import crypto from "node:crypto";

/**
 * Shared server-side admin authentication.
 *
 * Two kinds of admin credentials are accepted:
 *  1. The legacy `.env` admin account. It is verified on the server by
 *     /api/admin-login, which returns a short-lived HMAC-signed token.
 *  2. A real Supabase access token whose profile role is SA/admin.
 *
 * Destructive endpoints (DELETE) must call requireAdmin() before touching data.
 */

const ADMIN_SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const ADMIN_ROLES = new Set(["sa", "admin", "administrator", "superadmin", "super_admin"]);

function normalize(value) {
  return String(value ?? "").trim();
}

function isProductionRuntime() {
  return process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);
}

function safeEqual(a, b) {
  const hashA = crypto.createHash("sha256").update(String(a)).digest();
  const hashB = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

export function getAdminCredentials() {
  const configuredPassword = normalize(
    process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD
  );

  return {
    // Fall back to the old VITE_* variables so existing deployments keep
    // working after the credential check moved from the client to the server.
    username: normalize(
      process.env.ADMIN_USERNAME || process.env.VITE_ADMIN_USERNAME || "admin"
    ).toLowerCase(),
    email: normalize(
      process.env.ADMIN_EMAIL || process.env.VITE_ADMIN_EMAIL || "admin@eaagri.vn"
    ).toLowerCase(),
    // The well-known default is only for local development. In production the
    // env admin account stays disabled until ADMIN_PASSWORD is configured.
    password: configuredPassword || (isProductionRuntime() ? "" : "admin@123"),
  };
}

function getSigningSecret() {
  const explicit = normalize(process.env.ADMIN_SESSION_SECRET);
  if (explicit) return explicit;

  // Never return the service role key itself; derive a separate signing key.
  const serviceRole = normalize(
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
  );
  if (serviceRole) {
    return crypto.createHash("sha256").update(`eaagri-admin:${serviceRole}`).digest("hex");
  }

  // A hard-coded fallback would let anyone forge admin tokens in production.
  if (isProductionRuntime()) return null;
  return "eaagri-admin-local-dev-secret";
}

export function isAdminSessionConfigured() {
  return Boolean(getSigningSecret());
}

function sign(payload) {
  const secret = getSigningSecret();
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET or SUPABASE_SERVICE_ROLE_KEY is not configured");
  }
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createAdminToken(subject = "admin") {
  const now = Date.now();
  const expiresAt = now + ADMIN_SESSION_TTL_MS;
  const payload = Buffer.from(
    JSON.stringify({
      sub: normalize(subject) || "admin",
      role: "SA",
      iat: now,
      exp: expiresAt,
      jti: crypto.randomBytes(8).toString("hex"),
    })
  ).toString("base64url");

  return { token: `${payload}.${sign(payload)}`, expiresAt };
}

export function verifyAdminToken(token) {
  try {
    const raw = normalize(token);
    const parts = raw.split(".");
    if (parts.length !== 2) return null;

    const [payload, signature] = parts;
    const expected = sign(payload);
    const providedBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);

    if (
      providedBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(providedBuffer, expectedBuffer)
    ) {
      return null;
    }

    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!data || typeof data.exp !== "number" || data.exp <= Date.now()) return null;
    if (normalize(data.role).toLowerCase() !== "sa") return null;
    return data;
  } catch {
    return null;
  }
}

export function verifyAdminCredentials(identifier, password) {
  const credentials = getAdminCredentials();
  if (!credentials.password) return false;

  const input = normalize(identifier).toLowerCase();
  const matchesIdentifier =
    input === credentials.username || input === credentials.email || input === "admin";

  return matchesIdentifier && safeEqual(normalize(password), credentials.password);
}

async function verifySupabaseAccessToken(token) {
  const supabaseUrl = normalize(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const anonKey = normalize(
    process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  );
  const serviceRoleKey = normalize(
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
  );

  if (!supabaseUrl || !anonKey) return null;

  try {
    const userResponse = await fetch(`${supabaseUrl.replace(/\/$/, "")}/auth/v1/user`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${token}` },
    });
    if (!userResponse.ok) return null;

    const user = await userResponse.json();
    if (!user?.id) return null;

    const profileKey = serviceRoleKey || anonKey;
    const profileToken = serviceRoleKey || token;
    const profileResponse = await fetch(
      `${supabaseUrl.replace(/\/$/, "")}/rest/v1/profiles?select=role&id=eq.${encodeURIComponent(
        user.id
      )}`,
      {
        headers: {
          apikey: profileKey,
          Authorization: `Bearer ${profileToken}`,
          Accept: "application/json",
        },
      }
    );

    if (!profileResponse.ok) return null;

    const rows = await profileResponse.json();
    const role = normalize(Array.isArray(rows) ? rows[0]?.role : "").toLowerCase();
    if (!ADMIN_ROLES.has(role)) return null;

    return { id: user.id, email: user.email, role };
  } catch {
    return null;
  }
}

/**
 * @param {import("http").IncomingMessage} req
 * @returns {Promise<{ok: boolean, status?: number, error?: string, method?: string, user?: object}>}
 */
export async function requireAdmin(req) {
  const header = req?.headers?.authorization;
  const value = Array.isArray(header) ? header[0] : header;
  const [scheme, token] = normalize(value).split(/\s+/);

  if (!token || scheme.toLowerCase() !== "bearer") {
    return { ok: false, status: 401, error: "Authentication required" };
  }

  const adminSession = verifyAdminToken(token);
  if (adminSession) {
    return { ok: true, method: "env-admin", user: { sub: adminSession.sub, role: "SA" } };
  }

  const supabaseUser = await verifySupabaseAccessToken(token);
  if (supabaseUser) {
    return { ok: true, method: "supabase", user: supabaseUser };
  }

  return { ok: false, status: 403, error: "Admin privileges required" };
}
