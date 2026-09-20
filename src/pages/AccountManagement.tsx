import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSEO } from "../hooks/useSEO";
import { supabase } from "../utils/supabase/client";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: "SA" | "user";
  created_at: string;
}

interface AlertState {
  type: "success" | "error" | null;
  message: string;
}

export default function AccountManagement() {
  useSEO({
    title: "Quản Lý Tài Khoản",
    noindex: true,
  });

  const { user, profile: currentUserProfile, loading: authLoading } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<AlertState>({ type: null, message: "" });
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Fetch all profiles if the logged-in user is an SA
  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProfiles(data as Profile[] || []);
    } catch (err: any) {
      console.error("Error fetching profiles:", err);
      setAlert({
        type: "error",
        message: `Không thể tải danh sách tài khoản: ${err.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && currentUserProfile?.role === "SA") {
      fetchProfiles();
    }
  }, [user, currentUserProfile]);

  const handleRoleChange = async (targetUserId: string, newRole: "SA" | "user") => {
    // Prevent self role modification
    if (targetUserId === user?.id) {
      setAlert({
        type: "error",
        message: "Bạn không thể tự thay đổi vai trò của chính mình để tránh mất quyền quản trị."
      });
      return;
    }

    setAlert({ type: null, message: "" });
    setIsUpdating(targetUserId);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", targetUserId);

      if (error) throw error;

      setAlert({
        type: "success",
        message: "Cập nhật vai trò người dùng thành công!"
      });

      // Update state locally
      setProfiles((prev) =>
        prev.map((prof) =>
          prof.id === targetUserId ? { ...prof, role: newRole } : prof
        )
      );
    } catch (err: any) {
      console.error("Error updating role:", err);
      setAlert({
        type: "error",
        message: `Thay đổi vai trò thất bại: ${err.message}`
      });
    } finally {
      setIsUpdating(null);
    }
  };

  // Auth loading state
  if (authLoading) {
    return (
      <section className="ac-mgmt">
        <div className="news-list__loading">
          <div className="spinner"></div>
          <p>Đang kiểm tra quyền truy cập...</p>
        </div>
      </section>
    );
  }

  // Guard Clause: Only allow Super Admin (SA) role
  if (!user || currentUserProfile?.role !== "SA") {
    return (
      <section className="ac-mgmt" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div className="ac-mgmt__unauthorized" data-aos="fade-up">
          <i className="ri-shield-keyhole-line"></i>
          <h2>Truy Cập Bị Từ Chối</h2>
          <p>Trang này chỉ dành riêng cho tài khoản Super Admin (SA). Vui lòng đăng nhập với tài khoản có thẩm quyền hoặc quay lại trang chủ.</p>
          <Link to="/" className="btn">
            <i className="ri-home-4-line"></i>
            Quay về Trang chủ
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="ac-mgmt">
      <div className="ac-mgmt__container">
        
        {/* Back Link */}
        <Link to="/" className="ac-mgmt__back">
          <i className="ri-arrow-left-line"></i>
          Quay lại Trang chủ
        </Link>

        {/* Title */}
        <div className="ac-mgmt__header" data-aos="fade-up">
          <h1>Quản Lý Tài Khoản</h1>
          <p>Quản lý phân quyền và vai trò thành viên trong hệ thống EaAgri</p>
        </div>

        {/* Dashboard Card */}
        <div className="ac-mgmt__card" data-aos="fade-up" data-aos-delay="100">
          
          {/* Status Alert */}
          {alert.type && (
            <div className={`ac-mgmt__alert ac-mgmt__alert--${alert.type}`}>
              <i className={alert.type === "success" ? "ri-checkbox-circle-line" : "ri-error-warning-line"}></i>
              <span>{alert.message}</span>
            </div>
          )}

          <div className="ac-mgmt__toolbar">
            <h2 className="ac-mgmt__title">Danh sách thành viên</h2>
            <span className="ac-mgmt__stats">Tổng cộng: {profiles.length} tài khoản</span>
          </div>

          {loading ? (
            <div className="news-list__loading" style={{ minHeight: "150px" }}>
              <div className="spinner"></div>
              <p>Đang tải danh sách thành viên...</p>
            </div>
          ) : (
            <div className="ac-mgmt__table-wrapper">
              <table className="ac-mgmt__table">
                <thead>
                  <tr>
                    <th>Thành viên</th>
                    <th>Vai trò</th>
                    <th>Ngày đăng ký</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((prof) => (
                    <tr key={prof.id}>
                      {/* Member Info */}
                      <td>
                        <div className="ac-mgmt__user-info">
                          <span className="name">{prof.full_name || "Chưa cập nhật"}</span>
                          <span className="email">{prof.email}</span>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td>
                        <span className={`ac-mgmt__badge ac-mgmt__badge--${prof.role.toLowerCase()}`}>
                          {prof.role === "SA" ? "Super Admin (SA)" : "Thành viên (User)"}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td>
                        {new Date(prof.created_at).toLocaleDateString("vi-VN", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit"
                        })}
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="ac-mgmt__actions">
                          {prof.id === user.id ? (
                            <span style={{ fontSize: "0.85rem", color: "#b71c1c", fontWeight: "600" }}>
                              Tài khoản hiện tại
                            </span>
                          ) : (
                            <select
                              value={prof.role}
                              onChange={(e) => handleRoleChange(prof.id, e.target.value as "SA" | "user")}
                              className="ac-mgmt__select"
                              disabled={isUpdating === prof.id}
                            >
                              <option value="user">Đặt làm User</option>
                              <option value="SA">Cấp quyền SA</option>
                            </select>
                          )}
                          {isUpdating === prof.id && (
                            <div className="upload-news__spinner" style={{ width: "16px", height: "16px", borderTopColor: "#43a047" }}></div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
