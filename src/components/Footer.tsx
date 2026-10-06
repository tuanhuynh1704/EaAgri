import { useNavigate, useLocation } from "react-router-dom";
import { triggerAppStoreNotice } from "./AppStoreNoticeModal";

export default function Footer() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleFooterHome = () => {
    if (pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 50);
    }
  };

  return (
    <footer className="footer">
      {/* High-tech top border glow line */}
      <div className="footer__glow-line"></div>

      <div className="section__container footer__container">
        {/* Brand Column */}
        <div className="footer__brand-col" data-aos="fade-up">
          <div className="footer__logo-box" onClick={handleFooterHome} title="EaAgri - Về đầu trang">
            <div className="footer__logo-icon-wrap">
              <img loading="lazy" decoding="async"
                src="/logo_v1.jpg"
                alt="EaAgri Durian AI Mascot"
                className="footer__logo-icon"
              />
              <span className="footer__logo-pulse" />
            </div>
            <div className="footer__logo-text-group">
              <div className="footer__logo-brand">
                Ea<span>Agri</span>
              </div>
              <span className="footer__logo-sub">Trợ lý nông nghiệp thông minh</span>
            </div>
          </div>

          <p className="footer__description">
            Hệ sinh thái nông nghiệp thông minh ứng dụng công nghệ <strong>AI</strong>, <strong>IoT</strong> và dữ liệu thời gian thực giúp hóa giải rủi ro, tối ưu hóa chi phí và nâng cao chất lượng sầu riêng Việt Nam.
          </p>

          <div className="footer__contact-list">
            <a href="mailto:info@eaagri.vn" className="footer__contact-chip" title="Gửi email liên hệ">
              <i className="ri-mail-send-line"></i>
              <span>info@eaagri.vn</span>
            </a>
            <div className="footer__contact-chip footer__contact-chip--location">
              <i className="ri-map-pin-2-line"></i>
              <span>Đắk Lắk & TP. Hồ Chí Minh</span>
            </div>
          </div>
        </div>

        {/* Navigation Column */}
        <div className="footer__nav-col" data-aos="fade-up" data-aos-delay="100">
          <h4 className="footer__title">Điều Hướng</h4>
          <ul className="footer__links">
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate("/"); }}>
                <i className="ri-home-4-line"></i> <span>Trang chủ</span>
              </a>
            </li>
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate("/kien-truc"); }}>
                <i className="ri-node-tree"></i> <span>Kiến trúc hệ thống</span>
              </a>
            </li>
            <li>
              <a
                href="/tintuc"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/tintuc");
                }}
              >
                <i className="ri-newspaper-line"></i> <span>Tin tức & Sự kiện</span>
              </a>
            </li>
            <li>
              <a
                href="/giai-thuong"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/giai-thuong");
                }}
              >
                <i className="ri-trophy-line"></i> <span>Phòng truyền thống & Giải thưởng</span>
              </a>
            </li>
            <li>
              <a
                href="https://crm.eaagri.vn/"
                target="_blank"
                rel="noopener noreferrer"
                title="Hệ sinh thái EaAgri CRM cho Đại lý VTNN (crm.eaagri.vn)"
              >
                <i className="ri-building-4-line"></i> <span>Hệ thống CRM (crm.eaagri.vn)</span>
                <i className="ri-arrow-right-up-line" style={{ fontSize: "0.75rem", marginLeft: "4px", opacity: 0.7 }}></i>
              </a>
            </li>
          </ul>
        </div>

        {/* Social Connection Column */}
        <div className="footer__social-col" data-aos="fade-up" data-aos-delay="200">
          <h4 className="footer__title">Kết Nối</h4>
          <p className="footer__social-desc">
            Theo dõi hành trình phát triển và kết nối cùng đội ngũ kỹ sư sáng lập EaAgri.
          </p>
          <div className="footer__social-cards">
            <a
              href="https://www.facebook.com/profile.php?id=61577351045350"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__social-card footer__social-card--fb"
              title="Fanpage Facebook chính thức"
            >
              <div className="footer__social-icon">
                <i className="ri-facebook-circle-fill"></i>
              </div>
              <div className="footer__social-text">
                <strong>Facebook</strong>
                <span>@EaAgri.Official</span>
              </div>
              <i className="ri-arrow-right-up-line footer__social-arrow"></i>
            </a>

            {/* <a
              href="https://github.com/TuansHuynh/EaAgri"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__social-card footer__social-card--gh"
              title="Mã nguồn & Dự án trên GitHub"
            >
              <div className="footer__social-icon">
                <i className="ri-github-fill"></i>
              </div>
              <div className="footer__social-text">
                <strong>GitHub</strong>
                <span>Open Source Repos</span>
              </div>
              <i className="ri-arrow-right-up-line footer__social-arrow"></i>
            </a> */}
          </div>
        </div>

        {/* Download & Mobile Apps Column */}
        <div className="footer__download-col" data-aos="fade-up" data-aos-delay="300">
          <h4 className="footer__title">Tải Ứng Dụng</h4>
          <p className="footer__download-desc">
            Quản lý và giám sát vườn sầu riêng của bạn mọi lúc, mọi nơi trực tiếp trên smartphone.
          </p>

          <div className="footer__download-row">
            <a
              href="#app-store"
              className="footer__download-btn"
              onClick={(e) => {
                e.preventDefault();
                triggerAppStoreNotice();
              }}
              aria-label="App Store (iOS)"
              title="Tải trên App Store (iOS)"
            >
              <img loading="lazy" decoding="async"
                src="/assets/apple.png"
                alt="Tải trên App Store"
              />
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.eaagri.app&hl=vi"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__download-btn"
              aria-label="Google Play"
            >
              <img loading="lazy" decoding="async"
                src="/assets/google.png"
                alt="Tải trên Google Play"
              />
            </a>
          </div>

          <div className="footer__status-badge">
            <span className="footer__status-dot" />
            <span>Mạng lưới IoT & AI hoạt động 24/7</span>
          </div>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="footer__bar">
        <div className="footer__bar-content">
          <div className="footer__copyright">
            <span>© 2026 <strong>EaAgri Team</strong>. Nông Nghiệp Số Vì Nông Dân Việt.</span>
          </div>
          <div className="footer__bar-links">
            <a href="#">Điều khoản dịch vụ</a>
            <span className="footer__bar-divider"></span>
            <a
              href="/privacy"
              onClick={(e) => {
                e.preventDefault();
                navigate("/privacy");
              }}
            >
              Chính sách bảo mật
            </a>
            <span className="footer__bar-divider"></span>
            <a
              href="https://crm.eaagri.vn/"
              target="_blank"
              rel="noopener noreferrer"
              title="Cổng Quản trị & Bán hàng EaAgri CRM"
            >
              Cổng EaAgri CRM
            </a>
            <span className="footer__bar-divider"></span>
            <a href="#">Quy chuẩn VietGAP</a>
          </div>
        </div>
      </div>
    </footer>
  );
}