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
  is_real?: boolean; // true: Thiết bị thật, false: Dữ liệu mẫu/thử nghiệm

  // 👤 THÔNG TIN TÀI KHOẢN / KHÁCH VÃNG LAI
  is_authenticated?: boolean; // true: Người có tài khoản đăng nhập, false: Khách vãng lai
  user_id?: string;
  user_email?: string;
  user_name?: string;
  user_role?: string;
}

export interface VisitorHistoryItem {
  id: string;
  device_id: string;
  ip_address: string;
  city: string;
  region: string;
  country: string;
  device_type: "Desktop" | "Mobile" | "Tablet";
  os: string;
  browser: string;
  path: string;
  referrer: string;
  action: "pageview" | "heartbeat" | "leave" | "login" | string;
  is_authenticated: boolean;
  user_id?: string;
  user_email?: string;
  user_name?: string;
  user_role?: string;
  is_real?: boolean;
  created_at: string;
}

/**
 * Check if the current user has authorized admin privileges (SA or admin)
 */
export function isAuthorizedAdminRole(user?: any, profile?: any): boolean {
  if (!user && !profile) return false;
  if (user?.id === "eaagri-admin-sa-master") return true;

  const rolesToCheck: string[] = [
    profile?.role,
    (user?.app_metadata as any)?.role,
    (user?.user_metadata as any)?.role,
  ]
    .filter(Boolean)
    .map((r) => String(r).toLowerCase().trim());

  return rolesToCheck.some(
    (r) =>
      r === "sa" ||
      r === "admin" ||
      r === "administrator" ||
      r === "superadmin" ||
      r === "super_admin"
  );
}

/**
 * Get current visitor user info from localStorage or session
 */
export function getCurrentVisitorUser(): {
  isAuthenticated: boolean;
  userId?: string;
  userEmail?: string;
  userName?: string;
  userRole?: string;
} {
  if (typeof window === "undefined") {
    return { isAuthenticated: false };
  }

  // 1. Check admin session (from .env or localStorage)
  try {
    const adminSessionRaw = localStorage.getItem("eaagri_admin_session");
    if (adminSessionRaw) {
      const { expiresAt } = JSON.parse(adminSessionRaw);
      if (typeof expiresAt === "number" && Date.now() < expiresAt) {
        return {
          isAuthenticated: true,
          userId: "eaagri-admin-sa-master",
          userEmail: "admin@eaagri.vn",
          userName: "Quản Trị Viên (Super Admin)",
          userRole: "SA",
        };
      }
    }
  } catch {}

  // 2. Check Supabase auth token in localStorage
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith("sb-") || key.includes("supabase.auth.token"))) {
        const item = localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item);
          const user = parsed?.user || parsed?.currentSession?.user;
          if (user && user.email) {
            return {
              isAuthenticated: true,
              userId: user.id,
              userEmail: user.email,
              userName: user.user_metadata?.full_name || user.email.split("@")[0],
              userRole: user.app_metadata?.role || user.user_metadata?.role || "user",
            };
          }
        }
      }
    }
  } catch {}

  return { isAuthenticated: false };
}

/**
 * Determine if a visitor log is a verified REAL device (not mock/seed/test data)
 */
export function isRealVisitor(item: VisitorLogItem): boolean {
  if (!item) return false;
  // If explicitly flagged
  if (typeof item.is_real === "boolean") {
    return item.is_real;
  }
  // If flagged as sample/test
  if ((item as any).is_sample === true || (item as any).is_test === true) {
    return false;
  }
  const id = (item.id || "").toLowerCase();
  const devId = (item.device_id || "").toLowerCase();

  // Known mock/test IDs
  if (
    id.startsWith("log_init") ||
    id.includes("test") ||
    id.includes("mock") ||
    devId === "dev_test_phone_01" ||
    devId === "dev_pc_owner" ||
    devId.includes("test") ||
    devId.includes("owner") ||
    devId === "server_device"
  ) {
    return false;
  }

  return true;
}

