import { useMemo, type CSSProperties, type MouseEvent } from "react";

const Hero = () => {
  const fallingLeaves = useMemo(() => (
    Array.from({ length: 16 }, (_, index) => {
      const depth = Math.random();
      const size = 18 + depth * 38;
      const rotationDirection = Math.random() > 0.5 ? 1 : -1;

      return {
        id: index,
        style: {
          "--leaf-left": `${Math.random() * 96}%`,
          "--leaf-size": `${size}px`,
          "--leaf-duration": `${12 + (1 - depth) * 10 + Math.random() * 5}s`,
          "--leaf-delay": `${-Math.random() * 26}s`,
          "--leaf-opacity": `${0.24 + depth * 0.56}`,
          "--leaf-drift-a": `${-90 + Math.random() * 180}px`,
          "--leaf-drift-b": `${-145 + Math.random() * 290}px`,
          "--leaf-drift-c": `${-115 + Math.random() * 230}px`,
          "--leaf-rotation": `${rotationDirection * (220 + Math.random() * 520)}deg`,
          "--leaf-flutter-duration": `${2.4 + Math.random() * 2.8}s`,
          "--leaf-blur": `${(1 - depth) * 1.15}px`,
        } as CSSProperties,
      };
    })
  ), []);

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
    event.currentTarget.style.setProperty("--parallax-x", `${x * 13}px`);
    event.currentTarget.style.setProperty("--parallax-y", `${y * 10}px`);
    event.currentTarget.style.setProperty("--parallax-node-x", `${x * -6}px`);
    event.currentTarget.style.setProperty("--parallax-node-y", `${y * -4.5}px`);
  };

  const resetVisualParallax = (event: MouseEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty("--parallax-x", "0px");
    event.currentTarget.style.setProperty("--parallax-y", "0px");
    event.currentTarget.style.setProperty("--parallax-node-x", "0px");
    event.currentTarget.style.setProperty("--parallax-node-y", "0px");
  };

  return (
    <header className="hero-section fullpage-slide">
      {/* Soft Premium Background Orbs, Glowing 3D Sun & Floating 3D Leaves */}
      <div className="hero-bg-decor">
        <div className="hero-orb hero-orb--1"></div>
        <div className="hero-orb hero-orb--2"></div>
        
        {/* Dynamic Sunlight Illumination & Rays Effect */}
        <div className="hero-sun-illumination">
          <div className="sun-ambient-glow"></div>
          <div className="sun-conic-rays"></div>
          <div className="sun-flare-beam"></div>
        </div>
        {/* Floating 3D Leaves using custom leaf image */}
        <div className="hero-floating-leaves" aria-hidden="true">
          {fallingLeaves.map((leaf) => (
            <span className="floating-leaf" style={leaf.style} key={leaf.id}>
              <img src="/assets/floating-leaf.png" alt="" className="floating-leaf-img" />
            </span>
          ))}
        </div>
      </div>

      <div className="hero-grid-layout section__container">
        {/* LEFT COLUMN: Visuals with tree, farmer, and overlay cards */}
        <div
          className="hero__visual"
          data-aos="zoom-in"
          data-aos-delay="100"
          onMouseMove={handleVisualPointerMove}
          onMouseLeave={resetVisualParallax}
        >
          <div className="image-wrapper-container">
            <span className="hero-visual-depth-glow" aria-hidden="true"></span>
            {/* The main tree and farmer image */}
            <img
              src="/Cây 1.png"
              alt="Smart Agriculture"
              className="main-hero-image"
            />
            <div className="iot-data-layer" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((node) => (
                <span className={`iot-data-node iot-data-node--${node + 1}`} key={node}></span>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Heading, Subtext, App links */}
        <div className="hero__content" data-aos="fade-up">
          {/* Green Pill Badge */}
          <div className="hero-badge" data-aos="fade-right" data-aos-delay="100">
            <span className="hero-badge__icon"><i className="ri-leaf-fill"></i></span>
            <span className="hero-badge__text">NỀN TẢNG NÔNG NGHIỆP SỐ</span>
          </div>

          <h1 className="hero-title">
            <span className="text-ea-agri">Ea Agri</span>
            <span className="text-sub text-gray">Hệ sinh thái nông nghiệp</span>
            <span className="text-sub text-sub--accent">thông minh</span>
          </h1>

          <p className="hero-description">
            Giải pháp tối ưu hóa chuỗi giá trị sầu riêng tại Tây Nguyên.
            Tích hợp AI đa phương thức, IoT, dữ liệu lớn và mô hình kinh tế chia sẻ.
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
