import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../utils/supabase/client";

interface AlertState {
  type: "success" | "error" | null;
  message: string;
}

const USER_ROLES = [
  { id: "farmer", label: "Chủ vườn / Nông dân", icon: "ri-plant-line" },
  { id: "expert", label: "Kỹ sư / Chuyên gia", icon: "ri-microscope-line" },
  { id: "coop", label: "Doanh nghiệp / HTX", icon: "ri-building-line" },
  { id: "guest", label: "Khách quan tâm", icon: "ri-user-smile-line" },
];

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userRole, setUserRole] = useState("farmer");
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState>({ type: null, message: "" });
  const [isRegisteredSuccess, setIsRegisteredSuccess] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in
  const from = (location.state as any)?.from?.pathname || "/";
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  // Generate falling leaves layout across the screen
  const fallingLeaves = useMemo(
    () =>
      Array.from({ length: 15 }, (_, index) => {
        const depth = Math.random();
        const size = 18 + depth * 32;
        const rotationDirection = Math.random() > 0.5 ? 1 : -1;

        return {
          id: index,
          style: {
            "--leaf-left": `${Math.random() * 95}%`,
            "--leaf-size": `${size}px`,
            "--leaf-duration": `${12 + (1 - depth) * 10 + Math.random() * 5}s`,
            "--leaf-delay": `${-Math.random() * 24}s`,
            "--leaf-opacity": `${0.25 + depth * 0.55}`,
            "--leaf-drift-a": `${-80 + Math.random() * 160}px`,
            "--leaf-drift-b": `${-130 + Math.random() * 260}px`,
            "--leaf-drift-c": `${-100 + Math.random() * 200}px`,
            "--leaf-rotation": `${rotationDirection * (200 + Math.random() * 400)}deg`,
            "--leaf-flutter-duration": `${2.2 + Math.random() * 2.2}s`,
            "--leaf-blur": `${(1 - depth) * 1.1}px`,
          } as React.CSSProperties,
        };
      }),
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert({ type: null, message: "" });

    // Validate inputs
    if (!fullName.trim()) {
      setAlert({ type: "error", message: "Vui lòng nhập họ và tên của bạn." });
      return;
    }

    if (!email.trim() || !password.trim()) {
      setAlert({ type: "error", message: "Vui lòng điền đầy đủ email và mật khẩu." });
      return;
    }

    if (password.length < 6) {
      setAlert({ type: "error", message: "Mật khẩu phải có ít nhất 6 ký tự." });
      return;
    }

    if (password !== confirmPassword) {
      setAlert({ type: "error", message: "Mật khẩu xác nhận không trùng khớp." });
      return;
    }

    if (!agreeTerms) {
      setAlert({ type: "error", message: "Vui lòng đồng ý với Điều khoản dịch vụ của EaAgri." });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
            user_role: userRole,
            role: "user",
          },
        },
      });

      if (error) throw error;

      // Check if session exists or confirmation email was sent
      if (data.session) {
        setAlert({
          type: "success",
          message: "Đăng ký thành công! Đang chuyển hướng vào hệ thống...",
        });
        setTimeout(() => navigate("/"), 1500);
      } else {
        setIsRegisteredSuccess(true);
        setAlert({
          type: "success",
          message:
            "Đăng ký tài khoản thành công! Vui lòng kiểm tra email để xác thực (hoặc đăng nhập ngay nếu không cần xác thực).",
        });
      }
    } catch (err: any) {
      console.error("Register error:", err);
      let errMsg = err.message || "Đã xảy ra lỗi trong quá trình đăng ký.";
      if (errMsg.includes("User already registered")) {
        errMsg = "Email này đã được đăng ký tài khoản. Vui lòng đăng nhập hoặc dùng email khác.";
      }
      setAlert({ type: "error", message: errMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="auth-page auth-page--register">
      <button
        type="button"
        className="auth-page__back"
        onClick={() => navigate("/")}
        aria-label="Quay lại trang chủ"
      >
        <i className="ri-arrow-left-line"></i>
        <span>Quay lại trang chủ</span>
      </button>

      {/* Full-screen Background Banner Image */}
      <div
        className="auth-page__bg"
        style={{ backgroundImage: "url('/Banner 3.png')" }}
      ></div>
      <div className="auth-page__overlay"></div>

      {/* Animated Falling Leaves across the entire viewport */}
      <div className="auth-page__leaves" aria-hidden="true">
        {fallingLeaves.map((leaf) => (
          <span className="auth-leaf" style={leaf.style} key={leaf.id}>
            <img src="/assets/floating-leaf.png" alt="" className="auth-leaf-img" />
          </span>
        ))}
      </div>

      {/* Centered layout wrapper */}
      <div className="auth-page__card-wrapper auth-page__card-wrapper--register">
        {/* Left Side: Ecosystem Intro */}
        <aside className="auth-page__intro" data-aos="fade-right">
          <span className="auth-page__intro-label">
            <i className="ri-sparkling-2-line" /> EA AGRI ECOSYSTEM
          </span>
          <img src="/logo_navbar.png" alt="Ea Agri" className="auth-page__intro-logo" />
          <h2>
            Đồng hành cùng<br />
            <span>Nông nghiệp số 4.0.</span>
          </h2>
          <p>
            Đăng ký tài khoản để trải nghiệm nền tảng trợ lý sầu riêng thông minh, quản lý dữ liệu cảm biến IoT, nhận phác đồ sinh học AI và kết nối chuỗi giá trị.
          </p>

          <div className="auth-page__signals">
            <span>
              <i className="ri-shield-check-line" /> Chuẩn VietGAP
            </span>
            <span>
              <i className="ri-cpu-line" /> AI Chẩn đoán 3s
            </span>
            <span>
              <i className="ri-drop-line" /> Tưới tự động IoT
            </span>
          </div>

          <div className="auth-page__perks-list">
            <div className="auth-page__perk-item">
              <i className="ri-checkbox-circle-fill"></i>
              <span>Cập nhật bảng giá sầu riêng từng vùng 24/7</span>
            </div>
            <div className="auth-page__perk-item">
              <i className="ri-checkbox-circle-fill"></i>
              <span>Trợ lý AI chuyên gia tư vấn mùa vụ không giới hạn</span>
            </div>
            <div className="auth-page__perk-item">
              <i className="ri-checkbox-circle-fill"></i>
              <span>Quản lý nhật ký canh tác số hóa minh bạch</span>
            </div>
          </div>

          <div className="auth-page__online">
            <i /> Mạng lưới nông dân EaAgri đang mở rộng
          </div>
        </aside>

        {/* Right Side: Register Card Form */}
        <div className="auth-page__card auth-page__card--register" data-aos="zoom-in">
          {/* Header */}
          <div className="auth-page__header">
            <h1>Tạo Tài Khoản</h1>
            <p>Tham gia cộng đồng nông nghiệp thông minh EaAgri.</p>
          </div>

          {/* Status Alert */}
          {alert.type && (
            <div style={{ marginBottom: "1.25rem" }}>
              <div className={`auth-page__alert auth-page__alert--${alert.type}`}>
                <i
                  className={
                    alert.type === "success"
                      ? "ri-checkbox-circle-line"
                      : "ri-error-warning-line"
                  }
                ></i>
                <span>{alert.message}</span>
              </div>
            </div>
          )}

          {isRegisteredSuccess ? (
            <div className="auth-page__success-box">
              <div className="auth-page__success-icon">
                <i className="ri-check-line"></i>
              </div>
              <h3>Chào mừng bạn đến với EaAgri!</h3>
              <p>Tài khoản của bạn đã được khởi tạo thành công trên hệ sinh thái.</p>
              <button
                type="button"
                className="auth-page__submit"
                onClick={() => navigate("/login")}
              >
                <i className="ri-login-box-line"></i>
                <span>Tiến Hành Đăng Nhập</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-page__form">
              {/* Full Name */}
              <div className="auth-page__group">
                <label htmlFor="fullName">Họ và tên</label>
                <div className="auth-page__input-wrapper">
                  <i className="ri-user-3-line"></i>
                  <input
                    type="text"
                    id="fullName"
                    placeholder="Ví dụ: Nguyễn Văn An"
                    className="auth-page__input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Email & Phone Row */}
              <div className="auth-page__row-2">
                {/* Email */}
                <div className="auth-page__group">
                  <label htmlFor="email">Email</label>
                  <div className="auth-page__input-wrapper">
                    <i className="ri-mail-line"></i>
                    <input
                      type="email"
                      id="email"
                      placeholder="email@example.com"
                      className="auth-page__input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="auth-page__group">
                  <label htmlFor="phone">Số điện thoại (tùy chọn)</label>
                  <div className="auth-page__input-wrapper">
                    <i className="ri-phone-line"></i>
                    <input
                      type="tel"
                      id="phone"
                      placeholder="09xx xxx xxx"
                      className="auth-page__input"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Role Selection Pills */}
              <div className="auth-page__group">
                <label>Bạn là ai?</label>
                <div className="auth-page__roles-grid">
                  {USER_ROLES.map((role) => {
                    const isSelected = userRole === role.id;
                    return (
                      <button
                        type="button"
                        key={role.id}
                        className={`auth-page__role-btn ${
                          isSelected ? "auth-page__role-btn--active" : ""
                        }`}
                        onClick={() => setUserRole(role.id)}
                      >
                        <i className={role.icon}></i>
                        <span>{role.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Password & Confirm Password Row */}
              <div className="auth-page__row-2">
                {/* Password */}
                <div className="auth-page__group">
                  <label htmlFor="password">Mật khẩu</label>
                  <div className="auth-page__input-wrapper">
                    <i className="ri-lock-2-line"></i>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      placeholder="Tối thiểu 6 ký tự..."
                      className="auth-page__input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="auth-page__pwd-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      aria-label="Ẩn hiện mật khẩu"
                    >
                      <i className={showPassword ? "ri-eye-off-line" : "ri-eye-line"}></i>
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="auth-page__group">
                  <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                  <div className="auth-page__input-wrapper">
                    <i className="ri-shield-keyhole-line"></i>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      placeholder="Nhập lại mật khẩu..."
                      className="auth-page__input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="auth-page__pwd-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                      aria-label="Ẩn hiện xác nhận mật khẩu"
                    >
                      <i
                        className={
                          showConfirmPassword ? "ri-eye-off-line" : "ri-eye-line"
                        }
                      ></i>
                    </button>
                  </div>
                </div>
              </div>

              {/* Terms Agreement Checkbox */}
              <div className="auth-page__checkbox-group">
                <label className="auth-page__checkbox-label">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    required
                  />
                  <span>
                    Tôi đồng ý với{" "}
                    <a href="#" onClick={(e) => e.preventDefault()}>
                      Điều khoản dịch vụ
                    </a>{" "}
                    và{" "}
                    <a href="#" onClick={(e) => e.preventDefault()}>
                      Chính sách bảo mật
                    </a>{" "}
                    của EaAgri.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="auth-page__submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="upload-news__spinner"></span>
                ) : (
                  <>
                    <i className="ri-user-add-line"></i>
                    <span>Đăng Ký Tài Khoản</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Toggle to Login */}
          <div className="auth-page__toggle">
            <span>Đã có tài khoản EaAgri? </span>
            <Link to="/login">Đăng nhập ngay</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
