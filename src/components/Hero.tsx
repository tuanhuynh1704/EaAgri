import { type MouseEvent } from "react";

const Hero = () => {
  const scrollToNextSection = () => {
    const nextSection = document.getElementById('section-team');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleVisualPointerMove = (event: MouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    event.currentTarget.style.setProperty("--parallax-x", `${x * 10}px`);
    event.currentTarget.style.setProperty("--parallax-y", `${y * 8}px`);
  };

  const resetVisualParallax = (event: MouseEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty("--parallax-x", "0px");
    event.currentTarget.style.setProperty("--parallax-y", "0px");
  };

  return (
    <header className="hero-section fullpage-slide">
      <div className="hero-grid-layout section__container">
        {/* LEFT COLUMN: Heading, Subtext, App links */}
        <div className="hero__content" data-aos="fade-up">
          <div className="hero-badge" data-aos="fade-right" data-aos-delay="100">
            <span className="hero-badge__text">NỀN TẢNG NÔNG NGHIỆP SỐ</span>
          </div>

          <h1 className="hero-title">
            <span className="text-ea-agri">Ea Agri</span>
            <span className="text-sub text-gray">Hệ sinh thái nông nghiệp thông minh</span>
          </h1>

          <p className="hero-description">
            Giải pháp tối ưu hóa chuỗi giá trị sầu riêng tại Tây Nguyên. Tích hợp AI đa phương thức, IoT, dữ liệu lớn và mô hình kinh tế chia sẻ, mang lại hiệu quả vượt trội cho doanh nghiệp và nhà nông.
          </p>

          <div className="hero-download-links">
            <a href="#" className="download-btn">
              <span className="download-btn__icon apple-store-icon">
                <i className="ri-apple-fill"></i>
              </span>
              <div className="download-btn__text">
                <span className="download-btn__lbl">Tải về trên</span>
                <span className="download-btn__store">App Store</span>
              </div>
            </a>

            <a 
              href="https://play.google.com/store/apps/details?id=com.eaagri.app&hl=vi" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="download-btn"
            >
              <span className="download-btn__icon google-play-icon">
                <i className="ri-google-play-fill"></i>
              </span>
              <div className="download-btn__text">
                <span className="download-btn__lbl">Tải về trên</span>
                <span className="download-btn__store">Google Play</span>
              </div>
            </a>
          </div>
        </div>

        {/* RIGHT COLUMN: Visuals */}
        <div
          className="hero__visual"
          data-aos="zoom-in"
          data-aos-delay="100"
          onMouseMove={handleVisualPointerMove}
          onMouseLeave={resetVisualParallax}
        >
          <div className="image-wrapper-container">
            <img
              src="/Cây 1.png"
              alt="Smart Agriculture"
              className="main-hero-image"
            />
          </div>
        </div>
      </div>

      {/* Scroll Down Hint Button */}
      <div 
        className="scroll-down-hint" 
        onClick={scrollToNextSection}
        title="Cuộn xuống trang tiếp theo"
      >
        <span className="scroll-down-hint__text">Khám phá tiếp</span>
        <i className="ri-arrow-down-s-line"></i>
      </div>
    </header>
  );
};

export default Hero;
