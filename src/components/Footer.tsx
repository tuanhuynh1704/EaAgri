const Footer = () => {
  return (
    <footer>
      <div
        className="section__container footer__container"
        data-aos="fade-up"
      >
        <div className="footer__logo">
          <a href="#">
            <img
              src="/assets/tải xuống.png"
              alt="EaAgri Logo"
            />
          </a>

          <p>
            Hệ sinh thái nông nghiệp thông minh ứng dụng AI,
            IoT và dữ liệu thời gian thực cho người nông dân.
          </p>
        </div>

        <div className="footer__menu">
          <h4>Điều hướng</h4>

          <ul className="footer__links">
            <li>
              <a href="#">Giới thiệu</a>
            </li>

            <li>
              <a href="#">Công nghệ</a>
            </li>

            <li>
              <a href="#">Báo cáo</a>
            </li>

            <li>
              <a href="#">Liên hệ</a>
            </li>
          </ul>
        </div>

        <div className="footer__social">
          <h4>Kết nối</h4>

          <ul className="footer__socials">
            <li>
              <a href="#">
                <i className="ri-twitter-fill"></i>
              </a>
            </li>

            <li>
              <a href="https://www.facebook.com/profile.php?id=61577351045350">
                <i className="ri-facebook-fill"></i>
              </a>
            </li>

            <li>
              <a
                // href="https://github.com/DangwHuy/daklakagent"
                href="https://github.com/TuansHuynh/EaAgri"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="ri-github-fill"></i>
              </a>
            </li>
          </ul>
        </div>
        <ul className="header__links">
          <li>
            <a href="##">
              <img
                src="/assets/apple.png"
                alt="App Store"
              />
            </a>
          </li>

          <li>
            <a href="##">
              <img
                src="/assets/google.png"
                alt="Google Play"
              />
            </a>
          </li>
        </ul>
      </div>

      <div className="footer__bar">
        Copyright © 2026 Ea Agri Team.
        All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;