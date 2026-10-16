import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import {
  getVisitorLogs,
  getLocalOrSeedLogs,
  isRealVisitor,
  clearSampleVisitorLogs,
  deleteSingleVisitorLog,
  exportVisitorLogsToCsv,
  type VisitorLogItem,
} from "../services/visitorTracker";

export default function ManageTraffic() {
  const { user, profile } = useAuth();
  const [logs, setLogs] = useState<VisitorLogItem[]>(() => getLocalOrSeedLogs());
  const [deviceFilter, setDeviceFilter] = useState<"All" | "Desktop" | "Mobile" | "Tablet">("All");
  const [sourceFilter, setSourceFilter] = useState<"Real" | "All" | "Sample">("Real");
  const [authFilter, setAuthFilter] = useState<"All" | "Member" | "Guest">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCleaning, setIsCleaning] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "info" | "error"; text: string } | null>(null);

  const isAdmin = user && (profile?.role === "SA" || user.id === "eaagri-admin-sa-master");

  // Load and update visitor data silently
  const loadData = async () => {
    try {
      const res = await getVisitorLogs();
      setLogs(res.logs);
    } catch (err) {
      console.error("Error loading visitor logs:", err);
    }
  };

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!isAdmin) return;

    loadData();

    // 1. Listen to BroadcastChannel across different browser tabs/windows
    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      try {
        bc = new BroadcastChannel("eaagri_visitor_channel");
        bc.onmessage = () => {
          loadData();
        };
      } catch {}
    }

    // 2. Listen to custom DOM event in same window
    const handleVisitorUpdate = () => {
      loadData();
    };
    window.addEventListener("eaagri_visitor_update", handleVisitorUpdate);

    // 3. Listen to localStorage storage events from other tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "eaagri_visitor_logs_cache") {
        loadData();
      }
    };
    window.addEventListener("storage", handleStorage);

    // 4. Polling heartbeat every 3 seconds for continuous realtime accuracy
    const timer = setInterval(() => {
      loadData();
    }, 3000);

    // 5. Listen to Vite WebSocket for instant 0ms realtime updates
    if (import.meta.hot) {
      import.meta.hot.on("eaagri:visitor-updated", (data: any) => {
        if (Array.isArray(data)) {
          setLogs(data);
        }
      });
    }

    return () => {
      if (bc) bc.close();
      window.removeEventListener("eaagri_visitor_update", handleVisitorUpdate);
      window.removeEventListener("storage", handleStorage);
      clearInterval(timer);
    };
  }, [isAdmin]);

  // Overall comparison metrics (Real vs Sample & Member vs Guest)
  const globalSummary = useMemo(() => {
    const realLogs = logs.filter(isRealVisitor);
    const sampleLogs = logs.filter((l) => !isRealVisitor(l));

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

  // Scoped logs based on selected source filter (Real vs All vs Sample)
  const scopedLogs = useMemo(() => {
    if (sourceFilter === "Real") return logs.filter(isRealVisitor);
    if (sourceFilter === "Sample") return logs.filter((l) => !isRealVisitor(l));
    return logs;
  }, [logs, sourceFilter]);

  // Compute statistics dynamically based on current scope
  const stats = useMemo(() => {
    const totalVisits = scopedLogs.reduce((acc, curr) => acc + (curr.visit_count || 1), 0);
    const uniqueDevices = scopedLogs.length;
    const now = Date.now();

    // Active now (within 15 minutes)
    const activeNow = scopedLogs.filter((l) => {
      const diff = now - new Date(l.last_visit).getTime();
      return l.is_online || diff < 15 * 60 * 1000;
    }).length;

    // Today's visits
    const todayStr = new Date().toDateString();
    const todayVisits = scopedLogs
      .filter((l) => new Date(l.last_visit).toDateString() === todayStr)
      .reduce((acc, curr) => acc + (curr.visit_count || 1), 0);

    // Auth breakdown inside scope
    const membersCount = scopedLogs.filter((l) => l.is_authenticated === true).length;
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
  }, [scopedLogs]);

  // Filtered devices list for recent activity table
  const filteredLogs = useMemo(() => {
    return scopedLogs.filter((log) => {
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
  }, [scopedLogs, deviceFilter, authFilter, searchQuery]);

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

  // Action: Export CSV
  const handleExportCsv = () => {
    exportVisitorLogsToCsv(filteredLogs);
    setToast({
      type: "info",
      text: `Đã xuất ${filteredLogs.length} thiết bị ra file CSV (có thông tin Thiết bị thật & Khách / Đã đăng nhập).`,
    });
  };

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
    if (path.includes("giai-thuong") || path.includes("awards")) return "Bình chọn NTTU Startup";
    if (path.includes("tintuc") || path.includes("tin-tuc") || path.includes("news")) return "Tin tức nông nghiệp";
    if (path.includes("kien-truc") || path.includes("architecture")) return "Kiến trúc IoT";
    if (path.includes("privacy")) return "Chính sách bảo mật";
    return path;
  };

  // If user is not Super Admin, show unauthorized screen
  if (!isAdmin) {
    return (
      <section className="traffic-counter">
        <div className="traffic-counter__container">
          <div className="traffic-counter__unauth">
            <i className="ri-lock-password-fill traffic-counter__unauth-icon" />
            <h2>Khu vực dành riêng cho Quản Trị Viên</h2>
            <p>Vui lòng đăng nhập với tài khoản Quản Trị Cấp Cao (admin / admin@123) để xem bộ đếm truy cập.</p>
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
              Phân loại chuẩn xác thiết bị thật (người dùng thực tế) và dữ liệu mẫu, theo dõi rõ ràng khách vãng lai và người đã đăng nhập tài khoản.
            </p>
          </div>

          <div className="traffic-counter__realtime-tag">
            <span className="live-pulse" />
            <span>Tự động cập nhật trực tiếp (Realtime)</span>
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
            <div className="hero-metric-item">
              <div className="hero-metric-item__icon hero-metric-item__icon--devices">
                <i className={sourceFilter === "Real" ? "ri-shield-check-line" : "ri-computer-line"} />
              </div>
              <div className="hero-metric-item__text">
                <span className="hero-metric-item__lbl">
                  {sourceFilter === "Real" ? "Thiết bị thật" : "Số máy / Thiết bị"}
                </span>
                <strong className="hero-metric-item__val">{stats.uniqueDevices} máy</strong>
                <span className="hero-metric-item__sub">
                  {sourceFilter === "Real" ? "Người dùng thực tế" : "Thiết bị riêng biệt"}
                </span>
              </div>
            </div>

            <div className="hero-metric-item">
              <div className="hero-metric-item__icon hero-metric-item__icon--members">
                <i className="ri-user-follow-line" />
              </div>
              <div className="hero-metric-item__text">
                <span className="hero-metric-item__lbl">Đăng nhập / Khách</span>
                <strong className="hero-metric-item__val">
                  {stats.membersCount} mem / {stats.guestsCount} khách
                </strong>
                <span className="hero-metric-item__sub">Phân loại đối tượng</span>
              </div>
            </div>

            <div className="hero-metric-item">
              <div className="hero-metric-item__icon hero-metric-item__icon--online">
                <i className="ri-radar-fill" />
              </div>
              <div className="hero-metric-item__text">
                <span className="hero-metric-item__lbl">Đang trực tuyến</span>
                <strong className="hero-metric-item__val text-green">{stats.activeNow} máy</strong>
                <span className="hero-metric-item__sub">Hoạt động trong 15p</span>
              </div>
            </div>

            <div className="hero-metric-item">
              <div className="hero-metric-item__icon hero-metric-item__icon--today">
                <i className="ri-calendar-check-line" />
              </div>
              <div className="hero-metric-item__text">
                <span className="hero-metric-item__lbl">Lượt xem hôm nay</span>
                <strong className="hero-metric-item__val text-gold">{stats.todayVisits} lượt</strong>
                <span className="hero-metric-item__sub">Trong 24 giờ qua</span>
              </div>
            </div>
          </div>
        </div>

        {/* 💻📱📟 THỐNG KÊ CHI TIẾT THEO TỪNG LOẠI MÁY */}
        <div className="traffic-devices-grid">
          {/* Desktop */}
          <div className="device-card">
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
            </div>
          </div>

          {/* Mobile */}
          <div className="device-card">
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
                  <strong className="device-stat__val">{stats.devices.Mobile.count} máy</strong>
                </div>
                <div className="device-stat">
                  <span className="device-stat__lbl">Số lượt xem</span>
                  <strong className="device-stat__val">{stats.devices.Mobile.visits} lượt</strong>
                </div>
              </div>
              <div className="device-progress-bar">
                <div
                  className="device-progress-fill device-progress-fill--mobile"
                  style={{ width: `${stats.mobilePercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Tablet */}
          <div className="device-card">
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
                  <strong className="device-stat__val">{stats.devices.Tablet.count} máy</strong>
                </div>
                <div className="device-stat">
                  <span className="device-stat__lbl">Số lượt xem</span>
                  <strong className="device-stat__val">{stats.devices.Tablet.visits} lượt</strong>
                </div>
              </div>
              <div className="device-progress-bar">
                <div
                  className="device-progress-fill device-progress-fill--tablet"
                  style={{ width: `${stats.tabletPercent}%` }}
                />
              </div>
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

        {/* 📋 DANH SÁCH THIẾT BỊ & IP ĐÃ GHÉ THĂM (KÈM GẮN CỜ THIẾT BỊ THẬT & KHÁCH / TÀI KHOẢN) */}
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
                Tất cả máy ({scopedLogs.length})
              </button>
              <button
                type="button"
                className={`filter-pill ${deviceFilter === "Desktop" ? "filter-pill--active" : ""}`}
                onClick={() => setDeviceFilter("Desktop")}
              >
                <i className="ri-computer-line" /> Máy tính ({stats.devices.Desktop.count})
              </button>
              <button
                type="button"
                className={`filter-pill ${deviceFilter === "Mobile" ? "filter-pill--active" : ""}`}
                onClick={() => setDeviceFilter("Mobile")}
              >
                <i className="ri-smartphone-line" /> Điện thoại ({stats.devices.Mobile.count})
              </button>
              <button
                type="button"
                className={`filter-pill ${deviceFilter === "Tablet" ? "filter-pill--active" : ""}`}
                onClick={() => setDeviceFilter("Tablet")}
              >
                <i className="ri-tablet-line" /> Tablet ({stats.devices.Tablet.count})
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
                    const isRecent = Date.now() - new Date(item.last_visit).getTime() < 15 * 60 * 1000;
                    const isFrequent = item.visit_count >= 5;
                    const isReal = isRealVisitor(item);

                    return (
                      <tr key={item.device_id || item.id || idx}>
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
                                {item.user_role === "SA" && (
                                  <span className="visitor-role-badge">Quản trị viên</span>
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

                        {/* 3. Verification Source: Real vs Sample */}
                        <td>
                          {isReal ? (
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
                          {item.is_online || isRecent ? (
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
              Đang hiển thị <strong>{filteredLogs.length}</strong> / <strong>{scopedLogs.length}</strong> thiết bị{" "}
              {sourceFilter === "Real" ? "(100% thiết bị thật)" : sourceFilter === "Sample" ? "(Dữ liệu mẫu)" : "(Tất cả)"}
              {authFilter === "Member" ? " • Chỉ người đã đăng nhập" : authFilter === "Guest" ? " • Chỉ khách vãng lai" : ""}
            </span>
            <span className="footer-privacy-note">
              <i className="ri-shield-check-fill" /> Bảo mật quyền riêng tư: Hệ thống phân biệt khách và người dùng đăng nhập để hỗ trợ quản trị, bảo vệ dữ liệu người dùng.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
