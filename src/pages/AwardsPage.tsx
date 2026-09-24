import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSEO } from "../hooks/useSEO";
import { createPortal } from "react-dom";

interface GalleryImage {
  url: string;
  title: string;
  caption: string;
}

interface AwardDetail {
  id: string;
  category: "ai" | "startup";
  year: string;
  trophyIcon: string;
  badgeText: string;
  title: string;
  organizer: string;
  description: string;
  keyPoints: {
    icon: string;
    title: string;
    desc: string;
  }[];
  images: GalleryImage[];
  metrics: {
    label: string;
    value: string;
    icon: string;
  }[];
  verificationUrl?: string;
  facebookUrl?: string;
}

const AWARDS_LIST: AwardDetail[] = [
  {
    id: "ai-champion-2026",
    category: "ai",
    year: "2026",
    trophyIcon: "ri-vip-crown-fill",
    badgeText: "QUÁN QUÂN TOÀN TRƯỜNG • EXCELLENT NO. 1",
    title: "Cuộc Thi Trí Tuệ Nhân Tạo 2026",
    organizer: "Khoa Công Nghệ Thông Tin — Trường Đại học Nguyễn Tất Thành",
    description:
      'Vượt qua hàng chục đề tài công nghệ AI chuyên sâu, dự án EaAgri đã xuất sắc giành ngôi vị Quán quân cao nhất nhờ mô hình "Trợ lý nông nghiệp thông minh" tích hợp mạng nơ-ron nhận diện sâu bệnh và hệ thống khuyến nông tự động.',
    keyPoints: [
      {
        icon: "ri-cpu-line",
        title: "Lõi AI Tự Huấn Luyện & Nhận Diện Đa Tầng",
        desc: "Ứng dụng mô hình thị giác máy tính YOLOv9 kết hợp phân tích tương quan vi khí hậu, phát hiện sớm bệnh xì mủ, thán thư với độ chính xác trên 92%.",
      },
      {
        icon: "ri-shield-star-line",
        title: "Đánh Giá Xuất Sắc Từ Hội Đồng Khoa Học",
        desc: "Hệ thống được các chuyên gia đầu ngành đánh giá là giải pháp thực chứng có tính khả thi cao nhất nhằm hóa giải rủi ro thời tiết và dịch bệnh tại vùng sầu riêng Tây Nguyên.",
      },
      {
        icon: "ri-seedling-line",
        title: "Bệ Phóng Chuyển Đổi Số Nông Nghiệp",
        desc: "Giải thưởng là động lực mạnh mẽ để nhóm kỹ sư tiếp tục hoàn thiện, chuẩn hóa quy trình VietGAP số hóa, đồng hành lâu dài cùng bà con nông dân.",
      },
    ],
    images: [
      {
        url: "/assets/IMG_2695.JPEG",
        title: "Giấy Chứng Nhận & Cúp Vinh Danh Quán Quân",
        caption: "Bằng khen Quán quân cuộc thi Trí Tuệ Nhân Tạo 2026 cùng cúp vinh danh trao tặng cho dự án EaAgri.",
      },
    ],
    metrics: [
      { icon: "ri-trophy-fill", label: "Thứ hạng", value: "Quán Quân (No. 1)" },
      { icon: "ri-cpu-fill", label: "Độ chính xác AI", value: "> 92%" },
      { icon: "ri-leaf-fill", label: "Hạng mục", value: "AI Nông Nghiệp" },
    ],
  },
  {
    id: "nttu-startup-2026",
    category: "startup",
    year: "2026",
    trophyIcon: "ri-rocket-2-fill",
    badgeText: "GIẢI NHẤT BẢNG 1C • BÁN KẾT TOÀN QUỐC",
    title: "NTTU Innovation Startup Challenge 2026",
    organizer: "Trung tâm Đổi mới Sáng tạo & Ươm tạo Doanh nghiệp NIIC — ĐH Nguyễn Tất Thành",
    description:
      "Dự án EaAgri (Mã dự thi NTT-144) xuất sắc dẫn đầu Bảng 1C (Công nghệ Nông nghiệp & Công nghệ Thực phẩm), giành tấm vé danh giá tiến thẳng vào Vòng Chung Kết toàn quốc.",
    keyPoints: [
      {
        icon: "ri-funds-line",
        title: "Tiềm Năng Thương Mại Hóa & Thị Trường Thực Địa",
        desc: "Mô hình kinh doanh khả thi, giải pháp đo đạc độ ẩm đất đa tầng và dự báo sâu bệnh được các quỹ đầu tư mạo hiểm và giám khảo doanh nghiệp đánh giá rất cao.",
      },
      {
        icon: "ri-user-star-line",
        title: "Báo Cáo Thuyết Phục Trước Hội Đồng Giám Khảo",
        desc: "Đội ngũ sáng lập đã trình diễn thiết bị cảm biến IoT thực tế kết hợp ứng dụng di động EaAgri, nhận được phản hồi tích cực về tính tiện dụng cho người nông dân.",
      },
      {
        icon: "ri-medal-fill",
        title: "Tiến Thẳng Chung Kết & Ươm Tạo Doanh Nghiệp",
        desc: "Thành tích Bán kết mở ra cơ hội kết nối cố vấn chuyên gia quốc tế, bảo trợ pháp lý và tài trợ ươm tạo mở rộng quy mô hợp tác xã tại Đắk Lắk.",
      },
    ],
    images: [
      {
        url: "/Khởi nghiệp 3.jpg",
        title: "Bằng Khen Giải Nhất Bảng 1C & Huy Chương",
        caption: "Giấy chứng nhận Giải Nhất Bảng 1C cùng Huy chương danh dự từ Ban Tổ Chức NTTU Innovation Startup 2026.",
      },
      {
        url: "/Khởi nghiệp 1.jpg",
        title: "Trình Báo Cáo Hội Đồng Ban Giám Khảo",
        caption: "Đội ngũ kỹ sư EaAgri thuyết minh mô hình trạm quan trắc IoT và giải thuật AI tại bàn triển lãm vòng Bán kết.",
      },
      {
        url: "/Khởi nghiệp 2.jpg",
        title: "Đội Ngũ Sáng Lập EaAgri",
        caption: "Các thành viên nòng cốt của dự án EaAgri trong ngày vinh danh chiến thắng vòng Bán kết.",
      },
    ],
    metrics: [
      { icon: "ri-medal-fill", label: "Bảng đấu", value: "Nhất Bảng 1C" },
      { icon: "ri-flag-fill", label: "Vòng thi", value: "Tiến Chung Kết" },
      { icon: "ri-barcode-line", label: "Mã dự thi", value: "NTT-144" },
    ],
    verificationUrl:
      "https://cntt.ntt.edu.vn/nghien-cuu-khoa-hoc/phat-trien-san-pham/ea-agri-xuat-sac-gianh-giai-nhat-vong-ban-ket-nttu-innovation-startup-challenge-2026-bang-cong-nghe-nong-nghiep-va-cong-nghe-thuc-pham/",
    facebookUrl: "https://www.facebook.com/share/p/1CA44S7p5M/",
  },
];

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

  const [activeFilter, setActiveFilter] = useState<"all" | "ai" | "startup">("all");
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState<Record<string, number>>({
    "ai-champion-2026": 0,
    "nttu-startup-2026": 0,
  });
  const [lightboxImg, setLightboxImg] = useState<{ url: string; title: string; caption: string } | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const filteredAwards =
    activeFilter === "all"
      ? AWARDS_LIST
      : AWARDS_LIST.filter((a) => a.category === activeFilter);

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

      {/* 3. FLOATING SEGMENTED FILTER */}
      <section className="awards-filter-section" id="awards-showcase">
        <div className="section__container awards-filter-container">
          <div className="awards-segmented-pill">
            <button
              className={`awards-segmented-btn ${activeFilter === "all" ? "is-active" : ""}`}
              onClick={() => setActiveFilter("all")}
            >
              <i className="ri-apps-2-line"></i>
              <span>Tất cả giải thưởng ({AWARDS_LIST.length})</span>
            </button>
            <button
              className={`awards-segmented-btn ${activeFilter === "ai" ? "is-active" : ""}`}
              onClick={() => setActiveFilter("ai")}
            >
              <i className="ri-vip-crown-line"></i>
              <span>Trí Tuệ Nhân Tạo (AI)</span>
            </button>
            <button
              className={`awards-segmented-btn ${activeFilter === "startup" ? "is-active" : ""}`}
              onClick={() => setActiveFilter("startup")}
            >
              <i className="ri-rocket-2-line"></i>
              <span>Khởi Nghiệp ĐMST</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. AWARDS SHOWCASE STAGE */}
      <main className="awards-showcase-section">
        <div className="section__container awards-showcase-container">
          {filteredAwards.map((award, aIdx) => {
            const currentImgIdx = selectedPhotoIdx[award.id] || 0;
            const currentPhoto = award.images[currentImgIdx] || award.images[0];

            return (
              <article
                key={award.id}
                className={`award-stage-card award-stage-card--${award.category}`}
                data-aos="fade-up"
                data-aos-delay={`${aIdx * 100}`}
              >
                {/* Left Stage: Compact Refined Photo Display */}
                <div className="award-stage-card__visual">
                  <div className="award-photo-frame">
                    <div
                      className="award-photo-viewport"
                      onClick={() => setLightboxImg(currentPhoto)}
                      title="Nhấn để phóng to ảnh"
                    >
                      <img
                        src={currentPhoto.url}
                        alt={currentPhoto.title}
                        className="award-photo-main"
                        loading="lazy"
                      />
                      <div className="award-photo-hover-pill">
                        <i className="ri-fullscreen-line"></i>
                        <span>Phóng to</span>
                      </div>
                    </div>

                    {/* Compact Thumbnails (if multiple photos) */}
                    {award.images.length > 1 && (
                      <div className="award-photo-thumbs">
                        {award.images.map((thumb, tIdx) => (
                          <button
                            key={tIdx}
                            type="button"
                            className={`thumb-button ${tIdx === currentImgIdx ? "is-active" : ""}`}
                            onClick={() =>
                              setSelectedPhotoIdx((prev) => ({
                                ...prev,
                                [award.id]: tIdx,
                              }))
                            }
                            title={thumb.title}
                          >
                            <img src={thumb.url} alt={thumb.title} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Stage: Sleek Credentials & Key Points */}
                <div className="award-stage-card__info">
                  <div className="award-header-pill-row">
                    <span className="award-laurel-badge">
                      <i className={award.trophyIcon}></i>
                      {award.badgeText}
                    </span>
                    <span className="award-year-badge">{award.year}</span>
                  </div>

                  <h2 className="award-title">{award.title}</h2>

                  <div className="award-organizer-row">
                    <i className="ri-government-line"></i>
                    <span>{award.organizer}</span>
                  </div>

                  <p className="award-lead-desc">{award.description}</p>

                  {/* Compact Pill Tags Row */}
                  <div className="award-tags-row">
                    {award.metrics.map((m, mIdx) => (
                      <span key={mIdx} className="award-tag-pill">
                        <i className={m.icon}></i>
                        <span>{m.value}</span>
                      </span>
                    ))}
                  </div>

                  {/* Sleek Bullet Points (Replaces clunky heavy boxes) */}
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

                  {/* Minimalist Verification Seal & Action */}
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
            );
          })}

          {/* 4. UPCOMING MILESTONES / PATENT PENDING SLOT */}
          <div className="awards-upcoming-banner" data-aos="fade-up">
            <div className="awards-upcoming-banner__icon">
              <i className="ri-hourglass-2-fill"></i>
            </div>
            <div className="awards-upcoming-banner__content">
              <span className="upcoming-tag">HỒ SƠ ĐANG THẨM ĐỊNH & PHÁT TRIỂN TIẾP THEO</span>
              <h3>Đăng Ký Sở Hữu Trí Tuệ & Chuẩn Hóa Mã Vùng Trồng VietGAP</h3>
              <p>
                EaAgri đang xúc tiến hoàn thiện hồ sơ Đăng ký Bản quyền Phần mềm AI nông nghiệp và bảo hộ Giải pháp hữu ích cho Thiết bị IoT đo độ ẩm đất đa tầng, đồng thời xây dựng bộ tiêu chuẩn truy xuất nguồn gốc sầu riêng liên kết tại Tây Nguyên.
              </p>
            </div>
            <Link to="/architecture" className="upcoming-action-btn">
              <span>Xem kiến trúc hệ thống</span>
              <i className="ri-arrow-right-line"></i>
            </Link>
          </div>
        </div>
      </main>

      {/* 5. PRESS & ACADEMIC RECOGNITION */}
      <section className="awards-press-section">
        <div className="section__container awards-press-container">
          <div className="awards-press__heading" data-aos="fade-up">
            <span className="gold-sub-tag">EXPERT TESTIMONIALS</span>
            <h2>Hội Đồng Chuyên Môn Đánh Giá</h2>
            <p>Nhận định từ các giám khảo cuộc thi công nghệ và nhà khoa học cố vấn.</p>
          </div>

          <div className="awards-press__grid">
            <div className="press-quote-box" data-aos="fade-up" data-aos-delay="100">
              <div className="quote-icon"><i className="ri-double-quotes-l"></i></div>
              <p className="quote-body">
                "EaAgri mang lại góc tiếp cận thực tế khi giải quyết được đúng nỗi đau lớn nhất của bà con nông dân trồng sầu riêng: rủi ro về tưới tiêu và dịch bệnh xì mủ. Sự kết hợp giữa AI và IoT chi phí thấp giúp nhà nông dễ dàng làm chủ công nghệ cao."
              </p>
              <div className="quote-footer">
                <strong>Hội Đồng Giám Khảo NTTU Startup Challenge 2026</strong>
                <span>Trung tâm Đổi mới Sáng tạo & Ươm tạo Doanh nghiệp (NIIC)</span>
              </div>
            </div>

            <div className="press-quote-box" data-aos="fade-up" data-aos-delay="200">
              <div className="quote-icon"><i className="ri-double-quotes-l"></i></div>
              <p className="quote-body">
                "Đề tài đạt giải Quán quân AI 2026 nhờ khả năng tự tối ưu hóa mô hình nhận diện bệnh trên lá và thân cây sầu riêng với độ chính xác thực tế cao, giao diện trực quan và sẵn sàng cho việc thương mại hóa trên diện rộng."
              </p>
              <div className="quote-footer">
                <strong>Khoa Công Nghệ Thông Tin</strong>
                <span>Hội đồng chấm thi Cuộc thi Trí Tuệ Nhân Tạo 2026</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION (SIMPLE & CLEAN) */}
      <section className="awards-cta-banner">
        <div className="section__container awards-cta-container">
          <div className="awards-cta-card">
            <h3>Đồng Hành Cùng Công Nghệ Nông Nghiệp EaAgri</h3>
            <p>
              Kết nối trực tiếp cùng đội ngũ sáng lập để triển khai giải pháp IoT &amp; AI cho vườn sầu riêng.
            </p>
            <div className="awards-cta-card__actions">
              <a href="tel:0782711721" className="awards-cta-btn awards-cta-btn--primary">
                <i className="ri-phone-fill"></i>
                <span>Hotline: 0782-711721</span>
              </a>
              <Link to="/" className="awards-cta-btn awards-cta-btn--secondary">
                <i className="ri-arrow-left-line"></i>
                <span>Về Trang Chủ</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FULLSCREEN LIGHTBOX MODAL */}
      {lightboxImg &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="awards-lightbox-backdrop"
            onClick={() => setLightboxImg(null)}
          >
            <div
              className="awards-lightbox-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="lightbox-close-btn"
                onClick={() => setLightboxImg(null)}
                aria-label="Đóng cửa sổ xem ảnh"
              >
                <i className="ri-close-line"></i>
              </button>
              <div className="lightbox-image-container">
                <img src={lightboxImg.url} alt={lightboxImg.title} />
              </div>
              <div className="lightbox-caption-bar">
                <h3>{lightboxImg.title}</h3>
                <p>{lightboxImg.caption}</p>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
