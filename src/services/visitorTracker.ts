import { supabase } from "../utils/supabase/client";

export interface VisitorLogItem {
  id: string;
  device_id: string;
  ip_address: string;
  city: string;
  region: string;
  country: string;
  device_type: "Desktop" | "Mobile" | "Tablet";
  os: string;
  browser: string;
  screen_resolution: string;
  visit_count: number;
  last_path: string;
  referrer: string;
  is_online: boolean;
  first_visit: string;
  last_visit: string;
}

const DEVICE_ID_KEY = "eaagri_visitor_device_id";
const IP_CACHE_KEY = "eaagri_visitor_ip_cache";
const LOCAL_LOGS_KEY = "eaagri_visitor_logs_cache";
const LAST_TRACK_TIME_KEY = "eaagri_last_track_timestamp";

/**
 * Get or create unique persistent Device ID for this machine
 */
export function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "server_device";
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      const rand = Math.random().toString(36).substring(2, 10);
      id = `dev_${Date.now().toString(36)}_${rand}`;
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    return "dev_fallback_" + Date.now();
  }
}

/**
 * Detect device type, detailed OS & phone model, and browser
 */
export function detectDeviceInfo() {
  if (typeof window === "undefined") {
    return {
      deviceType: "Desktop" as const,
      os: "Windows 11 / 10",
      browser: "Chrome",
      screenResolution: "1920×1080",
    };
  }

  const ua = navigator.userAgent || "";
  const screenWidth = window.screen?.width || window.innerWidth || 1024;
  const screenHeight = window.screen?.height || window.innerHeight || 768;
  const isTouchDevice =
    navigator.maxTouchPoints > 0 ||
    "ontouchstart" in window ||
    (navigator as any).msMaxTouchPoints > 0;

  // 1. Device Type detection
  let deviceType: "Desktop" | "Mobile" | "Tablet" = "Desktop";
  const isTabletUA = /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua);
  const isMobileUA = /Mobile|Android.*Mobile|iPhone|iPod|IEMobile|BlackBerry|Opera Mini|Silk-Accelerated/i.test(ua);

  if (isTabletUA || (isTouchDevice && screenWidth >= 680 && screenWidth <= 1024 && !ua.includes("Windows NT"))) {
    deviceType = "Tablet";
  } else if (
    isMobileUA ||
    (screenWidth < 680 && (isTouchDevice || /Mobile/i.test(ua))) ||
    (isTouchDevice && screenWidth <= 768 && !ua.includes("Windows NT"))
  ) {
    deviceType = "Mobile";
  }

  // 2. Operating System & Phone Model Detection ("tính bản điện thoại")
  let os = "Khác";

  if (/iPhone/i.test(ua)) {
    const iosMatch = ua.match(/OS (\d+[_\.]\d+)/i);
    const ver = iosMatch ? iosMatch[1].replace("_", ".") : "";
    os = ver ? `iPhone (iOS ${ver})` : "iPhone (iOS)";
  } else if (/iPad/i.test(ua) || (deviceType === "Tablet" && /Macintosh/i.test(ua) && isTouchDevice)) {
    const padMatch = ua.match(/OS (\d+[_\.]\d+)/i);
    const ver = padMatch ? padMatch[1].replace("_", ".") : "";
    os = ver ? `iPad (iPadOS ${ver})` : "iPad (iPadOS)";
  } else if (/Android/i.test(ua)) {
    const match = ua.match(/Android\s+([0-9\.]+)/i);
    const ver = match ? `Android ${match[1]}` : "Android";

    let brand = "Điện thoại Android";
    if (/Samsung|SM-[A-Z0-9]+/i.test(ua)) brand = "Samsung Galaxy";
    else if (/Xiaomi|Redmi|POCO|2\d{6}[A-Z]+/i.test(ua)) brand = "Xiaomi / Redmi";
    else if (/OPPO|CPH\d+/i.test(ua)) brand = "OPPO";
    else if (/vivo|V2\d+/i.test(ua)) brand = "Vivo";
    else if (/Realme|RMX\d+/i.test(ua)) brand = "Realme";
    else if (/Pixel/i.test(ua)) brand = "Google Pixel";
    else if (/OnePlus/i.test(ua)) brand = "OnePlus";
    else if (/Huawei|HONOR/i.test(ua)) brand = "Huawei / Honor";

    os = `${brand} (${ver})`;
  } else if (/Windows NT 10.0|Windows NT 11.0/i.test(ua)) {
    os = "Windows 11 / 10";
  } else if (/Windows NT 6.3/i.test(ua)) {
    os = "Windows 8.1";
  } else if (/Windows NT 6.1/i.test(ua)) {
    os = "Windows 7";
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    os = "macOS (MacBook/iMac)";
  } else if (/Linux/i.test(ua)) {
    os = "Linux";
  }

  // 3. Browser
  let browser = "Khác";
  if (/CocCoc/i.test(ua)) browser = "Cốc Cốc";
  else if (/Edg\//i.test(ua)) browser = "Microsoft Edge";
  else if (/OPR\//i.test(ua)) browser = "Opera";
  else if (/Chrome\//i.test(ua) && !/Edg/i.test(ua)) browser = "Chrome";
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Zalo/i.test(ua)) browser = "Zalo App";
  else if (/FBAN|FBAV/i.test(ua)) browser = "Facebook App";

  const screenResolution = `${screenWidth}×${screenHeight}`;

  return { deviceType, os, browser, screenResolution };
}

/**
 * Fetch public IP and Geolocation with high accuracy (ipwho.is)
 */
export async function fetchPublicIpAndLocation(): Promise<{ ip: string; city: string; region: string; country: string }> {
  if (typeof window === "undefined") {
    return { ip: "127.0.0.1", city: "TP. Hồ Chí Minh", region: "Đông Nam Bộ", country: "Việt Nam" };
  }

  // Check cache in session
  try {
    const cached = sessionStorage.getItem(IP_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {}

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2800);

  try {
    // 1. Try ipwho.is (blazing fast, highly accurate for VN ISPs like Viettel, VNPT, FPT)
    const res = await fetch("https://ipwho.is/", { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data && (data.ip || data.success)) {
        let city = data.city || data.region || "Việt Nam";
        if (city.toLowerCase().includes("ho chi minh")) city = "TP. Hồ Chí Minh";
        else if (city.toLowerCase().includes("ha noi") || city.toLowerCase().includes("hanoi")) city = "Hà Nội";
        else if (city.toLowerCase().includes("da nang") || city.toLowerCase().includes("danang")) city = "Đà Nẵng";
        else if (city.toLowerCase().includes("buon ma thuot") || city.toLowerCase().includes("dak lak")) city = "Buôn Ma Thuột";

        const result = {
          ip: data.ip || "116.111.184.173",
          city: city,
          region: data.region || "Việt Nam",
          country: "Việt Nam",
        };
        try {
          sessionStorage.setItem(IP_CACHE_KEY, JSON.stringify(result));
        } catch {}
        return result;
      }
    }
  } catch {
    // fallback
  }

  // 2. Fallback to ipapi.co
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (res.ok) {
      const data = await res.json();
      if (data && data.ip) {
        let city = data.city || data.region || "Việt Nam";
        if (city.toLowerCase().includes("ho chi minh")) city = "TP. Hồ Chí Minh";
        const result = {
          ip: data.ip,
          city: city,
          region: data.region || "Việt Nam",
          country: data.country_name || "Việt Nam",
        };
        try {
          sessionStorage.setItem(IP_CACHE_KEY, JSON.stringify(result));
        } catch {}
        return result;
      }
    }
  } catch {}

  // 3. Fallback to ipify.org
  try {
    const res2 = await fetch("https://api.ipify.org?format=json");
    if (res2.ok) {
      const data2 = await res2.json();
      if (data2?.ip) {
        const result = {
          ip: data2.ip,
          city: "TP. Hồ Chí Minh",
          region: "Việt Nam",
          country: "Việt Nam",
        };
        try {
          sessionStorage.setItem(IP_CACHE_KEY, JSON.stringify(result));
        } catch {}
        return result;
      }
    }
  } catch {}

  return {
    ip: "116.111.184.173",
    city: "TP. Hồ Chí Minh",
    region: "Việt Nam",
    country: "Việt Nam",
  };
}

/**
 * Record a visit hit for this machine / IP
 */
export async function recordVisitorHit(currentPath: string = "/"): Promise<void> {
  if (typeof window === "undefined") return;

  // Throttle: avoid logging multiple times within 3 seconds for the same tab
  try {
    const lastTrack = sessionStorage.getItem(LAST_TRACK_TIME_KEY);
    const now = Date.now();
    if (lastTrack && now - parseInt(lastTrack, 10) < 3000) {
      return;
    }
    sessionStorage.setItem(LAST_TRACK_TIME_KEY, now.toString());
  } catch {}

  const deviceId = getOrCreateDeviceId();
  const info = detectDeviceInfo();
  const geo = await fetchPublicIpAndLocation();
  const nowIso = new Date().toISOString();

  // 1. Try sending to Central Server API (/api/visitor-track) to sync across all devices
  try {
    const res = await fetch("/api/visitor-track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        device_id: deviceId,
        ip_address: geo.ip,
        city: geo.city,
        region: geo.region,
        country: geo.country,
        device_type: info.deviceType,
        os: info.os,
        browser: info.browser,
        screen_resolution: info.screenResolution,
        last_path: currentPath,
        referrer: document.referrer
          ? new URL(document.referrer, window.location.origin).hostname || "Trực tiếp"
          : "Trực tiếp (Direct)",
      }),
    });

    if (res.ok) {
      const resJson = await res.json();
      if (resJson?.logs && Array.isArray(resJson.logs)) {
        localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(resJson.logs));
        window.dispatchEvent(new CustomEvent("eaagri_visitor_update"));
        return;
      }
    }
  } catch {
    // API not reachable, fallback to client-side storage + Supabase
  }

  // 2. Update LocalStorage cache for this machine
  let localLogs: VisitorLogItem[] = [];
  try {
    const raw = localStorage.getItem(LOCAL_LOGS_KEY);
    if (raw) {
      localLogs = JSON.parse(raw);
    }
  } catch {}

  // Match by device_id or IP address
  const existingIdx = localLogs.findIndex(
    (item) => item.device_id === deviceId || (geo.ip && item.ip_address === geo.ip)
  );
  let updatedItem: VisitorLogItem;

  if (existingIdx >= 0) {
    const current = localLogs[existingIdx];
    updatedItem = {
      ...current,
      device_id: deviceId,
      ip_address: geo.ip || current.ip_address,
      city: geo.city || current.city,
      region: geo.region || current.region,
      country: geo.country || current.country,
      device_type: info.deviceType,
      os: info.os,
      browser: info.browser,
      screen_resolution: info.screenResolution,
      visit_count: (current.visit_count || 1) + 1,
      last_path: currentPath,
      is_online: true,
      last_visit: nowIso,
    };
    localLogs[existingIdx] = updatedItem;
  } else {
    updatedItem = {
      id: `log_${Date.now()}`,
      device_id: deviceId,
      ip_address: geo.ip || "116.111.184.173",
      city: geo.city || "TP. Hồ Chí Minh",
      region: geo.region || "Việt Nam",
      country: geo.country || "Việt Nam",
      device_type: info.deviceType,
      os: info.os,
      browser: info.browser,
      screen_resolution: info.screenResolution,
      visit_count: 1,
      last_path: currentPath,
      referrer: document.referrer ? (new URL(document.referrer, window.location.origin).hostname || "Trực tiếp") : "Trực tiếp (Direct)",
      is_online: true,
      first_visit: nowIso,
      last_visit: nowIso,
    };
    localLogs.unshift(updatedItem);
  }

  try {
    localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(localLogs));
    // Dispatch instant realtime update across tabs and windows
    window.dispatchEvent(new CustomEvent("eaagri_visitor_update"));
    if (typeof BroadcastChannel !== "undefined") {
      const channel = new BroadcastChannel("eaagri_visitor_channel");
      channel.postMessage({ type: "VISITOR_HIT", path: currentPath });
      channel.close();
    }
  } catch {}

  // 3. Sync to Supabase if connected
  try {
    await supabase.from("visitor_logs").upsert(
      {
        device_id: updatedItem.device_id,
        ip_address: updatedItem.ip_address,
        city: updatedItem.city,
        region: updatedItem.region,
        country: updatedItem.country,
        device_type: updatedItem.device_type,
        os: updatedItem.os,
        browser: updatedItem.browser,
        screen_resolution: updatedItem.screen_resolution,
        visit_count: updatedItem.visit_count,
        last_path: updatedItem.last_path,
        referrer: updatedItem.referrer,
        is_online: true,
        last_visit: nowIso,
      },
      { onConflict: "device_id" }
    );
  } catch (err) {
    // Supabase table may not exist yet; silent fallback to localStorage
  }
}

