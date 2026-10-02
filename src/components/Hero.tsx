import { lazy, Suspense, useMemo, useRef, useState, useEffect, type CSSProperties, type MouseEvent } from "react";

// three.js (~600 KB) chunk preloads in parallel without blocking initial paint
const EaAgriDurianPromise = import("./eaagri-3d/EaAgriDurian");
const EaAgriDurian = lazy(() => EaAgriDurianPromise);
import { triggerAppStoreNotice } from "./AppStoreNoticeModal";
import { triggerPromoVideo } from "./PromoVideoModal";

const ROTATING_HIGHLIGHTS = [
  { text: "thông minh", tag: "AI • IOT" },
  { text: "sạch sâu bệnh", tag: "YOLOv9 DETECT" },
  { text: "chuẩn VietGAP", tag: "VIETGAP 2026" },
  { text: "tối ưu năng suất", tag: "HIGH YIELD" },
];

const Hero = () => {
  const [highlightIndex, setHighlightIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHighlightIndex((prev) => (prev + 1) % ROTATING_HIGHLIGHTS.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const fallingLeaves = useMemo(() => (
    Array.from({ length: 8 }, (_, index) => {
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

  const scrollToNextSection = () => {
    const nextSection = document.getElementById('section-team');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // mousemove can fire 100+ times/s; each write restyles the whole hero. Coalesce to
  // at most one layout read + style write per animation frame.
  const pointerFrame = useRef(0);
  const lastPointer = useRef({ x: 0, y: 0, hero: null as HTMLElement | null });

  const handleHeroPointerMove = (event: MouseEvent<HTMLElement>) => {
    lastPointer.current = { x: event.clientX, y: event.clientY, hero: event.currentTarget };
    if (pointerFrame.current) return;
    pointerFrame.current = requestAnimationFrame(() => {
      pointerFrame.current = 0;
      const { x, y, hero } = lastPointer.current;
      if (!hero) return;
      const bounds = hero.getBoundingClientRect();
      const xRatio = (x - bounds.left) / bounds.width;
      const yRatio = (y - bounds.top) / bounds.height;

      hero.style.setProperty("--hero-pointer-x", `${xRatio * 100}%`);
      hero.style.setProperty("--hero-pointer-y", `${yRatio * 100}%`);
      hero.style.setProperty("--content-shift-x", `${(xRatio - 0.5) * 5}px`);
      hero.style.setProperty("--content-shift-y", `${(yRatio - 0.5) * 3}px`);
    });
  };

  const resetHeroPointer = (event: MouseEvent<HTMLElement>) => {
    cancelAnimationFrame(pointerFrame.current);
    pointerFrame.current = 0;
    event.currentTarget.style.setProperty("--content-shift-x", "0px");
    event.currentTarget.style.setProperty("--content-shift-y", "0px");
  };

  useEffect(() => () => cancelAnimationFrame(pointerFrame.current), []);

  return (
    <header
      className="hero-section fullpage-slide"
      data-pause-offscreen
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
                <img src="/assets/floating-leaf.webp" alt="" className="floating-leaf-img" />
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="hero-grid-layout section__container">
        {/* LEFT COLUMN: Grand 3D Tree Visual with Interactive 3D Model */}
        <div
          className="hero__visual"
          data-aos="zoom-in"
          data-aos-delay="100"
        >
          <div className="image-wrapper-container hero-3d-wrapper">
            <span className="hero-visual-depth-glow" aria-hidden="true"></span>
            
            {/* The 3D Tree, IoT devices and Farmer interactive model */}
            <Suspense
              fallback={
                <div
                  className="hero-3d-placeholder"
                  aria-hidden="true"
                />
              }
            >
              <EaAgriDurian
                assetBaseUrl="/eaagri-3d/assets/"
                posterUrl={null}
                quality="auto"
                showCards={true}
                showHotspots={true}
                showFarmer={true}
                lazy={false}
              />
            </Suspense>

            {/* Glowing Sunlight Sparkles & Pollen Bokeh */}
            <div className="hero-sparkles-layer" aria-hidden="true">
              {sunSparkles.map((sp) => (
                <span className="sun-sparkle" style={sp.style} key={sp.id}></span>
              ))}
            </div>
          </div>
        </div>

        {/* MOBILE ONLY: App Store & Google Play placed directly below 3D Tree */}
        <div className="hero-download-links hero-download-links--mobile">
          <a
            href="#app-store"
            className="download-btn"
            onClick={(e) => {
              e.preventDefault();
              triggerAppStoreNotice();
            }}
            title="Tải về trên App Store (iOS)"
          >
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

          <button
            type="button"
            className="download-btn download-btn--promo"
            onClick={() => triggerPromoVideo()}
            title="Xem video giới thiệu EaAgri 45 giây"
          >
            <span className="download-btn__icon promo-video-icon">
              <i className="ri-play-circle-fill"></i>
            </span>
            <div className="download-btn__text">
              <span className="download-btn__lbl">Teaser 45s</span>
              <span className="download-btn__store">Xem Video</span>
            </div>
          </button>
        </div>

        {/* RIGHT COLUMN: Heading, Subtext, App links, Key Stats & Social Proof */}
        <div className="hero__content" data-aos="fade-up">
          {/* Green Pill Badge with Live Radar Pulse */}
          <div className="hero-badge" data-aos="fade-right" data-aos-delay="100">
            <span className="hero-badge__pulse-wrap" aria-hidden="true">
              <span className="hero-badge__pulse-sonar" />
              <span className="hero-badge__pulse-dot" />
            </span>
            <span className="hero-badge__icon"><i className="ri-leaf-fill"></i></span>
            <span className="hero-badge__text">TRỢ LÝ CÂY SẦU RIÊNG</span>
            <span className="hero-badge__live-chip">
              <span className="hero-badge__live-dot" aria-hidden="true" />
              LIVE AI
            </span>
          </div>

          <h1 className="hero-title">
            <span className="text-ea-agri" data-text="Ea Agri">
              Ea Agri
              <span className="text-ea-agri__light-beam" aria-hidden="true" />
            </span>
            <span className="text-sub text-gray">Trợ lý cây sầu riêng</span>
            <span className="text-sub text-sub--accent">
              <span className="rotating-word-box">
                <span key={highlightIndex} className="rotating-word-item">
                  {ROTATING_HIGHLIGHTS[highlightIndex].text}
                </span>
              </span>
              <small key={`tag-${highlightIndex}`} className="tech-chip-animated">
                <i className="ri-flashlight-fill" /> {ROTATING_HIGHLIGHTS[highlightIndex].tag}
              </small>
            </span>
          </h1>

          <p className="hero-description">
            <span className="hero-description__energy-bar" aria-hidden="true" />
            <span className="hero-description__full">
              Ứng dụng AI & IoT theo dõi sức khỏe, chẩn đoán sâu bệnh và tối ưu năng suất cho <strong className="hero-highlight">cây sầu riêng</strong>.
            </span>
            <span className="hero-description__mobile">
              Ứng dụng AI & IoT theo dõi sức khỏe, chẩn đoán sâu bệnh & tối ưu năng suất sầu riêng.
            </span>
          </p>

          <div className="hero-download-links hero-download-links--desktop">
            <a
              href="#app-store"
              className="download-btn"
              onClick={(e) => {
                e.preventDefault();
                triggerAppStoreNotice();
              }}
              title="Tải về trên App Store (iOS)"
            >
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

            <button
              type="button"
              className="download-btn download-btn--promo"
              onClick={() => triggerPromoVideo()}
              title="Xem video giới thiệu EaAgri 45 giây"
            >
              <span className="download-btn__icon promo-video-icon">
                <i className="ri-play-circle-fill"></i>
              </span>
              <div className="download-btn__text">
                <span className="download-btn__lbl">Teaser 45s</span>
                <span className="download-btn__store">Xem Video</span>
              </div>
            </button>
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
