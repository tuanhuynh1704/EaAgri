import {
  createAdminToken,
  getAdminCredentials,
  isAdminSessionConfigured,
  verifyAdminCredentials,
} from "./_lib/admin-auth.js";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

if (!globalThis.__eaagriAdminLoginAttempts) {
  globalThis.__eaagriAdminLoginAttempts = new Map();
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return (
    String(value || "").split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

function isRateLimited(ip) {
  const now = Date.now();
  const attempts = globalThis.__eaagriAdminLoginAttempts;
  const record = attempts.get(ip) || { count: 0, resetAt: now + WINDOW_MS };

  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + WINDOW_MS;
  }

  record.count += 1;
  attempts.set(ip, record);
  return record.count > MAX_ATTEMPTS;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept"
  );
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!isAdminSessionConfigured()) {
    return res.status(503).json({
      error:
        "Đăng nhập quản trị chưa được cấu hình trên máy chủ. Hãy đặt ADMIN_SESSION_SECRET (hoặc SUPABASE_SERVICE_ROLE_KEY) và ADMIN_PASSWORD.",
    });
  }

  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return res.status(429).json({
      error: "Quá nhiều lần đăng nhập. Vui lòng thử lại sau 15 phút.",
    });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const identifier = String(body.identifier || body.email || body.username || "").trim();
    const password = String(body.password || "");

    if (!identifier || !password) {
      return res.status(400).json({ error: "Vui lòng nhập tài khoản và mật khẩu." });
    }

    if (!verifyAdminCredentials(identifier, password)) {
      return res.status(401).json({ error: "Tài khoản hoặc mật khẩu không chính xác." });
    }

    const credentials = getAdminCredentials();
    const { token, expiresAt } = createAdminToken(identifier);

    return res.status(200).json({
      token,
      expiresAt,
      profile: {
        id: "eaagri-admin-sa-master",
        email: credentials.email,
        full_name: "Super Admin EaAgri",
        role: "SA",
      },
    });
  } catch {
    return res.status(400).json({ error: "Dữ liệu đăng nhập không hợp lệ." });
  }
}