const DEVICE_ID_KEY = "eaagri_visitor_device_id";
const IP_CACHE_KEY = "eaagri_visitor_ip_cache";
const LOCAL_LOGS_KEY = "eaagri_visitor_logs_cache";
const LOCAL_HISTORY_KEY = "eaagri_visitor_history_cache";
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
  const isIPad = /iPad/i.test(ua) || (/Macintosh/i.test(ua) && isTouchDevice && (navigator.maxTouchPoints || 0) > 1);
  const isTabletUA = isIPad || /(tablet|playbook|silk)|(android(?!.*mobi))/i.test(ua) || /SM-T|SM-X|GT-P|Tab/i.test(ua);
  const isMobileUA = /Mobile|Android.*Mobile|iPhone|iPod|IEMobile|BlackBerry|Opera Mini|Silk-Accelerated/i.test(ua);

  if (isTabletUA || (isTouchDevice && screenWidth >= 680 && screenWidth <= 1280 && !ua.includes("Windows NT"))) {
    deviceType = "Tablet";
  } else if (
    isMobileUA ||
    (screenWidth < 680 && (isTouchDevice || /Mobile/i.test(ua))) ||
    (isTouchDevice && screenWidth <= 768 && !ua.includes("Windows NT"))
  ) {
    deviceType = "Mobile";
  }

  // 2. Operating System & Phone Model Detection ("tính bản điện thoại & tablet")
  let os = "Khác";

  if (/iPhone/i.test(ua)) {
    const iosMatch = ua.match(/OS (\d+[_\.]\d+)/i);
    const ver = iosMatch ? iosMatch[1].replace("_", ".") : "";
    os = ver ? `iPhone (iOS ${ver})` : "iPhone (iOS)";
  } else if (isIPad) {
    const padMatch = ua.match(/OS (\d+[_\.]\d+)/i);
    const ver = padMatch ? padMatch[1].replace("_", ".") : "";
    os = ver ? `iPad (iPadOS ${ver})` : "iPad (iPadOS)";
  } else if (/Android/i.test(ua)) {
    const match = ua.match(/Android\s+([0-9\.]+)/i);
    const ver = match ? `Android ${match[1]}` : "Android";

    let brand = deviceType === "Tablet" ? "Máy tính bảng Android" : "Điện thoại Android";
    if (/SM-T|SM-X|Tab/i.test(ua)) brand = "Samsung Galaxy Tab";
    else if (/Samsung|SM-[A-Z0-9]+/i.test(ua)) brand = "Samsung Galaxy";
    else if (/Xiaomi|Redmi|POCO|2\d{6}[A-Z]+/i.test(ua)) brand = deviceType === "Tablet" ? "Xiaomi Pad" : "Xiaomi / Redmi";
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
export async function recordVisitorHit(
  currentPath: string = "/",
  userContext?: {
    isAuthenticated?: boolean;
    userId?: string;
    userEmail?: string;
    userName?: string;
    userRole?: string;
  }
): Promise<void> {
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

  // Resolve user info (from parameter or from session/localStorage)
  const resolvedUser =
    userContext && typeof userContext.isAuthenticated === "boolean"
      ? {
          isAuthenticated: userContext.isAuthenticated,
          userId: userContext.userId,
          userEmail: userContext.userEmail,
          userName: userContext.userName,
          userRole: userContext.userRole,
        }
      : getCurrentVisitorUser();

  const referrerUrl = document.referrer
    ? new URL(document.referrer, window.location.origin).hostname || "Trực tiếp"
    : "Trực tiếp (Direct)";

  // 1. Sync to Supabase (Cloud Database for cross-device sync)
  let cloudSuccess = false;
  let remoteVisitCount = 1;
  let remoteFirstVisit = nowIso;

  if (isRealSupabaseConfigured()) {
    try {
      // Find existing device to calculate cumulative visit count
      const { data: existingDev } = await supabase
        .from("visitor_logs")
        .select("visit_count, first_visit, is_authenticated, user_name, user_email, user_role")
        .eq("device_id", deviceId)
        .maybeSingle();

      if (existingDev) {
        remoteVisitCount = (existingDev.visit_count || 0) + 1;
        remoteFirstVisit = existingDev.first_visit || nowIso;
      }

      const upsertPayload: any = {
        device_id: deviceId,
        ip_address: geo.ip,
        city: geo.city,
        region: geo.region,
        country: geo.country,
        device_type: info.deviceType,
        os: info.os,
        browser: info.browser,
        screen_resolution: info.screenResolution,
        visit_count: remoteVisitCount,
        last_path: currentPath,
        referrer: referrerUrl,
        is_online: true,
        first_visit: remoteFirstVisit,
        last_visit: nowIso,
        is_real: true,
        is_authenticated: Boolean(resolvedUser.isAuthenticated || existingDev?.is_authenticated),
        user_id: resolvedUser.userId || null,
        user_email: resolvedUser.userEmail || existingDev?.user_email || null,
        user_name: resolvedUser.userName || existingDev?.user_name || null,
        user_role: resolvedUser.userRole || existingDev?.user_role || null,
      };

      const { error: upsertErr } = await supabase
        .from("visitor_logs")
        .upsert(upsertPayload, { onConflict: "device_id" });

      if (!upsertErr) {
        cloudSuccess = true;
      }

      // Also record to visitor_history_logs (stream of access events)
      await supabase.from("visitor_history_logs").insert({
        device_id: deviceId,
        ip_address: geo.ip,
        city: geo.city,
        region: geo.region,
        country: geo.country,
        device_type: info.deviceType,
        os: info.os,
        browser: info.browser,
        path: currentPath,
        referrer: referrerUrl,
        action: "pageview",
        is_authenticated: Boolean(resolvedUser.isAuthenticated),
        user_id: resolvedUser.userId || null,
        user_email: resolvedUser.userEmail || null,
        user_name: resolvedUser.userName || null,
        user_role: resolvedUser.userRole || null,
        is_real: true,
        created_at: nowIso,
      });
    } catch (err) {
      // Supabase table may not exist yet or connection failed
    }
  }

  // 2. Sync to Central Server API (/api/visitor-track & /api/visitor-history)
  const trackPayload = {
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
    is_real: true,
    is_authenticated: resolvedUser.isAuthenticated,
    user_id: resolvedUser.userId || null,
    user_email: resolvedUser.userEmail || null,
    user_name: resolvedUser.userName || null,
    user_role: resolvedUser.userRole || null,
    referrer: referrerUrl,
  };

  try {
    const res = await fetch("/api/visitor-track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(trackPayload),
    });

    if (res.ok) {
      const resJson = await res.json();
      if (!cloudSuccess && resJson?.logs && Array.isArray(resJson.logs)) {
        localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(resJson.logs));
      }
    }
  } catch {}

  try {
    fetch("/api/visitor-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...trackPayload, path: currentPath, action: "pageview" }),
    }).catch(() => {});
  } catch {}

  // 3. Update LocalStorage cache for immediate snappy render
  let localLogs: VisitorLogItem[] = [];
  try {
    const raw = localStorage.getItem(LOCAL_LOGS_KEY);
    if (raw) {
      localLogs = JSON.parse(raw);
    }
  } catch {}

  // CRITICAL FIX: Match ONLY by unique device_id (never merge different machines by IP)
  const existingIdx = localLogs.findIndex((item) => item.device_id === deviceId);
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
      visit_count: remoteVisitCount > (current.visit_count || 1) ? remoteVisitCount : (current.visit_count || 1) + 1,
      last_path: currentPath,
      is_online: true,
      last_visit: nowIso,
      is_real: true,
      is_authenticated: resolvedUser.isAuthenticated || current.is_authenticated || false,
      user_id: resolvedUser.userId || current.user_id,
      user_email: resolvedUser.userEmail || current.user_email,
      user_name: resolvedUser.userName || current.user_name,
      user_role: resolvedUser.userRole || current.user_role,
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
      visit_count: remoteVisitCount,
      last_path: currentPath,
      referrer: referrerUrl,
      is_online: true,
      first_visit: remoteFirstVisit,
      last_visit: nowIso,
      is_real: true,
      is_authenticated: resolvedUser.isAuthenticated,
      user_id: resolvedUser.userId,
      user_email: resolvedUser.userEmail,
      user_name: resolvedUser.userName,
      user_role: resolvedUser.userRole,
    };
    localLogs.unshift(updatedItem);
  }

  try {
    localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(localLogs));

    // Also append to local history cache
    let localHistory: VisitorHistoryItem[] = [];
    const rawHist = localStorage.getItem(LOCAL_HISTORY_KEY);
    if (rawHist) localHistory = JSON.parse(rawHist);
    const histItem: VisitorHistoryItem = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      device_id: deviceId,
      ip_address: geo.ip || "116.111.184.173",
      city: geo.city || "TP. Hồ Chí Minh",
      region: geo.region || "Việt Nam",
      country: geo.country || "Việt Nam",
      device_type: info.deviceType,
      os: info.os,
      browser: info.browser,
      path: currentPath,
      referrer: referrerUrl,
      action: "pageview",
      is_authenticated: resolvedUser.isAuthenticated,
      user_id: resolvedUser.userId,
      user_email: resolvedUser.userEmail,
      user_name: resolvedUser.userName,
      user_role: resolvedUser.userRole,
      is_real: true,
      created_at: nowIso,
    };
    localHistory.unshift(histItem);
    if (localHistory.length > 300) localHistory = localHistory.slice(0, 300);
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(localHistory));

    // Dispatch instant realtime update across tabs and windows
    window.dispatchEvent(new CustomEvent("eaagri_visitor_update"));
    if (typeof BroadcastChannel !== "undefined") {
      const channel = new BroadcastChannel("eaagri_visitor_channel");
      channel.postMessage({ type: "VISITOR_HIT", path: currentPath });
      channel.close();
    }
  } catch {}
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
 * Check if visitor_logs table exists and is accessible in Supabase
 */
