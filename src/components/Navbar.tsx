import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, profile, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const lastScrollY = useRef(0);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const isHomePage = pathname === "/";
  const useCapsuleStyle = !isHomePage || isScrolled;

  useEffect(() => {
    const handleScroll = () => {
      const currentY = Math.max(window.scrollY, 0);
      setIsScrolled(currentY > 80);

      if (currentY <= 120) {
        setIsHidden(false);
      } else if (Math.abs(currentY - lastScrollY.current) > 8) {
        setIsHidden(currentY > lastScrollY.current);
      }

      lastScrollY.current = currentY;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.clientY <= 72) setIsHidden(false);
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    handleScroll(); // Initial check
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  useEffect(() => {
    setIsHidden(false);
    lastScrollY.current = window.scrollY;
    setIsUserMenuOpen(false); // Close user menu on route navigation
  }, [pathname]);

  // Click outside to close user menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNew = () => {
    navigate("/tintuc");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleHome = () => {
    if (pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 50);
    }
  };

  const handleSignOut = async () => {
    setIsUserMenuOpen(false);
    try {
      await signOut();
      navigate("/");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Thành viên";
  const initialChar = displayName.trim().charAt(0).toUpperCase() || "U";
  const isAdmin = profile?.role === "SA";

  return (
    <nav
      className={`navbar-container ${useCapsuleStyle ? "is-scrolled" : ""} ${!isHomePage ? "is-inner-page" : ""} ${isHidden ? "is-hidden" : ""}`}
      data-aos="fade-down"
      onFocusCapture={() => setIsHidden(false)}
    >
      <div className="nav__logo" onClick={handleHome} title="EaAgri - Về đầu trang">
        <img
          src="/logo_banner.jpg"
          alt="EaAgri Logo"
          className="nav__logo-img"
        />
      </div>

      <div className="nav__right-capsule">
        <div className="nav__menu">
          <a
            href="/"
            className={`nav__link ${pathname === "/" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              handleHome();
            }}
          >
            <i className="ri-home-5-line nav__link-icon"></i>
            <span className="nav__link-text">Trang chủ</span>
          </a>

          <a
            href="/architecture"
            className={`nav__link ${pathname === "/architecture" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              navigate("/architecture");
            }}
          >
            <i className="ri-layout-grid-line nav__link-icon"></i>
            <span className="nav__link-text">Kiến trúc</span>
          </a>

          <a
            href="/tintuc"
            className={`nav__link ${pathname.startsWith("/tintuc") ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              handleNew();
            }}
          >
            <i className="ri-article-line nav__link-icon"></i>
            <span className="nav__link-text">Tin tức</span>
          </a>
        </div>

        <div className="nav__actions">
          {user ? (
            <div className="nav__user-menu-wrapper" ref={userMenuRef}>
              <button
                type="button"
                className={`nav__user-pill ${isUserMenuOpen ? "is-active" : ""}`}
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                aria-expanded={isUserMenuOpen}
                title="Tài khoản của bạn"
              >
                <div className="nav__user-avatar">
                  {initialChar}
                </div>
                <span className="nav__user-name">{displayName}</span>
                {isAdmin && <span className="nav__user-role-tag">Admin</span>}
                <i className={`ri-arrow-down-s-line nav__user-chevron ${isUserMenuOpen ? "is-rotated" : ""}`} />
              </button>

              {/* User Glassmorphism Dropdown */}
              {isUserMenuOpen && (
                <div className="nav__user-dropdown">
                  <div className="nav__user-dropdown-header">
                    <div className="nav__user-dropdown-avatar">
                      {initialChar}
                    </div>
                    <div className="nav__user-dropdown-info">
                      <strong className="user-title">{displayName}</strong>
                      <small className="user-email">{user.email}</small>
                      {isAdmin ? (
                        <span className="admin-pill">
                          <i className="ri-shield-star-fill" /> Quản Trị Viên
                        </span>
                      ) : (
                        <span className="member-pill">
                          <i className="ri-user-smile-fill" /> Thành Viên
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="nav__user-dropdown-divider" />

                  <div className="nav__user-dropdown-links">
                    {isAdmin && (
                      <>
                        <button
                          type="button"
                          className="nav__user-dropdown-item"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            navigate("/admin/cooperation");
                          }}
                        >
                          <i className="ri-shake-hands-line" />
                          <span>Quản lý hợp tác</span>
                        </button>

                        <button
                          type="button"
                          className="nav__user-dropdown-item"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            navigate("//admintintuc");
                          }}
                        >
                          <i className="ri-file-list-3-line" />
                          <span>Quản lý bài viết</span>
                        </button>

                        <button
                          type="button"
                          className="nav__user-dropdown-item"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            navigate("/admin/accounts");
                          }}
                        >
                          <i className="ri-group-line" />
                          <span>Quản lý tài khoản</span>
                        </button>

                        <button
                          type="button"
                          className="nav__user-dropdown-item"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            navigate("/tintuc/create");
                          }}
                        >
                          <i className="ri-edit-box-line" />
                          <span>Đăng bài mới</span>
                        </button>
                      </>
                    )}
                  </div>

                  <div className="nav__user-dropdown-divider" />

                  <button
                    type="button"
                    className="nav__user-dropdown-item nav__user-dropdown-item--logout"
                    onClick={handleSignOut}
                  >
                    <i className="ri-logout-box-r-line" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="btn btn--login" onClick={handleLogin}>
              <i className="ri-user-line"></i>
              <span>Đăng nhập</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