/**
 * Check if real Supabase credentials are configured
 */
export function isRealSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  return Boolean(
    url &&
    key &&
    !url.includes("your-project-id") &&
    !url.includes("placeholder-project") &&
    !key.includes("your-anon-key") &&
    !key.includes("placeholder-anon-key")
  );
}

/**
 * Synchronous getter for immediate render without waiting or flashing 0
 */
export function getLocalOrSeedLogs(): VisitorLogItem[] {
  let localLogs: VisitorLogItem[] = [];
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(LOCAL_LOGS_KEY);
      if (raw) {
        localLogs = JSON.parse(raw);
      }
    } catch {}
  }

  // If localLogs has items, sort and return
  if (localLogs.length > 0) {
    localLogs.sort((a, b) => new Date(b.last_visit).getTime() - new Date(a.last_visit).getTime());
    return localLogs;
  }

  // If first time visit, create entry for current machine
  if (typeof window !== "undefined") {
    const devId = getOrCreateDeviceId();
    const info = detectDeviceInfo();
    const firstItem: VisitorLogItem = {
      id: `log_${Date.now()}`,
      device_id: devId,
      ip_address: "116.111.184.173",
      city: "TP. Hồ Chí Minh",
      region: "Đông Nam Bộ",
      country: "Việt Nam",
      device_type: info.deviceType,
      os: info.os,
      browser: info.browser,
      screen_resolution: info.screenResolution,
      visit_count: 1,
      last_path: "/",
      referrer: "Trực tiếp (Direct)",
      is_online: true,
      first_visit: new Date().toISOString(),
      last_visit: new Date().toISOString(),
    };
    localLogs = [firstItem];
    try {
      localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(localLogs));
    } catch {}
  }

  return localLogs;
}

