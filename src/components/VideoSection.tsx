import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface VideoSectionProps {
  tag?: string;
  title: string;
  description: string;
  videoUrl: string;
  fallbackUrl?: string;
  footerText?: string;
}

const getYoutubeId = (url: string) => {
  const match = url.match(/embed\/([^?]+)/);
  return match ? match[1] : null;
};

const VideoSection = ({
  tag,
  title,
  description,
  videoUrl,
  fallbackUrl,
  footerText,
}: VideoSectionProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const youtubeId = getYoutubeId(videoUrl);
  const thumbnailUrl = youtubeId
    ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
    : "";

  useEffect(() => {
    if (!isModalOpen) return;

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
  }, [isModalOpen]);

  return (
    <section
      className="section__container video__section"
      data-aos="fade-up"
    >
      {tag && (
        <span className="video__tag">
          <i className="ri-cpu-line"></i> {tag}
        </span>
      )}

      <h2 className="section__header">
        {title}
      </h2>

      <p className="section__description video__description">
        {description}
      </p>

      <div className="architecture__video" onClick={() => setIsModalOpen(true)}>
        {thumbnailUrl ? (
          <>
            <img loading="lazy" decoding="async" src={thumbnailUrl} alt={title} className="video__thumbnail" />
            <div className="video__play-btn">
              <i className="ri-play-fill"></i>
            </div>
          </>
        ) : (
          <div className="video__play-btn">
            <i className="ri-play-fill"></i>
          </div>
        )}
      </div>

      {isModalOpen && createPortal(
        <div className="video__modal" onClick={() => setIsModalOpen(false)}>
          <div className="video__modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="video__close-btn" onClick={() => setIsModalOpen(false)}>
              <i className="ri-close-line"></i>
            </button>
            <iframe
              src={`${videoUrl}${videoUrl.includes("?") ? "&" : "?"}autoplay=1`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>,
        document.body
      )}

      {fallbackUrl && (
        <p className="video__link">
          <a
            href={fallbackUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="ri-youtube-fill"></i>
            <span>Xem trực tiếp trên YouTube</span>
          </a>
        </p>
      )}

      {footerText && (
        <p className="video__footer">
          {footerText}
        </p>
      )}
    </section>
  );
};

export default VideoSection;