import fs from "node:fs";
import path from "node:path";

// Memory cache for serverless environments
let inMemoryVisitorLogs = null;

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

  // GET: Return all visitor logs
  if (req.method === "GET") {
    const logs = readLogs();
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    return res.status(200).json(logs);
  }

  // DELETE: Delete logs
  if (req.method === "DELETE") {
    const urlObj = new URL(req.url, "http://localhost");
    const isSampleOnly = urlObj.searchParams.get("type") === "sample";
    const targetId = urlObj.searchParams.get("id");

    let logs = readLogs();
    let deletedCount = 0;

    if (isSampleOnly) {
      const initialCount = logs.length;
      logs = logs.filter((item) => {
        if (item.is_real === false) return false;
        const devId = (item.device_id || "").toLowerCase();
        const id = (item.id || "").toLowerCase();
        if (
          id.startsWith("log_init") ||
          devId === "dev_test_phone_01" ||
          devId === "dev_pc_owner" ||
          devId.includes("test") ||
          devId.includes("owner") ||
          devId === "server_device"
        ) {
          return false;
        }
        return true;
      });
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
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    return res.status(200).json({ success: true, count: logs.length, deletedCount, logs });
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
        return res.status(200).json({ success: true, action: "leave", count: logs.length, logs });
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
        return res.status(200).json({ success: true, action: "heartbeat", count: logs.length, logs });
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
      return res.status(200).json({ success: true, count: logs.length, logs });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
