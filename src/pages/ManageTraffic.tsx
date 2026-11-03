import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { supabase } from "../utils/supabase/client";
import {
  getVisitorLogs,
  getVisitorHistoryLogs,
  getLocalOrSeedLogs,
  isRealVisitor,
  isItemBot,
  purgeBotLogsFromDatabase,
  isVisitorOnline,
  clearSampleVisitorLogs,
  deleteSingleVisitorLog,
  exportVisitorLogsToCsv,
  exportVisitorHistoryToCsv,
  clearVisitorHistoryLogs,
  checkSupabaseVisitorTableStatus,
  isAuthorizedAdminRole,
  type VisitorLogItem,
  type VisitorHistoryItem,
} from "../services/visitorTracker";

const SQL_SETUP_SCRIPT = `-- =======================================================
-- SQL MIGRATION FOR EAAGRI VISITOR LOGS & REALTIME ACCESS TRACKING
-- Run this script in your Supabase SQL Editor (SQL Editor -> New Query -> Run)
-- =======================================================

CREATE TABLE IF NOT EXISTS public.visitor_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id TEXT NOT NULL UNIQUE,
    ip_address TEXT NOT NULL,
    city TEXT DEFAULT 'Không xác định',
    region TEXT DEFAULT 'Việt Nam',
    country TEXT DEFAULT 'Việt Nam',
    device_type TEXT NOT NULL DEFAULT 'Desktop',
    os TEXT DEFAULT 'Windows',
    browser TEXT DEFAULT 'Chrome',
    screen_resolution TEXT DEFAULT '1920x1080',
    visit_count INTEGER NOT NULL DEFAULT 1,
    last_path TEXT DEFAULT '/',
    referrer TEXT DEFAULT 'Trực tiếp (Direct)',
    is_online BOOLEAN NOT NULL DEFAULT true,
    first_visit TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_visit TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_real BOOLEAN NOT NULL DEFAULT true,
    is_bot BOOLEAN NOT NULL DEFAULT false,
    is_authenticated BOOLEAN NOT NULL DEFAULT false,
    user_id TEXT,
    user_email TEXT,
    user_name TEXT,
    user_role TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.visitor_history_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    city TEXT DEFAULT 'Không xác định',
    region TEXT DEFAULT 'Việt Nam',
    country TEXT DEFAULT 'Việt Nam',
    device_type TEXT NOT NULL DEFAULT 'Desktop',
    os TEXT DEFAULT 'Windows',
    browser TEXT DEFAULT 'Chrome',
    path TEXT NOT NULL DEFAULT '/',
    referrer TEXT DEFAULT 'Trực tiếp (Direct)',
    action TEXT NOT NULL DEFAULT 'pageview',
    is_authenticated BOOLEAN NOT NULL DEFAULT false,
    user_id TEXT,
    user_email TEXT,
    user_name TEXT,
    user_role TEXT,
    is_real BOOLEAN NOT NULL DEFAULT true,
    is_bot BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure is_bot and is_real columns exist if tables already created
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'visitor_logs' AND column_name = 'is_bot') THEN
        ALTER TABLE public.visitor_logs ADD COLUMN is_bot BOOLEAN NOT NULL DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'visitor_history_logs' AND column_name = 'is_bot') THEN
        ALTER TABLE public.visitor_history_logs ADD COLUMN is_bot BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_visitor_logs_last_visit ON public.visitor_logs(last_visit DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_ip ON public.visitor_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_device_id ON public.visitor_logs(device_id);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_is_online ON public.visitor_logs(is_online);

CREATE INDEX IF NOT EXISTS idx_visitor_history_created_at ON public.visitor_history_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_history_device_id ON public.visitor_history_logs(device_id);
CREATE INDEX IF NOT EXISTS idx_visitor_history_ip ON public.visitor_history_logs(ip_address);

ALTER TABLE public.visitor_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_history_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public to record visit logs" ON public.visitor_logs;
CREATE POLICY "Allow public to record visit logs"
ON public.visitor_logs
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public to record history logs" ON public.visitor_history_logs;
CREATE POLICY "Allow public to record history logs"
ON public.visitor_history_logs
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.visitor_logs;
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.visitor_history_logs;
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_object THEN NULL;
END $$;

-- CLEANUP / PURGE BOT & CRAWLER SPAM (Run this if you want to wipe old crawler records)
DELETE FROM public.visitor_logs
WHERE os = 'Linux' AND (screen_resolution LIKE '%800%' OR screen_resolution = '0x0')
   OR ip_address LIKE '13.57.%'
   OR ip_address LIKE '54.183.%'
   OR ip_address LIKE '54.215.%'
   OR ip_address LIKE '52.53.%'
   OR is_bot = true;

DELETE FROM public.visitor_history_logs
WHERE os = 'Linux'
   OR ip_address LIKE '13.57.%'
   OR ip_address LIKE '54.183.%'
   OR ip_address LIKE '54.215.%'
   OR ip_address LIKE '52.53.%'
   OR is_bot = true;
`;

