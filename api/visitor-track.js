import fs from "node:fs";
import path from "node:path";
import { requireAdmin } from "./_lib/admin-auth.js";
import { sanitizeVisitorLogs } from "./_lib/visitor-sanitize.js";
import {
  allRowsFilter,
  deleteSupabaseRowsByIds,
  isSupabaseAdminConfigured,
  supabaseAdminFetch,
} from "./_lib/supabase-admin.js";

// Memory cache for serverless environments
let inMemoryVisitorLogs = null;

const isBotRow = (item) => {
  const os = String(item?.os || "").toLowerCase();
  const screen = String(item?.screen_resolution || "").replace(/\s+/g, "");
  const ip = String(item?.ip_address || "").trim();

  if (item?.is_bot === true) return true;
  if (
    os.includes("linux") &&
    (screen.includes("800×600") || screen.includes("800x600") || screen === "0×0" || screen === "0x0")
  ) {
    return true;
  }
  return (
    ip.startsWith("13.57.") ||
    ip.startsWith("54.183.") ||
    ip.startsWith("54.215.") ||
    ip.startsWith("52.53.")
  );
};

const isSampleRow = (item) => {
  if (item?.is_real === false) return true;
  const deviceId = String(item?.device_id || "").toLowerCase();
  const id = String(item?.id || "").toLowerCase();
  return (
    id.startsWith("log_init") ||
    deviceId === "dev_test_phone_01" ||
    deviceId === "dev_pc_owner" ||
    deviceId.includes("test") ||
    deviceId.includes("owner") ||
    deviceId === "server_device"
  );
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const dataFilePath = path.resolve(process.cwd(), "src/data/visitor_logs.json");

  const cleanExpiredOnline = (logs) => {
    const now = Date.now();
    let changed = false;
    logs.forEach((item) => {
      const diff = now - new Date(item.last_visit).getTime();
      // If older than 2 minutes without heartbeat, mark offline
      if (item.is_online && diff > 120000) {
        item.is_online = false;
        changed = true;
      }
    });
    return changed;
  };

  const readLogs = () => {
    if (inMemoryVisitorLogs && Array.isArray(inMemoryVisitorLogs)) {
      cleanExpiredOnline(inMemoryVisitorLogs);
      return inMemoryVisitorLogs;
    }
    try {
      if (fs.existsSync(dataFilePath)) {
        const content = fs.readFileSync(dataFilePath, "utf-8");
        const logs = JSON.parse(content || "[]");
        cleanExpiredOnline(logs);
        inMemoryVisitorLogs = logs;
        return logs;
      }
    } catch {}
    inMemoryVisitorLogs = [];
    return inMemoryVisitorLogs;
  };

  const writeLogs = (logs) => {
    inMemoryVisitorLogs = logs;
    try {
      const dir = path.dirname(dataFilePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(dataFilePath, JSON.stringify(logs, null, 2), "utf-8");
    } catch {}
  };

  // The browser anon key can no longer read visitor_logs after the RLS
  // migration. Env-admin sessions read through the service role on the server.
  const readSupabaseLogs = async () => {
    if (!isSupabaseAdminConfigured()) return null;
    const result = await supabaseAdminFetch(
      "visitor_logs?select=*&order=last_visit.desc&limit=2000"
    );
    if (!result.ok || !Array.isArray(result.data)) return null;
    return result.data;
  };

  // GET: Return visitor logs. Guests receive an anonymised projection; admins get full data.
  if (req.method === "GET") {
    const auth = await requireAdmin(req);
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Vary", "Authorization");

    if (auth.ok) {
      const remoteLogs = await readSupabaseLogs();
      if (remoteLogs !== null) return res.status(200).json(remoteLogs);
    }

    const logs = readLogs();
    return res.status(200).json(auth.ok ? logs : sanitizeVisitorLogs(logs));
  }

  // Global rate limiter map in memory
  if (!global.__trafficRateLimit) global.__trafficRateLimit = new Map();

  // DELETE: Delete logs (admin only)
  if (req.method === "DELETE") {
    const auth = await requireAdmin(req);
    if (!auth.ok) {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      return res.status(auth.status || 401).json({ error: auth.error || "Unauthorized" });
    }

    const urlObj = new URL(req.url, "http://localhost");
    const isSampleOnly = urlObj.searchParams.get("type") === "sample";
    const isBotOnly = urlObj.searchParams.get("type") === "bot";
    const targetId = urlObj.searchParams.get("id");

    let logs = readLogs();
    let deletedCount = 0;

    if (isBotOnly) {
      const initialCount = logs.length;
      logs = logs.filter((item) => !isBotRow(item));
      deletedCount = initialCount - logs.length;
    } else if (isSampleOnly) {
      const initialCount = logs.length;
      logs = logs.filter((item) => !isSampleRow(item));
      deletedCount = initialCount - logs.length;
    } else if (targetId) {
      const initialCount = logs.length;
      logs = logs.filter((item) => item.id !== targetId && item.device_id !== targetId);
      deletedCount = initialCount - logs.length;
    } else {
      deletedCount = logs.length;
      logs = [];
    }

    writeLogs(logs);

    // Delete the same rows from Supabase when a service role key is available.
    // This keeps the admin dashboard working after anon DELETE was revoked.
    let remoteDeleted = 0;
    let remoteRemaining = null;
    if (isSupabaseAdminConfigured()) {
      if (isBotOnly || isSampleOnly) {
        const columns = isBotOnly
          ? "id,os,screen_resolution,ip_address,is_bot"
          : "id,device_id,is_real";
        const candidates = await supabaseAdminFetch(
          `visitor_logs?select=${columns}&limit=5000`
        );
        if (candidates.ok && Array.isArray(candidates.data)) {
          const predicate = isBotOnly ? isBotRow : isSampleRow;
          const ids = candidates.data.filter(predicate).map((item) => item.id);
          remoteDeleted += await deleteSupabaseRowsByIds("visitor_logs", ids);
        }
      } else if (targetId) {
        const result = await supabaseAdminFetch(
          `visitor_logs?or=(id.eq.${encodeURIComponent(targetId)},device_id.eq.${encodeURIComponent(
            targetId
          )})`,
          { method: "DELETE", headers: { Prefer: "count=exact" } }
        );
        if (result.ok) remoteDeleted += result.count ?? 0;
      } else {
        const result = await supabaseAdminFetch(`visitor_logs?${allRowsFilter()}`, {
          method: "DELETE",
          headers: { Prefer: "count=exact" },
        });
        if (result.ok) remoteDeleted += result.count ?? 0;
      }

      remoteRemaining = await readSupabaseLogs();
    }

    const responseLogs = remoteRemaining !== null ? remoteRemaining : logs;
    const effectiveDeleted = remoteRemaining !== null ? remoteDeleted : deletedCount;
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    return res.status(200).json({
      success: true,
      count: responseLogs.length,
      deletedCount: effectiveDeleted,
      logs: responseLogs,
    });
  }

  // POST: Record visitor hit / heartbeat / leave
  if (req.method === "POST") {
    try {
      const data = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
      let logs = readLogs();

      const socketIp =
        req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() ||
        req.socket?.remoteAddress ||
        "127.0.0.1";
      const cleanSocketIp = socketIp.replace(/^.*:/, "");

      const effectiveIp =
        data.ip_address && data.ip_address !== "127.0.0.1" && !data.ip_address.startsWith("192.168.")
          ? data.ip_address
          : cleanSocketIp || data.ip_address || "116.111.184.173";

      // 🛑 1. BOT & CRAWLER FILTER (Zero DB/file writing for automated scrapers)
      const ua = (req.headers["user-agent"] || "").toLowerCase();
      const isBotUa = /(bot|crawler|spider|headlesschrome|lighthouse|slurp|python|curl|wget|urllib|requests|axios|shodan|censys|nikto|nmap)/i.test(ua);
      const isDockerHeadless = String(data.os || "").toLowerCase().includes("linux") && String(data.screen_resolution || "").includes("800");
      const isAwsScraperIp = effectiveIp.startsWith("13.57.") || effectiveIp.startsWith("54.183.") || effectiveIp.startsWith("54.215.");

      if (isBotUa || isDockerHeadless || isAwsScraperIp || data.is_bot) {
        return res.status(200).json({ success: true, ignored: true, reason: "bot_filtered" });
      }

      // 🛑 2. RATE LIMITER: Max 30 requests per minute per IP
      const now = Date.now();
      const rateRecord = global.__trafficRateLimit.get(effectiveIp) || { count: 0, resetAt: now + 60000 };
      if (now > rateRecord.resetAt) {
        rateRecord.count = 1;
        rateRecord.resetAt = now + 60000;
      } else {
        rateRecord.count++;
      }
      global.__trafficRateLimit.set(effectiveIp, rateRecord);

      if (rateRecord.count > 30) {
        return res.status(200).json({ success: true, ignored: true, reason: "rate_limited" });
      }

      const nowIso = new Date().toISOString();
      const deviceId = data.device_id || `dev_${Date.now()}`;
      const isReal = data.is_real !== undefined ? Boolean(data.is_real) : true;

      // CRITICAL FIX: Match ONLY by device_id (never merge by IP address)
      const existingIdx = logs.findIndex((item) => item.device_id === deviceId);

      // Handle "leave" action
      if (data.action === "leave") {
        if (existingIdx >= 0) {
          logs[existingIdx].is_online = false;
          writeLogs(logs);
        }
        return res.status(200).json({ success: true, action: "leave", count: logs.length });
      }

      // Handle "heartbeat" action
      if (data.action === "heartbeat") {
        if (existingIdx >= 0) {
          logs[existingIdx].last_visit = nowIso;
          logs[existingIdx].is_online = true;
          if (data.last_path) logs[existingIdx].last_path = data.last_path;
        }
        cleanExpiredOnline(logs);
        writeLogs(logs);
        return res.status(200).json({ success: true, action: "heartbeat", count: logs.length });
      }

      // Normal visit hit
      if (existingIdx >= 0) {
        const existing = logs[existingIdx];
        logs[existingIdx] = {
          ...existing,
          device_id: deviceId,
          ip_address: effectiveIp,
          city: data.city || existing.city || "TP. Hồ Chí Minh",
          region: data.region || existing.region || "Việt Nam",
          country: data.country || existing.country || "Việt Nam",
          device_type: data.device_type || existing.device_type,
          os: data.os || existing.os,
          browser: data.browser || existing.browser,
          screen_resolution: data.screen_resolution || existing.screen_resolution,
          visit_count: (existing.visit_count || 1) + 1,
          last_path: data.last_path || existing.last_path || "/",
          is_online: true,
          last_visit: nowIso,
          is_real: isReal,
          is_authenticated:
            data.is_authenticated !== undefined
              ? Boolean(data.is_authenticated)
              : Boolean(existing.is_authenticated),
          user_id: data.user_id || existing.user_id || null,
          user_email: data.user_email || existing.user_email || null,
          user_name: data.user_name || existing.user_name || null,
          user_role: data.user_role || existing.user_role || null,
        };
      } else {
        const newRecord = {
          id: `log_${Date.now()}`,
          device_id: deviceId,
          ip_address: effectiveIp,
          city: data.city || "TP. Hồ Chí Minh",
          region: data.region || "Việt Nam",
          country: data.country || "Việt Nam",
          device_type: data.device_type || "Desktop",
          os: data.os || "Khác",
          browser: data.browser || "Chrome",
          screen_resolution: data.screen_resolution || "1920×1080",
          visit_count: 1,
          last_path: data.last_path || "/",
          referrer: data.referrer || "Trực tiếp (Direct)",
          is_online: true,
          first_visit: nowIso,
          last_visit: nowIso,
          is_real: isReal,
          is_authenticated: Boolean(data.is_authenticated),
          user_id: data.user_id || null,
          user_email: data.user_email || null,
          user_name: data.user_name || null,
          user_role: data.user_role || null,
        };
        logs.unshift(newRecord);
      }

      cleanExpiredOnline(logs);
      writeLogs(logs);

      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      return res.status(200).json({ success: true, count: logs.length });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
