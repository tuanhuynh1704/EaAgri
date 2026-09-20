import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSEO } from "../hooks/useSEO";
import { supabase } from "../utils/supabase/client";

interface AlertState {
  type: "success" | "error" | null;
  message: string;
}

export default function Login() {
  useSEO({
    title: "Đăng Nhập Tài Khoản",
    description: "Đăng nhập vào Hệ thống Nông nghiệp Thông minh EaAgri.",
    noindex: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState>({ type: null, message: "" });

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
  const fallingLeaves = useMemo(() => (
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
    })
  ), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert({ type: null, message: "" });

    // Validate inputs
    if (!email.trim() || !password.trim()) {
      setAlert({ type: "error", message: "Vui lòng điền đầy đủ email và mật khẩu." });
      return;
    }

    if (password.length < 6) {
      setAlert({ type: "error", message: "Mật khẩu phải có ít nhất 6 ký tự." });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) throw error;
      setAlert({ type: "success", message: "Đăng nhập thành công! Đang chuyển hướng..." });
    } catch (err: any) {
      console.error("Auth action error:", err);
      let errMsg = err.message || "Đã xảy ra lỗi trong quá trình xác thực.";
      if (errMsg.includes("Invalid login credentials")) {
        errMsg = "Email hoặc mật khẩu không chính xác.";
      }
      setAlert({ type: "error", message: errMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="auth-page">
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
      <div className="auth-page__bg" style={{ backgroundImage: "url('/Banner 3.png')" }}></div>
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
      <div className="auth-page__card-wrapper">
        <aside className="auth-page__intro" data-aos="fade-right">
          <span className="auth-page__intro-label"><i className="ri-sparkling-2-line" /> EA AGRI ECOSYSTEM</span>
          <img src="/logo_navbar.png" alt="Ea Agri" className="auth-page__intro-logo" />
          <h2>Kiến tạo tương lai<br /><span>nông nghiệp thông minh.</span></h2>
          <p>Website giới thiệu dự án Ea Agri — nền tảng kết nối AI, IoT và tri thức chuyên gia cho chuỗi giá trị sầu riêng Tây Nguyên.</p>
          <div className="auth-page__signals">
            <span><i className="ri-brain-line" /> AI đa phương thức</span>
            <span><i className="ri-radar-line" /> IoT thời gian thực</span>
            <span><i className="ri-team-line" /> Hợp tác nhà nông</span>
          </div>
          <div className="auth-page__online"><i /> Hệ thống đang hoạt động ổn định</div>
        </aside>
        <div className="auth-page__card" data-aos="zoom-in">



          {/* Toggle Title */}
          <div className="auth-page__header">
            <h1>Đăng Nhập</h1>
            <p>Khu vực dành cho thành viên quản trị nội dung Ea Agri.</p>
          </div>

          {/* Status Alert */}
          {alert.type && (
            <div style={{ marginBottom: "1.5rem" }}>
              <div className={`auth-page__alert auth-page__alert--${alert.type}`}>
                <i className={alert.type === "success" ? "ri-checkbox-circle-line" : "ri-error-warning-line"}></i>
                <span>{alert.message}</span>
              </div>
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="auth-page__form">

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

            {/* Password */}
            <div className="auth-page__group">
              <label htmlFor="password">Mật khẩu</label>
              <div className="auth-page__input-wrapper">
                <i className="ri-lock-line"></i>
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
                  <i className="ri-login-box-line"></i>
                  <span>Đăng Nhập</span>
                </>
              )}
            </button>

          </form>

          <div className="auth-page__toggle">
            <span>Chưa có tài khoản? </span>
            <button type="button" onClick={() => navigate("/register")}>
              Đăng ký tài khoản ngay
            </button>
          </div>

        </div>
      </div>

    </section>
  );
}
