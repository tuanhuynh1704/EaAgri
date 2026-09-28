import { useState, useEffect } from "react";
import { NTTU_VOTE_CONFIG } from "../data/voteConfig";

export default function FloatingVoteWidget() {
  const [isReady, setIsReady] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Show smoothly after 1s so it catches attention without blocking initial render
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!isReady || isDismissed) return null;

  return (
    <div
      className="floating-vote-badge"
      role="complementary"
      aria-label="Tiếp sức bình chọn EaAgri tại NTTU Startup 2026"
    >
      <a
        href={NTTU_VOTE_CONFIG.url}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-vote-badge__link"
        title="Bình chọn dự án EaAgri tại NTTU Startup 2026"
      >
        <span className="floating-vote-badge__pulse" aria-hidden="true" />
        <span className="floating-vote-badge__live-dot" aria-hidden="true" />
        <i className="ri-trophy-fill floating-vote-badge__icon" />
        <span className="floating-vote-badge__votes">{NTTU_VOTE_CONFIG.currentVotes}</span>

        {/* Hover Tooltip Callout */}
        <div className="floating-vote-badge__tooltip">
          <span className="tooltip-title">🏆 NTTU Startup 2026</span>
          <span className="tooltip-sub">Đã đạt <strong>{NTTU_VOTE_CONFIG.currentVotes}</strong> vote • Bấm tiếp sức ngay! ➔</span>
        </div>
      </a>

      {/* Dismiss button */}
      <button
        type="button"
        className="floating-vote-badge__close"
        onClick={(e) => {
          e.stopPropagation();
          setIsDismissed(true);
        }}
        title="Ẩn huy hiệu"
        aria-label="Ẩn huy hiệu bình chọn"
      >
        <i className="ri-close-line" />
      </button>
    </div>
  );
}