export async function checkSupabaseVisitorTableStatus(): Promise<{
  isConfigured: boolean;
  tableExists: boolean;
  errorMessage?: string;
}> {
  if (!isRealSupabaseConfigured()) {
    return { isConfigured: false, tableExists: false, errorMessage: "Chưa cấu hình Supabase URL hoặc Key" };
  }
  try {
    const { error } = await supabase.from("visitor_logs").select("id").limit(1);
    if (error) {
      return { isConfigured: true, tableExists: false, errorMessage: error.message };
    }
    return { isConfigured: true, tableExists: true };
  } catch (err: any) {
    return { isConfigured: true, tableExists: false, errorMessage: err.message };
  }
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
    const userAuth = getCurrentVisitorUser();
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
      is_real: true,
      is_authenticated: userAuth.isAuthenticated,
      user_id: userAuth.userId,
      user_email: userAuth.userEmail,
      user_name: userAuth.userName,
      user_role: userAuth.userRole,
    };
    localLogs = [firstItem];
    try {
      localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(localLogs));
    } catch {}
  }

  return localLogs;
}

/**
 * Retrieve visitor logs from Supabase (Cloud Sync), Server API, or fallback to LocalStorage
 */
export async function getVisitorLogs(): Promise<{ logs: VisitorLogItem[]; isFromCloud: boolean }> {
  // 1. Query Supabase FIRST if configured (True Cross-Device Cloud Sync)
  if (isRealSupabaseConfigured()) {
    try {
      const queryPromise = supabase
        .from("visitor_logs")
        .select("*")
        .order("last_visit", { ascending: false });

      const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: new Error("Supabase timeout") }), 3000)
      );

      const { data, error } = (await Promise.race([queryPromise, timeoutPromise])) as any;

      if (!error && Array.isArray(data) && data.length > 0) {
        // Automatically mark stale entries (> 2 mins without heartbeat) as offline
        const now = Date.now();
        const cleaned = data.map((item: VisitorLogItem) => {
          const diff = now - new Date(item.last_visit).getTime();
          if (item.is_online && diff > 120000) {
            return { ...item, is_online: false };
          }
          return item;
        });

        try {
          localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(cleaned));
        } catch {}

        return {
          logs: cleaned,
          isFromCloud: true,
        };
      }
    } catch {
      // Fall through to server API
    }
  }

  // 2. Query central server API (/api/visitor-track) which has multi-device synced data
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

  // 3. Fallback to local logs
  return {
    logs: getLocalOrSeedLogs(),
    isFromCloud: false,
  };
}

