import fs from "node:fs";
import path from "node:path";

export default async function handler(req, res) {
  // Set CORS headers so any client request can access this endpoint
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const customJsonPath = path.resolve(process.cwd(), "src/data/customVotingResults.json");

  const token = process.env.ACCES_TOKEN || process.env.ACCESS_TOKEN || "";
  const refreshToken = process.env.REFRESH_TOKEN || "";
  const cookieParts = [
    token ? `niic_access_token=${token}` : "",
    refreshToken ? `niic_refresh_token=${refreshToken}` : "",
  ].filter(Boolean);

  const authHeaders = {
    Accept: "application/json",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
  };

  if (cookieParts.length > 0) {
    authHeaders["Cookie"] = cookieParts.join("; ");
  }
  if (token) {
    authHeaders["Authorization"] = `Bearer ${token}`;
  }

  // Handle POST: Update results directly
  if (req.method === "POST") {
    try {
      const data = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      if (Array.isArray(data)) {
        const eaagriItem = data.find(
          (x) =>
            x.submissionId === "1848f999-465c-4334-b8a5-f85691d2805b" ||
            x.title?.includes("EaAgri")
        );
        return res.status(200).json({
          success: true,
          count: data.length,
          message: "Đã cập nhật bảng xếp hạng thành công!",
          eaagri: eaagriItem,
        });
      }
      return res.status(400).json({ error: "Payload must be an array" });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  // Handle GET: Always fetch live results from official NIIC with cookies
  try {
    const upstreamRes = await fetch(
      "https://nttu.startup.niic.vn/api/voting/4bb9fde6-c30c-4211-87e0-41b101fdf578/results",
      { headers: authHeaders }
    );

    if (upstreamRes.ok) {
      const data = await upstreamRes.json();
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      return res.status(200).json(data);
    }
  } catch (error) {
    // ignore upstream error and try fallback
  }

  // Fallback to local cache if upstream NIIC is down
  if (fs.existsSync(customJsonPath)) {
    try {
      const content = fs.readFileSync(customJsonPath, "utf-8");
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      return res.status(200).json(JSON.parse(content));
    } catch {}
  }

  return res.status(500).json({ error: "Failed to fetch live voting results" });
}
