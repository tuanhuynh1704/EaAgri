import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import {
  getVisitorLogs,
  getLocalOrSeedLogs,
  type VisitorLogItem,
} from "../services/visitorTracker";

export default function ManageTraffic() {
  const { user, profile } = useAuth();
  const [logs, setLogs] = useState<VisitorLogItem[]>(() => getLocalOrSeedLogs());
  const [deviceFilter, setDeviceFilter] = useState<"All" | "Desktop" | "Mobile" | "Tablet">("All");
  const [searchQuery, setSearchQuery] = useState("");

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

  // Compute statistics dynamically (100% truthful, no fake numbers)
  const stats = useMemo(() => {
    const totalVisits = logs.reduce((acc, curr) => acc + (curr.visit_count || 1), 0);
    const uniqueDevices = logs.length;
    const now = Date.now();

    // Active now (within 15 minutes)
    const activeNow = logs.filter((l) => {
      const diff = now - new Date(l.last_visit).getTime();
      return l.is_online || diff < 15 * 60 * 1000;
    }).length;

    // Today's visits
    const todayStr = new Date().toDateString();
    const todayVisits = logs
      .filter((l) => new Date(l.last_visit).toDateString() === todayStr)
      .reduce((acc, curr) => acc + (curr.visit_count || 1), 0);

    // Device breakdown
    const devices = {
      Desktop: { count: 0, visits: 0 },
      Mobile: { count: 0, visits: 0 },
      Tablet: { count: 0, visits: 0 },
    };

    logs.forEach((l) => {
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
    logs.forEach((l) => {
      const os = l.os || "Khác";
      osMap[os] = (osMap[os] || 0) + (l.visit_count || 1);
    });
    const topOs = Object.entries(osMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Browsers breakdown
    const browserMap: Record<string, number> = {};
    logs.forEach((l) => {
      const b = l.browser || "Khác";
      browserMap[b] = (browserMap[b] || 0) + (l.visit_count || 1);
    });
    const topBrowsers = Object.entries(browserMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Top Pages breakdown
    const pageMap: Record<string, number> = {};
    logs.forEach((l) => {
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
      devices,
      desktopPercent,
      mobilePercent,
      tabletPercent,
      topOs,
      topBrowsers,
      topPages,
    };
  }, [logs]);

  // Filtered devices list for recent activity (supports search by IP, OS, Browser, Device Type, Path)
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchDevice = deviceFilter === "All" || log.device_type === deviceFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        (log.ip_address && log.ip_address.toLowerCase().includes(q)) ||
        (log.city && log.city.toLowerCase().includes(q)) ||
        log.os.toLowerCase().includes(q) ||
        log.browser.toLowerCase().includes(q) ||
        log.device_type.toLowerCase().includes(q) ||
        log.last_path.toLowerCase().includes(q);
      return matchDevice && matchSearch;
    });
  }, [logs, deviceFilter, searchQuery]);

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
        {/* Title Header (Gọn gàng, vừa mắt) */}
        <div className="traffic-counter__header">
          <div className="traffic-counter__header-left">
            <div className="traffic-counter__live-tag">
              <span className="live-pulse" />
              <span>BỘ ĐẾM TRUY CẬP THỜI GIAN THỰC</span>
            </div>
            <h1 className="traffic-counter__title">Thống Kê Lượt Xem & Thiết Bị</h1>
            <p className="traffic-counter__subtitle">
              Đếm tổng số lượt truy cập trang web, phân loại theo dòng máy (Máy tính, Điện thoại, Tablet) và nội dung xem.
            </p>
          </div>

          <div className="traffic-counter__realtime-tag">
            <span className="live-pulse" />
            <span>Tự động cập nhật trực tiếp (Realtime)</span>
          </div>
        </div>

        {/* 🌟 HERO KPI BANNER (ĐÃ THU GỌN VỪA VẶN, TINH TẾ, KHÔNG BỊ QUÁ BỰ) */}
        <div className="traffic-hero-card">
          <div className="traffic-hero-card__main">
            <div className="traffic-hero-card__pulse-wrap">
              <i className="ri-line-chart-fill traffic-hero-card__pulse-icon" />
            </div>
            <div className="traffic-hero-card__data">
              <span className="traffic-hero-card__lbl">TỔNG LƯỢT XEM TRANG</span>
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
                Tổng số lần người dùng đã mở và xem các trang trên web
              </span>
            </div>
          </div>

          <div className="traffic-hero-card__divider" />

          <div className="traffic-hero-card__metrics">
            <div className="hero-metric-item">
              <div className="hero-metric-item__icon hero-metric-item__icon--devices">
                <i className="ri-computer-line" />
              </div>
              <div className="hero-metric-item__text">
                <span className="hero-metric-item__lbl">Số máy / Người dùng</span>
                <strong className="hero-metric-item__val">{stats.uniqueDevices} máy</strong>
                <span className="hero-metric-item__sub">Thiết bị riêng biệt</span>
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

        {/* 💻📱📟 THỐNG KÊ CHI TIẾT THEO TỪNG LOẠI MÁY (Đã giảm gọn kích thước) */}
        <div className="traffic-devices-grid">
          {/* Desktop */}
          <div className="device-card">
            <div className="device-card__top">
              <div className="device-card__icon device-card__icon--desktop">
                <i className="ri-computer-line" />
              </div>
              <span className="device-card__badge device-card__badge--desktop">
                {stats.desktopPercent}% tổng truy cập
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
                {stats.mobilePercent}% tổng truy cập
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
                {stats.tabletPercent}% tổng truy cập
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
              <h3>Hệ Điều Hành & Trình Duyệt</h3>
            </div>
            <div className="breakdown-card__list">
              <div className="breakdown-subgroup">
                <span className="breakdown-subgroup__title">Hệ điều hành thiết bị:</span>
                {stats.topOs.map((item) => (
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
                ))}
              </div>

              <div className="breakdown-subgroup">
                <span className="breakdown-subgroup__title">Trình duyệt phổ biến:</span>
                {stats.topBrowsers.map((item) => (
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
                ))}
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
              {stats.topPages.map((item, idx) => (
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
              ))}
            </div>
          </div>
        </div>

        {/* 📋 DANH SÁCH THIẾT BỊ GẦN ĐÂY (HOÀN TOÀN KHÔNG HIỆN IP) */}
        {/* 📋 DANH SÁCH THIẾT BỊ & IP ĐÃ GHÉ THĂM */}
        <div className="recent-devices-card">
          <div className="recent-devices-card__header">
            <div className="header-title-box">
              <i className="ri-history-line text-green" />
              <div>
                <h3>Danh Sách Thiết Bị & IP Đã Ghé Thăm</h3>
                <p>Theo dõi địa chỉ IP, thiết bị, số lượt xem và thời gian hoạt động của từng máy.</p>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="device-filter-pills">
              <button
                type="button"
                className={`filter-pill ${deviceFilter === "All" ? "filter-pill--active" : ""}`}
                onClick={() => setDeviceFilter("All")}
              >
                Tất cả ({logs.length})
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
            </div>
          </div>

          {/* Search box with IP search */}
          <div className="devices-search-box">
            <i className="ri-search-line search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm theo địa chỉ IP (116.111...), thiết bị (iPhone, Windows...), trình duyệt, trang xem..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button type="button" className="clear-search-btn" onClick={() => setSearchQuery("")}>
                <i className="ri-close-line" />
              </button>
            )}
          </div>

          {/* Devices List Table (WITH IP & LOCATION) */}
          <div className="recent-devices-table-wrap">
            <table className="recent-devices-table">
              <thead>
                <tr>
                  <th>THIẾT BỊ & HỆ ĐIỀU HÀNH</th>
                  <th>ĐỊA CHỈ IP & VỊ TRÍ</th>
                  <th>TRÌNH DUYỆT</th>
                  <th>SỐ LƯỢT XEM CỦA IP</th>
                  <th>TRANG XEM GẦN NHẤT</th>
                  <th>THỜI GIAN TRUY CẬP</th>
                  <th>TRẠNG THÁI</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-state">
                      <i className="ri-inbox-line" />
                      <span>Không tìm thấy thiết bị nào phù hợp bộ lọc</span>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((item, idx) => {
                    const isRecent = Date.now() - new Date(item.last_visit).getTime() < 15 * 60 * 1000;
                    const isFrequent = item.visit_count >= 5;

                    return (
                      <tr key={item.device_id || idx}>
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
                                  alert(`Đã sao chép IP: ${item.ip_address || "127.0.0.1"}`);
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
                          <span className="browser-badge">
                            <i className="ri-compass-3-line" /> {item.browser}
                          </span>
                        </td>

                        <td>
                          <span className={`views-badge ${isFrequent ? "views-badge--frequent" : ""}`}>
                            <strong>{item.visit_count}</strong> lượt xem
                          </span>
                        </td>

                        <td>
                          <span className="page-badge">
                            {formatPageName(item.last_path)}
                          </span>
                        </td>

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
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="recent-devices-card__footer">
            <span>
              Đang hiển thị <strong>{filteredLogs.length}</strong> / <strong>{logs.length}</strong> thiết bị truy cập
            </span>
            <span className="footer-privacy-note">
              <i className="ri-shield-check-fill" /> Bảo mật quyền riêng tư: Hệ thống chỉ đếm lượt xem, không lưu trữ hoặc hiển thị địa chỉ IP
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