/**
 * Retrieve detailed chronological access history logs
 */
export async function getVisitorHistoryLogs(): Promise<{ history: VisitorHistoryItem[]; isFromCloud: boolean }> {
  // 1. Try Supabase visitor_history_logs
  if (isRealSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("visitor_history_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (!error && Array.isArray(data) && data.length > 0) {
        try {
          localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(data));
        } catch {}
        return { history: data as VisitorHistoryItem[], isFromCloud: true };
      }
    } catch {}
  }

  // 2. Try Server API /api/visitor-history
  try {
    const res = await fetch("/api/visitor-history");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        try {
          localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(data));
        } catch {}
        return { history: data as VisitorHistoryItem[], isFromCloud: true };
      }
    }
  } catch {}

  // 3. Fallback to local cache
  try {
    const raw = localStorage.getItem(LOCAL_HISTORY_KEY);
    if (raw) {
      return { history: JSON.parse(raw), isFromCloud: false };
    }
  } catch {}

  return { history: [], isFromCloud: false };
}

/**
 * Clear only sample/mock visitor logs, retaining 100% of real devices
 */
export async function clearSampleVisitorLogs(): Promise<number> {
  let deletedCount = 0;

  // 1. Request server API to delete sample logs
  try {
    const res = await fetch("/api/visitor-track?type=sample", { method: "DELETE" });
    if (res.ok) {
      const data = await res.json();
      if (data?.logs && Array.isArray(data.logs)) {
        localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(data.logs));
        window.dispatchEvent(new CustomEvent("eaagri_visitor_update"));
        deletedCount = data.deletedCount || 1;
      }
    }
  } catch {}

  // 2. Delete from Supabase if connected
  if (isRealSupabaseConfigured()) {
    try {
      await supabase.from("visitor_logs").delete().eq("is_real", false);
    } catch {}
  }

  // 3. Filter local storage cache
  try {
    const raw = localStorage.getItem(LOCAL_LOGS_KEY);
    if (raw) {
      const parsed: VisitorLogItem[] = JSON.parse(raw);
      const realOnly = parsed.filter(isRealVisitor);
      deletedCount = Math.max(deletedCount, parsed.length - realOnly.length);
      localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(realOnly));
    }
  } catch {}

  // 4. Dispatch update event across tabs & windows
  try {
    window.dispatchEvent(new CustomEvent("eaagri_visitor_update"));
    if (typeof BroadcastChannel !== "undefined") {
      const channel = new BroadcastChannel("eaagri_visitor_channel");
      channel.postMessage({ type: "VISITOR_CLEARED_SAMPLE" });
      channel.close();
    }
  } catch {}

  return deletedCount;
}

