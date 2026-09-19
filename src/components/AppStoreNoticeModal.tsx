import { useState, useEffect } from "react";

export const APPSTORE_NOTICE_EVENT = "eaagri:open-appstore-notice";

export function triggerAppStoreNotice() {
  window.dispatchEvent(new CustomEvent(APPSTORE_NOTICE_EVENT));
}

export default function AppStoreNoticeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener(APPSTORE_NOTICE_EVENT, handleOpen);
    return () => window.removeEventListener(APPSTORE_NOTICE_EVENT, handleOpen);
  }, []);

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

  return (
    <div
      className="appstore-notice-backdrop"
      onClick={() => setIsOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="appstore-notice-title"
    >
      <div
        className="appstore-notice-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="appstore-notice-card__glow" />

        <button
          type="button"
          className="appstore-notice-card__close-btn"
          onClick={() => setIsOpen(false)}
          aria-label="Đóng thông báo"
        >
          <i className="ri-close-line" />
        </button>

        <div className="appstore-notice-card__icon-wrap">
          <i className="ri-apple-fill" />
          <span className="notice-status-dot" title="Đang phát triển" />
        </div>

        <div className="appstore-notice-card__tag">
          <i className="ri-tools-fill" />
          <span>Đang phát triển • Chưa triển khai</span>
        </div>

        <h3 id="appstore-notice-title" className="appstore-notice-card__title">
          Ứng dụng iOS (App Store)
        </h3>

        <p className="appstore-notice-card__desc">
          Phiên bản dành cho hệ điều hành iOS trên <strong>App Store</strong> hiện đang được đội ngũ kỹ thuật EaAgri phát triển và chuẩn bị phát hành.
          <br /><br />
          Quý khách vui lòng trải nghiệm trước trên phiên bản <strong>Android (Google Play)</strong> hoặc trực tiếp trên nền tảng <strong>Web</strong>!
        </p>

        <div className="appstore-notice-card__actions">
          <a
            href="https://play.google.com/store/apps/details?id=com.eaagri.app&hl=vi"
            target="_blank"
            rel="noopener noreferrer"
            className="appstore-notice-card__btn-google"
            onClick={() => setIsOpen(false)}
          >
            <i className="ri-google-play-fill" />
            <span>Tải trên Google Play</span>
          </a>

          <button
            type="button"
            className="appstore-notice-card__btn-dismiss"
            onClick={() => setIsOpen(false)}
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
}
