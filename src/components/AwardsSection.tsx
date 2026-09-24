import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";

interface AwardImage {
  url: string;
  alt: string;
  caption: string;
  shortTitle: string;
}

interface AwardPoint {
  icon: string;
  title: string;
  desc: string;
}

interface MetricBadge {
  icon: string;
  text: string;
}

interface AwardItem {
  id: string;
  stepNumber: string;
  tabLabel: string;
  tabBadge: string;
  tabIcon: string;
  themeColor: "emerald" | "gold";
  tag: string;
  titlePrefix: string;
  titleHighlight: string;
  subtitle: string;
  ribbonText: string;
  ribbonIcon: string;
  metricBadges: MetricBadge[];
  floatingBadge: {
    title: string;
    subtitle: string;
    icon: string;
  };
  images: AwardImage[];
  points: AwardPoint[];
}

const AWARDS_DATA: AwardItem[] = [
  {
    id: "ai-contest",
    stepNumber: "01",
    tabLabel: "Trí Tuệ Nhân Tạo 2026",
    tabBadge: "Quán quân AI",
    tabIcon: "ri-vip-crown-line",
    themeColor: "emerald",
    tag: "🏆 Danh Hiệu & Giải Thưởng",
    titlePrefix: "Vinh Danh Tại Cuộc Thi",
    titleHighlight: "Trí Tuệ Nhân Tạo 2026",
    subtitle:
      "Dự án EaAgri tự hào đạt giải thưởng cao nhất tại sân chơi học thuật uy tín của Trường Đại học Nguyễn Tất Thành, khẳng định tính đột phá và ứng dụng thực tiễn cao của giải pháp nông nghiệp thông minh.",
    ribbonText: "Excellent No. 1",
    ribbonIcon: "ri-vip-crown-fill",
    metricBadges: [
      { icon: "ri-trophy-fill", text: "Quán Quân Toàn Trường" },
      { icon: "ri-cpu-line", text: "Lõi AI Tự Phát Triển" },
      { icon: "ri-star-smile-fill", text: "Đánh Giá Xuất Sắc" },
    ],
    floatingBadge: {
      title: "Đại học NTT",
      subtitle: "Khoa CNTT vinh danh",
      icon: "ri-award-fill",
    },
    images: [
      {
        url: "/assets/IMG_2695.JPEG",
        alt: "Vinh danh Cuộc thi Trí Tuệ Nhân Tạo 2026",
        caption: "Giấy chứng nhận Quán quân & Cúp Vinh danh",
        shortTitle: "Bằng chứng nhận & Cúp",
      },
    ],
    points: [
      {
        icon: "ri-medal-line",
        title: "Giải thưởng cao nhất (Excellent No. 1)",
        desc: 'Vượt qua hàng chục đề tài công nghệ, EaAgri xuất sắc dành ngôi vị Quán quân nhờ mô hình "Trợ lý nông nghiệp thông minh" tích hợp AI toàn diện.',
      },
      {
        icon: "ri-seedling-line",
        title: "Đánh giá cao từ hội đồng chuyên gia",
        desc: 'Hệ thống cảm biến IoT kết hợp AI được các nhà khoa học đánh giá là giải pháp thực tiễn cao nhất để hóa giải "Tứ giác rủi ro" tại Tây Nguyên.',
      },
      {
        icon: "ri-shield-check-line",
        title: "Động lực phát triển bền vững",
        desc: "Thành tựu này là bệ phóng vững chắc để đội ngũ kỹ sư EaAgri tiếp tục hoàn thiện, chuyển dịch nông nghiệp Tây Nguyên sang hướng nông nghiệp số.",
      },
    ],
  },
  {
    id: "startup-contest",
    stepNumber: "02",
    tabLabel: "Khởi Nghiệp ĐMST 2026",
    tabBadge: "Nhất Bảng Bán Kết",
    tabIcon: "ri-rocket-2-line",
    themeColor: "gold",
    tag: "🚀 Cuộc Thi Khởi Nghiệp Đổi Mới Sáng Tạo",
    titlePrefix: "Giải Nhất Bảng Bán Kết",
    titleHighlight: "Khởi Nghiệp ĐMST 2026",
    subtitle:
      "Tại cuộc thi NTTU Innovation Startup Challenge 2026, EaAgri xuất sắc giành Giải Nhất Bảng 1C (Công nghệ Nông nghiệp & Công nghệ Thực phẩm), khẳng định tiềm năng thương mại hóa và mở rộng thực địa.",
    ribbonText: "Giải Nhất Bảng 1C",
    ribbonIcon: "ri-medal-fill",
    metricBadges: [
      { icon: "ri-medal-fill", text: "Nhất Bảng 1C Nông Nghiệp" },
      { icon: "ri-funds-box-line", text: "Tiềm Năng Thương Mại" },
      { icon: "ri-flag-2-fill", text: "Tiến Thẳng Chung Kết" },
    ],
    floatingBadge: {
      title: "NTTU Startup 2026",
      subtitle: "Nhất Bảng Bán Kết 1C",
      icon: "ri-trophy-fill",
    },
    images: [
      {
        url: "/Khởi nghiệp 3.jpg",
        alt: "Bằng chứng nhận Giải Nhất Bảng 1C và Huy chương Bán kết",
        caption: "Bằng chứng nhận Nhất Bảng 1C & Huy chương Bán Kết",
        shortTitle: "Bằng khen & Huy chương",
      },
      {
        url: "/Khởi nghiệp 1.jpg",
        alt: "Đội thi EaAgri thuyết trình mô hình với Ban giám khảo",
        caption: "Trình diễn thiết bị IoT & Mô hình AI cho Hội đồng Giám Khảo",
        shortTitle: "Báo cáo Hội đồng",
      },
      {
        url: "/Khởi nghiệp 2.jpg",
        alt: "Đội ngũ kỹ sư sáng lập dự án EaAgri",
        caption: "Đội ngũ kỹ sư EaAgri tại vòng Bán kết Khởi nghiệp",
        shortTitle: "Đội ngũ EaAgri",
      },
    ],
    points: [
      {
        icon: "ri-trophy-line",
        title: "Giải Nhất Bảng 1C (Vòng Bán Kết)",
        desc: "Đội thi NTT-144 với dự án EaAgri đã xuất sắc vượt qua các đối thủ tiềm năng để dẫn đầu bảng Công nghệ Nông nghiệp & Công nghệ Thực phẩm.",
      },
      {
        icon: "ri-funds-line",
        title: "Khả năng thương mại hóa & Tính ứng dụng cao",
        desc: "Mô hình kinh doanh khả thi cùng giải pháp quản trị nông trại toàn diện, kết nối sâu rộng chuỗi giá trị sầu riêng Đắk Lắk được các quỹ đầu tư đánh giá cao.",
      },
      {
        icon: "ri-flag-line",
        title: "Tấm vé danh giá bước vào Vòng Chung Kết",
        desc: "Thành tích là bàn đạp vững chắc đưa EaAgri tiến thẳng vào Chung kết, kết nối với mạng lưới cố vấn chuyên gia và cơ hội ươm tạo doanh nghiệp.",
      },
    ],
  },
];

