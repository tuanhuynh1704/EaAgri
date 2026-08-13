import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="footer">
      {/* High-tech top border glow line */}
      <div className="footer__glow-line"></div>

      <div className="section__container footer__container">
        {/* Brand Column */}
        <div className="footer__brand-col" data-aos="fade-up">
          <div className="footer__logo-box" onClick={() => navigate("/")}>
            <img
              src="/logo_navbar.png"
              alt="EaAgri Logo"
              className="footer__logo-img"
            />
          </div>
          <p className="footer__description">
            Hệ sinh thái nông nghiệp thông minh ứng dụng công nghệ AI, IoT và dữ liệu thời gian thực giúp nâng cao năng suất và chất lượng nông sản Việt Nam.
          </p>
          {/* Quick contact badge */}
          <div className="footer__contact-badge">
            <i className="ri-mail-send-line"></i>
            <span>contact@eaagri.id.vn</span>
          </div>
        </div>

        {/* Navigation Column */}
        <div className="footer__nav-col" data-aos="fade-up" data-aos-delay="100">
          <h4 className="footer__title">Điều Hướng</h4>
          <ul className="footer__links">
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate("/"); }}>
                <i className="ri-arrow-right-s-line"></i> Trang chủ
              </a>
            </li>
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate("/architecture"); }}>
                <i className="ri-arrow-right-s-line"></i> Kiến trúc hệ thống
              </a>
            </li>
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate("/news"); }}>
                <i className="ri-arrow-right-s-line"></i> Tin tức & Sự kiện
              </a>
            </li>
          </ul>
        </div>

        {/* Social Connection Column */}
        <div className="footer__social-col" data-aos="fade-up" data-aos-delay="200">
          <h4 className="footer__title">Kết Nối</h4>
          <p className="footer__social-desc">
            Theo dõi hành trình phát triển và cập nhật các tính năng mới nhất từ EaAgri.
          </p>
          <div className="footer__social-cards">
            <a
              href="https://www.facebook.com/profile.php?id=61577351045350"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__social-card"
              title="Facebook"
            >
              <i className="ri-facebook-circle-fill"></i>
              <span>Facebook</span>
            </a>
            <a
              href="https://github.com/TuansHuynh/EaAgri"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__social-card"
              title="GitHub"
            >
              <i className="ri-github-fill"></i>
              <span>GitHub</span>
            </a>
          </div>
        </div>

        {/* Download & Newsletter Column */}
        <div className="footer__download-col" data-aos="fade-up" data-aos-delay="300">
          <h4 className="footer__title">Tải Ứng Dụng</h4>
          <p className="footer__download-desc">
            Quản lý và giám sát vườn sầu riêng của bạn mọi lúc, mọi nơi trực tiếp trên thiết bị di động.
          </p>
          
          <div className="footer__download-row">
            <a href="##" className="footer__download-btn" aria-label="App Store">
              <img
                src="/assets/apple.png"
                alt="App Store"
              />
            </a>
            <a 
              href="https://play.google.com/store/apps/details?id=com.eaagri.app&hl=vi" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="footer__download-btn" 
              aria-label="Google Play"
            >
              <img
                src="/assets/google.png"
                alt="Google Play"
              />
            </a>
          </div>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="footer__bar">
        <div className="footer__bar-content">
          <span className="footer__copyright">
            Copyright © 2026 Ea Agri Team. All rights reserved.
          </span>
          <div className="footer__bar-links">
            <a href="#">Điều khoản dịch vụ</a>
            <span className="footer__bar-divider"></span>
            <a href="#">Chính sách bảo mật</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;