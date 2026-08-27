import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, profile, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);
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
  }, [pathname]);

  const handleNew = () => {
    navigate("/news");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleHome = () => {
    navigate("/");
  };

  return (
    <nav
      className={`navbar-container ${useCapsuleStyle ? "is-scrolled" : ""} ${!isHomePage ? "is-inner-page" : ""} ${isHidden ? "is-hidden" : ""}`}
      data-aos="fade-down"
      onFocusCapture={() => setIsHidden(false)}
    >
      <div className="nav__logo" onClick={handleHome}>
        <img
          src="/logo_navbar.png"
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
            <>
              {profile?.role === "SA" && (
                <div className="nav__admin-btns">
                  <button className="btn btn--admin" onClick={() => navigate("/admin/news")}>
                    Quản lý bài
                  </button>
                  <button className="btn btn--admin" onClick={() => navigate("/admin/accounts")}>
                    Tài khoản
                  </button>
                </div>
              )}
              
              <div className="nav__user-greeting">
                {profile?.full_name || user.email?.split("@")[0]}
              </div>

              <button className="btn btn--logout" onClick={signOut}>
                <i className="ri-logout-box-r-line"></i>
                <span>Đăng xuất</span>
              </button>
            </>
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
