import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { triggerPromoVideo } from "./PromoVideoModal";

interface VideoItem {
  title: string;
  description: string;
  videoUrl: string;
  fallbackUrl: string;
}

const getYoutubeId = (url: string) => {
  const match = url.match(/embed\/([^?]+)/);
  return match ? match[1] : null;
};

export default function VideoGallerySection() {
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const promoMode = isMobile ? "9x16" : "16x9";
  const posterSrc = isMobile
    ? "/Video/promo_9x16_poster.webp"
    : "/Video/promo_16x9_poster.webp";
  const badgeText = isMobile ? "BẢN ĐIỆN THOẠI • 9:16" : "BẢN WEB • 16:9";

  const videos: VideoItem[] = [
    {
      title: "Lời Giải Cho Nông Dân",
      description: "Sự khởi đầu và câu chuyện ý nghĩa của dự án EaAgri",
      videoUrl: "https://www.youtube.com/embed/ap6V_7nSDm8?start=1",
      fallbackUrl: "https://www.youtube.com/watch?v=ap6V_7nSDm8"
    },
    {
      title: "Demo Thực Tế Sản Phẩm",
      description: "Trải nghiệm thực tế các tính năng vận hành của hệ thống EaAgri",
      videoUrl: "https://www.youtube.com/embed/WxfKTEIxSjQ",
      fallbackUrl: "https://www.youtube.com/watch?v=WxfKTEIxSjQ"
    }
  ];

  useEffect(() => {
    if (activeVideo) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;

      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    }
  }, [activeVideo]);

  return (
    <section className="section__container video-gallery__container">
      <div className="video-gallery__header" data-aos="fade-down">
        <span className="video-gallery__tag">
          <i className="ri-play-circle-line"></i> THƯ VIỆN TRUYỀN THÔNG
        </span>
        <h2 className="video-gallery__title">
          Video & <span className="highlight">Trải Nghiệm Thực Tế</span>
        </h2>
        <p className="video-gallery__subtitle">
          Tìm hiểu câu chuyện phát triển dự án và xem quá trình vận hành trực quan của EaAgri.
        </p>
      </div>

      {/* Featured Spotlight Promo Video Card (Adaptive Web vs Phone) */}
      <div className="video-gallery__spotlight" data-aos="zoom-in" data-aos-delay="100">
        <div 
          className={`video-gallery__spotlight-media video-gallery__spotlight-media--${promoMode}`}
          onClick={() => triggerPromoVideo(promoMode)}
          role="button"
          tabIndex={0}
          aria-label="Xem video giới thiệu EaAgri 45 giây"
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") triggerPromoVideo(promoMode); }}
        >
          <picture className="video-gallery__spotlight-picture">
            <source media="(max-width: 768px)" srcSet="/Video/promo_9x16_poster.webp" />
            <img 
              src={posterSrc} 
              alt="Trailer giới thiệu EaAgri 45 giây"
              className="video-gallery__spotlight-poster"
              loading="lazy"
              decoding="async"
            />
          </picture>
          <div className="video-gallery__spotlight-overlay" />
          
          <div className="video-gallery__spotlight-play-wrap">
            <span className="spotlight-play-pulse" />
            <div className="spotlight-play-btn">
              <i className="ri-play-fill" />
            </div>
            <span className="spotlight-play-label">Xem Teaser (45s)</span>
          </div>

          <span className="video-gallery__spotlight-badge">
            <span className="spotlight-badge-dot" />
            {badgeText}
          </span>
          <span className="video-gallery__spotlight-duration">0:45</span>
        </div>

        <div className="video-gallery__spotlight-content">
          <div className="spotlight-header-meta">
            <span className="spotlight-chip">
              <i className="ri-sparkling-fill" /> TIÊU ĐIỂM TRUYỀN THÔNG
            </span>
            <span className="spotlight-hd-tag">
              {isMobile ? "CHUẨN MOBILE • 9:16" : "FULL HD • 60FPS"}
            </span>
          </div>

          <h3 className="spotlight-title">
            EaAgri — Khát Vọng Số Hóa Nông Nghiệp Tây Nguyên
          </h3>

          <p className="spotlight-desc">
            Trải nghiệm giải pháp trợ lý cây sầu riêng ứng dụng AI Dual-Brain kết hợp YOLOv9 nhận diện sâu bệnh và mạng lưới trạm quan trắc IoT vi khí hậu độc quyền.
          </p>

          <div className="spotlight-actions">
            <button 
              type="button"
              className="spotlight-btn spotlight-btn--primary"
              onClick={() => triggerPromoVideo(promoMode)}
              title={isMobile ? "Xem video bản điện thoại (9:16)" : "Xem video bản web (16:9)"}
            >
              <i className="ri-play-circle-fill" />
              <span>Xem Video Giới Thiệu (45s)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section Divider */}
      <div className="video-gallery__divider" data-aos="fade-up">
        <span><i className="ri-film-line" /> PHIM TƯ LIỆU & THỰC ĐỊA</span>
      </div>

      <div className="video-gallery__grid">
        {videos.map((video, idx) => {
          const ytId = getYoutubeId(video.videoUrl);
          const thumbUrl = ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : "";

          return (
            <div 
              key={idx} 
              className="video-gallery__card"
              data-aos={idx === 0 ? "fade-right" : "fade-left"}
              data-aos-delay={idx * 150}
            >
              <div 
                className="video-gallery__player-wrapper video-gallery__player-wrapper--clickable"
                onClick={() => setActiveVideo(video)}
              >
                {thumbUrl ? (
                  <>
                    <img
                      src={thumbUrl}
                      alt={video.title}
                      className="video-gallery__thumbnail"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="video-gallery__play-btn">
                      <i className="ri-play-circle-fill"></i>
                    </div>
                  </>
                ) : (
                  <div className="video-gallery__play-btn">
                    <i className="ri-play-circle-fill"></i>
                  </div>
                )}
                <div className="video-gallery__image-overlay"></div>
              </div>
              <div className="video-gallery__info">
                <h3>{video.title}</h3>
                <p>{video.description}</p>
                <a 
                  href={video.fallbackUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="video-gallery__link"
                >
                  <i className="ri-youtube-fill"></i> Xem trên YouTube
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {activeVideo && createPortal(
        <div className="video__modal" onClick={() => setActiveVideo(null)}>
          <div className="video__modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="video__close-btn" onClick={() => setActiveVideo(null)}>
              <i className="ri-close-line"></i>
            </button>
            <iframe
              src={`${activeVideo.videoUrl}${activeVideo.videoUrl.includes("?") ? "&" : "?"}autoplay=1`}
              title={activeVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
