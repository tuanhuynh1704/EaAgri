import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

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
