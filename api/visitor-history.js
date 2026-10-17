import fs from "node:fs";
import path from "node:path";

let inMemoryHistory = null;

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

  const historyFilePath = path.resolve(process.cwd(), "src/data/visitor_history.json");

  const readHistory = () => {
    if (inMemoryHistory && Array.isArray(inMemoryHistory)) {
      return inMemoryHistory;
    }
    try {
      if (fs.existsSync(historyFilePath)) {
        const content = fs.readFileSync(historyFilePath, "utf-8");
        inMemoryHistory = JSON.parse(content || "[]");
        return inMemoryHistory;
      }
    } catch {}
    inMemoryHistory = [];
    return inMemoryHistory;
  };

  const writeHistory = (history) => {
    inMemoryHistory = history;
    try {
      const dir = path.dirname(historyFilePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(historyFilePath, JSON.stringify(history, null, 2), "utf-8");
    } catch {}
  };

  // GET: Return history logs
  if (req.method === "GET") {
    const history = readHistory();
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    return res.status(200).json(history);
  }

  // DELETE: Clear history
  if (req.method === "DELETE") {
    writeHistory([]);
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    return res.status(200).json({ success: true, count: 0 });
  }

  // POST: Record history event
  if (req.method === "POST") {
    try {
      const data = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
      let history = readHistory();

      const socketIp =
        req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() ||
        req.socket?.remoteAddress ||
        "127.0.0.1";
      const cleanSocketIp = socketIp.replace(/^.*:/, "");

      const effectiveIp =
        data.ip_address && data.ip_address !== "127.0.0.1" && !data.ip_address.startsWith("192.168.")
          ? data.ip_address
          : cleanSocketIp || data.ip_address || "116.111.184.173";

      // 🛑 BOT & CRAWLER FILTER (Zero history spam for automated scrapers)
      const ua = (req.headers["user-agent"] || "").toLowerCase();
      const isBotUa = /(bot|crawler|spider|headlesschrome|lighthouse|slurp|python|curl|wget|urllib|requests|axios|shodan|censys|nikto|nmap)/i.test(ua);
      const isDockerHeadless = String(data.os || "").toLowerCase().includes("linux") && String(data.screen_resolution || "").includes("800");
      const isAwsScraperIp = effectiveIp.startsWith("13.57.") || effectiveIp.startsWith("54.183.") || effectiveIp.startsWith("54.215.");

      if (isBotUa || isDockerHeadless || isAwsScraperIp || data.is_bot) {
        return res.status(200).json({ success: true, ignored: true, reason: "bot_filtered" });
      }

      const newHistoryItem = {
        id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        device_id: data.device_id || `dev_${Date.now()}`,
        ip_address: effectiveIp,
        city: data.city || "TP. Hồ Chí Minh",
        region: data.region || "Việt Nam",
        country: data.country || "Việt Nam",
        device_type: data.device_type || "Desktop",
        os: data.os || "Khác",
        browser: data.browser || "Chrome",
        path: data.path || data.last_path || "/",
        referrer: data.referrer || "Trực tiếp (Direct)",
        action: data.action || "pageview",
        is_authenticated: Boolean(data.is_authenticated),
        user_id: data.user_id || null,
        user_email: data.user_email || null,
        user_name: data.user_name || null,
        user_role: data.user_role || null,
        is_real: data.is_real !== undefined ? Boolean(data.is_real) : true,
        created_at: new Date().toISOString(),
      };

      // Keep at most 500 recent events
      history.unshift(newHistoryItem);
      if (history.length > 500) {
        history = history.slice(0, 500);
      }

      writeHistory(history);
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      return res.status(200).json({ success: true, count: history.length, item: newHistoryItem });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