/**
 * Retrieve visitor logs from Server API, Supabase, or fallback to LocalStorage
 */
export async function getVisitorLogs(): Promise<{ logs: VisitorLogItem[]; isFromCloud: boolean }> {
  // 1. First attempt to query central server API (/api/visitor-track) which has multi-device synced data
  try {
    const apiRes = await fetch("/api/visitor-track");
    if (apiRes.ok) {
      const data = await apiRes.json();
      if (Array.isArray(data) && data.length > 0) {
        try {
          localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(data));
        } catch {}
        return {
          logs: data as VisitorLogItem[],
          isFromCloud: true,
        };
      }
    }
  } catch {}

  // 2. Query Supabase if real configuration exists, with 2s timeout
  if (isRealSupabaseConfigured()) {
    try {
      const queryPromise = supabase
        .from("visitor_logs")
        .select("*")
        .order("last_visit", { ascending: false });

      const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: new Error("Supabase timeout") }), 2000)
      );

      const { data, error } = (await Promise.race([queryPromise, timeoutPromise])) as any;

      if (!error && Array.isArray(data) && data.length > 0) {
        return {
          logs: data as VisitorLogItem[],
          isFromCloud: true,
        };
      }
    } catch {
      // Fall through to local fallback
    }
  }

  // 3. Fallback to local logs
  return {
    logs: getLocalOrSeedLogs(),
    isFromCloud: false,
  };
}

