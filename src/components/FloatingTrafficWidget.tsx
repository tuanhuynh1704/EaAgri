import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../utils/supabase/client";
import {
  getLocalOrSeedLogs,
  getVisitorLogs,
  computeTrafficStats,
  isAuthorizedAdminRole,
  type VisitorLogItem,
} from "../services/visitorTracker";

const DISMISS_KEY = "eaagri_traffic_widget_dismissed";

export default function FloatingTrafficWidget() {
  const { user, profile } = useAuth();
  // Only users with role admin or SA (or master admin) are permitted to view traffic counts
  const isAdmin = isAuthorizedAdminRole(user, profile);

  const [logs, setLogs] = useState<VisitorLogItem[]>(() => getLocalOrSeedLogs());
  const [isReady, setIsReady] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(DISMISS_KEY) === "true";
  });
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [pillMode, setPillMode] = useState<"online" | "total">("online");

  // Load and sync real visitor logs
  const loadData = async () => {
    try {
      const res = await getVisitorLogs();
      if (res?.logs && Array.isArray(res.logs)) {
        setLogs(res.logs);
      }
    } catch {}
  };

  useEffect(() => {
    if (!isAdmin) return;

    // Show smoothly after 600ms
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 600);

    loadData();

    // 1. Supabase Realtime for instant multi-device cloud synchronization
    let channel: any = null;
    try {
      channel = supabase
        .channel("floating-traffic-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "visitor_logs" },
          () => {
            loadData();
          }
        )
        .subscribe();
    } catch {}

    // 2. BroadcastChannel across tabs on the same machine
    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      try {
        bc = new BroadcastChannel("eaagri_visitor_channel");
        bc.onmessage = () => loadData();
      } catch {}
    }

    // 3. Custom DOM event in same window
    const handleUpdate = () => loadData();
    window.addEventListener("eaagri_visitor_update", handleUpdate);

    // 4. Storage event
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "eaagri_visitor_logs_cache") loadData();
    };
    window.addEventListener("storage", handleStorage);

    // 5. Polling heartbeat every 5 seconds for continuous real-time accuracy
    const interval = setInterval(loadData, 5000);

    // 6. Hot reload websocket (local dev)
    if (import.meta.hot) {
      import.meta.hot.on("eaagri:visitor-updated", (data: any) => {
        if (Array.isArray(data)) setLogs(data);
      });
    }

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch {}
      }
      if (bc) bc.close();
      window.removeEventListener("eaagri_visitor_update", handleUpdate);
      window.removeEventListener("storage", handleStorage);
    };
  }, [isAdmin]);

  // Smoothly alternate pill text between Active Users & Total Visits every 3.5s
  useEffect(() => {
    if (!isAdmin) return;
    const cycle = setInterval(() => {
      setPillMode((prev) => (prev === "online" ? "total" : "online"));
    }, 3500);

    return () => clearInterval(cycle);
  }, []);

  const stats = useMemo(() => computeTrafficStats(logs), [logs]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, "true");
    } catch {}
  };

  const handleReopen = () => {
    setIsDismissed(false);
    try {
      sessionStorage.removeItem(DISMISS_KEY);
    } catch {}
  };

  if (!isAdmin || !isReady) return null;

  // Minimized trigger pill if dismissed
  if (isDismissed) {
    return (
      <button
        type="button"
        className="floating-traffic-minimized"
        onClick={handleReopen}
        title="Mở lại bộ đếm người truy cập & đang hoạt động"
        aria-label="Mở lại bộ đếm truy cập"
      >
        <span className="live-dot" />
        <i className="ri-radar-fill" />
        <span>{stats.activeNow} online</span>
      </button>
    );
  }

  return (
    <div
      className="floating-traffic-badge"
      role="complementary"
      aria-label="Thống kê số lượng người đang truy cập và hoạt động trên EaAgri"
    >
      {/* 🟢 Main Circular Medallion */}
      <div
        className="floating-traffic-badge__body"
        onClick={() => setIsPopupOpen((prev) => !prev)}
        onMouseEnter={() => setIsPopupOpen(true)}
        onMouseLeave={() => setIsPopupOpen(false)}
        title="Nhấp để xem chi tiết người đang truy cập & thiết bị"
      >
        {/* Outer Animated Pulse Rings */}
        <span className="floating-traffic-badge__pulse" aria-hidden="true" />
        <span className="floating-traffic-badge__live-beacon" aria-hidden="true" />

        {/* Center Golden Community / Live Visitor Icon */}
        <div className="floating-traffic-badge__icon-wrap">
          <i className="ri-group-fill floating-traffic-badge__icon" />
        </div>

        {/* Bottom Overlapping Pill Badge (Alternates Online & Total) */}
        <div className="floating-traffic-badge__pill">
          <span className="pill-dot" />
          <span className="pill-text">
            {pillMode === "online" ? `${stats.activeNow} Online` : `${stats.totalVisits}+ Lượt`}
          </span>
        </div>

        {/* 📋 Popover Card on Hover/Click */}
        <div
          className={`floating-traffic-badge__popover ${
            isPopupOpen ? "is-visible" : ""
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="popover-header">
            <div className="popover-live-tag">
              <span className="live-dot" />
              <span>TRUY CẬP THỜI GIAN THỰC</span>
            </div>
            <button
              type="button"
              className="popover-close-btn"
              onClick={() => setIsPopupOpen(false)}
              aria-label="Đóng bảng xem nhanh"
            >
              <i className="ri-close-line" />
            </button>
          </div>

          <div className="popover-main-metric">
            <div className="popover-icon-box">
              <i className="ri-radar-fill text-green" />
            </div>
            <div>
              <span className="popover-lbl">Đang hoạt động lúc này</span>
              <strong className="popover-val text-green">
                {stats.activeNow} người trực tuyến
              </strong>
            </div>
          </div>

          <div className="popover-divider" />

          <div className="popover-stats-grid">
            <div className="popover-stat-item">
              <span className="popover-stat-lbl">
                <i className="ri-calendar-check-line" /> Hôm nay
              </span>
              <strong className="popover-stat-val text-gold">
                +{stats.todayVisits} lượt
              </strong>
            </div>
            <div className="popover-stat-item">
              <span className="popover-stat-lbl">
                <i className="ri-global-line" /> Tổng lượt xem
              </span>
              <strong className="popover-stat-val">
                {stats.totalVisits.toLocaleString("vi-VN")} lượt
              </strong>
            </div>
          </div>

          {/* Device allocation row */}
          <div className="popover-devices">
            <span className="popover-devices-title">Phân bổ thiết bị:</span>
            <div className="popover-devices-bar">
              <div
                className="device-bar-fill device-bar-fill--desktop"
                style={{ width: `${stats.desktopPercent}%` }}
                title={`Máy tính: ${stats.desktopPercent}% (${stats.desktopVisits} lượt)`}
              />
              <div
                className="device-bar-fill device-bar-fill--mobile"
                style={{ width: `${stats.mobilePercent}%` }}
                title={`Điện thoại: ${stats.mobilePercent}% (${stats.mobileVisits} lượt)`}
              />
              <div
                className="device-bar-fill device-bar-fill--tablet"
                style={{ width: `${stats.tabletPercent}%` }}
                title={`Tablet: ${stats.tabletPercent}% (${stats.tabletVisits} lượt)`}
              />
            </div>
            <div className="popover-devices-legend">
              <span>
                <i className="ri-computer-line" /> PC {stats.desktopPercent}%
              </span>
              <span className="text-rose">
                <i className="ri-smartphone-line" /> ĐT {stats.mobilePercent}%
              </span>
              <span className="text-cyan">
                <i className="ri-tablet-line" /> Tab {stats.tabletPercent}%
              </span>
            </div>
          </div>

          {/* Action Link */}
          {isAdmin ? (
            <Link to="/admin/traffic" className="popover-action-link">
              <i className="ri-shield-check-line" /> Quản lý chi tiết lưu lượng IP ➔
            </Link>
          ) : (
            <div className="popover-footer-note">
              <i className="ri-shield-flash-line" /> Hệ thống bảo mật 100% thiết bị thật
            </div>
          )}
        </div>
      </div>

      {/* ✖️ Dismiss Button (Exact look as in user's image) */}
      <button
        type="button"
        className="floating-traffic-badge__close"
        onClick={handleDismiss}
        title="Ẩn widget"
        aria-label="Ẩn widget đếm truy cập"
      >
        <i className="ri-close-line" />
      </button>
    </div>
  );
}