/**
 * Delete a single visitor entry by ID or Device ID
 */
export async function deleteSingleVisitorLog(idOrDeviceId: string): Promise<void> {
  if (isRealSupabaseConfigured()) {
    try {
      await supabase
        .from("visitor_logs")
        .delete()
        .or(`id.eq.${idOrDeviceId},device_id.eq.${idOrDeviceId}`);
    } catch {}
  }

  try {
    await fetch(`/api/visitor-track?id=${encodeURIComponent(idOrDeviceId)}`, { method: "DELETE" });
  } catch {}

  try {
    const raw = localStorage.getItem(LOCAL_LOGS_KEY);
    if (raw) {
      const parsed: VisitorLogItem[] = JSON.parse(raw);
      const filtered = parsed.filter(
        (item) => item.id !== idOrDeviceId && item.device_id !== idOrDeviceId
      );
      localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(filtered));
    }
  } catch {}

  try {
    window.dispatchEvent(new CustomEvent("eaagri_visitor_update"));
    if (typeof BroadcastChannel !== "undefined") {
      const channel = new BroadcastChannel("eaagri_visitor_channel");
      channel.postMessage({ type: "VISITOR_DELETED_ONE", id: idOrDeviceId });
      channel.close();
    }
  } catch {}
}

/**
 * Clear all visitor logs
 */
