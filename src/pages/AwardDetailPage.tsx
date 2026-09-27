import { useState, useEffect } from "react";
import { Link, Navigate, useParams, useLocation } from "react-router-dom";
import { useSEO } from "../hooks/useSEO";
import { AWARDS_LIST, AWARDS_PATH, awardPath, getAwardById, getAwardByLegacyId } from "../data/awards";

export default function AwardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const award = getAwardById(id);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const photoCount = award?.images.length ?? 0;

  const showPrev = () => setPhotoIdx((i) => (i - 1 + photoCount) % photoCount);
  const showNext = () => setPhotoIdx((i) => (i + 1) % photoCount);

  useSEO({
    title: award ? `${award.title} – Giải thưởng` : "Không tìm thấy giải thưởng",
    description: award?.description,
    ogImage: award ? `https://www.eaagri.vn${encodeURI(award.images[0].url)}` : undefined,
    canonicalUrl: award ? `https://www.eaagri.vn${awardPath(award.id)}` : undefined,
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setPhotoIdx(0);
  }, [id]);

  // Arrow keys switch photos
  useEffect(() => {
    if (photoCount <= 1) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setPhotoIdx((i) => (i - 1 + photoCount) % photoCount);
      else if (e.key === "ArrowRight") setPhotoIdx((i) => (i + 1) % photoCount);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [photoCount]);

  // Auto-advance photos every 5s. Depends on photoIdx so any manual change
  // restarts the countdown; paused on hover and for reduced-motion users.
  useEffect(() => {
    if (photoCount <= 1 || isPaused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Interval (not timeout) so the slider resumes after the tab was hidden
    const timer = window.setInterval(() => {
      if (!document.hidden) setPhotoIdx((i) => (i + 1) % photoCount);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [photoIdx, photoCount, isPaused]);

  // Old English slug (/awards/ai-champion-2026 or /awards/...) -> new Vietnamese URL
  if (award && location.pathname.startsWith("/awards/")) {
    return <Navigate to={awardPath(award.id)} replace />;
  }

  if (!award) {
    const renamed = getAwardByLegacyId(id);
    if (renamed) return <Navigate to={awardPath(renamed.id)} replace />;

    return (
      <div className="award-detail-page">
        <div className="section__container award-detail-page__container award-detail-page__empty">
          <h1>Không tìm thấy giải thưởng</h1>
          <Link to={AWARDS_PATH} className="award-detail-back">
            <i className="ri-arrow-left-line"></i>
            <span>Quay lại Phòng truyền thống</span>
          </Link>
        </div>
      </div>
    );
  }

  const photo = award.images[photoIdx] || award.images[0];
  const otherAwards = AWARDS_LIST.filter((a) => a.id !== award.id);

  return (
    <div className={`award-detail-page award-detail-page--${award.category}`}>
      {/* Compact banner, same landscape as the awards list hero */}
      <header className="awards-hero awards-hero--compact">
        <div className="awards-hero__bg-overlay" />

        <div className="section__container awards-hero__container">
          <div className="awards-hero__content-col">
            <nav className="award-detail-breadcrumb" aria-label="Breadcrumb">
              <Link to={AWARDS_PATH}>
                <i className="ri-arrow-left-line"></i>
                <span>Phòng truyền thống</span>
              </Link>
              <i className="ri-arrow-right-s-line"></i>
              <span>{award.shortBadge}</span>
            </nav>

            <div className="awards-hero__laurel-badge">
              <i className={award.trophyIcon}></i>
              <span>
                {award.badgeText} • {award.year}
              </span>
            </div>

            <h1 className="awards-hero__headline">{award.title}</h1>

            <p className="awards-hero__lead award-detail-organizer">
              <i className="ri-government-line"></i>
              <span>{award.organizer}</span>
            </p>
          </div>
        </div>
      </header>

      <div className="section__container award-detail-page__container">
        <article className="award-detail-layout">
          {/* Media: photo + thumbnails + caption */}
          <div className="award-detail-layout__media">
            <div
              className="award-detail-layout__photo"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* key forces a fresh fade-in on every photo change */}
              <img key={`bg-${photo.url}`} src={photo.url} alt="" aria-hidden="true" className="award-photo-backdrop" />
              <img key={photo.url} src={photo.url} alt={photo.title} className="award-detail-layout__photo-main" />

              {photoCount > 1 && (
                <>
                  <button
                    type="button"
                    className="award-detail-layout__nav award-detail-layout__nav--prev"
                    onClick={showPrev}
                    aria-label="Ảnh trước"
                  >
                    <i className="ri-arrow-left-s-line"></i>
                  </button>
                  <button
                    type="button"
                    className="award-detail-layout__nav award-detail-layout__nav--next"
                    onClick={showNext}
                    aria-label="Ảnh kế tiếp"
                  >
                    <i className="ri-arrow-right-s-line"></i>
                  </button>
                  <span className="award-detail-layout__counter">
                    {photoIdx + 1} / {photoCount}
                  </span>
                </>
              )}
            </div>

            {award.images.length > 1 && (
              <div className="award-detail-layout__thumbs">
                {award.images.map((thumb, tIdx) => (
                  <button
                    key={tIdx}
                    type="button"
                    className={`thumb-button ${tIdx === photoIdx ? "is-active" : ""}`}
                    onClick={() => setPhotoIdx(tIdx)}
                    title={thumb.title}
                  >
                    <img src={thumb.url} alt={thumb.title} />
                  </button>
                ))}
              </div>
            )}

            <div className="award-detail-layout__caption">
              <strong>{photo.title}</strong>
              <p>{photo.caption}</p>
            </div>
          </div>

          {/* Body: full contest details */}
          <div className="award-detail-layout__body">
            <h2 className="award-detail-subheading">Giới thiệu</h2>
            <p className="award-lead-desc">{award.description}</p>

            <div className="award-detail-metrics">
              {award.metrics.map((m, mIdx) => (
                <div key={mIdx} className="award-detail-metric">
                  <i className={m.icon}></i>
                  <span>{m.label}</span>
                  <strong>{m.value}</strong>
                </div>
              ))}
            </div>

            <h2 className="award-detail-subheading">Điểm nổi bật</h2>
            <ul className="award-highlights-clean">
              {award.keyPoints.map((pt, pIdx) => (
                <li key={pIdx}>
                  <i className="ri-checkbox-circle-fill"></i>
                  <div>
                    <strong>{pt.title}:</strong> {pt.desc}
                  </div>
                </li>
              ))}
            </ul>

            {award.timeline && award.timeline.length > 0 && (
              <>
                <h2 className="award-detail-subheading">Hành trình</h2>
                <ol className="award-timeline">
                  {award.timeline.map((step, sIdx) => (
                    <li
                      key={sIdx}
                      className={`award-timeline__step ${step.upcoming ? "is-upcoming" : ""}`}
                    >
                      <span className="award-timeline__dot" aria-hidden="true">
                        <i className={step.upcoming ? "ri-time-line" : "ri-check-line"}></i>
                      </span>
                      <div className="award-timeline__content">
                        <small>{step.date}</small>
                        <strong>{step.title}</strong>
                        {step.desc && <p>{step.desc}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              </>
            )}

            {(award.verificationUrl || award.facebookUrl) && (
              <div className="award-verification-seal">
                <div className="seal-badge">
                  <i className="ri-verified-badge-fill"></i>
                  <span>Xác thực bởi Khoa CNTT — ĐH Nguyễn Tất Thành</span>
                </div>

                <div className="seal-links">
                  {award.verificationUrl && (
                    <a
                      href={award.verificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="seal-btn seal-btn--article"
                    >
                      <span>Bài viết</span>
                      <i className="ri-arrow-right-up-line"></i>
                    </a>
                  )}
                  {award.facebookUrl && (
                    <a
                      href={award.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="seal-btn seal-btn--facebook"
                      title="Xem Facebook"
                    >
                      <i className="ri-facebook-fill"></i>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Other awards */}
        {otherAwards.length > 0 && (
          <nav className="award-detail-others" aria-label="Giải thưởng khác">
            <span className="award-detail-subheading">Giải thưởng khác</span>
            <div className="award-detail-others__list">
              {otherAwards.map((a) => (
                <Link key={a.id} to={awardPath(a.id)} className="award-detail-others__item">
                  <img src={a.images[0].url} alt="" loading="lazy" />
                  <div>
                    <small>{a.shortBadge}</small>
                    <strong>{a.title}</strong>
                  </div>
                  <i className="ri-arrow-right-line"></i>
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}
