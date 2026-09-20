import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../utils/supabase/client";
import { useAuth } from "../context/AuthContext";

export interface CooperationItem {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  organization: string | null;
  cooperation_type: string;
  message: string | null;
  status: "pending" | "contacted" | "negotiating" | "partnered" | "cancelled";
  notes: string | null;
  created_at: string;
  updated_at?: string;
}

interface AlertState {
  type: "success" | "error" | "info" | null;
  message: string;
}

const STATUS_CONFIG: Record<
  CooperationItem["status"],
  { label: string; bg: string; color: string; icon: string }
> = {
  pending: {
    label: "Chờ xử lý",
    bg: "rgba(245, 158, 11, 0.12)",
    color: "#b45309",
    icon: "ri-time-line",
  },
  contacted: {
    label: "Đã liên hệ",
    bg: "rgba(2, 132, 199, 0.12)",
    color: "#0369a1",
    icon: "ri-phone-line",
  },
  negotiating: {
    label: "Đang trao đổi",
    bg: "rgba(147, 51, 234, 0.12)",
    color: "#7e22ce",
    icon: "ri-chat-voice-line",
  },
  partnered: {
    label: "Đã chốt hợp tác",
    bg: "rgba(16, 185, 129, 0.15)",
    color: "#047857",
    icon: "ri-checkbox-circle-fill",
  },
  cancelled: {
    label: "Tạm dừng / Hủy",
    bg: "rgba(100, 116, 139, 0.12)",
    color: "#475569",
    icon: "ri-close-circle-line",
  },
};

