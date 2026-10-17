import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { triggerPromoVideo } from "./PromoVideoModal";

interface VideoItem {
  title: string;
  description: string;
  videoUrl: string;
  fallbackUrl: string;
}

// const getYoutubeId = (url: string) => {
//   const match = url.match(/embed\/([^?]+)/);
//   return match ? match[1] : null;
// };

export default function VideoGallerySection() {
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return Boolean(
      window.matchMedia?.("(max-width: 768px)")?.matches ||
      window.innerWidth <= 768
    );
  });

  useEffect(() => {
    const mql = window.matchMedia?.("(max-width: 768px)");
    const checkMobile = () => {
      setIsMobile(Boolean(mql?.matches || window.innerWidth <= 768));
    };

    checkMobile();
    if (mql?.addEventListener) {
      mql.addEventListener("change", checkMobile);
    } else if (mql?.addListener) {
      mql.addListener(checkMobile);
    }
    window.addEventListener("resize", checkMobile);

    return () => {
      if (mql?.removeEventListener) {
        mql.removeEventListener("change", checkMobile);
      } else if (mql?.removeListener) {
        mql.removeListener(checkMobile);
      }
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const promoMode = isMobile ? "9x16" : "16x9";
  const promoVideoSrc = isMobile
    ? "/assets/EaAgri_Promo_45s_9x16_mobile.mp4"
    : "/assets/EaAgri_Promo_45s_16x9_pc.mp4";
  const posterSrc = isMobile
    ? "/Video/promo_9x16_poster.webp"
    : "/Video/promo_16x9_poster.webp";

  // const videos: VideoItem[] = [
  //   {
  //     title: "Lời Giải Cho Nông Dân",
  //     description: "Sự khởi đầu và câu chuyện ý nghĩa của dự án EaAgri",
  //     videoUrl: "https://www.youtube.com/embed/ap6V_7nSDm8?start=1",
  //     fallbackUrl: "https://www.youtube.com/watch?v=ap6V_7nSDm8"
  //   },
  //   {
  //     title: "Demo Thực Tế Sản Phẩm",
  //     description: "Trải nghiệm thực tế các tính năng vận hành của hệ thống EaAgri",
  //     videoUrl: "https://www.youtube.com/embed/WxfKTEIxSjQ",
  //     fallbackUrl: "https://www.youtube.com/watch?v=WxfKTEIxSjQ"
  //   }
  // ];

  useEffect(() => {
    if (!activeVideo) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const origBodyTouch = document.body.style.touchAction;
    const origHtmlTouch = document.documentElement.style.touchAction;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    document.documentElement.style.touchAction = "none";

    document.body.classList.add("modal-scroll-lock");
    document.documentElement.classList.add("modal-scroll-lock");

    const blockScroll = (e: WheelEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "IFRAME" || target.closest(".video__modal-content"))) {
        return;
      }
      e.preventDefault();
    };

    window.addEventListener("wheel", blockScroll, { passive: false });
    window.addEventListener("touchmove", blockScroll, { passive: false });

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.touchAction = origBodyTouch;
      document.documentElement.style.touchAction = origHtmlTouch;

      document.body.classList.remove("modal-scroll-lock");
      document.documentElement.classList.remove("modal-scroll-lock");

      window.removeEventListener("wheel", blockScroll);
      window.removeEventListener("touchmove", blockScroll);
    };
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

      {/* Featured Spotlight Promo Video (Side-by-Side: Video bên trái • Chữ bên phải, Không khung hộp) */}
      <div className="video-gallery__spotlight video-gallery__spotlight--split" data-aos="fade-up" data-aos-delay="100">
        {/* Cột Trái: Trình phát Video tương tác trực tiếp */}
        <div 
          className={`video-gallery__spotlight-media video-gallery__spotlight-media--${promoMode}`}
        >
          <video
            key={promoVideoSrc}
            src={promoVideoSrc}
            poster={posterSrc}
            className="video-gallery__spotlight-video"
            controls
            playsInline
            preload="metadata"
          />
        </div>

        {/* Cột Phải: Thông tin cô đọng, súc tích */}
        <div className="video-gallery__spotlight-info">
          <div className="spotlight-header-meta">
            <span className="spotlight-chip">
              <i className="ri-sparkling-fill" /> TIÊU ĐIỂM DỰ ÁN
            </span>
          </div>

          <h3 className="spotlight-title">
            Khát Vọng Số Hóa Nông Nghiệp Tây Nguyên
          </h3>

          <p className="spotlight-desc">
            Trải nghiệm trợ lý cây sầu riêng ứng dụng AI Dual-Brain và trạm quan trắc IoT vi khí hậu độc quyền.
          </p>

          <div className="spotlight-highlights-list">
            <div className="spotlight-highlight-item">
              <i className="ri-checkbox-circle-fill text-green" />
              <span>Chuẩn hóa quy trình canh tác VietGAP số</span>
            </div>
            <div className="spotlight-highlight-item">
              <i className="ri-checkbox-circle-fill text-green" />
              <span>AI YOLOv9 chẩn đoán bệnh lá tức thì</span>
            </div>
            <div className="spotlight-highlight-item">
              <i className="ri-checkbox-circle-fill text-green" />
              <span>IoT giám sát thổ nhưỡng & tưới 3 lớp</span>
            </div>
          </div>

          <div className="spotlight-action-row">
            <button 
              type="button"
              className="spotlight-btn spotlight-btn--primary"
              onClick={() => triggerPromoVideo(promoMode)}
              title={promoMode === "9x16" ? "Mở rạp chiếu video bản điện thoại (9:16)" : "Mở rạp chiếu video bản web (16:9)"}
            >
              <i className="ri-play-circle-fill" />
              <span>Xem Phóng To Rạp Chiếu (45s)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section Divider */}
      {/* <div className="video-gallery__divider" data-aos="fade-up">
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
      </div> */}

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