const AUTO_SWITCH_INTERVAL = 8000; // 8 seconds per tab
const SUB_IMAGE_INTERVAL = 3800; // 3.8 seconds per sub-image

export default function AwardsSection() {
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // 3D Parallax Tilt state
  const [cardTilt, setCardTilt] = useState({ rotateX: 0, rotateY: 0, shineX: 50, shineY: 50 });
  const cardWrapperRef = useRef<HTMLDivElement>(null);

  const currentAward = AWARDS_DATA[activeTabIdx];
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const elapsedBeforePauseRef = useRef<number>(0);

  const shouldPause = isPaused || isManuallyPaused || isZoomOpen;

  // Switch Tab Helper
  const switchTab = useCallback((idx: number) => {
    setActiveTabIdx(idx);
    setActiveImgIdx(0);
    elapsedBeforePauseRef.current = 0;
    startTimeRef.current = Date.now();
    setProgress(0);
  }, []);

  const handleNextTab = () => {
    switchTab((activeTabIdx + 1) % AWARDS_DATA.length);
  };

  const handlePrevTab = () => {
    switchTab((activeTabIdx - 1 + AWARDS_DATA.length) % AWARDS_DATA.length);
  };

  // Switch Sub-Images
  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImgIdx((prev) =>
      prev === 0 ? currentAward.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImgIdx((prev) => (prev + 1) % currentAward.images.length);
  };

  // Mouse move 3D tilt tracking
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardWrapperRef.current) return;
    const rect = cardWrapperRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -7; // max -7 to 7 deg
    const rotateY = ((x - centerX) / centerX) * 7;  // max -7 to 7 deg
    const shineX = (x / rect.width) * 100;
    const shineY = (y / rect.height) * 100;

    setCardTilt({ rotateX, rotateY, shineX, shineY });
  };

  const handleCardMouseLeave = () => {
    setCardTilt({ rotateX: 0, rotateY: 0, shineX: 50, shineY: 50 });
  };

  // Keyboard accessibility and body scroll lock for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isZoomOpen) return;
      if (e.key === "Escape") {
        setIsZoomOpen(false);
      } else if (e.key === "ArrowLeft") {
        handlePrevImage();
      } else if (e.key === "ArrowRight") {
        handleNextImage();
      }
    };

    if (isZoomOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isZoomOpen, currentAward.images.length]);

  // Auto-switch tabs timer with smooth progress calculation
  useEffect(() => {
    if (shouldPause) {
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    startTimeRef.current = Date.now() - elapsedBeforePauseRef.current;

    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      elapsedBeforePauseRef.current = elapsed;
      const currentProgress = Math.min((elapsed / AUTO_SWITCH_INTERVAL) * 100, 100);
      setProgress(currentProgress);

      if (elapsed >= AUTO_SWITCH_INTERVAL) {
        switchTab((activeTabIdx + 1) % AWARDS_DATA.length);
      } else {
        timerRef.current = requestAnimationFrame(tick);
      }
    };

    timerRef.current = requestAnimationFrame(tick);

    return () => {
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
      }
    };
  }, [activeTabIdx, shouldPause, switchTab]);

  // Auto cycle sub-images within the current tab
  useEffect(() => {
    if (currentAward.images.length <= 1 || shouldPause) return;

    const subImgInterval = setInterval(() => {
      setActiveImgIdx((prev) => (prev + 1) % currentAward.images.length);
    }, SUB_IMAGE_INTERVAL);

    return () => clearInterval(subImgInterval);
  }, [currentAward, shouldPause]);

  return (
    <>
      <section
        id="section-awards"
        className={`section__container awards-section__container awards-section--theme-${currentAward.themeColor}`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Dynamic Background Ambient Aurora Layer */}
        <div className={`awards-section__aurora-bg awards-section__aurora-bg--${currentAward.themeColor}`} />

        {/* Top Story Tabs Header */}
        <div className="awards-section__tabs-header" data-aos="fade-down">
          <div className="awards-section__tabs-nav" role="tablist">
            {AWARDS_DATA.map((item, idx) => {
              const isActive = idx === activeTabIdx;
              return (
                <button
                  key={item.id}
                  role="tab"
                  aria-selected={isActive}
                  className={`awards-section__tab-btn ${
                    isActive ? "awards-section__tab-btn--active" : ""
                  }`}
                  onClick={() => switchTab(idx)}
                >
                  {/* Story Style Top Progress Line */}
                  <div className="awards-section__story-line">
                    <div
                      className="awards-section__story-line-fill"
                      style={{
                        width: isActive
                          ? `${progress}%`
                          : idx < activeTabIdx
                          ? "100%"
                          : "0%",
                      }}
                    />
                  </div>

                  <div className="awards-section__tab-btn-inner">
                    <span className="awards-section__tab-num">{item.stepNumber}</span>
                    <div className="awards-section__tab-icon-wrap">
                      <i className={item.tabIcon}></i>
                    </div>
                    <div className="awards-section__tab-text">
                      <div className="awards-section__tab-label">{item.tabLabel}</div>
                      <span className="awards-section__tab-badge">{item.tabBadge}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Controls Bar: Play/Pause and Fast Nav */}
          <div className="awards-section__controls">
            <button
              className={`awards-section__control-btn ${
                isManuallyPaused ? "awards-section__control-btn--paused" : ""
              }`}
              onClick={() => setIsManuallyPaused((prev) => !prev)}
              title={isManuallyPaused ? "Nhấn để bật tự động chạy" : "Nhấn để tạm dừng"}
              aria-label="Tạm dừng hoặc tiếp tục tự động chuyển"
            >
              <i
                className={
                  isManuallyPaused || isPaused
                    ? "ri-play-fill"
                    : "ri-pause-fill"
                }
              ></i>
              <span>{isManuallyPaused || isPaused ? "Tạm dừng" : "Tự động (8s)"}</span>
            </button>

            <div className="awards-section__tab-arrows">
              <button
                className="awards-section__arrow-btn"
                onClick={handlePrevTab}
                title="Giải thưởng trước"
                aria-label="Giải thưởng trước"
              >
                <i className="ri-arrow-left-s-line"></i>
              </button>
              <button
                className="awards-section__arrow-btn"
                onClick={handleNextTab}
                title="Giải thưởng tiếp theo"
                aria-label="Giải thưởng tiếp theo"
              >
                <i className="ri-arrow-right-s-line"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Main Showcase Grid */}
        <div
          className="awards-section__grid"
          key={currentAward.id}
          data-tab={currentAward.id}
        >
          {/* Left Side: 3D Certificate & Gallery Showcase */}
          <div className="awards-section__image-side" data-aos="fade-right">
            <div
              className="awards-section__card-wrapper"
              ref={cardWrapperRef}
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
            >
              {/* Dynamic Ambient Glow Behind the Card */}
              <div
                className={`awards-section__ambient-glow awards-section__ambient-glow--${currentAward.themeColor}`}
              />

              {/* Floating Sparkles around card */}
              <div className="awards-section__sparkle awards-section__sparkle--1">✨</div>
              <div className="awards-section__sparkle awards-section__sparkle--2">⭐</div>
              <div className="awards-section__sparkle awards-section__sparkle--3">🌟</div>

              <div
                className="awards-section__certificate-card"
                style={{
                  transform: `perspective(1000px) rotateX(${cardTilt.rotateX}deg) rotateY(${cardTilt.rotateY}deg)`,
                }}
              >
                {/* 4 Luxe Framed Corners */}
                <div className="awards-section__corner awards-section__corner--tl" />
                <div className="awards-section__corner awards-section__corner--tr" />
                <div className="awards-section__corner awards-section__corner--bl" />
                <div className="awards-section__corner awards-section__corner--br" />

                {/* Mouse-reactive Shine reflection */}
                <div
                  className="awards-section__shine-reactive"
                  style={{
                    background: `radial-gradient(circle at ${cardTilt.shineX}% ${cardTilt.shineY}%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 60%)`,
                  }}
                />

                {/* Main Image Slider Viewport */}
                <div
                  className="awards-section__img-viewport"
                  onClick={() => setIsZoomOpen(true)}
                  title="Nhấn để phóng to & lướt xem ảnh sắc nét"
                >
                  {currentAward.images.map((img, imgIdx) => (
                    <img
                      key={img.url}
                      src={img.url}
                      alt={img.alt}
                      className={`awards-section__img ${
                        imgIdx === activeImgIdx ? "awards-section__img--active" : ""
                      }`}
                    />
                  ))}

                  {/* Zoom hint badge */}
                  <div className="awards-section__zoom-hint">
                    <i className="ri-zoom-in-line"></i>
                    <span>Phóng to</span>
                  </div>

                  {/* Navigation arrows for multi-image tabs */}
                  {currentAward.images.length > 1 && (
                    <>
                      <button
                        className="awards-section__img-nav awards-section__img-nav--prev"
                        onClick={handlePrevImage}
                        aria-label="Xem ảnh trước"
                      >
                        <i className="ri-arrow-left-s-line"></i>
                      </button>
                      <button
                        className="awards-section__img-nav awards-section__img-nav--next"
                        onClick={handleNextImage}
                        aria-label="Xem ảnh kế tiếp"
                      >
                        <i className="ri-arrow-right-s-line"></i>
                      </button>
                    </>
                  )}

                  {/* Corner Ribbon */}
                  <div className="awards-section__badge-ribbon">
                    <i className={currentAward.ribbonIcon}></i>
                    <span>{currentAward.ribbonText}</span>
                  </div>
                </div>

                {/* Gallery Thumbnails Selector for multi-image */}
                {currentAward.images.length > 1 ? (
                  <div className="awards-section__thumbnails-wrap">
                    {currentAward.images.map((thumb, tIdx) => {
                      const isThumbActive = tIdx === activeImgIdx;
                      return (
                        <button
                          key={tIdx}
                          className={`awards-section__thumb-btn ${
                            isThumbActive
                              ? "awards-section__thumb-btn--active"
                              : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImgIdx(tIdx);
                          }}
                        >
                          <div className="awards-section__thumb-img-wrap">
                            <img src={thumb.url} alt={thumb.shortTitle} />
                            {isThumbActive && (
                              <span className="awards-section__thumb-live-dot" />
                            )}
                          </div>
                          <span>{thumb.shortTitle}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="awards-section__single-caption">
                    <i className="ri-award-line"></i>
                    <span>{currentAward.images[0]?.caption}</span>
                  </div>
                )}
              </div>

              {/* Floating Badge */}
              <div className="awards-section__floating-badge awards-section__floating-badge--2">
                <i className={currentAward.floatingBadge.icon}></i>
                <div>
                  <strong>{currentAward.floatingBadge.title}</strong>
                  <span>{currentAward.floatingBadge.subtitle}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Staggered Content & Key Points */}
          <div className="awards-section__content-side" data-aos="fade-left">
            <span className="awards-section__tag">
              <i className="ri-trophy-line"></i> {currentAward.tag}
            </span>

            <h2 className="awards-section__title">
              {currentAward.titlePrefix}{" "}
              <span className="highlight">{currentAward.titleHighlight}</span>
            </h2>

            {/* Prestige Metric Pills */}
            <div className="awards-section__metrics">
              {currentAward.metricBadges.map((badge, bIdx) => (
                <div key={bIdx} className="awards-section__metric-pill">
                  <i className={badge.icon}></i>
                  <span>{badge.text}</span>
                </div>
              ))}
            </div>

            <p className="awards-section__subtitle">{currentAward.subtitle}</p>

            {currentAward.id === "startup-contest" && (
              <aside className="awards-section__verification" aria-label="Nguồn xác thực giải thưởng">
                <span className="awards-section__verification-mark"><i className="ri-shield-check-fill" /></span>
                <div className="awards-section__verification-copy">
                  <small>ĐƯỢC XÁC THỰC BỞI ĐƠN VỊ ĐÀO TẠO</small>
                  <strong>Khoa CNTT — Trường Đại học Nguyễn Tất Thành</strong>
                  <span>Ea Agri · Mã dự thi NTT-144 · Giải Nhất Vòng Bán kết Bảng 1C</span>
                </div>
                <div className="awards-section__verification-actions">
                  <a href="https://cntt.ntt.edu.vn/nghien-cuu-khoa-hoc/phat-trien-san-pham/ea-agri-xuat-sac-gianh-giai-nhat-vong-ban-ket-nttu-innovation-startup-challenge-2026-bang-cong-nghe-nong-nghiep-va-cong-nghe-thuc-pham/" target="_blank" rel="noopener noreferrer">
                    Bài viết chính thức <i className="ri-arrow-right-up-line" />
                  </a>
                  <a className="is-facebook" href="https://www.facebook.com/share/p/1CA44S7p5M/" target="_blank" rel="noopener noreferrer" aria-label="Xem bài đăng Facebook của Khoa CNTT">
                    <i className="ri-facebook-circle-fill" />
                  </a>
                </div>
              </aside>
            )}

            {/* Staggered Highlight Point Cards */}
            <div className="awards-section__points">
              {currentAward.points.map((point, pIdx) => (
                <div
                  key={pIdx}
                  className="awards-section__point-card"
                  style={{ animationDelay: `${0.08 + pIdx * 0.1}s` }}
                >
                  <div className="awards-section__point-icon">
                    <i className={point.icon}></i>
                  </div>
                  <div className="awards-section__point-info">
                    <h3>{point.title}</h3>
                    <p>{point.desc}</p>
                  </div>
                  <div className="awards-section__point-arrow">
                    <i className="ri-arrow-right-up-line"></i>
                  </div>
                </div>
              ))}
            </div>

            {/* Link to Dedicated Awards Page */}
            <div className="awards-section__explore-btn-wrap">
              <Link to="/awards" className="awards-section__explore-btn">
                <i className="ri-award-fill"></i>
                <span>Xem đầy đủ Phòng truyền thống & Bằng chứng nhận</span>
                <i className="ri-arrow-right-line"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox / Zoom Modal with Multi-Image Slider & Thumbnails */}
      {isZoomOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="awards-section__modal-backdrop"
            onClick={() => setIsZoomOpen(false)}
          >
            <div
              className="awards-section__modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top Bar (Counter + Close) */}
              <div className="awards-section__modal-header">
                {currentAward.images.length > 1 ? (
                  <span className="awards-section__modal-counter">
                    <i className="ri-image-2-line"></i> Ảnh {activeImgIdx + 1} / {currentAward.images.length}
                  </span>
                ) : (
                  <span className="awards-section__modal-counter">
                    <i className="ri-award-fill"></i> Chứng nhận vinh danh
                  </span>
                )}

                <button
                  className="awards-section__modal-close"
                  onClick={() => setIsZoomOpen(false)}
                  aria-label="Đóng ảnh"
                  title="Đóng (Esc)"
                >
                  <i className="ri-close-line"></i>
                </button>
              </div>

              {/* Modal Main Image with Prev / Next Chevrons */}
              <div className="awards-section__modal-viewport">
                <div className="awards-section__modal-img-wrap">
                  {currentAward.images.map((img, imgIdx) => (
                    <img
                      key={img.url}
                      src={img.url}
                      alt={img.alt}
                      className={`awards-section__modal-img ${
                        imgIdx === activeImgIdx ? "awards-section__modal-img--active" : ""
                      }`}
                    />
                  ))}
                </div>

                {/* Modal Navigation Arrows for Multi-image */}
                {currentAward.images.length > 1 && (
                  <>
                    <button
                      className="awards-section__modal-nav awards-section__modal-nav--prev"
                      onClick={handlePrevImage}
                      aria-label="Xem ảnh trước (Phím mũi tên trái)"
                      title="Ảnh trước (←)"
                    >
                      <i className="ri-arrow-left-s-line"></i>
                    </button>
                    <button
                      className="awards-section__modal-nav awards-section__modal-nav--next"
                      onClick={handleNextImage}
                      aria-label="Xem ảnh kế tiếp (Phím mũi tên phải)"
                      title="Ảnh kế tiếp (→)"
                    >
                      <i className="ri-arrow-right-s-line"></i>
                    </button>
                  </>
                )}
              </div>

              {/* Modal Caption */}
              <div className="awards-section__modal-caption">
                <i className="ri-award-fill"></i>
                <span>{currentAward.images[activeImgIdx]?.caption}</span>
              </div>

              {/* Modal Bottom Thumbnails (if multi-image) */}
              {currentAward.images.length > 1 && (
                <div className="awards-section__modal-thumbs">
                  {currentAward.images.map((thumb, tIdx) => {
                    const isThumbActive = tIdx === activeImgIdx;
                    return (
                      <button
                        key={tIdx}
                        className={`awards-section__modal-thumb-btn ${
                          isThumbActive ? "awards-section__modal-thumb-btn--active" : ""
                        }`}
                        onClick={() => setActiveImgIdx(tIdx)}
                        title={thumb.shortTitle}
                      >
                        <img src={thumb.url} alt={thumb.shortTitle} />
                        <span>{thumb.shortTitle}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