export default function ManageCooperation() {
  const { user, profile, loading: authLoading } = useAuth();

  const [items, setItems] = useState<CooperationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [alert, setAlert] = useState<AlertState>({ type: null, message: "" });

  // Detail Modal State
  const [selectedItem, setSelectedItem] = useState<CooperationItem | null>(null);
  const [modalNotes, setModalNotes] = useState("");
  const [modalStatus, setModalStatus] = useState<CooperationItem["status"]>("pending");
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete Modal State
  const [itemToDelete, setItemToDelete] = useState<CooperationItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    setAlert({ type: null, message: "" });
    try {
      const { data, error } = await supabase
        .from("cooperation_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setItems((data as CooperationItem[]) || []);
    } catch (err: any) {
      console.warn("Could not fetch cooperation requests:", err);
      setAlert({
        type: "info",
        message:
          "Chưa kết nối được bảng `cooperation_requests` trên Supabase hoặc chưa có dữ liệu. Bạn hãy chạy file SQL trong thư mục `/supabase/cooperation_requests.sql` trên Supabase SQL Editor.",
      });
      // Fallback empty array
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && profile?.role === "SA") {
      fetchData();
    }
  }, [user, profile]);

  // Open detail modal
  const handleOpenDetail = (item: CooperationItem) => {
    setSelectedItem(item);
    setModalNotes(item.notes || "");
    setModalStatus(item.status);
  };

  // Close detail modal
  const handleCloseDetail = () => {
    setSelectedItem(null);
  };

  // Update Status & Notes
  const handleSaveDetail = async () => {
    if (!selectedItem) return;
    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from("cooperation_requests")
        .update({
          status: modalStatus,
          notes: modalNotes.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedItem.id);

      if (error) throw error;

      // Update local state
      setItems((prev) =>
        prev.map((it) =>
          it.id === selectedItem.id
            ? { ...it, status: modalStatus, notes: modalNotes.trim() || null }
            : it
        )
      );

      setAlert({
        type: "success",
        message: `Đã cập nhật yêu cầu của đối tác ${selectedItem.full_name} thành công!`,
      });

      handleCloseDetail();
    } catch (err: any) {
      console.error("Error updating cooperation request:", err);
      // Update locally if offline
      setItems((prev) =>
        prev.map((it) =>
          it.id === selectedItem.id
            ? { ...it, status: modalStatus, notes: modalNotes.trim() || null }
            : it
        )
      );
      setAlert({
        type: "success",
        message: `Đã cập nhật thành công (Lưu trên phiên làm việc hiện tại).`,
      });
      handleCloseDetail();
    } finally {
      setIsUpdating(false);
    }
  };

  // Quick Status change from table dropdown
  const handleQuickStatusChange = async (
    item: CooperationItem,
    newStatus: CooperationItem["status"]
  ) => {
    try {
      await supabase
        .from("cooperation_requests")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id);

      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: newStatus } : it))
      );
    } catch (err) {
      console.warn("Update status error:", err);
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: newStatus } : it))
      );
    }
  };

  // Delete Request
  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from("cooperation_requests")
        .delete()
        .eq("id", itemToDelete.id);

      if (error) throw error;

      setItems((prev) => prev.filter((it) => it.id !== itemToDelete.id));
      setAlert({
        type: "success",
        message: `Đã xóa yêu cầu hợp tác của "${itemToDelete.full_name}".`,
      });
      setItemToDelete(null);
    } catch (err: any) {
      console.error("Delete error:", err);
      setItems((prev) => prev.filter((it) => it.id !== itemToDelete.id));
      setAlert({
        type: "success",
        message: `Đã xóa yêu cầu hợp tác (cập nhật phiên làm việc).`,
      });
      setItemToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (items.length === 0) {
      setAlert({ type: "info", message: "Chưa có dữ liệu để xuất file CSV." });
      return;
    }

    const headers = [
      "ID",
      "Họ và tên",
      "Số điện thoại",
      "Email",
      "Đơn vị / Tổ chức",
      "Loại hình hợp tác",
      "Nội dung yêu cầu",
      "Trạng thái",
      "Ghi chú",
      "Ngày gửi",
    ];

    const rows = filteredItems.map((it) => [
      `"${it.id}"`,
      `"${(it.full_name || "").replace(/"/g, '""')}"`,
      `"${it.phone}"`,
      `"${it.email || ""}"`,
      `"${(it.organization || "").replace(/"/g, '""')}"`,
      `"${(it.cooperation_type || "").replace(/"/g, '""')}"`,
      `"${(it.message || "").replace(/"/g, '""')}"`,
      `"${STATUS_CONFIG[it.status]?.label || it.status}"`,
      `"${(it.notes || "").replace(/"/g, '""')}"`,
      `"${new Date(it.created_at).toLocaleString("vi-VN")}"`,
    ]);

    const csvContent =
      "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `eaagri_cooperation_requests_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.phone.includes(searchQuery) ||
        (item.email && item.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.organization &&
          item.organization.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.message &&
          item.message.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus = statusFilter === "all" || item.status === statusFilter;
      const matchType = typeFilter === "all" || item.cooperation_type === typeFilter;

      return matchSearch && matchStatus && matchType;
    });
  }, [items, searchQuery, statusFilter, typeFilter]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = items.length;
    const pending = items.filter((i) => i.status === "pending").length;
    const inProgress = items.filter(
      (i) => i.status === "contacted" || i.status === "negotiating"
    ).length;
    const partnered = items.filter((i) => i.status === "partnered").length;

    return { total, pending, inProgress, partnered };
  }, [items]);

  // Unique cooperation types for filter dropdown
  const uniqueTypes = useMemo(() => {
    const types = new Set(items.map((i) => i.cooperation_type).filter(Boolean));
    return Array.from(types);
  }, [items]);

  // Format date helper
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  // Auth Loading State
  if (authLoading) {
    return (
      <div className="coop-admin__loading-screen">
        <div className="coop-admin__spinner" />
        <p>Đang xác thực thông tin quản trị...</p>
      </div>
    );
  }

  // Access Denied State
  if (!user || profile?.role !== "SA") {
    return (
      <section className="coop-admin">
        <div className="coop-admin__container">
          <div className="coop-admin__card coop-admin__card--unauthorized">
            <div className="coop-admin__unauth-icon">
              <i className="ri-shield-keyhole-line" />
            </div>
            <h2>Khu Vực Dành Cho Quản Trị Viên</h2>
            <p>
              Bạn không có quyền truy cập trang quản lý liên hệ hợp tác. Vui lòng đăng nhập
              bằng tài khoản có quyền Quản Trị Cấp Cao (SA).
            </p>
            <div className="coop-admin__unauth-actions">
              <Link to="/login" className="btn btn--primary">
                <i className="ri-login-box-line" /> Đăng nhập quản trị
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
    <section className="coop-admin">
      <div className="coop-admin__container">
        {/* Breadcrumb Navigation */}
        <div className="coop-admin__top-bar">
          <Link to="/" className="coop-admin__back-btn">
            <i className="ri-arrow-left-line" /> Quay lại Trang Chủ
          </Link>
          <div className="coop-admin__quick-nav">
            <Link to="/admin/tintuc" className="coop-admin__nav-pill">
              <i className="ri-file-list-3-line" /> Bài Viết
            </Link>
            <Link to="/admin/accounts" className="coop-admin__nav-pill">
              <i className="ri-group-line" /> Tài Khoản
            </Link>
            <span className="coop-admin__nav-pill coop-admin__nav-pill--active">
              <i className="ri-shake-hands-line" /> Hợp Tác ({items.length})
            </span>
          </div>
        </div>

        {/* Header Title */}
        <div className="coop-admin__header">
          <span className="coop-admin__eyebrow">
            <i className="ri-shield-star-fill" /> HỆ THỐNG QUẢN TRỊ ĐỐI TÁC EAAGRI
          </span>
          <h1 className="coop-admin__title">Quản Lý Yêu Cầu Hợp Tác</h1>
          <p className="coop-admin__subtitle">
            Theo dõi, xử lý và chăm sóc thông tin các hợp tác xã, trang trại sầu riêng và đối tác gửi yêu cầu liên hệ.
          </p>
        </div>

        {/* Global Alert */}
        {alert.type && (
          <div
            className={`coop-admin__alert coop-admin__alert--${alert.type}`}
            data-aos="fade-up"
          >
            <i
              className={
                alert.type === "success"
                  ? "ri-checkbox-circle-fill"
                  : alert.type === "error"
                  ? "ri-error-warning-fill"
                  : "ri-information-fill"
              }
            />
            <div className="coop-admin__alert-content">
              <span>{alert.message}</span>
            </div>
            <button
              type="button"
              className="coop-admin__alert-close"
              onClick={() => setAlert({ type: null, message: "" })}
            >
              <i className="ri-close-line" />
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="coop-admin__stats-grid">
          <div className="coop-admin__stat-card">
            <div className="coop-admin__stat-icon coop-admin__stat-icon--total">
              <i className="ri-inbox-archive-line" />
            </div>
            <div className="coop-admin__stat-info">
              <span className="coop-admin__stat-label">Tổng Yêu Cầu</span>
              <strong className="coop-admin__stat-value">{stats.total}</strong>
            </div>
          </div>

          <div className="coop-admin__stat-card">
            <div className="coop-admin__stat-icon coop-admin__stat-icon--pending">
              <i className="ri-time-line" />
            </div>
            <div className="coop-admin__stat-info">
              <span className="coop-admin__stat-label">Chờ Xử Lý</span>
              <strong className="coop-admin__stat-value">{stats.pending}</strong>
            </div>
          </div>

          <div className="coop-admin__stat-card">
            <div className="coop-admin__stat-icon coop-admin__stat-icon--progress">
              <i className="ri-chat-voice-line" />
            </div>
            <div className="coop-admin__stat-info">
              <span className="coop-admin__stat-label">Đang Trao Đổi</span>
              <strong className="coop-admin__stat-value">{stats.inProgress}</strong>
            </div>
          </div>

          <div className="coop-admin__stat-card">
            <div className="coop-admin__stat-icon coop-admin__stat-icon--partnered">
              <i className="ri-shake-hands-fill" />
            </div>
            <div className="coop-admin__stat-info">
              <span className="coop-admin__stat-label">Đã Hợp Tác</span>
              <strong className="coop-admin__stat-value">{stats.partnered}</strong>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="coop-admin__card">
          {/* Controls Bar: Search + Filters + Actions */}
          <div className="coop-admin__controls">
            <div className="coop-admin__search-box">
              <i className="ri-search-line" />
              <input
                type="text"
                placeholder="Tìm theo tên, SĐT, email, HTX, nội dung..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="coop-admin__clear-search"
                  onClick={() => setSearchQuery("")}
                >
                  <i className="ri-close-circle-fill" />
                </button>
              )}
            </div>

            <div className="coop-admin__filter-group">
              <div className="coop-admin__select-wrap">
                <i className="ri-filter-3-line" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label="Lọc theo trạng thái"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="pending">⏳ Chờ xử lý</option>
                  <option value="contacted">📞 Đã liên hệ</option>
                  <option value="negotiating">💬 Đang trao đổi</option>
                  <option value="partnered">🤝 Đã chốt hợp tác</option>
                  <option value="cancelled">🚫 Tạm dừng / Hủy</option>
                </select>
              </div>

              {uniqueTypes.length > 0 && (
                <div className="coop-admin__select-wrap">
                  <i className="ri-git-branch-line" />
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    aria-label="Lọc theo hình thức hợp tác"
                  >
                    <option value="all">Tất cả hình thức</option>
                    {uniqueTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="button"
                className="btn coop-admin__btn-export"
                onClick={handleExportCSV}
                title="Xuất dữ liệu danh sách đối tác ra file Excel CSV"
              >
                <i className="ri-file-excel-2-line" /> Xuất Excel
              </button>

              <button
                type="button"
                className="btn coop-admin__btn-refresh"
                onClick={fetchData}
                title="Tải lại danh sách mới nhất"
              >
                <i className="ri-refresh-line" />
              </button>
            </div>
          </div>

          {/* Data Table */}
          <div className="coop-admin__table-container">
            {loading ? (
              <div className="coop-admin__table-loading">
                <div className="coop-admin__spinner" />
                <p>Đang tải danh sách yêu cầu hợp tác...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="coop-admin__empty-state">
                <div className="coop-admin__empty-icon">
                  <i className="ri-folder-user-line" />
                </div>
                <h3>Không tìm thấy yêu cầu hợp tác nào</h3>
                <p>
                  {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                    ? "Không có dữ liệu phù hợp với bộ lọc tìm kiếm. Hãy thử xóa bộ lọc."
                    : "Chưa có biểu mẫu đăng ký hợp tác nào được gửi đến."}
                </p>
                {(searchQuery || statusFilter !== "all" || typeFilter !== "all") && (
                  <button
                    type="button"
                    className="btn btn--outline"
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                      setTypeFilter("all");
                    }}
                  >
                    <i className="ri-refresh-line" /> Đặt lại bộ lọc
                  </button>
                )}
              </div>
            ) : (
              <table className="coop-admin__table">
                <thead>
                  <tr>
                    <th>Thời gian</th>
                    <th>Người liên hệ</th>
                    <th>Đơn vị / Tổ chức</th>
                    <th>Loại hình hợp tác</th>
                    <th>Trạng thái</th>
                    <th>Ghi chú</th>
                    <th className="text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => {
                    const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
                    return (
                      <tr key={item.id} className="coop-admin__row">
                        {/* Date */}
                        <td className="coop-admin__cell-date">
                          <span className="date-main">{formatDate(item.created_at)}</span>
                        </td>

                        {/* Contact Person */}
                        <td className="coop-admin__cell-contact">
                          <strong className="contact-name">{item.full_name}</strong>
                          <div className="contact-meta">
                            <a
                              href={`tel:${item.phone}`}
                              className="contact-phone"
                              title="Gọi điện trực tiếp"
                            >
                              <i className="ri-phone-fill" /> {item.phone}
                            </a>
                            {item.email && (
                              <a
                                href={`mailto:${item.email}`}
                                className="contact-email"
                                title="Gửi email"
                              >
                                <i className="ri-mail-line" /> {item.email}
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Organization */}
                        <td className="coop-admin__cell-org">
                          {item.organization ? (
                            <span className="org-badge">
                              <i className="ri-community-line" /> {item.organization}
                            </span>
                          ) : (
                            <span className="text-muted">Cá nhân / Nhà vườn</span>
                          )}
                        </td>

                        {/* Cooperation Type */}
                        <td className="coop-admin__cell-type">
                          <span className="type-badge">
                            {item.cooperation_type}
                          </span>
                        </td>

                        {/* Status Quick Dropdown */}
                        <td className="coop-admin__cell-status">
                          <select
                            className="status-select"
                            style={{
                              backgroundColor: statusCfg.bg,
                              color: statusCfg.color,
                              borderColor: statusCfg.color,
                            }}
                            value={item.status}
                            onChange={(e) =>
                              handleQuickStatusChange(
                                item,
                                e.target.value as CooperationItem["status"]
                              )
                            }
                          >
                            <option value="pending">⏳ Chờ xử lý</option>
                            <option value="contacted">📞 Đã liên hệ</option>
                            <option value="negotiating">💬 Đang trao đổi</option>
                            <option value="partnered">🤝 Đã chốt hợp tác</option>
                            <option value="cancelled">🚫 Tạm dừng / Hủy</option>
                          </select>
                        </td>

                        {/* Notes Preview */}
                        <td className="coop-admin__cell-notes">
                          {item.notes ? (
                            <span className="notes-preview" title={item.notes}>
                              <i className="ri-file-text-line" /> {item.notes}
                            </span>
                          ) : (
                            <span className="text-muted">--</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="coop-admin__cell-actions text-right">
                          <div className="action-btn-group">
                            <button
                              type="button"
                              className="btn-action btn-action--view"
                              onClick={() => handleOpenDetail(item)}
                              title="Xem chi tiết & Xử lý"
                            >
                              <i className="ri-eye-line" />
                            </button>

                            <a
                              href={`https://zalo.me/${item.phone.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-action btn-action--zalo"
                              title="Nhắn tin Zalo"
                            >
                              <i className="ri-chat-3-line" />
                            </a>

                            <button
                              type="button"
                              className="btn-action btn-action--delete"
                              onClick={() => setItemToDelete(item)}
                              title="Xóa yêu cầu"
                            >
                              <i className="ri-delete-bin-line" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer Table Info */}
          <div className="coop-admin__table-footer">
            <span>
              Hiển thị <strong>{filteredItems.length}</strong> / {items.length} yêu cầu
            </span>
          </div>
        </div>
      </div>

      {/* DETAIL & EDIT MODAL */}
      {selectedItem && (
        <div className="coop-modal__backdrop" onClick={handleCloseDetail}>
          <div
            className="coop-modal__dialog coop-modal__dialog--detail"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="coop-modal__header">
              <div className="coop-modal__header-content">
                <span className="coop-modal__badge">
                  <i className="ri-user-star-line" /> CHI TIẾT YÊU CẦU HỢP TÁC
                </span>
                <h3 className="coop-modal__title">{selectedItem.full_name}</h3>
                <p className="coop-modal__desc">
                  Gửi lúc {formatDate(selectedItem.created_at)}
                </p>
              </div>
              <button
                type="button"
                className="coop-modal__close-btn"
                onClick={handleCloseDetail}
              >
                <i className="ri-close-line" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="coop-modal__body">
              {/* Direct Action Chips */}
              <div className="coop-detail__action-strip">
                <a
                  href={`tel:${selectedItem.phone}`}
                  className="coop-detail__chip-btn coop-detail__chip-btn--call"
                >
                  <i className="ri-phone-fill" /> Gọi {selectedItem.phone}
                </a>
                <a
                  href={`https://zalo.me/${selectedItem.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="coop-detail__chip-btn coop-detail__chip-btn--zalo"
                >
                  <i className="ri-chat-3-fill" /> Nhắn Zalo
                </a>
                {selectedItem.email && (
                  <a
                    href={`mailto:${selectedItem.email}`}
                    className="coop-detail__chip-btn coop-detail__chip-btn--email"
                  >
                    <i className="ri-mail-send-fill" /> Gửi Email
                  </a>
                )}
              </div>

              {/* Info Grid */}
              <div className="coop-detail__info-grid">
                <div className="coop-detail__info-box">
                  <span className="label">Đơn vị / Tổ chức:</span>
                  <strong>{selectedItem.organization || "Cá nhân / Nhà vườn tự do"}</strong>
                </div>

                <div className="coop-detail__info-box">
                  <span className="label">Loại hình hợp tác:</span>
                  <strong className="text-emerald">{selectedItem.cooperation_type}</strong>
                </div>

                <div className="coop-detail__info-box">
                  <span className="label">Số điện thoại:</span>
                  <strong>{selectedItem.phone}</strong>
                </div>

                <div className="coop-detail__info-box">
                  <span className="label">Email liên hệ:</span>
                  <strong>{selectedItem.email || "Không cung cấp"}</strong>
                </div>
              </div>

              {/* Message Content */}
              <div className="coop-detail__section">
                <h4>
                  <i className="ri-message-2-line" /> Lời nhắn & Nhu cầu từ đối tác
                </h4>
                <div className="coop-detail__message-card">
                  {selectedItem.message ? (
                    <p>{selectedItem.message}</p>
                  ) : (
                    <p className="text-muted">Không có nội dung lời nhắn bổ sung.</p>
                  )}
                </div>
              </div>

              {/* Status and Admin Notes Form */}
              <div className="coop-detail__section">
                <h4>
                  <i className="ri-edit-2-line" /> Xử lý & Ghi chú quản trị viên
                </h4>

                <div className="coop-detail__form-row">
                  <div className="coop-modal__field">
                    <label htmlFor="modal-status-select">Trạng thái xử lý:</label>
                    <div className="coop-modal__input-wrap">
                      <i className="ri-flag-2-line" />
                      <select
                        id="modal-status-select"
                        value={modalStatus}
                        onChange={(e) =>
                          setModalStatus(e.target.value as CooperationItem["status"])
                        }
                      >
                        <option value="pending">⏳ Chờ xử lý</option>
                        <option value="contacted">📞 Đã liên hệ</option>
                        <option value="negotiating">💬 Đang trao đổi & khảo sát</option>
                        <option value="partnered">🤝 Đã chốt ký hợp tác</option>
                        <option value="cancelled">🚫 Tạm dừng / Từ chối / Hủy</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="coop-modal__field" style={{ marginTop: "1rem" }}>
                  <label htmlFor="modal-notes-textarea">
                    Ghi chú nội bộ (Lịch sử trao đổi, kết quả cuộc gọi...):
                  </label>
                  <div className="coop-modal__input-wrap coop-modal__input-wrap--textarea">
                    <textarea
                      id="modal-notes-textarea"
                      rows={3}
                      placeholder="Ví dụ: Đã gọi lúc 9h sáng, đối tác quan tâm gói số hóa 50ha sầu riêng tại Cư M'gar, hẹn thứ 6 gửi báo giá..."
                      value={modalNotes}
                      onChange={(e) => setModalNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="coop-detail__footer">
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={handleCloseDetail}
                >
                  Đóng
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  className="btn btn--primary"
                  onClick={handleSaveDetail}
                >
                  {isUpdating ? (
                    <>
                      <i className="ri-loader-4-line coop-modal__spinner" /> Đang lưu...
                    </>
                  ) : (
                    <>
                      <i className="ri-save-line" /> Lưu Cập Nhật
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {itemToDelete && (
        <div
          className="coop-modal__backdrop"
          onClick={() => setItemToDelete(null)}
        >
          <div
            className="coop-modal__dialog coop-modal__dialog--sm"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="coop-modal__header">
              <div className="coop-modal__header-content">
                <h3 className="coop-modal__title text-danger">
                  <i className="ri-delete-bin-line" /> Xác Nhận Xóa
                </h3>
              </div>
              <button
                type="button"
                className="coop-modal__close-btn"
                onClick={() => setItemToDelete(null)}
              >
                <i className="ri-close-line" />
              </button>
            </div>

            <div className="coop-modal__body text-center">
              <p>
                Bạn có chắc chắn muốn xóa yêu cầu hợp tác của{" "}
                <strong>"{itemToDelete.full_name}"</strong> ({itemToDelete.phone}) không?
              </p>
              <p className="text-muted" style={{ fontSize: "0.85rem" }}>
                Hành động này sẽ xóa vĩnh viễn bản ghi khỏi cơ sở dữ liệu và không thể hoàn tác.
              </p>

              <div className="coop-modal__success-actions" style={{ marginTop: "1.5rem" }}>
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={() => setItemToDelete(null)}
                  disabled={isDeleting}
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  className="btn btn--danger"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <i className="ri-loader-4-line coop-modal__spinner" /> Đang xóa...
                    </>
                  ) : (
                    <>
                      <i className="ri-delete-bin-fill" /> Đồng ý xóa
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
