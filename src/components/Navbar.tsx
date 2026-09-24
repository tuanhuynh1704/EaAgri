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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const lastScrollY = useRef(0);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const isHomePage = pathname === "/";
  const useCapsuleStyle = !isHomePage || isScrolled;

  // Khóa cuộn trang nền khi mở Drawer Mobile
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

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
    setIsMobileMenuOpen(false); // Close mobile drawer on route navigation
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
    navigate("/news");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleAwards = () => {
    navigate("/awards");
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
    <>
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
            href="/awards"
            className={`nav__link ${pathname === "/awards" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              handleAwards();
            }}
          >
            <i className="ri-trophy-line nav__link-icon"></i>
            <span className="nav__link-text">Giải thưởng</span>
          </a>

          <a
            href="/news"
            className={`nav__link ${pathname.startsWith("/news") ? "active" : ""}`}
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
                            navigate("/admin/news");
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
                            navigate("/news/create");
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

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            className={`nav__mobile-toggle ${isMobileMenuOpen ? "is-active" : ""}`}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
            aria-expanded={isMobileMenuOpen}
          >
            <i className={isMobileMenuOpen ? "ri-close-line" : "ri-menu-4-line"} />
          </button>
        </div>
      </div>
    </nav>

    {/* Mobile Drawer Menu Backdrop */}
    <div
      className={`mobile-drawer-backdrop ${isMobileMenuOpen ? "is-open" : ""}`}
      onClick={() => setIsMobileMenuOpen(false)}
      aria-hidden={!isMobileMenuOpen}
    />

    {/* Mobile Drawer Menu Sheet */}
    <aside
      className={`mobile-drawer ${isMobileMenuOpen ? "is-open" : ""}`}
      aria-hidden={!isMobileMenuOpen}
    >
      <div className="mobile-drawer__header">
        <div
          className="mobile-drawer__brand"
          onClick={() => {
            setIsMobileMenuOpen(false);
            handleHome();
          }}
        >
          <img src="/logo_banner.jpg" alt="EaAgri" className="mobile-drawer__logo-img" />
        </div>
        <button
          type="button"
          className="mobile-drawer__close-btn"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Đóng menu"
        >
          <i className="ri-close-line" />
        </button>
      </div>

      {/* User Card (if logged in) */}
      {user && (
        <div className="mobile-drawer__user-card">
          <div className="mobile-drawer__user-avatar">{initialChar}</div>
          <div className="mobile-drawer__user-info">
            <strong className="mobile-drawer__user-name">{displayName}</strong>
            <span className="mobile-drawer__user-email">{user.email}</span>
            {isAdmin && (
              <span className="mobile-drawer__admin-pill">
                <i className="ri-shield-star-fill" /> Quản Trị Viên
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Navigation Links */}
      <div className="mobile-drawer__nav-list">
        <a
          href="/"
          className={`mobile-drawer__nav-item ${pathname === "/" ? "is-active" : ""}`}
          onClick={(e) => {
            e.preventDefault();
            setIsMobileMenuOpen(false);
            handleHome();
          }}
        >
          <div className="mobile-drawer__nav-icon-box">
            <i className="ri-home-5-line" />
          </div>
          <div className="mobile-drawer__nav-text">
            <span className="mobile-drawer__nav-title">Trang chủ</span>
            <span className="mobile-drawer__nav-desc">Nền tảng nông nghiệp số EaAgri</span>
          </div>
          <i className="ri-arrow-right-s-line mobile-drawer__nav-chevron" />
        </a>

        <a
          href="/architecture"
          className={`mobile-drawer__nav-item ${pathname === "/architecture" ? "is-active" : ""}`}
          onClick={(e) => {
            e.preventDefault();
            setIsMobileMenuOpen(false);
            navigate("/architecture");
          }}
        >
          <div className="mobile-drawer__nav-icon-box">
            <i className="ri-layout-grid-line" />
          </div>
          <div className="mobile-drawer__nav-text">
            <span className="mobile-drawer__nav-title">Kiến trúc hệ thống</span>
            <span className="mobile-drawer__nav-desc">Hạ tầng IoT & AI vườn sầu riêng</span>
          </div>
          <i className="ri-arrow-right-s-line mobile-drawer__nav-chevron" />
        </a>

        <a
          href="/awards"
          className={`mobile-drawer__nav-item ${pathname === "/awards" ? "is-active" : ""}`}
          onClick={(e) => {
            e.preventDefault();
            setIsMobileMenuOpen(false);
            navigate("/awards");
          }}
        >
          <div className="mobile-drawer__nav-icon-box">
            <i className="ri-trophy-line" />
          </div>
          <div className="mobile-drawer__nav-text">
            <span className="mobile-drawer__nav-title">Phòng truyền thống & Giải thưởng</span>
            <span className="mobile-drawer__nav-desc">Quán quân AI & NTTU Startup 2026</span>
          </div>
          <i className="ri-arrow-right-s-line mobile-drawer__nav-chevron" />
        </a>

        <a
          href="/news"
          className={`mobile-drawer__nav-item ${pathname.startsWith("/news") ? "is-active" : ""}`}
          onClick={(e) => {
            e.preventDefault();
            setIsMobileMenuOpen(false);
            handleNew();
          }}
        >
          <div className="mobile-drawer__nav-icon-box">
            <i className="ri-article-line" />
          </div>
          <div className="mobile-drawer__nav-text">
            <span className="mobile-drawer__nav-title">Tin tức & Sự kiện</span>
            <span className="mobile-drawer__nav-desc">Kỹ thuật & chuyển giao công nghệ</span>
          </div>
          <i className="ri-arrow-right-s-line mobile-drawer__nav-chevron" />
        </a>
      </div>

      {/* Admin Section (if admin) */}
      {user && isAdmin && (
        <div className="mobile-drawer__admin-section">
          <span className="mobile-drawer__section-title">QUẢN TRỊ VIÊN</span>
          <div className="mobile-drawer__admin-grid">
            <button
              type="button"
              className="mobile-drawer__admin-btn"
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigate("/admin/cooperation");
              }}
            >
              <i className="ri-shake-hands-line" />
              <span>Hợp tác</span>
            </button>
            <button
              type="button"
              className="mobile-drawer__admin-btn"
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigate("/admin/news");
              }}
            >
              <i className="ri-file-list-3-line" />
              <span>Bài viết</span>
            </button>
            <button
              type="button"
              className="mobile-drawer__admin-btn"
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigate("/admin/accounts");
              }}
            >
              <i className="ri-group-line" />
              <span>Tài khoản</span>
            </button>
            <button
              type="button"
              className="mobile-drawer__admin-btn mobile-drawer__admin-btn--create"
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigate("/news/create");
              }}
            >
              <i className="ri-edit-box-line" />
              <span>Đăng bài</span>
            </button>
          </div>
        </div>
      )}

      {/* Auth Button */}
      <div className="mobile-drawer__auth-box">
        {user ? (
          <button
            type="button"
            className="mobile-drawer__logout-btn"
            onClick={() => {
              setIsMobileMenuOpen(false);
              handleSignOut();
            }}
          >
            <i className="ri-logout-box-r-line" />
            <span>Đăng xuất tài khoản</span>
          </button>
        ) : (
          <button
            type="button"
            className="mobile-drawer__login-btn"
            onClick={() => {
              setIsMobileMenuOpen(false);
              handleLogin();
            }}
          >
            <i className="ri-user-line" />
            <span>Đăng nhập vào EaAgri</span>
          </button>
        )}
      </div>
    </aside>
  </>
  );
};

export default Navbar;
