import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface ProblemSolutionSectionProps {
  image?: string;
  imageAlt?: string;
}

type ViewMode = "comparison" | "problem" | "solution";

interface TelemetryWidget {
  icon: string;
  type: "temp" | "ai" | "water" | "price" | "app";
  title: string;
  badge: string;
  val: string;
}

interface RiskSolutionPair {
  id: string;
  number: string;
  categoryLabel: string;
  themeColor: "cyan" | "purple" | "teal" | "amber";
  image: string;
  imageAlt: string;
  riskTitle: string;
  riskIcon: string;
  riskDesc: string;
  riskTag: string;
  solutionTitle: string;
  solutionIcon: string;
  solutionDesc: string;
  solutionTag: string;
  widget1: TelemetryWidget;
  widget2: TelemetryWidget;
}

const OVERVIEW_DATA = {
  id: "overview",
  number: "00",
  shortTitle: "Tổng quan",
  categoryLabel: "Hệ Sinh Thái",
  themeColor: "emerald",
  icon: "ri-dashboard-line",
  image: "/assets/mohinhtongquan",
  imageAlt: "Sơ đồ tổng quan kiến trúc hệ thống AI & IoT EaAgri - Lời Giải Cho Nông Dân",
  windowTitle: "EaAgri IoT & AI System Architecture • Sơ Đồ Toàn Hệ Sinh Thái",
  widget1: {
    icon: "ri-radar-line",
    type: "temp" as const,
    title: "Mạng lưới IoT",
    badge: "Online 24/7",
    val: "Thu thập dữ liệu đất thời gian thực",
  },
  widget2: {
    icon: "ri-cpu-line",
    type: "ai" as const,
    title: "Lõi AI Phân tích",
    badge: "AI Core Hub",
    val: "Khỏe mạnh 98% • Tối ưu mùa vụ",
  },
};

