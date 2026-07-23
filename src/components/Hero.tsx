const Hero = () => {
  return (
    <header className="hero-section">
      {/* Decorative background elements */}
      <div className="hero-bg-decor">
        {/* Dynamic Multi-layered Background Gradients */}
        <div className="hero-orb hero-orb--1"></div>
        <div className="hero-orb hero-orb--2"></div>
        <div className="hero-orb hero-orb--3"></div>
        <div className="hero-orb hero-orb--4"></div>
        <div className="hero-orb hero-orb--5"></div>

        {/* Abstract shapes & Grid patterns */}
        <div className="hero-grid-pattern"></div>
        <div className="hero-diagonal-shape"></div>
        <div className="hero-wave-shape"></div>

        {/* Animated Particles */}
        <div className="hero-particles">
          <span></span><span></span><span></span>
          <span></span><span></span><span></span>
          <span></span><span></span><span></span>
          <span></span><span></span><span></span>
        </div>
      </div>

      <div
        className="header__img"
        data-aos="zoom-in"
        data-aos-delay="100"
      >
        {/* Tech Radar Scanner & Glow Behind the Main Image */}
        <div className="image-glow-backdrop"></div>
        <div className="image-radar-ring"></div>
        <div className="image-radar-ring image-radar-ring--delayed"></div>

        <img
          src="/assets/tải xuống (3).png"
          alt="Smart Agriculture"
          className="main-hero-image"
        />

        {/* Floating Agricultural Dashboard Badges */}
        <div className="floating-badge badge--ai" data-aos="fade-up" data-aos-delay="300">
          <div className="badge__icon">🤖</div>
          <div className="badge__content">
            <span className="badge__title">Ea Agri AI</span>
            <span className="badge__value text-success">Sầu riêng khỏe mạnh 98%</span>
          </div>
        </div>

        <div className="floating-badge badge--moisture" data-aos="fade-up" data-aos-delay="500">
          <div className="badge__icon">💧</div>
          <div className="badge__content">
            <span className="badge__title">Độ ẩm đất</span>
            <span className="badge__value">68% - Đủ nước</span>
          </div>
        </div>

        <div className="floating-badge badge--iot" data-aos="fade-up" data-aos-delay="700">
          <div className="badge__icon">📡</div>
          <div className="badge__content">
            <span className="badge__title">Cảm biến IoT</span>
            <span className="badge__value text-primary">Đang trực tuyến 24/7</span>
          </div>
        </div>
      </div>

      <div
        className="header__content"
        data-aos="fade-up"
      >
        <span className="hero-subtitle" data-aos="fade-right" data-aos-delay="100">
          NỀN TẢNG NÔNG NGHIỆP SỐ
        </span>
         <h1>
          <span className="text-ea">EA</span> <span className="text-agri">AGRI</span> HỆ SINH THÁI NÔNG NGHIỆP THÔNG MINH
        </h1>

        <p className="section__description">
          Giải pháp tối ưu hóa chuỗi giá trị sầu riêng tại Tây
          Nguyên: Tích hợp AI đa phương thức, IoT, đặt lịch chuyên
          gia và mô hình kinh tế chia sẻ.
        </p>

        <ul className="header__links">
          <li>
            <a href="#">
              <img
                src="/assets/apple.png"
                alt="App Store"
              />
            </a>
          </li>

          <li>
            <a href="https://play.google.com/store/apps/details?id=com.eaagri.app&hl=vi">
              <img
                src="/assets/google.png"
                alt="Google Play"
              />
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Hero;