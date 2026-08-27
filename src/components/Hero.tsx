import { useMemo, useState, type CSSProperties, type MouseEvent } from "react";

interface Hotspot {
  id: string;
  label: string;
  icon: string;
  category: string;
  metric: string;
  left: string;
  top: string;
}

const Hero = () => {
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

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

  const sunSparkles = useMemo(() => (
    Array.from({ length: 14 }, (_, index) => ({
      id: index,
      style: {
        "--sparkle-left": `${10 + Math.random() * 80}%`,
        "--sparkle-top": `${8 + Math.random() * 80}%`,
        "--sparkle-size": `${4 + Math.random() * 6}px`,
        "--sparkle-delay": `${Math.random() * 3.5}s`,
        "--sparkle-duration": `${2 + Math.random() * 2.5}s`,
      } as CSSProperties,
    }))
  ), []);

  const hotspots: Hotspot[] = [
    {
      id: "map",
      label: "Bản đồ số vườn",
      icon: "ri-map-pin-2-fill",
      category: "Bản Đồ Số Lô Vườn",
      metric: "Lô A2 • 120 cây đang nuôi trái (64% diện tích)",
      left: "24%",
      top: "39%",
    },
    {
      id: "chart",
      label: "Dữ liệu thời gian thực",
      icon: "ri-line-chart-fill",
      category: "Cảm Biến Đất & Khí Hậu",
      metric: "Độ ẩm 68% • Nhiệt độ 28°C • pH 6.2 (Tối ưu)",
      left: "24%",
      top: "53%",
    },
    {
      id: "weather",
      label: "Dự báo thời tiết",
      icon: "ri-sun-cloudy-fill",
      category: "Trạm Quan Trắc Vi Khí Hậu",
      metric: "28°C • Nắng 12.5k Lux • Độ ẩm 70%",
      left: "87%",
      top: "39%",
    },
    {
      id: "growth",
      label: "Mô hình tăng trưởng",
      icon: "ri-plant-fill",
      category: "Chỉ Số Sinh Học AI",
      metric: "Tăng trưởng: +15% • Sạch bệnh 100%",
      left: "74%",
      top: "55%",
    },
    {
      id: "durian",
      label: "Quả sầu riêng",
      icon: "ri-award-fill",
      category: "Sầu Riêng Ri6 Thượng Hạng",
      metric: "Chuẩn Loại 1 • Brix 18.5° • Cơm sáp hạt lép",
      left: "51%",
      top: "40%",
    },
    {
      id: "pump",
      label: "Trạm máy bơm IoT",
      icon: "ri-water-flash-fill",
      category: "Tưới Tiêu Tự Động",
      metric: "Van tưới nhỏ giọt • Đang cấp ẩm tự động",
      left: "64%",
      top: "66%",
    },
  ];

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
    event.currentTarget.style.setProperty("--parallax-x", `${x * 14}px`);
    event.currentTarget.style.setProperty("--parallax-y", `${y * 10}px`);
    event.currentTarget.style.setProperty("--parallax-node-x", `${x * -7}px`);
    event.currentTarget.style.setProperty("--parallax-node-y", `${y * -5}px`);
    event.currentTarget.style.setProperty("--visual-tilt-x", `${y * -3.2}deg`);
    event.currentTarget.style.setProperty("--visual-tilt-y", `${x * 4.2}deg`);
    event.currentTarget.style.setProperty("--visual-light-x", `${(x + 0.5) * 100}%`);
    event.currentTarget.style.setProperty("--visual-light-y", `${(y + 0.5) * 100}%`);
  };

  const resetVisualParallax = (event: MouseEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty("--parallax-x", "0px");
    event.currentTarget.style.setProperty("--parallax-y", "0px");
    event.currentTarget.style.setProperty("--parallax-node-x", "0px");
    event.currentTarget.style.setProperty("--parallax-node-y", "0px");
    event.currentTarget.style.setProperty("--visual-tilt-x", "0deg");
    event.currentTarget.style.setProperty("--visual-tilt-y", "0deg");
  };

  const handleHeroPointerMove = (event: MouseEvent<HTMLElement>) => {
    const hero = event.currentTarget;
    const bounds = hero.getBoundingClientRect();
    const xRatio = (event.clientX - bounds.left) / bounds.width;
    const yRatio = (event.clientY - bounds.top) / bounds.height;

    hero.style.setProperty("--hero-pointer-x", `${xRatio * 100}%`);
    hero.style.setProperty("--hero-pointer-y", `${yRatio * 100}%`);
    hero.style.setProperty("--content-shift-x", `${(xRatio - 0.5) * 5}px`);
    hero.style.setProperty("--content-shift-y", `${(yRatio - 0.5) * 3}px`);

    hero.querySelectorAll<HTMLElement>(".floating-leaf").forEach((leaf) => {
      const leafBounds = leaf.getBoundingClientRect();
      const centerX = leafBounds.left + leafBounds.width / 2;
      const centerY = leafBounds.top + leafBounds.height / 2;
      const dx = centerX - event.clientX;
      const dy = centerY - event.clientY;
      const distance = Math.hypot(dx, dy);
      const radius = 190;

      if (distance < radius) {
        const force = (radius - distance) / radius;
        const safeDistance = Math.max(distance, 1);
        leaf.style.setProperty("--leaf-repel-x", `${(dx / safeDistance) * force * 108}px`);
        leaf.style.setProperty("--leaf-repel-y", `${(dy / safeDistance) * force * 78}px`);
        leaf.style.setProperty("--leaf-repel-rotate", `${(dx >= 0 ? 1 : -1) * force * 96}deg`);
        leaf.style.setProperty("--leaf-repel-scale", `${1 + force * 0.32}`);
        leaf.classList.add("is-repelled");
      } else {
        leaf.style.setProperty("--leaf-repel-x", "0px");
        leaf.style.setProperty("--leaf-repel-y", "0px");
        leaf.style.setProperty("--leaf-repel-rotate", "0deg");
        leaf.style.setProperty("--leaf-repel-scale", "1");
        leaf.classList.remove("is-repelled");
      }
    });
  };

  const resetHeroPointer = (event: MouseEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty("--content-shift-x", "0px");
    event.currentTarget.style.setProperty("--content-shift-y", "0px");
    event.currentTarget.querySelectorAll<HTMLElement>(".floating-leaf").forEach((leaf) => {
      leaf.style.setProperty("--leaf-repel-x", "0px");
      leaf.style.setProperty("--leaf-repel-y", "0px");
      leaf.style.setProperty("--leaf-repel-rotate", "0deg");
      leaf.style.setProperty("--leaf-repel-scale", "1");
      leaf.classList.remove("is-repelled");
    });
  };

  return (
    <header
      className="hero-section fullpage-slide"
      onMouseMove={handleHeroPointerMove}
      onMouseLeave={resetHeroPointer}
    >
      {/* Soft Premium Background Orbs, Glowing 3D Sun & Floating 3D Leaves */}
      <div className="hero-bg-decor">
        <div className="hero-orb hero-orb--1"></div>
        <div className="hero-orb hero-orb--2"></div>

        {/* Subtle wind field filling the open sky on the left */}
        <div className="hero-wind-field" aria-hidden="true">
          <span className="wind-trail wind-trail--1"></span>
          <span className="wind-trail wind-trail--2"></span>
          <span className="wind-trail wind-trail--3"></span>
          <span className="wind-mist wind-mist--1"></span>
          <span className="wind-mist wind-mist--2"></span>
          <span className="wind-seed wind-seed--1"></span>
          <span className="wind-seed wind-seed--2"></span>
          <span className="wind-seed wind-seed--3"></span>
        </div>

        {/* A distant flock crosses the open sky occasionally */}
        <div className="hero-bird-sky" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((bird) => (
            <span className={`bird-flight bird-flight--${bird}`} key={bird}>
              <i className="sky-bird"><b></b><em></em></i>
            </span>
          ))}
        </div>
        
        {/* Dynamic Sunlight Illumination & Rays Effect */}
        <div className="hero-sun-illumination">
          <div className="sun-ambient-glow"></div>
          <div className="sun-conic-rays"></div>
          <div className="sun-flare-beam"></div>
        </div>

        {/* Floating 3D Leaves */}
        <div className="hero-floating-leaves" aria-hidden="true">
          {fallingLeaves.map((leaf) => (
            <span className="floating-leaf" style={leaf.style} key={leaf.id}>
              <span className="floating-leaf-reactor">
                <img src="/assets/floating-leaf.png" alt="" className="floating-leaf-img" />
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="hero-grid-layout section__container">
        {/* LEFT COLUMN: Grand 3D Tree Visual with Interactive Beacons */}
        <div
          className="hero__visual"
          data-aos="zoom-in"
          data-aos-delay="100"
          onMouseMove={handleVisualPointerMove}
          onMouseLeave={resetVisualParallax}
        >
          <div className="image-wrapper-container">
            <span className="hero-visual-depth-glow" aria-hidden="true"></span>
            
            {/* The main tree and farmer image (Enlarged) */}
            <img
              src="/Cây 1.png"
              alt="Hệ sinh thái sầu riêng thông minh Ea Agri"
              className="main-hero-image"
            />

            {/* Glowing Sunlight Sparkles & Pollen Bokeh */}
            <div className="hero-sparkles-layer" aria-hidden="true">
              {sunSparkles.map((sp) => (
                <span className="sun-sparkle" style={sp.style} key={sp.id}></span>
              ))}
            </div>

            {/* Wifi Telemetry Pulse Waves from Farmer's Tablet */}
            <div className="farmer-tablet-wifi-aura" aria-hidden="true">
              <span className="wifi-center-dot"></span>
              <span className="wifi-ring wifi-ring--1"></span>
              <span className="wifi-ring wifi-ring--2"></span>
              <span className="wifi-ring wifi-ring--3"></span>
            </div>

            {/* Wireless Telemetry Pulse from Solar Sensor Pole */}
            <div className="solar-sensor-telemetry-aura" aria-hidden="true">
              <span className="sensor-center-dot"></span>
              <span className="telemetry-ring telemetry-ring--1"></span>
              <span className="telemetry-ring telemetry-ring--2"></span>
            </div>

            {/* Animated Circuit Data Flow Nodes */}
            <div className="iot-data-layer" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((node) => (
                <span className={`iot-data-node iot-data-node--${node + 1}`} key={node}></span>
              ))}
            </div>

            {/* Interactive Screen & IoT Hotspots with Live Tooltips */}
            <div className="hero-interactive-hotspots">
              {hotspots.map((hs) => (
                <div
                  key={hs.id}
                  className={`hero-hotspot-pin ${activeHotspot === hs.id ? "is-active" : ""}`}
                  style={{ left: hs.left, top: hs.top }}
                  onMouseEnter={() => setActiveHotspot(hs.id)}
                  onMouseLeave={() => setActiveHotspot(null)}
                  onClick={() => setActiveHotspot(activeHotspot === hs.id ? null : hs.id)}
                >
                  <button
                    type="button"
                    className="hotspot-trigger-beacon"
                    aria-label={hs.label}
                  >
                    <span className="beacon-outer-radar"></span>
                    <span className="beacon-inner-pulse"></span>
                    <span className="beacon-dot">
                      <i className={hs.icon}></i>
                    </span>
                  </button>

                  {/* High-Tech Frosted Live Tooltip Popover */}
                  <div className="hotspot-tooltip-popover">
                    <div className="tooltip-header">
                      <i className={hs.icon}></i>
                      <span className="tooltip-cat">{hs.category}</span>
                    </div>
                    <div className="tooltip-metric">{hs.metric}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Heading, Subtext, App links, Key Stats & Social Proof */}
        <div className="hero__content" data-aos="fade-up">
          {/* Green Pill Badge */}
          <div className="hero-badge" data-aos="fade-right" data-aos-delay="100">
            <span className="hero-badge__icon"><i className="ri-leaf-fill"></i></span>
            <span className="hero-badge__text">NỀN TẢNG NÔNG NGHIỆP SỐ</span>
          </div>

          <h1 className="hero-title">
            <span className="text-ea-agri">Ea Agri</span>
            <span className="text-sub text-gray">Hệ sinh thái nông nghiệp</span>
            <span className="text-sub text-sub--accent">
              <span>thông minh</span>
              <small>AI • IoT • DATA</small>
            </span>
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

      {/* Floating Live Tech Marquee Ticker Bar at Bottom */}
      <div className="hero-bottom-ticker-bar" onClick={scrollToNextSection}>
        <div className="ticker-label">
          <span className="ticker-live-dot"></span>
          <span>HỆ SINH THÁI 4.0</span>
        </div>
        <div className="ticker-marquee-track">
          <div className="ticker-marquee-content">
            <span><i className="ri-radar-fill"></i> Viễn thám vệ tinh Sentinel-2</span>
            <span><i className="ri-wifi-line"></i> Cảm biến đất LoRaWAN</span>
            <span><i className="ri-scan-2-line"></i> AI Vision chẩn đoán 3D</span>
            <span><i className="ri-shield-keyhole-line"></i> Truy xuất Blockchain</span>
            <span><i className="ri-drop-fill"></i> Tưới tiêu chính xác IoT</span>
            <span><i className="ri-line-chart-line"></i> Dự báo giá & sàn nông sản</span>
            {/* Seamless duplicate */}
            <span><i className="ri-radar-fill"></i> Viễn thám vệ tinh Sentinel-2</span>
            <span><i className="ri-wifi-line"></i> Cảm biến đất LoRaWAN</span>
            <span><i className="ri-scan-2-line"></i> AI Vision chẩn đoán 3D</span>
            <span><i className="ri-shield-keyhole-line"></i> Truy xuất Blockchain</span>
            <span><i className="ri-drop-fill"></i> Tưới tiêu chính xác IoT</span>
            <span><i className="ri-line-chart-line"></i> Dự báo giá & sàn nông sản</span>
          </div>
        </div>
        <div className="ticker-scroll-prompt" title="Cuộn xuống khám phá">
          <span>Khám phá tiếp</span>
          <i className="ri-arrow-down-s-line"></i>
        </div>
      </div>
    </header>
  );
};

export default Hero;
