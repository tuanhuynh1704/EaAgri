import { useState, useEffect } from "react";
import { NTTU_VOTE_CONFIG } from "../data/voteConfig";
import { useVoteStats } from "../context/VoteContext";

const SESSION_STORAGE_KEY = "eaagri_vote_banner_hidden";

export default function VoteAnnouncementBar() {
  const { formattedVotes, isPulsing } = useVoteStats();
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return sessionStorage.getItem(SESSION_STORAGE_KEY) !== "true";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (isVisible) {
      document.body.classList.add("has-vote-banner");
    } else {
      document.body.classList.remove("has-vote-banner");
    }

    return () => {
      document.body.classList.remove("has-vote-banner");
    };
  }, [isVisible]);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, "true");
    } catch {
      // ignore
    }
  };

  if (!isVisible) return null;

  return (
    <aside
      className="vote-announcement-bar"
      role="region"
      aria-label="Thông báo bình chọn NTTU Startup 2026"
    >
      <div className="vote-announcement-bar__inner">
        <div className="vote-announcement-bar__badge">
          <span className="vote-pulse-dot" />
          <span className="vote-badge-text">BÌNH CHỌN CỘNG ĐỒNG</span>
        </div>

        <div className="vote-announcement-bar__content">
          <i className="ri-trophy-fill vote-trophy-icon" />
          <span className="vote-announcement-bar__text vote-announcement-bar__text--desktop">
            Tiếp sức dự án <strong>EaAgri</strong> tại <strong>NTTU Startup 2026</strong> • Đã đạt{" "}
            <span className={`vote-highlight ${isPulsing ? "vote-highlight--pulse" : ""}`}>
              {formattedVotes} vote
            </span>{" "}
            • Cùng đồng hành nhé!
          </span>
          <span className="vote-announcement-bar__text vote-announcement-bar__text--mobile">
            Tiếp sức <strong>EaAgri</strong> •{" "}
            <span className={`vote-highlight ${isPulsing ? "vote-highlight--pulse" : ""}`}>
              {formattedVotes} vote
            </span>
          </span>
        </div>

        <div className="vote-announcement-bar__actions">
          <a
            href={NTTU_VOTE_CONFIG.url}
            target="_blank"
            rel="noopener noreferrer"
            className="vote-announcement-bar__cta"
            title="Mở cổng bình chọn dự án EaAgri"
          >
            <span className="cta-label--desktop">Bình chọn ngay</span>
            <span className="cta-label--mobile">Bình chọn</span>
            <i className="ri-arrow-right-line" />
          </a>

          <button
            type="button"
            className="vote-announcement-bar__close"
            onClick={handleDismiss}
            aria-label="Đóng thông báo bình chọn"
            title="Đóng thông báo"
          >
            <i className="ri-close-line" />
          </button>
        </div>
      </div>
    </aside>
  );
}