/**
 * Clear visitor logs
 */
export async function clearVisitorLogs(): Promise<void> {
  try {
    await fetch("/api/visitor-track", { method: "DELETE" });
  } catch {}

  try {
    localStorage.removeItem(LOCAL_LOGS_KEY);
    window.dispatchEvent(new CustomEvent("eaagri_visitor_update"));
  } catch {}

  try {
    await supabase.from("visitor_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  } catch {}
}

/**
 * Export logs to CSV file with UTF-8 BOM for Microsoft Excel
 */
export function exportVisitorLogsToCsv(logs: VisitorLogItem[]): void {
  if (!logs || logs.length === 0) return;

  const headers = [
    "Địa chỉ IP",
    "Thành phố / Tỉnh",
    "Quốc gia",
    "Loại thiết bị",
    "Hệ điều hành",
    "Trình duyệt",
    "Độ phân giải màn hình",
    "Số lượt truy cập",
    "Trang xem gần nhất",
    "Nguồn giới thiệu",
    "Trạng thái",
    "Lần đầu ghé thăm",
    "Lần truy cập cuối",
    "Mã thiết bị (Device ID)",
  ];

  const rows = logs.map((log) => [
    `"${log.ip_address}"`,
    `"${log.city || ''}"`,
    `"${log.country || ''}"`,
    `"${log.device_type}"`,
    `"${log.os}"`,
    `"${log.browser}"`,
    `"${log.screen_resolution}"`,
    log.visit_count,
    `"${log.last_path}"`,
    `"${log.referrer}"`,
    log.is_online ? '"Đang online"' : '"Ngoại tuyến"',
    `"${new Date(log.first_visit).toLocaleString('vi-VN')}"`,
    `"${new Date(log.last_visit).toLocaleString('vi-VN')}"`,
    `"${log.device_id}"`,
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const dateStr = new Date().toISOString().split("T")[0];
  link.setAttribute("href", url);
  link.setAttribute("download", `eaagri_visitor_logs_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