const MATRIX_DATA: RiskSolutionPair[] = [
  {
    id: "water",
    number: "01",
    categoryLabel: "Nước & Khí Hậu",
    themeColor: "cyan",
    image: "/ẢNh 1.webp",
    imageAlt: "Mô hình 3D vườn sầu riêng thông minh kết nối cảm biến IoT và ứng dụng EaAgri",
    riskTitle: "Sốc Nước & Khô Hạn Cực Đoan",
    riskIcon: "ri-drop-line",
    riskDesc: "Thời tiết Tây Nguyên thất thường làm cây bị sốc nước, rụng hoa và trái non, giảm tới 35% năng suất.",
    riskTag: "Thất thoát 35% sản lượng",
    solutionTitle: "Cảm Biến IoT & Lịch Tưới Thông Minh",
    solutionIcon: "ri-contrast-drop-2-line",
    solutionDesc: "Cảm biến đo độ ẩm đất đa tầng tự động kích hoạt van tưới chính xác, tiết kiệm 40% nước và chống sốc nhiệt độ.",
    solutionTag: "Tiết kiệm 40% nước tưới",
    widget1: {
      icon: "ri-temp-hot-line",
      type: "temp",
      title: "Cảm biến đất IoT",
      badge: "Live IoT",
      val: "28.5°C • Độ ẩm 68%",
    },
    widget2: {
      icon: "ri-drop-fill",
      type: "water",
      title: "Van tưới tự động",
      badge: "Auto ON",
      val: "Tiết kiệm 40% nước",
    },
  },
  {
    id: "disease",
    number: "02",
    categoryLabel: "Sâu Bệnh & AI Vision",
    themeColor: "purple",
    image: "/assets/phantichanhbenh.webp",
    imageAlt: "Mô hình AI Vision nhận diện sâu bệnh và nấm lá",
    riskTitle: "Dịch Bệnh & Nấm Phytophthora",
    riskIcon: "ri-virus-line",
    riskDesc: "Bệnh xì mủ, cháy lá, nấm rễ lây lan ngầm khó phát hiện bằng mắt thường, dẫn đến lạm dụng thuốc BVTV tốn kém.",
    riskTag: "Chi phí thuốc tăng 45%",
    solutionTitle: "AI Vision Quét Ảnh Bệnh Trong 3s",
    solutionIcon: "ri-scan-2-line",
    solutionDesc: "Chụp ảnh lá/thân cây, mô hình AI chẩn đoán ngay bệnh lý với độ chính xác >95% và đưa ra phác đồ sinh học chuẩn xác.",
    solutionTag: "Độ chính xác AI > 95%",
    widget1: {
      icon: "ri-scan-line",
      type: "ai",
      title: "AI Vision Scan",
      badge: "Scan 3s",
      val: "Phát hiện Nấm lá 96%",
    },
    widget2: {
      icon: "ri-shield-check-line",
      type: "ai",
      title: "Phác đồ sinh học",
      badge: "An toàn",
      val: "Giảm 50% thuốc BVTV",
    },
  },
  {
    id: "knowledge",
    number: "03",
    categoryLabel: "Tri Thức & AI RAG",
    themeColor: "teal",
    image: "/assets/Rag.webp",
    imageAlt: "Trợ lý AI chuyên gia RAG tư vấn kỹ thuật 24/7",
    riskTitle: "Thiếu Hụt Tri Thức Canh Tác Sâu",
    riskIcon: "ri-book-read-line",
    riskDesc: "Nông dân canh tác theo kinh nghiệm truyền miệng, thiếu quy trình chuẩn VietGAP cho từng giai đoạn nuôi trái.",
    riskTag: "Rủi ro kỹ thuật cao",
    solutionTitle: "Trợ Lý AI Chuyên Gia 24/7 (RAG)",
    solutionIcon: "ri-robot-2-line",
    solutionDesc: "Trợ lý ảo tích hợp kho tri thức nông học chuyên sâu, hỗ trợ giải đáp kỹ thuật, liều lượng bón phân mọi lúc mọi nơi.",
    solutionTag: "Phản hồi chuyên sâu tức thì",
    widget1: {
      icon: "ri-robot-line",
      type: "ai",
      title: "Trợ lý AI Chuyên gia",
      badge: "24/7",
      val: "Phản hồi trong 1.2s",
    },
    widget2: {
      icon: "ri-file-list-3-line",
      type: "water",
      title: "Tri thức nông học",
      badge: "VietGAP",
      val: "Kho dữ liệu sầu riêng",
    },
  },
  {
    id: "market",
    number: "04",
    categoryLabel: "Thị Trường & Giá Cả",
    themeColor: "amber",
    image: "/assets/mohinhgia.webp",
    imageAlt: "Biểu đồ biến động giá và phân tích thị trường nông sản",
    riskTitle: "Bất Đối Xứng Giá & Thị Trường",
    riskIcon: "ri-funds-line",
    riskDesc: "Nông dân bị phụ thuộc vào thương lái, thiếu dữ liệu biến động giá nông sản theo thời gian thực nên dễ bị ép giá.",
    riskTag: "Bị ép giá khi thu hoạch",
    solutionTitle: "Dự Báo Giá & Kết Nối Chuỗi Cung Ứng",
    solutionIcon: "ri-line-chart-line",
    solutionDesc: "Cập nhật biểu đồ giá sầu riêng từng vùng mỗi ngày, dự báo xu hướng thị trường và kết nối trực tiếp với hợp tác xã.",
    solutionTag: "Minh bạch giá 24/7",
    widget1: {
      icon: "ri-line-chart-fill",
      type: "price",
      title: "Giá sầu riêng Monthong",
      badge: "Live Price",
      val: "95.000đ/kg (Tăng +4%)",
    },
    widget2: {
      icon: "ri-store-2-line",
      type: "price",
      title: "Kết nối đầu ra",
      badge: "Hợp tác xã",
      val: "Bao tiêu chuẩn xuất khẩu",
    },
  },
];

