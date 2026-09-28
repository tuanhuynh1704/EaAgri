import { useRef, useState } from "react";

interface PillarItem {
  icon: string;
  tag: string;
  title: string;
  desc: string;
}

const PILLARS: PillarItem[] = [
  {
    icon: "ri-base-station-line",
    tag: "Hardware & IoT",
    title: "Mạng Lưới Cảm Biến 24/7",
    desc: "Thu thập liên tục độ ẩm đất, nhiệt độ môi trường, pH và EC, giúp nhà nông nắm bắt chính xác sức khỏe thổ nhưỡng theo thời gian thực.",
  },
  {
    icon: "ri-scan-2-line",
    tag: "AI Dual-Brain",
    title: "AI Chẩn Đoán Sâu Bệnh",
    desc: "Mô hình thị giác máy tính YOLOv9 phát hiện nhanh nấm Phytophthora, rệp sáp, xì mủ thân kết hợp trợ lý AI tư vấn phác đồ điều trị.",
  },
  {
    icon: "ri-drop-line",
    tag: "Tự Động Hóa",
    title: "Tưới Tiêu 3 Lớp Thông Minh",
    desc: "Thuật toán tưới thích ứng theo sinh học cây trồng, tự ngắt khi có mưa và bảo vệ rễ sầu riêng khỏi nguy cơ úng nước, tiết kiệm đến 40% chi phí.",
  },
  {
    icon: "ri-line-chart-line",
    tag: "Big Data & VietGAP",
    title: "Dự Báo Giá & Nhật Ký Số",
    desc: "Dự báo biến động giá sầu riêng ngắn hạn 1–7 ngày qua mô hình LSTM, tích hợp sổ tay canh tác số hóa minh bạch chuẩn hóa xuất khẩu.",
  },
];

export default function IntroductionProject() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleScrollToProblemSolution = () => {
    const el = document.getElementById("problem-solution");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section id="introduction-project" className="intro-project__container">
      {/* Background Aurora */}
      <div className="intro-project__aurora" aria-hidden="true" />

      {/* Header */}
      <div className="intro-project__header" data-aos="fade-down">
        <span className="intro-project__badge">
          <i className="ri-movie-2-line"></i> Giới Thiệu Dự Án
        </span>
        <h2 className="intro-project__title">
          Hành Trình Khởi Nghiệp Số &amp; <span className="highlight">Hệ Sinh Thái EaAgri</span>
        </h2>
        <p className="intro-project__lead">
          Khám phá video giới thiệu <strong>45 giây</strong> về nền tảng Nông nghiệp Thông minh toàn diện — 
          Ứng dụng <strong>IoT &amp; Trí tuệ Nhân tạo (AI)</strong> kiến tạo giải pháp canh tác bền vững cho nông dân Việt Nam.
        </p>
      </div>

      {/* Video Showcase Card */}
      <div className="intro-project__video-wrapper" data-aos="zoom-in" data-aos-delay="150">
        {/* Mockup Window Topbar */}
        <div className="intro-project__window-bar">
          <div className="intro-project__window-dots">
            <span className="dot dot--red"></span>
            <span className="dot dot--yellow"></span>
            <span className="dot dot--green"></span>
          </div>
          <div className="intro-project__window-title">
            <i className="ri-video-line"></i>
            <span>EaAgri_Promo_45s_16x9.mp4 • Video Giới Thiệu Dự Án</span>
          </div>
          <div className="intro-project__window-status">
            <span className="pulse-dot"></span>
            <span>Ultra HD 1080p</span>
          </div>
        </div>

        {/* Video Player */}
        <div className="intro-project__player-box">
          <video
            ref={videoRef}
            src="/assets/EaAgri_Promo_45s_16x9.mp4"
            poster="/assets/smart_durian_hero.webp"
            controls
            playsInline
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            title="Video Giới Thiệu Dự Án EaAgri"
          >
            Trình duyệt của bạn không hỗ trợ định dạng video này.
          </video>

          {/* Overlay Play Button when paused */}
          <div
            className={`intro-project__play-overlay ${isPlaying ? "intro-project__play-overlay--hidden" : ""}`}
            onClick={handleTogglePlay}
            role="button"
            aria-label="Phát video giới thiệu EaAgri"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleTogglePlay();
              }
            }}
          >
            <div className="intro-project__play-circle">
              <i className="ri-play-fill"></i>
            </div>
            <span className="intro-project__play-text">Xem Video Giới Thiệu (45s)</span>
          </div>
        </div>

        {/* Video Metadata Quick Strip */}
        <div className="intro-project__meta-strip">
          <div className="intro-project__meta-item">
            <i className="ri-time-line"></i>
            <span>Thời lượng:</span>
            <strong>45 Giây</strong>
          </div>
          <div className="intro-project__meta-item">
            <i className="ri-aspect-ratio-line"></i>
            <span>Tỉ lệ:</span>
            <strong>16:9 Cinematic HD</strong>
          </div>
          <div className="intro-project__meta-item">
            <i className="ri-cpu-line"></i>
            <span>Công nghệ:</span>
            <strong>AI Dual-Brain &amp; IoT</strong>
          </div>
          <div className="intro-project__meta-item">
            <i className="ri-trophy-line"></i>
            <span>Thành tựu:</span>
            <strong>Quán quân Startup NTTU 2026</strong>
          </div>
        </div>
      </div>

      {/* 4 Key Innovations Pillars Grid */}
      <div className="intro-project__pillars-grid">
        {PILLARS.map((pillar, idx) => (
          <div
            key={idx}
            className="intro-project__pillar-card"
            data-aos="fade-up"
            data-aos-delay={200 + idx * 100}
          >
            <div className="intro-project__pillar-header">
              <div className="intro-project__pillar-icon">
                <i className={pillar.icon}></i>
              </div>
              <span className="intro-project__pillar-tag">{pillar.tag}</span>
            </div>
            <h3 className="intro-project__pillar-title">{pillar.title}</h3>
            <p className="intro-project__pillar-desc">{pillar.desc}</p>
          </div>
        ))}
      </div>

      {/* Scroll Down CTA */}
      <div className="intro-project__cta-wrap" data-aos="fade-up" data-aos-delay="400">
        <button
          onClick={handleScrollToProblemSolution}
          className="intro-project__cta-btn"
          aria-label="Khám phá chi tiết Vấn đề & Giải pháp đột phá"
        >
          <span>Khám Phá Vấn Đề &amp; Lời Giải Đột Phá</span>
          <i className="ri-arrow-down-line"></i>
        </button>
      </div>
    </section>
  );
}