export default function ManageTraffic() {
  const { user, profile } = useAuth();
  // Authorized: SA or Admin role or Master ID
  const isAdmin = isAuthorizedAdminRole(user, profile);

  const [logs, setLogs] = useState<VisitorLogItem[]>(() => getLocalOrSeedLogs());
  const [historyLogs, setHistoryLogs] = useState<VisitorHistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<"devices" | "history">("devices");
  const [supabaseStatus, setSupabaseStatus] = useState<{
    checked: boolean;
    tableExists: boolean;
    errorMessage?: string;
  }>({ checked: false, tableExists: true });
  const [isSqlCopied, setIsSqlCopied] = useState(false);

  // Filters for Device Summary
  const [deviceFilter, setDeviceFilter] = useState<"All" | "Desktop" | "Mobile" | "Tablet">("All");
  const [sourceFilter, setSourceFilter] = useState<"Real" | "All" | "Sample" | "Bot">("Real");
  const [authFilter, setAuthFilter] = useState<"All" | "Member" | "Guest">("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Filters for History Stream
  const [historyActionFilter, setHistoryActionFilter] = useState<string>("All");
  const [historyAuthFilter, setHistoryAuthFilter] = useState<"All" | "Member" | "Guest">("All");
  const [historySearchQuery, setHistorySearchQuery] = useState("");

  const [isCleaning, setIsCleaning] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "info" | "error"; text: string } | null>(null);

  // Load and update visitor data silently
  const loadData = async () => {
    try {
      const res = await getVisitorLogs();
      setLogs(res.logs);

      const histRes = await getVisitorHistoryLogs();
      setHistoryLogs(histRes.history);
    } catch (err) {
      console.error("Error loading visitor logs:", err);
    }
  };

  // Check Supabase visitor table existence
  useEffect(() => {
    if (!isAdmin) return;
    checkSupabaseVisitorTableStatus().then((status) => {
      setSupabaseStatus({
        checked: true,
        tableExists: status.tableExists,
        errorMessage: status.errorMessage,
      });
    });
  }, [isAdmin]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!isAdmin) return;

    loadData();

    // 1. Supabase Realtime channel for instant cross-device updates
    let channel: any = null;
    try {
      channel = supabase
        .channel("admin-traffic-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "visitor_logs" },
          () => {
            loadData();
          }
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "visitor_history_logs" },
          () => {
            loadData();
          }
        )
        .subscribe();
    } catch {}

    // 2. Listen to BroadcastChannel across different browser tabs/windows
    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      try {
        bc = new BroadcastChannel("eaagri_visitor_channel");
        bc.onmessage = () => {
          loadData();
        };
      } catch {}
    }

    // 3. Listen to custom DOM event in same window
    const handleVisitorUpdate = () => {
      loadData();
    };
    window.addEventListener("eaagri_visitor_update", handleVisitorUpdate);

    // 4. Listen to localStorage storage events from other tabs
    const handleStorage = (e: StorageEvent) => {
      if (
        e.key === "eaagri_visitor_logs_cache" ||
        e.key === "eaagri_visitor_history_cache"
      ) {
        loadData();
      }
    };
    window.addEventListener("storage", handleStorage);

    // 5. Polling heartbeat every 4 seconds for continuous realtime accuracy
    const timer = setInterval(() => {
      loadData();
    }, 4000);

    // 6. Listen to Vite WebSocket for instant 0ms realtime updates
    if (import.meta.hot) {
      import.meta.hot.on("eaagri:visitor-updated", (data: any) => {
        if (Array.isArray(data)) {
          setLogs(data);
        }
      });
      import.meta.hot.on("eaagri:visitor-history-updated", (data: any) => {
        if (Array.isArray(data)) {
          setHistoryLogs(data);
        }
      });
    }

    return () => {
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch {}
      }
      if (bc) bc.close();
      window.removeEventListener("eaagri_visitor_update", handleVisitorUpdate);
      window.removeEventListener("storage", handleStorage);
      clearInterval(timer);
    };
  }, [isAdmin]);

  // Overall comparison metrics (Real vs Sample & Member vs Guest & Bot)
  const globalSummary = useMemo(() => {
    const botLogs = logs.filter(isItemBot);
    const realLogs = logs.filter(isRealVisitor);
    const sampleLogs = logs.filter((l) => !isRealVisitor(l) && !isItemBot(l));

    const totalBotDevices = botLogs.length;
    const totalBotVisits = botLogs.reduce((acc, curr) => acc + (curr.visit_count || 1), 0);

    const totalRealDevices = realLogs.length;
    const totalRealVisits = realLogs.reduce((acc, curr) => acc + (curr.visit_count || 1), 0);

    const totalSampleDevices = sampleLogs.length;
    const totalSampleVisits = sampleLogs.reduce((acc, curr) => acc + (curr.visit_count || 1), 0);

    const totalAllDevices = logs.length;
    const totalAllVisits = logs.reduce((acc, curr) => acc + (curr.visit_count || 1), 0);

    const totalMembers = logs.filter((l) => l.is_authenticated === true).length;
    const totalGuests = logs.filter((l) => !l.is_authenticated).length;

    const realDevicePercent = totalAllDevices ? Math.round((totalRealDevices / totalAllDevices) * 100) : 100;
    const realVisitsPercent = totalAllVisits ? Math.round((totalRealVisits / totalAllVisits) * 100) : 100;

    return {
      totalBotDevices,
      totalBotVisits,
      totalRealDevices,
      totalRealVisits,
      totalSampleDevices,
      totalSampleVisits,
      totalAllDevices,
      totalAllVisits,
      totalMembers,
      totalGuests,
      realDevicePercent,
      realVisitsPercent,
    };
  }, [logs]);

  // Scoped logs based on selected source filter (Real vs All vs Sample vs Bot)
  const scopedLogs = useMemo(() => {
    if (sourceFilter === "Real") return logs.filter(isRealVisitor);
    if (sourceFilter === "Sample") return logs.filter((l) => !isRealVisitor(l) && !isItemBot(l));
    if (sourceFilter === "Bot") return logs.filter(isItemBot);
    return logs;
  }, [logs, sourceFilter]);

  // A signed-in person may use several devices and networks. Present one account row
  // while retaining the combined device/IP details for admins.
  const groupedScopedLogs = useMemo(() => {
    const groups = new Map<string, VisitorLogItem>();
    for (const log of scopedLogs) {
      const key = log.is_authenticated && log.user_id
        ? `user:${log.user_id}`
        : `device:${log.device_id}`;
      const existing = groups.get(key);
      if (!existing) {
        groups.set(key, { ...log, ip_address: log.ip_address || "" });
        continue;
      }
      const ips = new Set([...(existing.ip_address || "").split(", "), log.ip_address].filter(Boolean));
      const devices = new Set([...(existing.os || "").split(" • "), log.os].filter(Boolean));
      existing.ip_address = [...ips].join(", ");
      existing.os = [...devices].join(" • ");
      existing.visit_count = (existing.visit_count || 0) + (log.visit_count || 0);
      existing.first_visit = new Date(existing.first_visit) < new Date(log.first_visit) ? existing.first_visit : log.first_visit;
      existing.last_visit = new Date(existing.last_visit) > new Date(log.last_visit) ? existing.last_visit : log.last_visit;
      existing.is_online = existing.is_online || log.is_online;
    }
    return [...groups.values()];
  }, [scopedLogs]);

  // Compute statistics dynamically based on current scope
  const stats = useMemo(() => {
    const totalVisits = scopedLogs.reduce((acc, curr) => acc + (curr.visit_count || 1), 0);
    const uniqueDevices = scopedLogs.length;
    // Active now: truly online devices (heartbeat / visit within 2.5 minutes)
    const activeNow = scopedLogs.filter(isVisitorOnline).length;

    // Today's visits
    const todayStr = new Date().toDateString();
    const todayVisits = historyLogs.length
      ? historyLogs.filter((event) => (event.action === "pageview" || !event.action) && new Date(event.created_at).toDateString() === todayStr && (sourceFilter !== "Real" || event.is_real !== false) && (sourceFilter !== "Bot" || event.is_bot === true)).length
      : scopedLogs.filter((l) => new Date(l.last_visit).toDateString() === todayStr).length;

    // Auth breakdown inside scope
    const membersCount = new Set(scopedLogs.filter((l) => l.is_authenticated).map((l) => l.user_id || l.user_email || l.device_id)).size;
    const guestsCount = scopedLogs.filter((l) => !l.is_authenticated).length;

    // Device breakdown
    const devices = {
      Desktop: { count: 0, visits: 0 },
      Mobile: { count: 0, visits: 0 },
      Tablet: { count: 0, visits: 0 },
    };

    scopedLogs.forEach((l) => {
      const v = l.visit_count || 1;
      if (l.device_type === "Mobile") {
        devices.Mobile.count += 1;
        devices.Mobile.visits += v;
      } else if (l.device_type === "Tablet") {
        devices.Tablet.count += 1;
        devices.Tablet.visits += v;
      } else {
        devices.Desktop.count += 1;
        devices.Desktop.visits += v;
      }
    });

    const desktopPercent = totalVisits ? Math.round((devices.Desktop.visits / totalVisits) * 100) : 0;
    const mobilePercent = totalVisits ? Math.round((devices.Mobile.visits / totalVisits) * 100) : 0;
    const tabletPercent = totalVisits ? Math.max(0, 100 - desktopPercent - mobilePercent) : 0;

    // Operating systems breakdown
    const osMap: Record<string, number> = {};
    scopedLogs.forEach((l) => {
      const os = l.os || "Khác";
      osMap[os] = (osMap[os] || 0) + (l.visit_count || 1);
    });
    const topOs = Object.entries(osMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Browsers breakdown
    const browserMap: Record<string, number> = {};
    scopedLogs.forEach((l) => {
      const b = l.browser || "Khác";
      browserMap[b] = (browserMap[b] || 0) + (l.visit_count || 1);
    });
    const topBrowsers = Object.entries(browserMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Top Pages breakdown
    const pageMap: Record<string, number> = {};
    scopedLogs.forEach((l) => {
      const p = l.last_path || "/";
      pageMap[p] = (pageMap[p] || 0) + (l.visit_count || 1);
    });
    const topPages = Object.entries(pageMap)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalVisits,
      uniqueDevices,
      activeNow,
      todayVisits,
      membersCount,
      guestsCount,
      devices,
      desktopPercent,
      mobilePercent,
      tabletPercent,
      topOs,
      topBrowsers,
      topPages,
    };
  }, [scopedLogs, historyLogs, sourceFilter]);

  // Filtered devices list for recent activity table
  const filteredLogs = useMemo(() => {
    return groupedScopedLogs.filter((log) => {
      const matchDevice = deviceFilter === "All" || log.device_type === deviceFilter;
      const matchAuth =
        authFilter === "All" ||
        (authFilter === "Member" && log.is_authenticated === true) ||
        (authFilter === "Guest" && !log.is_authenticated);

      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        (log.ip_address && log.ip_address.toLowerCase().includes(q)) ||
        (log.city && log.city.toLowerCase().includes(q)) ||
        log.os.toLowerCase().includes(q) ||
        log.browser.toLowerCase().includes(q) ||
        log.device_type.toLowerCase().includes(q) ||
        log.last_path.toLowerCase().includes(q) ||
        (log.device_id && log.device_id.toLowerCase().includes(q)) ||
        (log.user_email && log.user_email.toLowerCase().includes(q)) ||
        (log.user_name && log.user_name.toLowerCase().includes(q)) ||
        (q === "khách" && !log.is_authenticated) ||
        (q === "đăng nhập" && log.is_authenticated);

      return matchDevice && matchAuth && matchSearch;
    });
  }, [groupedScopedLogs, deviceFilter, authFilter, searchQuery]);

  // Action: Purge bot / crawler logs from Database & Local
  const handlePurgeBots = async () => {
    if (globalSummary.totalBotDevices === 0) {
      setToast({ type: "info", text: "Hệ thống hiện không phát hiện bot hay IP quét rác nào!" });
      return;
    }
    const confirmClean = window.confirm(
      `Phát hiện ${globalSummary.totalBotDevices} thiết bị bot / crawler quét rác (${globalSummary.totalBotVisits} lượt truy cập).\n\nBạn có chắc chắn muốn dọn dẹp và xóa toàn bộ các IP quét rác này khỏi cơ sở dữ liệu để giải phóng server và làm sạch thống kê?`
    );
    if (!confirmClean) return;

    setIsCleaning(true);
    try {
      const res = await purgeBotLogsFromDatabase();
      await loadData();
      setToast({
        type: "success",
        text: res.message || `Đã dọn dẹp ${globalSummary.totalBotDevices} bot / crawler thành công!`,
      });
      setSourceFilter("Real");
    } catch (err) {
      setToast({ type: "error", text: "Lỗi khi dọn dẹp bot. Vui lòng thử lại!" });
    } finally {
      setIsCleaning(false);
    }
  };

  // Action: Clear sample/mock logs
  const handleClearSample = async () => {
    if (globalSummary.totalSampleDevices === 0) {
      setToast({ type: "info", text: "Hệ thống hiện không còn dữ liệu mẫu nào cần dọn dẹp!" });
      return;
    }
    const confirmClean = window.confirm(
      `Bạn có chắc chắn muốn dọn dẹp và xóa toàn bộ ${globalSummary.totalSampleDevices} thiết bị mẫu khỏi hệ thống?\n\nSau khi xóa, hệ thống sẽ chỉ giữ lại ${globalSummary.totalRealDevices} thiết bị thật 100%.`
    );
    if (!confirmClean) return;

    setIsCleaning(true);
    try {
      const deleted = await clearSampleVisitorLogs();
      await loadData();
      setToast({
        type: "success",
        text: `Đã dọn dẹp thành công ${deleted || globalSummary.totalSampleDevices} thiết bị mẫu! Hiện chỉ còn các thiết bị thật.`,
      });
      setSourceFilter("Real");
    } catch (err) {
      setToast({ type: "error", text: "Lỗi khi dọn dẹp dữ liệu mẫu. Vui lòng thử lại!" });
    } finally {
      setIsCleaning(false);
    }
  };

  // Action: Delete single log
  const handleDeleteSingle = async (item: VisitorLogItem) => {
    const isReal = isRealVisitor(item);
    const label = isReal ? "thiết bị thật" : "thiết bị mẫu";
    const confirmDel = window.confirm(
      `Xác nhận xóa bản ghi ${label} (IP: ${item.ip_address || "127.0.0.1"} - ${item.os})?`
    );
    if (!confirmDel) return;

    try {
      await deleteSingleVisitorLog(item.id || item.device_id);
      await loadData();
      setToast({
        type: "success",
        text: `Đã xóa bản ghi ${item.ip_address || item.os} khỏi danh sách.`,
      });
    } catch (err) {
      setToast({ type: "error", text: "Không thể xóa bản ghi này." });
    }
  };

  // Action: Export CSV for Devices
  const handleExportCsv = () => {
    exportVisitorLogsToCsv(filteredLogs);
    setToast({
      type: "info",
      text: `Đã xuất ${filteredLogs.length} thiết bị ra file CSV (có thông tin Thiết bị thật & Khách / Đã đăng nhập).`,
    });
  };

  // Action: Export CSV for History Logs
  const handleExportHistoryCsv = () => {
    exportVisitorHistoryToCsv(filteredHistory);
    setToast({
      type: "info",
      text: `Đã xuất ${filteredHistory.length} sự kiện nhật ký truy cập ra file CSV.`,
    });
  };

  // Action: Clear History Logs
  const handleClearHistory = async () => {
    const confirmClear = window.confirm(
      "Bạn có chắc chắn muốn xóa toàn bộ lịch sử sự kiện truy cập không?"
    );
    if (!confirmClear) return;
    try {
      await clearVisitorHistoryLogs();
      await loadData();
      setToast({ type: "success", text: "Đã xóa toàn bộ nhật ký sự kiện truy cập thành công!" });
    } catch {
      setToast({ type: "error", text: "Không thể xóa nhật ký lúc này." });
    }
  };

  // Action: Copy Supabase Setup SQL
  const handleCopySql = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(SQL_SETUP_SCRIPT);
    }
    setIsSqlCopied(true);
    setToast({
      type: "success",
      text: "Đã sao chép mã SQL cài đặt Supabase! Hãy mở Supabase -> SQL Editor -> Dán và bấm Run.",
    });
    setTimeout(() => setIsSqlCopied(false), 4000);
  };

  // Action: Retry Supabase connection check
  const handleCheckSupabaseAgain = async () => {
    setToast({ type: "info", text: "Đang kiểm tra kết nối bảng visitor_logs trên Supabase..." });
    const status = await checkSupabaseVisitorTableStatus();
    setSupabaseStatus({
      checked: true,
      tableExists: status.tableExists,
      errorMessage: status.errorMessage,
    });
    if (status.tableExists) {
      setToast({ type: "success", text: "Tuyệt vời! Bảng visitor_logs trên Supabase đã hoạt động." });
      await loadData();
    } else {
      setToast({
        type: "error",
        text: `Bảng chưa tồn tại (${status.errorMessage || "chưa tạo"}). Hãy chạy mã SQL trong Supabase SQL Editor.`,
      });
    }
  };

  // Filtered history list
  const filteredHistory = useMemo(() => {
    return historyLogs.filter((item) => {
      const matchAction =
        historyActionFilter === "All" || item.action === historyActionFilter;
      const matchAuth =
        historyAuthFilter === "All" ||
        (historyAuthFilter === "Member" && item.is_authenticated) ||
        (historyAuthFilter === "Guest" && !item.is_authenticated);

      const q = historySearchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        (item.ip_address && item.ip_address.toLowerCase().includes(q)) ||
        (item.path && item.path.toLowerCase().includes(q)) ||
        (item.user_email && item.user_email.toLowerCase().includes(q)) ||
        (item.user_name && item.user_name.toLowerCase().includes(q)) ||
        (item.city && item.city.toLowerCase().includes(q)) ||
        (item.device_type && item.device_type.toLowerCase().includes(q)) ||
        (item.os && item.os.toLowerCase().includes(q)) ||
        (item.browser && item.browser.toLowerCase().includes(q));

      return matchAction && matchAuth && matchSearch;
    });
  }, [historyLogs, historyActionFilter, historyAuthFilter, historySearchQuery]);

  // Format relative time in Vietnamese
  const formatTimeAgo = (isoString: string) => {
    const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diffSec < 60) return "Vừa xong";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút trước`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} giờ trước`;
    return new Date(isoString).toLocaleDateString("vi-VN");
  };

  // Device icon helper
  const getDeviceIcon = (deviceType: string, os: string) => {
    if (os.includes("iOS") || os.includes("macOS") || os.includes("Apple")) {
      return "ri-apple-fill";
    }
    if (os.includes("Android")) {
      return "ri-android-fill";
    }
    if (os.includes("Windows")) {
      return "ri-windows-fill";
    }
    if (deviceType === "Mobile") return "ri-smartphone-line";
    if (deviceType === "Tablet") return "ri-tablet-line";
    return "ri-computer-line";
  };

  // Page label format helper
  const formatPageName = (path: string) => {
    if (path === "/" || path === "") return "Trang chủ";
    if (path.includes("traffic")) return "Quản lý truy cập";
    if (path.includes("admin")) return "Bảng điều khiển Admin";
    if (path.includes("giai-thuong") || path.includes("awards")) return "Bình chọn NTTU Startup";
    if (path.includes("tintuc") || path.includes("tin-tuc") || path.includes("news")) return "Tin tức nông nghiệp";
    if (path.includes("kien-truc") || path.includes("architecture")) return "Kiến trúc IoT";
    if (path.includes("privacy")) return "Chính sách bảo mật";
    return path;
  };

  // If user is not Super Admin or Admin, show unauthorized screen
  if (!isAdmin) {
    return (
      <section className="traffic-counter">
        <div className="traffic-counter__container">
          <div className="traffic-counter__unauth">
            <i className="ri-lock-password-fill traffic-counter__unauth-icon" />
            <h2>Khu vực dành riêng cho Quản Trị Viên</h2>
            <p>Vui lòng đăng nhập với tài khoản có quyền Quản Trị (role SA hoặc admin) để theo dõi toàn bộ lưu lượng và nhật ký truy cập đồng bộ tất cả các máy.</p>
            <div className="traffic-counter__unauth-actions">
              <Link to="/login" className="btn btn--primary">
                <i className="ri-login-box-line" /> Đăng nhập ngay
              </Link>
              <Link to="/" className="btn btn--outline">
                <i className="ri-home-4-line" /> Về trang chủ
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="traffic-counter">
      <div className="traffic-counter__container">
        {/* Title Header */}
        <div className="traffic-counter__header">
          <div className="traffic-counter__header-left">
            <div className="traffic-counter__live-tag">
              <span className="live-pulse" />
              <span>BỘ ĐẾM TRUY CẬP THỜI GIAN THỰC</span>
            </div>
            <h1 className="traffic-counter__title">Thống Kê Lượt Xem & Thiết Bị Thật</h1>
            <p className="traffic-counter__subtitle">
              Đồng bộ dữ liệu đa thiết bị trên toàn hệ thống, theo dõi lượt xem trực tuyến, lưu lại nhật ký chi tiết và quản lý người dùng đăng nhập vs khách vãng lai.
            </p>
          </div>

          <div className="traffic-counter__realtime-tag">
            <span className="live-pulse" />
            <span>
              {supabaseStatus.tableExists
                ? "Đồng bộ Đám mây Supabase (Realtime Đa Thiết Bị)"
                : "Đồng bộ Máy chủ nội bộ & API"}
            </span>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {toast && (
          <div className={`traffic-toast traffic-toast--${toast.type}`}>
            <div className="traffic-toast__left">
              <i
                className={
                  toast.type === "success"
                    ? "ri-checkbox-circle-fill"
                    : toast.type === "error"
                    ? "ri-error-warning-fill"
                    : "ri-information-fill"
                }
              />
              <span>{toast.text}</span>
            </div>
            <button
              type="button"
              className="traffic-toast__close"
              onClick={() => setToast(null)}
              aria-label="Đóng thông báo"
            >
              <i className="ri-close-line" />
            </button>
          </div>
        )}

        {/* Supabase Table Missing Warning Card */}
        {supabaseStatus.checked && !supabaseStatus.tableExists && (
          <div className="supabase-warning-card">
            <div className="supabase-warning-card__left">
              <div className="supabase-warning-card__icon-box">
                <i className="ri-database-2-line" />
              </div>
              <div>
                <h4>Chưa kích hoạt bảng visitor_logs trên Supabase</h4>
                <p>
                  Để các thiết bị khác nhau (điện thoại, máy tính, mạng khác) đồng bộ chung 100% số lượt truy cập và xem trực tuyến, bạn hãy sao chép mã SQL và chạy trong <strong>Supabase SQL Editor</strong> (chỉ mất 5 giây).
                </p>
              </div>
            </div>
            <div className="supabase-warning-card__actions">
              <button
                type="button"
                className="btn--copy-sql"
                onClick={handleCopySql}
                title="Sao chép mã SQL migration"
              >
                <i className="ri-file-copy-line" /> {isSqlCopied ? "Đã sao chép SQL!" : "Sao chép mã SQL Supabase"}
              </button>
              <button
                type="button"
                className="btn--retry-check"
                onClick={handleCheckSupabaseAgain}
              >
                <i className="ri-refresh-line" /> Kiểm tra lại kết nối
              </button>
            </div>
          </div>
        )}

        {/* 🎛️ THANH ĐIỀU KHIỂN & BỘ LỌC NGUỒN DỮ LIỆU (CHỈ THIẾT BỊ THẬT / TẤT CẢ / MẪU) */}
        <div className="traffic-control-bar">
          <div className="traffic-control-bar__left">
            <span className="traffic-control-bar__label">
              <i className="ri-shield-check-line" /> Chế độ thống kê:
            </span>
            <div className="traffic-control-bar__pills">
              <button
                type="button"
                className={`traffic-control-bar__pill-btn ${
                  sourceFilter === "Real" ? "traffic-control-bar__pill-btn--active-real" : ""
                }`}
                onClick={() => setSourceFilter("Real")}
              >
                <i className="ri-shield-check-fill" /> Chỉ thiết bị thật
                <span className="traffic-control-bar__badge">{globalSummary.totalRealDevices} máy</span>
              </button>

              <button
                type="button"
                className={`traffic-control-bar__pill-btn ${
                  sourceFilter === "All" ? "traffic-control-bar__pill-btn--active-all" : ""
                }`}
                onClick={() => setSourceFilter("All")}
              >
                <i className="ri-global-line" /> Tất cả dữ liệu
                <span className="traffic-control-bar__badge">{globalSummary.totalAllDevices} máy</span>
              </button>

              {globalSummary.totalBotDevices > 0 && (
                <button
                  type="button"
                  className={`traffic-control-bar__pill-btn ${
                    sourceFilter === "Bot" ? "traffic-control-bar__pill-btn--active-bot" : ""
                  }`}
                  onClick={() => setSourceFilter("Bot")}
                >
                  <i className="ri-robot-line" /> Bot quét rác
                  <span className="traffic-control-bar__badge traffic-control-bar__badge--bot">
                    {globalSummary.totalBotDevices} bot
                  </span>
                </button>
              )}

              {globalSummary.totalSampleDevices > 0 && (
                <button
                  type="button"
                  className={`traffic-control-bar__pill-btn ${
                    sourceFilter === "Sample" ? "traffic-control-bar__pill-btn--active-sample" : ""
                  }`}
                  onClick={() => setSourceFilter("Sample")}
                >
                  <i className="ri-flask-line" /> Dữ liệu mẫu
                  <span className="traffic-control-bar__badge">{globalSummary.totalSampleDevices} máy</span>
                </button>
              )}
            </div>
          </div>

          <div className="traffic-control-bar__actions">
            {globalSummary.totalBotDevices > 0 && (
              <button
                type="button"
                className="btn btn--danger btn-traffic-action--purge-bot"
                onClick={handlePurgeBots}
                disabled={isCleaning}
                title="Xóa toàn bộ các bản ghi bot quét rác, ngăn làm nhiễu dữ liệu và giảm tải database"
              >
                <i className={isCleaning ? "ri-loader-4-line spinning" : "ri-robot-line"} />
                {isCleaning ? "Đang xử lý..." : `Dọn sạch ${globalSummary.totalBotDevices} bot rác`}
              </button>
            )}

            {globalSummary.totalSampleDevices > 0 && (
              <button
                type="button"
                className="btn btn--danger"
                onClick={handleClearSample}
                disabled={isCleaning}
                title="Xóa vĩnh viễn các bản ghi mẫu, chỉ giữ lại thiết bị thật"
              >
                <i className={isCleaning ? "ri-loader-4-line spinning" : "ri-delete-bin-line"} />
                {isCleaning ? "Đang dọn..." : `Dọn dẹp ${globalSummary.totalSampleDevices} thiết bị mẫu`}
              </button>
            )}

            <button
              type="button"
              className="btn btn--refresh"
              onClick={handleExportCsv}
              title="Xuất danh sách ra file Excel / CSV"
            >
              <i className="ri-file-excel-2-line text-green" /> Xuất Excel
            </button>

            <button
              type="button"
              className="btn btn--refresh"
              onClick={loadData}
              title="Làm mới dữ liệu từ máy chủ"
            >
              <i className="ri-refresh-line" /> Làm mới
            </button>
          </div>
        </div>

        {/* 🛡️ BẢNG KIỂM ĐỊNH LƯU LƯỢNG (SO SÁNH THIẾT BỊ THẬT VS DỮ LIỆU MẪU & KHÁCH VS TÀI KHOẢN) */}
        <div className="traffic-purity-banner">
          <div className="traffic-purity-banner__left">
            <div className="traffic-purity-banner__shield-wrap">
              <i className="ri-shield-keyhole-line" />
            </div>
            <div className="traffic-purity-banner__title-box">
              <h3>
                Kiểm Định Dữ Liệu Truy Cập
                <span className="verified-badge">
                  {sourceFilter === "Real"
                    ? "ĐANG XEM 100% THIẾT BỊ THẬT"
                    : sourceFilter === "Sample"
                    ? "ĐANG XEM DỮ LIỆU MẪU"
                    : sourceFilter === "Bot"
                    ? "ĐANG XEM BOT / IP QUÉT RÁC"
                    : "ĐANG XEM TỔNG HỢP"}
                </span>
              </h3>
              <p>
                Phân biệt các thiết bị vật lý thật qua IP, User-Agent & độ phân giải; đồng thời xác định tài khoản đăng nhập và khách ghé thăm.
              </p>
            </div>
          </div>

          <div className="traffic-purity-banner__comparison">
            <div className="traffic-purity-banner__labels">
              <span className="traffic-purity-banner__label-real">
                <span className="dot" />
                Thiết bị thật: <strong>{globalSummary.totalRealDevices} máy</strong> ({globalSummary.totalRealVisits} lượt xem • {globalSummary.realDevicePercent}%)
              </span>
              {globalSummary.totalBotDevices > 0 && (
                <span className="traffic-purity-banner__label-bot">
                  <span className="dot" />
                  Bot quét rác: <strong>{globalSummary.totalBotDevices} máy</strong> ({globalSummary.totalBotVisits} lượt xem)
                </span>
              )}
              <span className="traffic-purity-banner__label-sample">
                <span className="dot" />
                Dữ liệu mẫu: <strong>{globalSummary.totalSampleDevices} máy</strong> ({globalSummary.totalSampleVisits} lượt xem • {100 - globalSummary.realDevicePercent}%)
              </span>
            </div>
            <div className="traffic-purity-banner__bar-wrap">
              <div
                className="traffic-purity-banner__bar-real"
                style={{ width: `${globalSummary.realDevicePercent}%` }}
                title={`Thiết bị thật: ${globalSummary.realDevicePercent}%`}
              />
              <div
                className="traffic-purity-banner__bar-sample"
                style={{ width: `${100 - globalSummary.realDevicePercent}%` }}
                title={`Dữ liệu mẫu: ${100 - globalSummary.realDevicePercent}%`}
              />
            </div>
          </div>

          {sourceFilter !== "Real" && (
            <div className="traffic-purity-banner__actions">
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => setSourceFilter("Real")}
              >
                <i className="ri-shield-check-fill" /> Chỉ xem thiết bị thật
              </button>
            </div>
          )}
        </div>

        {/* 🌟 HERO KPI BANNER (HIỂN THỊ CHUẨN XÁC THEO CHẾ ĐỘ ĐANG CHỌN) */}
        <div className="traffic-hero-card">
          <div className="traffic-hero-card__main">
            <div className="traffic-hero-card__pulse-wrap">
              <i className="ri-line-chart-fill traffic-hero-card__pulse-icon" />
            </div>
            <div className="traffic-hero-card__data">
              <span className="traffic-hero-card__lbl">
                {sourceFilter === "Real"
                  ? "TỔNG LƯỢT XEM TỪ THIẾT BỊ THẬT"
                  : sourceFilter === "Sample"
                  ? "LƯỢT XEM TỪ DỮ LIỆU MẪU"
                  : "TỔNG LƯỢT XEM TRANG (TẤT CẢ)"}
              </span>
              <div className="traffic-hero-card__num-row">
                <strong className="traffic-hero-card__num">{stats.totalVisits.toLocaleString("vi-VN")}</strong>
                <span className="traffic-hero-card__unit">lượt</span>
                {stats.todayVisits > 0 && (
                  <span className="traffic-hero-card__today-tag">
                    +{stats.todayVisits} hôm nay
                  </span>
                )}
              </div>
              <span className="traffic-hero-card__desc">
                {sourceFilter === "Real"
                  ? "Tổng số lần người dùng trên các thiết bị vật lý thật đã truy cập và mở các trang trên web"
                  : sourceFilter === "Sample"
                  ? "Lượt xem từ các thiết bị mẫu được tạo để kiểm thử giao diện"
                  : "Tổng số lần người dùng và thiết bị đã mở các trang trên web"}
              </span>
            </div>
          </div>

          <div className="traffic-hero-card__divider" />

          <div className="traffic-hero-card__metrics">
            {/* 1. Tổng thiết bị riêng biệt */}
            <div className="hero-metric-item">
              <div className="hero-metric-item__icon hero-metric-item__icon--devices">
                <i className={sourceFilter === "Real" ? "ri-shield-check-line" : "ri-computer-line"} />
              </div>
              <div className="hero-metric-item__text">
                <span className="hero-metric-item__lbl">
                  {sourceFilter === "Real" ? "Thiết bị thật" : "Tổng số máy"}
                </span>
                <strong className="hero-metric-item__val">{stats.uniqueDevices} máy</strong>
                <span className="hero-metric-item__sub">
                  {sourceFilter === "Real" ? "Người dùng thực tế" : "Thiết bị riêng biệt"}
                </span>
              </div>
            </div>

            {/* 2. Đang trực tuyến (Realtime) */}
            <div className="hero-metric-item">
              <div className="hero-metric-item__icon hero-metric-item__icon--online">
                <i className="ri-radar-fill" />
              </div>
              <div className="hero-metric-item__text">
                <span className="hero-metric-item__lbl">Đang trực tuyến</span>
                <strong className="hero-metric-item__val text-green">{stats.activeNow} máy</strong>
                <span className="hero-metric-item__sub">Thời gian thực (Realtime)</span>
              </div>
            </div>

            {/* 3. Lượt xem hôm nay */}
            <div className="hero-metric-item">
              <div className="hero-metric-item__icon hero-metric-item__icon--today">
                <i className="ri-calendar-check-line" />
              </div>
              <div className="hero-metric-item__text">
                <span className="hero-metric-item__lbl">Lượt xem hôm nay</span>
                <strong className="hero-metric-item__val text-gold">{stats.todayVisits} lượt</strong>
                <span className="hero-metric-item__sub">Từ 00:00 hôm nay</span>
              </div>
            </div>

            {/* 4. Thành viên đã đăng nhập */}
            <div
              className={`hero-metric-item hero-metric-item--clickable ${authFilter === "Member" ? "hero-metric-item--active" : ""}`}
              onClick={() => setAuthFilter(authFilter === "Member" ? "All" : "Member")}
              title="Nhấn để lọc xem thành viên đã đăng nhập"
            >
              <div className="hero-metric-item__icon hero-metric-item__icon--members">
                <i className="ri-user-star-line" />
              </div>
              <div className="hero-metric-item__text">
                <span className="hero-metric-item__lbl">Đã đăng nhập</span>
                <strong className="hero-metric-item__val text-emerald">
                  {stats.membersCount} thành viên
                </strong>
                <span className="hero-metric-item__sub">Tài khoản định danh</span>
              </div>
            </div>

            {/* 5. Khách vãng lai */}
            <div
              className={`hero-metric-item hero-metric-item--clickable ${authFilter === "Guest" ? "hero-metric-item--active" : ""}`}
              onClick={() => setAuthFilter(authFilter === "Guest" ? "All" : "Guest")}
              title="Nhấn để lọc xem khách vãng lai"
            >
              <div className="hero-metric-item__icon hero-metric-item__icon--guests">
                <i className="ri-user-shared-line" />
              </div>
              <div className="hero-metric-item__text">
                <span className="hero-metric-item__lbl">Khách ghé thăm</span>
                <strong className="hero-metric-item__val">
                  {stats.guestsCount} khách
                </strong>
                <span className="hero-metric-item__sub">Chưa tạo tài khoản</span>
              </div>
            </div>

            {/* 6. Trang xem nhiều nhất */}
            <div className="hero-metric-item">
              <div className="hero-metric-item__icon hero-metric-item__icon--page">
                <i className="ri-pages-line" />
              </div>
              <div className="hero-metric-item__text">
                <span className="hero-metric-item__lbl">Trang xem nhiều nhất</span>
                <strong className="hero-metric-item__val text-cyan" title={stats.topPages[0]?.path || "/"}>
                  {stats.topPages[0] ? formatPageName(stats.topPages[0].path) : "Trang chủ"}
                </strong>
                <span className="hero-metric-item__sub">
                  {stats.topPages[0] ? `${stats.topPages[0].count} lượt xem` : "Chưa có dữ liệu"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 💻📱📟 THỐNG KÊ CHI TIẾT THEO TỪNG LOẠI MÁY */}
        <div className="traffic-devices-grid">
          {/* Desktop */}
          <div className={`device-card ${deviceFilter === "Desktop" ? "device-card--selected" : ""}`}>
            <div className="device-card__top">
              <div className="device-card__icon device-card__icon--desktop">
                <i className="ri-computer-line" />
              </div>
              <span className="device-card__badge device-card__badge--desktop">
                {stats.desktopPercent}% truy cập
              </span>
            </div>
            <div className="device-card__body">
              <h3 className="device-card__title">Máy Tính (Desktop / PC)</h3>
              <div className="device-card__stat-row">
                <div className="device-stat">
                  <span className="device-stat__lbl">Số máy tính</span>
                  <strong className="device-stat__val">{stats.devices.Desktop.count} máy</strong>
                </div>
                <div className="device-stat">
                  <span className="device-stat__lbl">Số lượt xem</span>
                  <strong className="device-stat__val">{stats.devices.Desktop.visits} lượt</strong>
                </div>
              </div>
              <div className="device-progress-bar">
                <div
                  className="device-progress-fill device-progress-fill--desktop"
                  style={{ width: `${stats.desktopPercent}%` }}
                />
              </div>
              <button
                type="button"
                className={`device-card__action-btn ${deviceFilter === "Desktop" ? "is-active" : ""}`}
                onClick={() => setDeviceFilter(deviceFilter === "Desktop" ? "All" : "Desktop")}
              >
                <i className="ri-filter-3-line" />
                {deviceFilter === "Desktop" ? "Đang lọc máy tính" : `Xem ${stats.devices.Desktop.count} máy tính`}
              </button>
            </div>
          </div>

          {/* Mobile */}
          <div className={`device-card ${deviceFilter === "Mobile" ? "device-card--selected" : ""}`}>
            <div className="device-card__top">
              <div className="device-card__icon device-card__icon--mobile">
                <i className="ri-smartphone-line" />
              </div>
              <span className="device-card__badge device-card__badge--mobile">
                {stats.mobilePercent}% truy cập
              </span>
            </div>
            <div className="device-card__body">
              <h3 className="device-card__title">Điện Thoại (Smartphones)</h3>
              <div className="device-card__stat-row">
                <div className="device-stat">
                  <span className="device-stat__lbl">Số điện thoại</span>
                  <strong className="device-stat__val text-rose">{stats.devices.Mobile.count} máy</strong>
                </div>
                <div className="device-stat">
                  <span className="device-stat__lbl">Số lượt xem</span>
                  <strong className="device-stat__val text-rose">{stats.devices.Mobile.visits} lượt</strong>
                </div>
              </div>
              <div className="device-progress-bar">
                <div
                  className="device-progress-fill device-progress-fill--mobile"
                  style={{ width: `${stats.mobilePercent}%` }}
                />
              </div>
              <button
                type="button"
                className={`device-card__action-btn device-card__action-btn--mobile ${deviceFilter === "Mobile" ? "is-active" : ""}`}
                onClick={() => setDeviceFilter(deviceFilter === "Mobile" ? "All" : "Mobile")}
              >
                <i className="ri-filter-3-line" />
                {deviceFilter === "Mobile" ? "Đang lọc điện thoại" : `Xem ${stats.devices.Mobile.count} điện thoại (${stats.devices.Mobile.visits} lượt)`}
              </button>
            </div>
          </div>

          {/* Tablet */}
          <div className={`device-card ${deviceFilter === "Tablet" ? "device-card--selected" : ""}`}>
            <div className="device-card__top">
              <div className="device-card__icon device-card__icon--tablet">
                <i className="ri-tablet-line" />
              </div>
              <span className="device-card__badge device-card__badge--tablet">
                {stats.tabletPercent}% truy cập
              </span>
            </div>
            <div className="device-card__body">
              <h3 className="device-card__title">Máy Tính Bảng (Tablets)</h3>
              <div className="device-card__stat-row">
                <div className="device-stat">
                  <span className="device-stat__lbl">Số máy tính bảng</span>
                  <strong className="device-stat__val text-cyan">{stats.devices.Tablet.count} máy</strong>
                </div>
                <div className="device-stat">
                  <span className="device-stat__lbl">Số lượt xem</span>
                  <strong className="device-stat__val text-cyan">{stats.devices.Tablet.visits} lượt</strong>
                </div>
              </div>
              <div className="device-progress-bar">
                <div
                  className="device-progress-fill device-progress-fill--tablet"
                  style={{ width: `${stats.tabletPercent}%` }}
                />
              </div>
              <button
                type="button"
                className={`device-card__action-btn device-card__action-btn--tablet ${deviceFilter === "Tablet" ? "is-active" : ""}`}
                onClick={() => setDeviceFilter(deviceFilter === "Tablet" ? "All" : "Tablet")}
              >
                <i className="ri-filter-3-line" />
                {deviceFilter === "Tablet" ? "Đang lọc tablet" : `Xem ${stats.devices.Tablet.count} tablet (${stats.devices.Tablet.visits} lượt)`}
              </button>
            </div>
          </div>
        </div>

        {/* 📊 BẢNG TỔNG HỢP THEO HỆ ĐIỀU HÀNH & NỘI DUNG XEM */}
        <div className="traffic-breakdown-row">
          {/* Operating Systems & Browsers */}
          <div className="breakdown-card">
            <div className="breakdown-card__header">
              <i className="ri-settings-4-line text-green" />
              <h3>Hệ Điều Hành & Trình Duyệt ({sourceFilter === "Real" ? "Thiết bị thật" : "Đang lọc"})</h3>
            </div>
            <div className="breakdown-card__list">
              <div className="breakdown-subgroup">
                <span className="breakdown-subgroup__title">Hệ điều hành thiết bị:</span>
                {stats.topOs.length === 0 ? (
                  <p className="empty-subgroup">Chưa có dữ liệu</p>
                ) : (
                  stats.topOs.map((item) => (
                    <div className="breakdown-item" key={item.name}>
                      <div className="breakdown-item__name">
                        <i className={getDeviceIcon("Desktop", item.name)} />
                        <span>{item.name}</span>
                      </div>
                      <div className="breakdown-item__bar-wrap">
                        <div
                          className="breakdown-item__bar"
                          style={{
                            width: `${stats.totalVisits ? Math.round((item.count / stats.totalVisits) * 100) : 0}%`,
                          }}
                        />
                      </div>
                      <strong className="breakdown-item__count">{item.count} lượt</strong>
                    </div>
                  ))
                )}
              </div>

              <div className="breakdown-subgroup">
                <span className="breakdown-subgroup__title">Trình duyệt phổ biến:</span>
                {stats.topBrowsers.length === 0 ? (
                  <p className="empty-subgroup">Chưa có dữ liệu</p>
                ) : (
                  stats.topBrowsers.map((item) => (
                    <div className="breakdown-item" key={item.name}>
                      <div className="breakdown-item__name">
                        <i className="ri-compass-3-line text-slate" />
                        <span>{item.name}</span>
                      </div>
                      <div className="breakdown-item__bar-wrap">
                        <div
                          className="breakdown-item__bar breakdown-item__bar--amber"
                          style={{
                            width: `${stats.totalVisits ? Math.round((item.count / stats.totalVisits) * 100) : 0}%`,
                          }}
                        />
                      </div>
                      <strong className="breakdown-item__count">{item.count} lượt</strong>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Top Visited Pages */}
          <div className="breakdown-card">
            <div className="breakdown-card__header">
              <i className="ri-pages-line text-gold" />
              <h3>Nội Dung / Trang Được Xem Nhiều Nhất</h3>
            </div>
            <div className="breakdown-card__list">
              {stats.topPages.length === 0 ? (
                <p className="empty-subgroup">Chưa có dữ liệu</p>
              ) : (
                stats.topPages.map((item, idx) => (
                  <div className="page-view-item" key={item.path}>
                    <span className="page-view-item__rank">#{idx + 1}</span>
                    <div className="page-view-item__info">
                      <span className="page-view-item__title">{formatPageName(item.path)}</span>
                      <code className="page-view-item__path">{item.path}</code>
                    </div>
                    <span className="page-view-item__views">
                      <strong>{item.count}</strong> lượt xem
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* TAB NAVIGATION: TỔNG QUAN THIẾT BỊ vs NHẬT KÝ TRUY CẬP THỜI GIAN THỰC */}
        <div className="traffic-tabs">
          <button
            type="button"
            className={`traffic-tab-btn ${activeTab === "devices" ? "traffic-tab-btn--active" : ""}`}
            onClick={() => setActiveTab("devices")}
          >
            <i className="ri-computer-line" />
            <span>Quản Lý Thiết Bị & Lưu Lượng</span>
            <span className="traffic-tab-badge">{groupedScopedLogs.length}</span>
          </button>

          <button
            type="button"
            className={`traffic-tab-btn ${activeTab === "history" ? "traffic-tab-btn--active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            <i className="ri-history-line" />
            <span>Nhật Ký & Lịch Sử Truy Cập Thời Gian Thực</span>
            <span className="traffic-tab-badge traffic-tab-badge--green">{historyLogs.length}</span>
          </button>
        </div>

        {/* 📋 TAB 1: DANH SÁCH THIẾT BỊ & IP ĐÃ GHÉ THĂM */}
        {activeTab === "devices" && (
          <div className="recent-devices-card">
            <div className="recent-devices-card__header">
              <div className="header-title-box">
                <i className="ri-history-line text-green" />
                <div>
                  <h3>Danh Sách Thiết Bị & IP Đã Ghé Thăm</h3>
                  <p>
                    Theo dõi chi tiết từng máy: người dùng đăng nhập hay khách vãng lai, thiết bị thật vs dữ liệu mẫu, IP, hệ điều hành, số lượt xem và thời gian.
                  </p>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="device-filter-pills">
                {/* Device Types */}
                <button
                  type="button"
                  className={`filter-pill ${deviceFilter === "All" ? "filter-pill--active" : ""}`}
                  onClick={() => setDeviceFilter("All")}
                >
                  Tất cả máy ({groupedScopedLogs.length} nhóm • {stats.totalVisits} lượt)
                </button>
                <button
                  type="button"
                  className={`filter-pill ${deviceFilter === "Desktop" ? "filter-pill--active" : ""}`}
                  onClick={() => setDeviceFilter(deviceFilter === "Desktop" ? "All" : "Desktop")}
                >
                  <i className="ri-computer-line" /> Máy tính ({stats.devices.Desktop.count} máy • {stats.devices.Desktop.visits} lượt)
                </button>
                <button
                  type="button"
                  className={`filter-pill ${deviceFilter === "Mobile" ? "filter-pill--active" : ""}`}
                  onClick={() => setDeviceFilter(deviceFilter === "Mobile" ? "All" : "Mobile")}
                >
                  <i className="ri-smartphone-line" /> Điện thoại ({stats.devices.Mobile.count} máy • {stats.devices.Mobile.visits} lượt)
                </button>
                <button
                  type="button"
                  className={`filter-pill ${deviceFilter === "Tablet" ? "filter-pill--active" : ""}`}
                  onClick={() => setDeviceFilter(deviceFilter === "Tablet" ? "All" : "Tablet")}
                >
                  <i className="ri-tablet-line" /> Tablet ({stats.devices.Tablet.count} máy • {stats.devices.Tablet.visits} lượt)
                </button>

                {/* User Type Filters */}
                <button
                  type="button"
                  className={`filter-pill filter-pill--member ${authFilter === "Member" ? "filter-pill--active" : ""}`}
                  onClick={() => setAuthFilter(authFilter === "Member" ? "All" : "Member")}
                  title="Chỉ hiển thị các máy đã đăng nhập tài khoản"
                >
                  <i className="ri-user-follow-line" /> Đã đăng nhập ({stats.membersCount})
                </button>

                <button
                  type="button"
                  className={`filter-pill filter-pill--guest ${authFilter === "Guest" ? "filter-pill--active" : ""}`}
                  onClick={() => setAuthFilter(authFilter === "Guest" ? "All" : "Guest")}
                  title="Chỉ hiển thị khách vãng lai (chưa đăng nhập)"
                >
                  <i className="ri-user-line" /> Khách ({stats.guestsCount})
                </button>
              </div>
            </div>

            {/* Search box with IP search */}
            <div className="devices-search-box">
              <i className="ri-search-line search-icon" />
              <input
                type="text"
                placeholder="Tìm kiếm theo địa chỉ IP (116.111...), email, tên người dùng, 'khách', 'đăng nhập', thiết bị, vị trí..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button type="button" className="clear-search-btn" onClick={() => setSearchQuery("")}>
                  <i className="ri-close-line" />
                </button>
              )}
            </div>

            {/* Devices List Table (WITH REAL/SAMPLE BADGE, AUTH USER INFO & IP) */}
            <div className="recent-devices-table-wrap">
              <table className="recent-devices-table">
                <thead>
                  <tr>
                    <th>THIẾT BỊ & HỆ ĐIỀU HÀNH</th>
                    <th>ĐỐI TƯỢNG TRUY CẬP</th>
                    <th>XÁC THỰC NGUỒN</th>
                    <th>ĐỊA CHỈ IP & VỊ TRÍ</th>
                    <th>TRÌNH DUYỆT</th>
                    <th>SỐ LƯỢT XEM CỦA IP</th>
                    <th>TRANG XEM GẦN NHẤT</th>
                    <th>THỜI GIAN TRUY CẬP</th>
                    <th>TRẠNG THÁI</th>
                    <th>THAO TÁC</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="empty-state">
                        <i className="ri-inbox-line" />
                        <span>Không tìm thấy thiết bị nào phù hợp với bộ lọc</span>
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((item, idx) => {
                      const isOnline = isVisitorOnline(item);
                      const isFrequent = item.visit_count >= 5;
                      const isBot = isItemBot(item);
                      const isReal = isRealVisitor(item);

                      return (
                        <tr key={item.id || `${item.device_id}_${idx}`}>
                          {/* 1. Device & OS */}
                          <td>
                            <div className="device-cell">
                              <span className="device-cell__icon">
                                <i className={getDeviceIcon(item.device_type, item.os)} />
                              </span>
                              <div className="device-cell__info">
                                <strong className="device-cell__name">{item.os}</strong>
                                <span className="device-cell__sub">
                                  {item.device_type} • Màn hình {item.screen_resolution}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* 2. User Authentication: Member vs Guest */}
                          <td>
                            {item.is_authenticated ? (
                              <div className="visitor-user-cell">
                                <span className="visitor-user-badge visitor-user-badge--member">
                                  <i className="ri-user-follow-fill" /> Đã đăng nhập
                                </span>
                                <div className="visitor-user-details">
                                  <strong className="visitor-user-name">
                                    {item.user_name || "Thành viên"}
                                  </strong>
                                  <span className="visitor-user-email" title={item.user_email || undefined}>
                                    <i className="ri-mail-line" /> {item.user_email || "Tài khoản hệ thống"}
                                  </span>
                                  {item.user_role && (
                                    <span className="visitor-role-badge">{item.user_role}</span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="visitor-user-cell">
                                <span className="visitor-user-badge visitor-user-badge--guest">
                                  <i className="ri-user-line" /> Khách vãng lai
                                </span>
                                <span className="visitor-user-guest-sub">Chưa đăng nhập</span>
                              </div>
                            )}
                          </td>

                          {/* 3. Verification Source: Real vs Sample vs Bot */}
                          <td>
                            {isBot ? (
                              <span className="data-type-chip data-type-chip--bot" title="Phát hiện bot / crawler / IP quét tự động">
                                <i className="ri-robot-line" /> Bot quét rác
                              </span>
                            ) : isReal ? (
                              <span className="data-type-chip data-type-chip--real" title="Thiết bị vật lý thật từ IP & User-Agent thực tế">
                                <i className="ri-checkbox-circle-fill" /> Thiết bị thật
                              </span>
                            ) : (
                              <span className="data-type-chip data-type-chip--sample" title="Dữ liệu mẫu khởi tạo thử nghiệm">
                                <i className="ri-flask-line" /> Dữ liệu mẫu
                              </span>
                            )}
                          </td>

                          {/* 4. IP & Location */}
                          <td>
                            <div className="ip-cell">
                              <span className="ip-cell__address">
                                <i className="ri-global-line text-green" />
                                <code>{item.ip_address || "127.0.0.1"}</code>
                                <button
                                  type="button"
                                  className="copy-ip-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard?.writeText(item.ip_address || "127.0.0.1");
                                    setToast({
                                      type: "info",
                                      text: `Đã sao chép IP: ${item.ip_address || "127.0.0.1"}`,
                                    });
                                  }}
                                  title="Sao chép IP"
                                >
                                  <i className="ri-file-copy-line" />
                                </button>
                              </span>
                              <span className="ip-cell__location">
                                <i className="ri-map-pin-2-fill" />
                                {item.city ? `${item.city}, ${item.country || "VN"}` : (item.region || "Việt Nam")}
                              </span>
                            </div>
                          </td>

                          {/* 5. Browser */}
                          <td>
                            <span className="browser-badge">
                              <i className="ri-compass-3-line" /> {item.browser}
                            </span>
                          </td>

                          {/* 6. View Counts */}
                          <td>
                            <span className={`views-badge ${isFrequent ? "views-badge--frequent" : ""}`}>
                              <strong>{item.visit_count}</strong> lượt xem
                            </span>
                          </td>

                          {/* 7. Last Path */}
                          <td>
                            <span className="page-badge">
                              {formatPageName(item.last_path)}
                            </span>
                          </td>

                          {/* 8. Last Visit Time */}
                          <td>
                            <div className="time-cell">
                              <span className="time-ago">{formatTimeAgo(item.last_visit)}</span>
                              <span className="time-exact">
                                {new Date(item.last_visit).toLocaleTimeString("vi-VN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </td>

                          {/* 9. Status */}
                          <td>
                            {isOnline ? (
                              <span className="status-chip status-chip--online">
                                <span className="status-dot" /> Online
                              </span>
                            ) : (
                              <span className="status-chip status-chip--offline">
                                Ngoại tuyến
                              </span>
                            )}
                          </td>

                          {/* 10. Actions */}
                          <td>
                            <button
                              type="button"
                              className="row-action-btn"
                              onClick={() => handleDeleteSingle(item)}
                              title="Xóa bản ghi này khỏi bộ đếm"
                            >
                              <i className="ri-delete-bin-line" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="recent-devices-card__footer">
              <span>
                Đang hiển thị <strong>{filteredLogs.length}</strong> / <strong>{groupedScopedLogs.length}</strong> nhóm thiết bị / tài khoản{" "}
                {sourceFilter === "Real"
                  ? "(100% thiết bị thật)"
                  : sourceFilter === "Sample"
                  ? "(Dữ liệu mẫu)"
                  : sourceFilter === "Bot"
                  ? "(Bot quét rác)"
                  : "(Tất cả)"}
                {authFilter === "Member" ? " • Chỉ người đã đăng nhập" : authFilter === "Guest" ? " • Chỉ khách vãng lai" : ""}
              </span>
              <span className="footer-privacy-note">
                <i className="ri-shield-check-fill" /> Bảo mật quyền riêng tư: Hệ thống phân biệt khách và người dùng đăng nhập để hỗ trợ quản trị, bảo vệ dữ liệu người dùng.
              </span>
            </div>
          </div>
        )}

        {/* 📋 TAB 2: NHẬT KÝ & LỊCH SỬ TRUY CẬP CHI TIẾT */}
        {activeTab === "history" && (
          <div className="recent-devices-card">
            <div className="recent-devices-card__header">
              <div className="header-title-box">
                <i className="ri-history-line text-green" />
                <div>
                  <h3>Nhật Ký & Lịch Sử Truy Cập Thời Gian Thực</h3>
                  <p>
                    Ghi nhận từng lượt xem trang, tương tác và phiên hoạt động từ mọi máy và địa chỉ IP, hiển thị rõ ràng người dùng đăng nhập và khách vãng lai.
                  </p>
                </div>
              </div>

              {/* Action Filters */}
              <div className="device-filter-pills">
                <button
                  type="button"
                  className={`filter-pill ${historyActionFilter === "All" ? "filter-pill--active" : ""}`}
                  onClick={() => setHistoryActionFilter("All")}
                >
                  Tất cả ({historyLogs.length})
                </button>
                <button
                  type="button"
                  className={`filter-pill ${historyActionFilter === "pageview" ? "filter-pill--active" : ""}`}
                  onClick={() => setHistoryActionFilter(historyActionFilter === "pageview" ? "All" : "pageview")}
                >
                  <i className="ri-eye-line" /> Xem trang ({historyLogs.filter((h) => h.action === "pageview" || !h.action).length})
                </button>
                <button
                  type="button"
                  className={`filter-pill filter-pill--member ${historyAuthFilter === "Member" ? "filter-pill--active" : ""}`}
                  onClick={() => setHistoryAuthFilter(historyAuthFilter === "Member" ? "All" : "Member")}
                >
                  <i className="ri-user-follow-line" /> Thành viên ({historyLogs.filter((h) => h.is_authenticated).length})
                </button>
                <button
                  type="button"
                  className={`filter-pill filter-pill--guest ${historyAuthFilter === "Guest" ? "filter-pill--active" : ""}`}
                  onClick={() => setHistoryAuthFilter(historyAuthFilter === "Guest" ? "All" : "Guest")}
                >
                  <i className="ri-user-line" /> Khách vãng lai ({historyLogs.filter((h) => !h.is_authenticated).length})
                </button>
              </div>
            </div>

            {/* Search Box & Controls for History */}
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", padding: "0 1.5rem 1rem", alignItems: "center", justifyContent: "space-between" }}>
              <div className="devices-search-box" style={{ margin: 0, flex: 1, minWidth: "260px" }}>
                <i className="ri-search-line search-icon" />
                <input
                  type="text"
                  placeholder="Tìm kiếm nhật ký theo IP, trang (URL), email, tên người dùng, thiết bị..."
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                />
                {historySearchQuery && (
                  <button type="button" className="clear-search-btn" onClick={() => setHistorySearchQuery("")}>
                    <i className="ri-close-line" />
                  </button>
                )}
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  className="btn btn--refresh"
                  onClick={handleExportHistoryCsv}
                  title="Xuất toàn bộ lịch sử truy cập ra file CSV"
                >
                  <i className="ri-file-excel-2-line text-green" /> Xuất CSV Lịch Sử
                </button>
                <button
                  type="button"
                  className="btn btn--danger"
                  style={{ padding: "0.5rem 0.85rem", fontSize: "0.8rem", borderRadius: "8px" }}
                  onClick={handleClearHistory}
                  title="Xóa toàn bộ nhật ký sự kiện"
                >
                  <i className="ri-delete-bin-line" /> Xóa Nhật Ký
                </button>
              </div>
            </div>

            {/* History Table */}
            <div className="recent-devices-table-wrap">
              <table className="recent-devices-table">
                <thead>
                  <tr>
                    <th>THỜI GIAN</th>
                    <th>HÀNH ĐỘNG</th>
                    <th>TRANG XEM (PATH)</th>
                    <th>ĐỐI TƯỢNG TRUY CẬP</th>
                    <th>ĐỊA CHỈ IP & VỊ TRÍ</th>
                    <th>THIẾT BỊ & HỆ ĐIỀU HÀNH</th>
                    <th>TRÌNH DUYỆT</th>
                    <th>NGUỒN GIỚI THIỆU</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="empty-state">
                        <i className="ri-inbox-line" />
                        <span>Chưa có sự kiện truy cập nào được ghi lại</span>
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.map((item, idx) => {
                      const isBot = isItemBot(item);
                      return (
                        <tr key={item.id || `${item.device_id}_hist_${idx}`}>
                          <td>
                            <div className="time-cell">
                              <span className="time-ago">{formatTimeAgo(item.created_at)}</span>
                              <span className="time-exact">
                                {new Date(item.created_at).toLocaleTimeString("vi-VN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                })}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className={`action-chip action-chip--${item.action || "pageview"}`}>
                              {item.action === "pageview" ? "Xem trang" : item.action === "login" ? "Đăng nhập" : item.action === "leave" ? "Rời trang" : item.action}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                              <strong style={{ fontSize: "0.82rem", color: "#0f172a" }}>
                                {formatPageName(item.path)}
                              </strong>
                              <code style={{ fontSize: "0.72rem", color: "#64748b" }}>{item.path}</code>
                            </div>
                          </td>
                          <td>
                            {isBot ? (
                              <div className="visitor-user-cell">
                                <span className="visitor-user-badge" style={{ background: "#fef2f2", color: "#b91c1c", border: "1px solid #fca5a5" }}>
                                  <i className="ri-robot-line" /> Bot quét tự động
                                </span>
                                <span className="visitor-user-guest-sub" style={{ color: "#ef4444" }}>Crawler / Scanner</span>
                              </div>
                            ) : item.is_authenticated ? (
                              <div className="visitor-user-cell">
                                <span className="visitor-user-badge visitor-user-badge--member">
                                  <i className="ri-user-follow-fill" /> Đã đăng nhập
                                </span>
                                <div className="visitor-user-details">
                                  <strong className="visitor-user-name">
                                    {item.user_name || "Thành viên"}
                                  </strong>
                                  <span className="visitor-user-email">
                                    <i className="ri-mail-line" /> {item.user_email || "Tài khoản hệ thống"}
                                  </span>
                                  {item.user_role && (
                                    <span className="visitor-role-badge">{item.user_role}</span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="visitor-user-cell">
                                <span className="visitor-user-badge visitor-user-badge--guest">
                                  <i className="ri-user-line" /> Khách vãng lai
                                </span>
                                <span className="visitor-user-guest-sub">Chưa đăng nhập</span>
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="ip-cell">
                              <span className="ip-cell__address">
                                <i className="ri-global-line text-green" />
                                <code>{item.ip_address || "127.0.0.1"}</code>
                                <button
                                  type="button"
                                  className="copy-ip-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard?.writeText(item.ip_address || "127.0.0.1");
                                    setToast({
                                      type: "info",
                                      text: `Đã sao chép IP: ${item.ip_address || "127.0.0.1"}`,
                                    });
                                  }}
                                  title="Sao chép IP"
                                >
                                  <i className="ri-file-copy-line" />
                                </button>
                              </span>
                              <span className="ip-cell__location">
                                <i className="ri-map-pin-2-fill" />
                                {item.city ? `${item.city}, ${item.country || "VN"}` : (item.region || "Việt Nam")}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="device-cell">
                              <span className="device-cell__icon">
                                <i className={getDeviceIcon(item.device_type, item.os)} />
                              </span>
                              <div className="device-cell__info">
                                <strong className="device-cell__name">{item.os}</strong>
                                <span className="device-cell__sub">{item.device_type}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="browser-badge">
                              <i className="ri-compass-3-line" /> {item.browser}
                            </span>
                          </td>
                          <td>
                            <span className="page-badge" style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {item.referrer || "Trực tiếp"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="recent-devices-card__footer">
              <span>
                Đang hiển thị <strong>{filteredHistory.length}</strong> / <strong>{historyLogs.length}</strong> sự kiện nhật ký truy cập
              </span>
              <span className="footer-privacy-note">
                <i className="ri-shield-check-fill" /> Toàn bộ nhật ký được lưu trữ bảo mật và đồng bộ thời gian thực cho Quản Trị Viên (Admin / SA).
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
