import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSEO } from "../hooks/useSEO";
import { AWARDS_LIST } from "../data/awards";

const DAY_MS = 24 * 60 * 60 * 1000;

const formatDayMonth = (d: Date) =>
  `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

// First upcoming milestone (with dates) that has not ended yet, for the event strip
function getUpcomingEvent() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const award of AWARDS_LIST) {
    for (const step of award.timeline ?? []) {
      if (!step.upcoming || !step.startDate) continue;
      const start = new Date(`${step.startDate}T00:00:00`);
      const end = new Date(`${step.endDate ?? step.startDate}T00:00:00`);
      if (today > end) continue;

      const sameDay = start.getTime() === end.getTime();
      return {
        award,
        step,
        daysLeft: Math.round((start.getTime() - today.getTime()) / DAY_MS),
        dateLabel: sameDay
          ? `${formatDayMonth(start)}/${start.getFullYear()}`
          : `${formatDayMonth(start)} – ${formatDayMonth(end)}/${end.getFullYear()}`,
      };
    }
  }
  return null;
}

export default function AwardsPage() {
  useSEO({
    title: "Phòng Truyền Thống & Giải Thưởng Vinh Danh | EaAgri",
    description:
      "Khám phá các dấu ấn danh giá của EaAgri: Quán quân Cuộc thi Trí Tuệ Nhân Tạo 2026, Giải Nhất Bảng 1C NTTU Innovation Startup Challenge 2026.",
    keywords:
      "Giải thưởng EaAgri, Quán quân AI 2026, NTTU Startup 2026, Khởi nghiệp nông nghiệp số, thành tựu EaAgri, bằng khen sầu riêng AI",
    canonicalUrl: "https://www.eaagri.vn/awards",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Phòng Truyền Thống & Giải Thưởng EaAgri",
      "description":
        "Hồ sơ thành tích, bằng khen và danh hiệu khoa học công nghệ của hệ sinh thái nông nghiệp thông minh EaAgri.",
      "url": "https://www.eaagri.vn/awards",
    },
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const upcomingEvent = getUpcomingEvent();


  return (
    <div className="awards-page">
      {/* 1. PANORAMIC SMART FARM HERO HEADER (EXACT MOCKUP DESIGN) */}
      <header className="awards-hero" data-aos="fade-down">
        <div className="awards-hero__bg-overlay" />

        <div className="section__container awards-hero__container">
          <div className="awards-hero__content-col">
            <div className="awards-hero__laurel-badge">
              <span className="badge-medal-icon">🏅</span>
              <span>EAAGRI HALL OF FAME • PHÒNG TRUYỀN THỐNG</span>
            </div>

            <h1 className="awards-hero__headline">
              Vinh Danh Thành Tựu & <br />
              <span className="green-accent-text">Giải Thưởng Quốc Gia</span>
            </h1>

            <p className="awards-hero__lead">
              Dấu ấn khẳng định năng lực công nghệ AI & IoT và giá trị ứng dụng thực tiễn của hệ sinh thái số nông nghiệp thông minh EaAgri từ các hội đồng khoa học uy tín.
            </p>

            <div className="awards-hero__actions">
              <a href="#awards-showcase" className="awards-hero-btn awards-hero-btn--primary">
                <span>Khám phá ngay</span>
                <i className="ri-arrow-right-line"></i>
              </a>
              <button
                type="button"
                className="awards-hero-btn awards-hero-btn--secondary"
                onClick={() => {
                  const target = document.getElementById("awards-showcase");
                  target?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <i className="ri-play-circle-fill"></i>
                <span>Xem giới thiệu</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. FLOATING HONORS PLAQUE (4 COLUMNS EXACTLY AS MOCKUP) */}
      <section className="awards-honors-section">
        <div className="section__container awards-honors-container">
          <div className="awards-honors-plaque" data-aos="fade-up" data-aos-delay="100">
            <div className="honor-plaque-col">
              <div className="honor-plaque-icon honor-plaque-icon--green">
                <i className="ri-trophy-fill"></i>
              </div>
              <div className="honor-plaque-text">
                <strong>Quán Quân AI 2026</strong>
                <span>Trí Tuệ Nhân Tạo Toàn Trường</span>
              </div>
            </div>

            <div className="honor-plaque-divider" />

            <div className="honor-plaque-col">
              <div className="honor-plaque-icon honor-plaque-icon--yellow">
                <i className="ri-notification-3-fill"></i>
              </div>
              <div className="honor-plaque-text">
                <strong>Nhất Bảng 1C Nông Nghiệp</strong>
                <span>NTTU Innovation Startup 2026</span>
              </div>
            </div>

            <div className="honor-plaque-divider" />

            <div className="honor-plaque-col">
              <div className="honor-plaque-icon honor-plaque-icon--blue">
                <i className="ri-shield-check-fill"></i>
              </div>
              <div className="honor-plaque-text">
                <strong>Hội Đồng Khoa Học Đánh Giá</strong>
                <span>Xuất sắc về tính ứng dụng thực tế</span>
              </div>
            </div>

            <div className="honor-plaque-divider" />

            <div className="honor-plaque-col">
              <div className="honor-plaque-icon honor-plaque-icon--purple">
                <i className="ri-medal-fill"></i>
              </div>
              <div className="honor-plaque-text">
                <strong>Tiến Thẳng Chung Kết</strong>
                <span>Ươm tạo doanh nghiệp thương mại</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. AWARDS SHOWCASE STAGE */}
      <main className="awards-showcase-section" id="awards-showcase">
        <div className="section__container awards-showcase-container">
          <header className="awards-showcase-heading" data-aos="fade-up">
            <span className="awards-showcase-heading__kicker">
              <i className="ri-award-fill"></i>
              Thành tích nổi bật
            </span>
            <h2>
              Giải Thưởng & <span>Cuộc Thi</span>
            </h2>
            <p>
              {AWARDS_LIST.length} dấu mốc EaAgri đạt được trong năm 2026. Chọn một giải để xem ảnh và hành trình chi tiết.
            </p>
          </header>

          {AWARDS_LIST.map((award, aIdx) => {
            const coverPhoto = award.images[0];
            const nextStep = award.timeline?.find((step) => step.upcoming && step.short);

            return (
              <Link
                key={award.id}
                to={`/awards/${award.id}`}
                className={`award-stage-card award-stage-card--${award.category}`}
                data-aos="fade-up"
                data-aos-delay={`${aIdx * 100}`}
              >
                <div className="award-stage-card__visual">
                  <div className="award-photo-frame">
                    <div className="award-photo-viewport">
                      <img
                        src={coverPhoto.url}
                        alt=""
                        aria-hidden="true"
                        className="award-photo-backdrop"
                        loading="lazy"
                      />
                      <img
                        src={coverPhoto.url}
                        alt={coverPhoto.title}
                        className="award-photo-main"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>

                <div className="award-stage-card__info">
                  <span className="award-card-kicker">
                    <i className={award.trophyIcon}></i>
                    {award.shortBadge}
                  </span>
                  <h2 className="award-title">{award.title}</h2>

                  {nextStep && (
                    <span className="award-card-upcoming">
                      <i className="ri-calendar-event-line"></i>
                      {nextStep.short}
                    </span>
                  )}

                  <div className="award-card-footer">
                    <span>{award.shortOrganizer}</span>
                    <span className="award-card-arrow" aria-hidden="true">
                      <i className="ri-arrow-right-up-line"></i>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}

          {/* Upcoming event strip, derived from award timelines; hides itself once the event ends */}
          {upcomingEvent && (
            <Link
              to={`/awards/${upcomingEvent.award.id}`}
              className="awards-upcoming-event"
              data-aos="fade-up"
            >
              <span className="awards-upcoming-event__icon" aria-hidden="true">
                <i className="ri-calendar-event-fill"></i>
              </span>

              <div className="awards-upcoming-event__body">
                <small>Sự kiện sắp tới</small>
                <strong>
                  {upcomingEvent.step.title} · {upcomingEvent.award.title}
                </strong>
                <span>
                  <i className="ri-time-line"></i> {upcomingEvent.dateLabel}
                  {upcomingEvent.step.location && (
                    <>
                      <i className="ri-map-pin-2-line"></i> {upcomingEvent.step.location}
                    </>
                  )}
                </span>
              </div>

              <span className="awards-upcoming-event__countdown">
                {upcomingEvent.daysLeft > 0 ? (
                  <>
                    <b>{upcomingEvent.daysLeft}</b> ngày nữa
                  </>
                ) : (
                  <b>Đang diễn ra</b>
                )}
              </span>

              <span className="awards-upcoming-event__cta">
                Xem hành trình <i className="ri-arrow-right-line"></i>
              </span>
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