export async function clearVisitorLogs(): Promise<void> {
  if (isRealSupabaseConfigured()) {
    try {
      await supabase.from("visitor_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    } catch {}
  }

  try {
    await fetch("/api/visitor-track", { method: "DELETE" });
  } catch {}

  try {
    localStorage.removeItem(LOCAL_LOGS_KEY);
    window.dispatchEvent(new CustomEvent("eaagri_visitor_update"));
  } catch {}
}

/**
 * Clear all visitor history logs
 */
export async function clearVisitorHistoryLogs(): Promise<void> {
  if (isRealSupabaseConfigured()) {
    try {
      await supabase.from("visitor_history_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    } catch {}
  }

  try {
    await fetch("/api/visitor-history", { method: "DELETE" });
  } catch {}

  try {
    localStorage.removeItem(LOCAL_HISTORY_KEY);
    window.dispatchEvent(new CustomEvent("eaagri_visitor_update"));
  } catch {}
}

/**
 * Export device summary logs to CSV file with UTF-8 BOM for Microsoft Excel
 */
export function exportVisitorLogsToCsv(logs: VisitorLogItem[]): void {
  if (!logs || logs.length === 0) return;

  const headers = [
    "Xác thực thiết bị",
    "Đối tượng truy cập",
    "Tài khoản / Email",
    "Tên người dùng",
    "Vai trò (Role)",
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
    isRealVisitor(log) ? '"Thiết bị thật"' : '"Dữ liệu mẫu"',
    log.is_authenticated ? '"Đã đăng nhập"' : '"Khách vãng lai"',
    `"${log.user_email || ''}"`,
    `"${log.user_name || ''}"`,
    `"${log.user_role || (log.is_authenticated ? 'user' : 'khách')}"`,
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
  link.setAttribute("download", `eaagri_visitor_devices_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export detailed access history log stream to CSV with UTF-8 BOM
 */
export function exportVisitorHistoryToCsv(history: VisitorHistoryItem[]): void {
  if (!history || history.length === 0) return;

  const headers = [
    "Thời gian",
    "Hành động",
    "Đường dẫn (Path)",
    "Đối tượng",
    "Tên người dùng",
    "Email",
    "Vai trò (Role)",
    "Địa chỉ IP",
    "Vị trí",
    "Thiết bị",
    "Hệ điều hành",
    "Trình duyệt",
    "Nguồn giới thiệu",
    "Mã thiết bị",
  ];

  const rows = history.map((item) => [
    `"${new Date(item.created_at).toLocaleString('vi-VN')}"`,
    `"${item.action === 'pageview' ? 'Xem trang' : item.action === 'login' ? 'Đăng nhập' : item.action}"`,
    `"${item.path}"`,
    item.is_authenticated ? '"Thành viên"' : '"Khách vãng lai"',
    `"${item.user_name || ''}"`,
    `"${item.user_email || ''}"`,
    `"${item.user_role || (item.is_authenticated ? 'user' : 'khách')}"`,
    `"${item.ip_address}"`,
    `"${item.city ? item.city + ', ' + item.country : item.country}"`,
    `"${item.device_type}"`,
    `"${item.os}"`,
    `"${item.browser}"`,
    `"${item.referrer}"`,
    `"${item.device_id}"`,
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const dateStr = new Date().toISOString().split("T")[0];
  link.setAttribute("href", url);
  link.setAttribute("download", `eaagri_access_history_logs_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Check if a visitor is currently online (heartbeat within 2 minutes)
 */
export function isVisitorOnline(log: VisitorLogItem): boolean {
  if (!log) return false;
  const diff = Date.now() - new Date(log.last_visit).getTime();
  return Boolean(log.is_online) && diff < 120000;
}

/**
 * Send lightweight heartbeat to keep session active (online)
 */
export async function sendVisitorHeartbeat(currentPath: string = "/"): Promise<void> {
  if (typeof window === "undefined") return;
  const deviceId = getOrCreateDeviceId();
  const nowIso = new Date().toISOString();

  // 1. Update Supabase
  if (isRealSupabaseConfigured()) {
    try {
      await supabase
        .from("visitor_logs")
        .update({ last_visit: nowIso, is_online: true, last_path: currentPath })
        .eq("device_id", deviceId);
    } catch {}
  }

  // 2. Update Server API
  try {
    await fetch("/api/visitor-track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        device_id: deviceId,
        action: "heartbeat",
        last_path: currentPath,
      }),
    });
  } catch {}
}

/**
 * Notify server that user is leaving or closing tab
 */
export function sendVisitorLeave(): void {
  if (typeof window === "undefined") return;
  const deviceId = getOrCreateDeviceId();
  const payload = JSON.stringify({
    device_id: deviceId,
    action: "leave",
    is_online: false,
  });

  // 1. Update Supabase
  if (isRealSupabaseConfigured()) {
    try {
      supabase
        .from("visitor_logs")
        .update({ is_online: false })
        .eq("device_id", deviceId)
        .then(() => {});
    } catch {}
  }

  // 2. Send Beacon / Keepalive fetch
  if (navigator.sendBeacon) {
    try {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/visitor-track", blob);
      return;
    } catch {}
  }

  try {
    fetch("/api/visitor-track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    });
  } catch {}
}

/**
 * Summary statistics for the Live Floating Traffic Widget
 */
export interface LiveTrafficWidgetStats {
  activeNow: number;
  todayVisits: number;
  totalVisits: number;
  totalDevices: number;
  desktopPercent: number;
  mobilePercent: number;
  tabletPercent: number;
  desktopVisits: number;
  mobileVisits: number;
  tabletVisits: number;
}

export function computeTrafficStats(logs: VisitorLogItem[]): LiveTrafficWidgetStats {
  const realLogs = logs.filter(isRealVisitor);
  const scopedLogs = realLogs.length > 0 ? realLogs : logs;

  const onlineCount = scopedLogs.filter(isVisitorOnline).length;
  // If the page is active in browser, there is at least 1 current visitor
  const activeNow = Math.max(1, onlineCount);

  const todayStr = new Date().toDateString();
  const todayVisits = scopedLogs
    .filter((l) => new Date(l.last_visit).toDateString() === todayStr)
    .reduce((acc, curr) => acc + (curr.visit_count || 1), 0);

  const totalVisits = scopedLogs.reduce((acc, curr) => acc + (curr.visit_count || 1), 0);
  const totalDevices = scopedLogs.length;

  const devices = {
    Desktop: 0,
    Mobile: 0,
    Tablet: 0,
  };

  scopedLogs.forEach((l) => {
    const v = l.visit_count || 1;
    if (l.device_type === "Mobile") devices.Mobile += v;
    else if (l.device_type === "Tablet") devices.Tablet += v;
    else devices.Desktop += v;
  });

  const desktopPercent = totalVisits ? Math.round((devices.Desktop / totalVisits) * 100) : 0;
  const mobilePercent = totalVisits ? Math.round((devices.Mobile / totalVisits) * 100) : 0;
  const tabletPercent = totalVisits ? Math.max(0, 100 - desktopPercent - mobilePercent) : 0;

  return {
    activeNow,
    todayVisits,
    totalVisits,
    totalDevices,
    desktopPercent,
    mobilePercent,
    tabletPercent,
    desktopVisits: devices.Desktop,
    mobileVisits: devices.Mobile,
    tabletVisits: devices.Tablet,
  };
}