export default function ProblemSolutionSection({
  image: _image = "/assets/mohinhtongquan",
  imageAlt: _imageAlt = "Sơ đồ hệ thống EaAgri",
}: ProblemSolutionSectionProps) {
  const [activeMode, setActiveMode] = useState<ViewMode>("comparison");
  // Default to overview
  const [activeItemId, setActiveItemId] = useState<string>("overview");
  const [isZoomOpen, setIsZoomOpen] = useState<boolean>(false);

  const matchedPair = MATRIX_DATA.find((p) => p.id === activeItemId);

  const currentDisplay = matchedPair
    ? {
        image: matchedPair.image,
        imageAlt: matchedPair.imageAlt,
        windowTitle: `Tính Năng ${matchedPair.number} • ${matchedPair.solutionTitle}`,
        shortTitle: `Tính Năng ${matchedPair.number}`,
        widget1: matchedPair.widget1,
        widget2: matchedPair.widget2,
      }
    : {
        image: OVERVIEW_DATA.image,
        imageAlt: OVERVIEW_DATA.imageAlt,
        windowTitle: OVERVIEW_DATA.windowTitle,
        shortTitle: "Sơ đồ hệ sinh thái",
        widget1: OVERVIEW_DATA.widget1,
        widget2: OVERVIEW_DATA.widget2,
      };

  // Keyboard accessibility and body scroll lock for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isZoomOpen) {
        setIsZoomOpen(false);
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
  }, [isZoomOpen]);

  return (
    <>
      <section id="problem-solution" className="section__container problem-solution__container">
        {/* Dynamic Background Aurora */}
        <div
          className={`problem-solution__aurora-bg problem-solution__aurora-bg--${
            activeMode === "problem" ? "red" : "emerald"
          }`}
        />

        {/* Section Header */}
        <div className="problem-solution__header-wrap" data-aos="fade-down">
          <span className="problem-solution__tag">
            <i className="ri-lightbulb-line"></i> Tầm Nhìn & Sứ Mệnh
          </span>
          <h2 className="problem-solution__title">
            Vấn Đề & <span className="highlight">Giải Pháp Đột Phá</span>
          </h2>
          <p className="problem-solution__lead">
            EaAgri giải mã <strong>"Tứ giác rủi ro"</strong> bằng hệ sinh thái Nông nghiệp Thông minh toàn diện tích hợp <strong>IoT & Trí tuệ nhân tạo (AI)</strong>.
          </p>

          {/* View Mode Switcher Pills */}
          <div className="problem-solution__mode-tabs" role="tablist">
            <button
              role="tab"
              aria-selected={activeMode === "comparison"}
              className={`problem-solution__mode-btn ${
                activeMode === "comparison" ? "problem-solution__mode-btn--active" : ""
              }`}
              onClick={() => setActiveMode("comparison")}
            >
              <i className="ri-shuffle-line"></i>
              <span className="mode-btn__text-full">Đối chiếu 4 Cặp Rủi Ro & Lời Giải</span>
              <span className="mode-btn__text-short">Đối chiếu</span>
            </button>

            <button
              role="tab"
              aria-selected={activeMode === "problem"}
              className={`problem-solution__mode-btn problem-solution__mode-btn--danger ${
                activeMode === "problem" ? "problem-solution__mode-btn--active" : ""
              }`}
              onClick={() => setActiveMode("problem")}
            >
              <i className="ri-error-warning-line"></i>
              <span className="mode-btn__text-full">Tứ Giác Rủi Ro</span>
              <span className="mode-btn__text-short">Rủi ro</span>
            </button>

            <button
              role="tab"
              aria-selected={activeMode === "solution"}
              className={`problem-solution__mode-btn problem-solution__mode-btn--success ${
                activeMode === "solution" ? "problem-solution__mode-btn--active" : ""
              }`}
              onClick={() => setActiveMode("solution")}
            >
              <i className="ri-rocket-2-line"></i>
              <span className="mode-btn__text-full">Lời Giải EaAgri</span>
              <span className="mode-btn__text-short">Lời giải</span>
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="problem-solution__grid">
          {/* Left Side: Interactive Dynamic Image & Telemetry Showcase */}
          <div className="problem-solution__image-side" data-aos="fade-right">
            <div className="problem-solution__image-wrapper">
              <div className="problem-solution__window-header">
                <div className="problem-solution__window-dots">
                  <span className="dot dot--red"></span>
                  <span className="dot dot--yellow"></span>
                  <span className="dot dot--green"></span>
                </div>
                <span className="problem-solution__window-title" title={currentDisplay.windowTitle}>
                  <span className="window-title--desktop">{currentDisplay.windowTitle}</span>
                  <span className="window-title--mobile">{currentDisplay.shortTitle}</span>
                </span>
                <span className="problem-solution__status-pill">
                  <span className="live-dot" /> Online 24/7
                </span>
              </div>

              {/* Image Container with Dynamic Transition & Zoom Trigger */}
              <div
                className="problem-solution__image-container"
                onClick={() => setIsZoomOpen(true)}
                title="Nhấn để phóng to xem chi tiết hình ảnh tính năng"
              >
                <img loading="lazy" decoding="async"
                  key={currentDisplay.image}
                  src={currentDisplay.image}
                  alt={currentDisplay.imageAlt}
                  className="problem-solution__img"
                />
                <div className="problem-solution__image-overlay">
                  <div className="problem-solution__zoom-btn">
                    <i className="ri-zoom-in-line"></i> Phóng to ảnh
                  </div>
                </div>
                <div className="problem-solution__zoom-hint-mobile">
                  <i className="ri-zoom-in-line"></i> Phóng to
                </div>
              </div>

              {/* Quick Thumbnail Navigation (00 Tổng Quan + 01 Tưới IoT + 02-04) */}
              <div className="problem-solution__thumb-strip">
                {/* Button 00: Overview (Ảnh 1 mohinhtongquan) */}
                <button
                  className={`problem-solution__thumb-item problem-solution__thumb-item--overview ${
                    activeItemId === "overview" ? "problem-solution__thumb-item--active" : ""
                  }`}
                  onClick={() => setActiveItemId("overview")}
                  title="00. Sơ đồ kiến trúc tổng quan EaAgri"
                >
                  <i className={OVERVIEW_DATA.icon}></i>
                  <span className="thumb-item__text-desktop">00. Tổng quan</span>
                  <span className="thumb-item__text-mobile">00</span>
                </button>

                {/* Buttons 01 -> 04 */}
                {MATRIX_DATA.map((item) => {
                  const isSelected = item.id === activeItemId;
                  return (
                    <button
                      key={item.id}
                      className={`problem-solution__thumb-item problem-solution__thumb-item--${item.themeColor} ${
                        isSelected ? "problem-solution__thumb-item--active" : ""
                      }`}
                      onClick={() => setActiveItemId(item.id)}
                      title={`${item.number}. ${item.solutionTitle}`}
                    >
                      <i className={item.solutionIcon}></i>
                      <span>{item.number}</span>
                    </button>
                  );
                })}
              </div>

              {/* Floating Dynamic Telemetry Widgets */}
              <div className="problem-solution__widget problem-solution__widget--top">
                <div className={`problem-solution__widget-icon problem-solution__widget-icon--${currentDisplay.widget1.type}`}>
                  <i className={currentDisplay.widget1.icon}></i>
                </div>
                <div>
                  <div className="problem-solution__widget-top">
                    <strong>{currentDisplay.widget1.title}</strong>
                    <span className="badge-live">{currentDisplay.widget1.badge}</span>
                  </div>
                  <span className="problem-solution__widget-val">
                    {currentDisplay.widget1.val}
                  </span>
                </div>
              </div>

              <div className="problem-solution__widget problem-solution__widget--bottom">
                <div className={`problem-solution__widget-icon problem-solution__widget-icon--${currentDisplay.widget2.type}`}>
                  <i className={currentDisplay.widget2.icon}></i>
                </div>
                <div>
                  <div className="problem-solution__widget-top">
                    <strong>{currentDisplay.widget2.title}</strong>
                    <span className="badge-ai">{currentDisplay.widget2.badge}</span>
                  </div>
                  <span className="problem-solution__widget-val">
                    {currentDisplay.widget2.val}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Dynamic Content based on Active Mode */}
          <div className="problem-solution__content-side" data-aos="fade-left">
            {/* 1. Comparison Mode: 4-Pair Interactive Cards */}
            {activeMode === "comparison" && (
              <div className="problem-solution__matrix-list">
                {MATRIX_DATA.map((item, idx) => {
                  const isExpanded = activeItemId === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`problem-solution__matrix-card problem-solution__matrix-card--${item.themeColor} ${
                        isExpanded ? "problem-solution__matrix-card--active" : ""
                      }`}
                      onClick={() =>
                        setActiveItemId(isExpanded ? "overview" : item.id)
                      }
                      style={{ animationDelay: `${idx * 0.08}s` }}
                    >
                      {/* Top Bar: Category Pill & Animated Toggle Arrow */}
                      <div className="problem-solution__matrix-header-top">
                        <div className="matrix-category-tag">
                          <span className={`matrix-category-num matrix-category-num--${item.themeColor}`}>
                            {item.number}
                          </span>
                          <span className="matrix-category-name">{item.categoryLabel}</span>
                        </div>
                        <div
                          className={`matrix-toggle-circle ${
                            isExpanded ? "matrix-toggle-circle--open" : ""
                          }`}
                        >
                          <i className="ri-arrow-down-s-line"></i>
                        </div>
                      </div>

                      {/* Before vs After Dual Badges */}
                      <div className="problem-solution__matrix-header">
                        <div className="problem-solution__matrix-titles">
                          <div className="matrix-badge matrix-badge--risk">
                            <span className="matrix-badge__pill">
                              <i className={item.riskIcon}></i> Rủi ro
                            </span>
                            <span className="matrix-badge__title">{item.riskTitle}</span>
                          </div>
                          <div className="matrix-badge__connector">
                            <i className="ri-arrow-down-line"></i>
                          </div>
                          <div className="matrix-badge matrix-badge--solution">
                            <span className="matrix-badge__pill">
                              <i className={item.solutionIcon}></i> Lời giải
                            </span>
                            <span className="matrix-badge__title">{item.solutionTitle}</span>
                          </div>
                        </div>
                      </div>

                      {/* Detail Body */}
                      <div
                        className={`problem-solution__matrix-body ${
                          isExpanded ? "problem-solution__matrix-body--open" : ""
                        }`}
                      >
                        <div className="problem-solution__matrix-split">
                          {/* Risk Box */}
                          <div className="matrix-box matrix-box--risk">
                            <div className="matrix-box__badge">
                              <i className="ri-error-warning-line"></i> Thách thức thực tế
                            </div>
                            <p>{item.riskDesc}</p>
                            <span className="matrix-box__chip matrix-box__chip--risk">
                              {item.riskTag}
                            </span>
                          </div>

                          {/* Solution Box */}
                          <div className="matrix-box matrix-box--solution">
                            <div className="matrix-box__badge">
                              <i className="ri-checkbox-circle-line"></i> Lời giải EaAgri
                            </div>
                            <p>{item.solutionDesc}</p>
                            <span className="matrix-box__chip matrix-box__chip--solution">
                              {item.solutionTag}
                            </span>
                          </div>
                        </div>

                        {/* Interactive Hint: Tap to view image above */}
                        <div
                          className="matrix-box__action-hint"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveItemId(item.id);
                            const imageEl = document.querySelector(".problem-solution__image-wrapper");
                            if (imageEl) {
                              imageEl.scrollIntoView({ behavior: "smooth", block: "center" });
                            }
                          }}
                        >
                          <i className="ri-eye-line"></i>
                          <span>Xem mô hình tính năng {item.number} trên sơ đồ phía trên</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 2. Problem Mode Only: Focus on 4 Key Risks */}
            {activeMode === "problem" && (
              <div className="problem-solution__risk-list">
                <div className="problem-solution__alert-banner">
                  <i className="ri-error-warning-fill"></i>
                  <div>
                    <strong>"Tứ Giác Rủi Ro" Nông Nghiệp Tây Nguyên</strong>
                    <p>
                      Mô hình truyền thống khiến nông dân chịu rủi ro chi phí cao, thất thoát mùa vụ và thiếu quyền tự quyết về giá.
                    </p>
                  </div>
                </div>

                <div className="problem-solution__items-grid">
                  {MATRIX_DATA.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`problem-solution__card problem-solution__card--problem ${
                        item.id === activeItemId ? "problem-solution__card--active" : ""
                      }`}
                      style={{ animationDelay: `${idx * 0.08}s` }}
                      onClick={() => setActiveItemId(item.id === activeItemId ? "overview" : item.id)}
                    >
                      <div className="problem-solution__card-icon">
                        <i className={item.riskIcon}></i>
                      </div>
                      <div className="problem-solution__card-body">
                        <div className="problem-solution__card-title-row">
                          <h3>{item.riskTitle}</h3>
                          <span className="risk-badge-tag">{item.riskTag}</span>
                        </div>
                        <p>{item.riskDesc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Solution Mode Only: Focus on 4 EaAgri Breakthroughs */}
            {activeMode === "solution" && (
              <div className="problem-solution__solution-list">
                <div className="problem-solution__solution-banner">
                  <i className="ri-sparkling-fill"></i>
                  <div>
                    <strong>Hệ Sinh Thái Nông Nghiệp Số Data-Driven</strong>
                    <p>
                      Kết hợp cảm biến IoT thời gian thực và trí tuệ nhân tạo AI giúp tối ưu tài nguyên, nâng cao năng suất và bảo vệ mùa màng.
                    </p>
                  </div>
                </div>

                <div className="problem-solution__items-grid">
                  {MATRIX_DATA.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`problem-solution__card problem-solution__card--solution ${
                        item.id === activeItemId ? "problem-solution__card--active" : ""
                      }`}
                      style={{ animationDelay: `${idx * 0.08}s` }}
                      onClick={() => setActiveItemId(item.id === activeItemId ? "overview" : item.id)}
                    >
                      <div className="problem-solution__card-icon">
                        <i className={item.solutionIcon}></i>
                      </div>
                      <div className="problem-solution__card-body">
                        <div className="problem-solution__card-title-row">
                          <h3>{item.solutionTitle}</h3>
                          <span className="solution-badge-tag">{item.solutionTag}</span>
                        </div>
                        <p>{item.solutionDesc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Lightbox Modal via React Portal */}
      {isZoomOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="problem-solution__modal-backdrop"
            onClick={() => setIsZoomOpen(false)}
          >
            <div
              className="problem-solution__modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="problem-solution__modal-header">
                <div className="problem-solution__modal-title">
                  <i className="ri-image-2-line"></i>
                  <span>{currentDisplay.imageAlt}</span>
                </div>
                <button
                  className="problem-solution__modal-close"
                  onClick={() => setIsZoomOpen(false)}
                  title="Đóng (Esc)"
                  aria-label="Đóng"
                >
                  <i className="ri-close-line"></i>
                </button>
              </div>

              <div className="problem-solution__modal-img-wrap">
                <img loading="lazy" decoding="async"
                  src={currentDisplay.image}
                  alt={currentDisplay.imageAlt}
                  className="problem-solution__modal-img"
                />
              </div>

              <div className="problem-solution__modal-footer">
                <button
                  className={`problem-solution__modal-pill ${
                    activeItemId === "overview" ? "problem-solution__modal-pill--active" : ""
                  }`}
                  onClick={() => setActiveItemId("overview")}
                >
                  <i className={OVERVIEW_DATA.icon}></i>
                  <span>00 • Tổng Quan Sơ Đồ Hệ Thống</span>
                </button>

                {MATRIX_DATA.map((item) => (
                  <button
                    key={item.id}
                    className={`problem-solution__modal-pill ${
                      item.id === activeItemId ? "problem-solution__modal-pill--active" : ""
                    }`}
                    onClick={() => setActiveItemId(item.id)}
                  >
                    <i className={item.solutionIcon}></i>
                    <span>0{item.number} • {item.solutionTitle}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
