import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export const PROMO_VIDEO_EVENT = "eaagri:open-promo-video";

export interface PromoVideoDetail {
  mode?: "16x9" | "9x16";
}

export function triggerPromoVideo(mode?: "16x9" | "9x16") {
  const isMobile =
    typeof window !== "undefined"
      ? Boolean(window.matchMedia?.("(max-width: 768px)")?.matches || window.innerWidth <= 768)
      : false;
  const targetMode = mode || (isMobile ? "9x16" : "16x9");
  window.dispatchEvent(
    new CustomEvent<PromoVideoDetail>(PROMO_VIDEO_EVENT, { detail: { mode: targetMode } })
  );
}

export default function PromoVideoModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"16x9" | "9x16">(() => {
    if (typeof window === "undefined") return "16x9";
    return (window.matchMedia?.("(max-width: 768px)")?.matches || window.innerWidth <= 768) ? "9x16" : "16x9";
  });
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<PromoVideoDetail>;
      const isMobile = Boolean(
        window.matchMedia?.("(max-width: 768px)")?.matches || window.innerWidth <= 768
      );
      const preferredMode =
        customEvent.detail?.mode || (isMobile ? "9x16" : "16x9");
      setMode(preferredMode);
      setIsOpen(true);
    };

    window.addEventListener(PROMO_VIDEO_EVENT, handleOpen);
    return () => window.removeEventListener(PROMO_VIDEO_EVENT, handleOpen);
  }, []);

  // Auto adapt if screen is resized while open
  useEffect(() => {
    if (!isOpen) return;
    const handleResize = () => {
      const isMobile = Boolean(
        window.matchMedia?.("(max-width: 768px)")?.matches || window.innerWidth <= 768
      );
      setMode(isMobile ? "9x16" : "16x9");
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  // Lock background scroll when open (prevents wheel/touch scrolling on desktop and mobile)
  useEffect(() => {
    if (!isOpen) return;

    const origBodyOverflow = document.body.style.overflow;
    const origHtmlOverflow = document.documentElement.style.overflow;
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
      // Allow user to interact with the native video player element (scrubber/volume/fullscreen)
      if (target && (target.tagName === "VIDEO" || target.closest("video"))) {
        return;
      }
      e.preventDefault();
    };

    window.addEventListener("wheel", blockScroll, { passive: false });
    window.addEventListener("touchmove", blockScroll, { passive: false });

    return () => {
      document.body.style.overflow = origBodyOverflow;
      document.documentElement.style.overflow = origHtmlOverflow;
      document.body.style.touchAction = origBodyTouch;
      document.documentElement.style.touchAction = origHtmlTouch;

      document.body.classList.remove("modal-scroll-lock");
      document.documentElement.classList.remove("modal-scroll-lock");

      window.removeEventListener("wheel", blockScroll);
      window.removeEventListener("touchmove", blockScroll);
    };
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const videoSrc =
    mode === "16x9"
      ? "/assets/EaAgri_Promo_45s_16x9_pc.mp4"
      : "/assets/EaAgri_Promo_45s_9x16_mobile.mp4";

  const posterSrc =
    mode === "16x9"
      ? "/Video/promo_16x9_poster.webp"
      : "/Video/promo_9x16_poster.webp";

  return createPortal(
    <div
      className="promo-video-backdrop"
      onClick={() => setIsOpen(false)}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => {
        const target = e.target as HTMLElement | null;
        if (!target || (target.tagName !== "VIDEO" && !target.closest("video"))) {
          e.stopPropagation();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="promo-video-modal-title"
    >
      <div
        className={`promo-video-card promo-video-card--${mode}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="promo-video-card__header">
          <div className="promo-video-card__info">
            <span className="promo-video-card__badge">
              <span className="promo-video-card__badge-pulse" />
              <i className={mode === "9x16" ? "ri-smartphone-line" : "ri-movie-2-fill"}></i>
              {mode === "9x16" ? "BẢN ĐIỆN THOẠI (9:16)" : "BẢN WEB (16:9)"}
            </span>
            <h3 id="promo-video-modal-title" className="promo-video-card__title">
              EaAgri • Trợ Lý Nông Nghiệp Thông Minh
            </h3>
          </div>

          {/* Close button */}
          <button
            type="button"
            className="promo-video-card__close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Đóng video"
          >
            <i className="ri-close-line"></i>
          </button>
        </div>

        {/* Video Player Box */}
        <div className={`promo-video-player-wrap promo-video-player-wrap--${mode}`}>
          <video
            ref={videoRef}
            src={videoSrc}
            poster={posterSrc}
            controls
            autoPlay
            playsInline
            preload="auto"
            className="promo-video-player-wrap__element"
          />
        </div>

        {/* Bottom Tagline & Actions */}
        <div className="promo-video-card__footer">
          <div className="promo-video-card__pills">
            <span className="promo-pill">
              <i className="ri-shield-check-fill"></i> Chuẩn VietGAP
            </span>
            <span className="promo-pill">
              <i className="ri-cpu-line"></i> AI YOLOv9 Nhận Diện Bệnh
            </span>
            <span className="promo-pill">
              <i className="ri-drop-line"></i> IoT Tưới 3 Lớp
            </span>
          </div>

          <a
            href="https://play.google.com/store/apps/details?id=com.eaagri.app&hl=vi"
            target="_blank"
            rel="noopener noreferrer"
            className="promo-video-card__cta"
          >
            <i className="ri-google-play-fill"></i> Tải Ngay
          </a>
        </div>
      </div>
    </div>,
    document.body
  );
}
