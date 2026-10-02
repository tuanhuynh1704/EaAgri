import { useState, useRef } from "react";

interface AdvisorMember {
  name: string;
  roleTag: string;
  subRole: string;
  organization: string;
  task: string;
  avatar: string;
  themeColor: "gold" | "emerald" | "blue" | "teal" | "purple" | "orange";
  topIcon: string;
  advisorCode: string;
  orgIcon: string;
  stats?: { value: string; label: string }[];
  fields?: string[];
  contact?: { phone?: string; email?: string };
}

const advisors: AdvisorMember[] = [
  {
    name: "Nguyễn Khắc Minh Trí",
    roleTag: "MENTOR",
    subRole: "Co-Founder & CEO, MimosaTEK",
    organization: "Mimosa Technology",
    task: "Định hướng chiến lược IoT, giải pháp Agtech & mô hình thương mại hóa bền vững.",
    avatar: "/images/webp/advisors/nguyen-khac-minh-tri.webp",
    themeColor: "gold",
    topIcon: "ri-star-smile-fill",
    advisorCode: "ADV-01",
    orgIcon: "ri-medal-fill",
    stats: [
      { value: "20+", label: "năm CNTT & Viễn thông" },
      { value: "12+", label: "năm Founder / CEO" },
    ],
    fields: ["Agtech", "IoT nông nghiệp", "Chuyển đổi số", "Phát triển bền vững"],
  },
  {
    name: "Nguyễn Lâm Chí Hải",
    roleTag: "MENTOR",
    subRole: "Cố vấn Chiến lược Khởi nghiệp",
    organization: "Mạng lưới Cố vấn Khởi nghiệp",
    task: "Cố vấn phát triển mô hình kinh doanh, quản trị doanh thu & chiến lược kết nối nguồn vốn đầu tư.",
    avatar: "/images/webp/advisors/nguyen-chi-hai.webp",
    themeColor: "orange",
    topIcon: "ri-funds-line",
    advisorCode: "ADV-02",
    orgIcon: "ri-briefcase-4-fill",
    stats: [
      { value: "15+", label: "năm Đầu tư & Quản trị" },
      { value: "Top", label: "Mentor Khởi nghiệp" },
    ],
    fields: ["Mô hình kinh doanh", "Chiến lược gọi vốn", "Phát triển thị trường"],
  },
  {
    name: "ThS. LIANG GUEI JIA",
    roleTag: "CỐ VẤN KHOA HỌC QUỐC TẾ",
    subRole: "Nghiên cứu viên Dự án — NSTC Đài Loan",
    organization: "NSTC Đài Loan 🇹🇼",
    task: "Cố vấn canh tác sinh thái, quản lý dinh dưỡng & chuẩn hóa sầu riêng chất lượng cao.",
    avatar: "/images/webp/advisors/liang-guei-jia.webp",
    themeColor: "emerald",
    topIcon: "ri-global-line",
    advisorCode: "ADV-03",
    orgIcon: "ri-global-line",
    fields: ["Canh tác sinh thái", "Dinh dưỡng cây trồng", "Quy trình xuất khẩu"],
    contact: {
      phone: "0782-711721",
      email: "horticulture1992@gmail.com",
    },
  },
  {
    name: "ThS. NGUYỄN HUỲNH THÔNG",
    roleTag: "CỐ VẤN CHUYÊN MÔN CNTT",
    subRole: "Giảng viên Khoa CNTT — ĐH Nguyễn Tất Thành",
    organization: "ĐH Nguyễn Tất Thành",
    task: "Cố vấn kiến trúc hệ thống phần mềm, an toàn thông tin & công nghệ nền tảng.",
    avatar: "/images/webp/advisors/nguyen-huynh-thong.webp",
    themeColor: "blue",
    topIcon: "ri-graduation-cap-fill",
    advisorCode: "ADV-04",
    orgIcon: "ri-school-line",
    fields: ["Kiến trúc phần mềm", "Bảo mật hệ thống", "Cloud & Web"],
  },
  {
    name: "ThS. PHẠM ĐÌNH TÀI",
    roleTag: "CỐ VẤN CHUYÊN MÔN CNTT",
    subRole: "Giảng viên Khoa CNTT — ĐH Nguyễn Tất Thành",
    organization: "ĐH Nguyễn Tất Thành",
    task: "Cố vấn giải pháp hệ thống thông tin, tối ưu hóa CSDL & số hóa nông nghiệp.",
    avatar: "/images/webp/advisors/pham-dinh-tai.webp",
    themeColor: "teal",
    topIcon: "ri-graduation-cap-fill",
    advisorCode: "ADV-05",
    orgIcon: "ri-school-line",
    fields: ["Hệ thống thông tin", "Cơ sở dữ liệu", "Phân tích dữ liệu"],
  },
  {
    name: "TS. HOÀNG THỊNH NHÂN",
    roleTag: "CỐ VẤN CHUYÊN MÔN CNTT",
    subRole: "Giảng viên Khoa CNTT — ĐH Nguyễn Tất Thành",
    organization: "ĐH Nguyễn Tất Thành",
    task: "Cố vấn học thuật, mô hình giải thuật toán học & phương pháp nghiên cứu AI chuyên sâu.",
    avatar: "/images/webp/advisors/hoang-thinh-nhan.webp",
    themeColor: "purple",
    topIcon: "ri-graduation-cap-fill",
    advisorCode: "ADV-06",
    orgIcon: "ri-school-line",
    fields: ["Khoa học máy tính", "Mô hình toán học", "Thuật toán AI"],
  },
];

export default function AdvisorsSection() {
  const [flippedAdvisorCards, setFlippedAdvisorCards] = useState<{ [key: number]: boolean }>({});
  const [activeAdvisorIndex, setActiveAdvisorIndex] = useState(0);
  const advisorCardsContainerRef = useRef<HTMLDivElement>(null);
  const advisorTouchStartXRef = useRef<number>(0);
  const advisorTouchStartYRef = useRef<number>(0);
  const advisorTouchStartTimeRef = useRef<number>(0);
  const advisorIsSwipingRef = useRef<boolean>(false);
  const advisorSwipeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleAdvisorTouchStart = (e: React.TouchEvent) => {
    advisorTouchStartXRef.current = e.touches[0].clientX;
    advisorTouchStartYRef.current = e.touches[0].clientY;
    advisorTouchStartTimeRef.current = Date.now();
    advisorIsSwipingRef.current = false;
    if (advisorSwipeTimerRef.current) {
      clearTimeout(advisorSwipeTimerRef.current);
      advisorSwipeTimerRef.current = null;
    }
  };

  const handleAdvisorTouchMove = (e: React.TouchEvent) => {
    const deltaX = Math.abs(e.touches[0].clientX - advisorTouchStartXRef.current);
    const deltaY = Math.abs(e.touches[0].clientY - advisorTouchStartYRef.current);
    if (deltaX > 10 || deltaY > 10) {
      advisorIsSwipingRef.current = true;
    }
  };

  const handleAdvisorTouchEnd = (e: React.TouchEvent) => {
    const touchDuration = Date.now() - advisorTouchStartTimeRef.current;
    if (e.changedTouches && e.changedTouches[0]) {
      const deltaX = Math.abs(e.changedTouches[0].clientX - advisorTouchStartXRef.current);
      const deltaY = Math.abs(e.changedTouches[0].clientY - advisorTouchStartYRef.current);
      if (deltaX <= 10 && deltaY <= 10 && touchDuration < 350) {
        advisorIsSwipingRef.current = false;
        return;
      }
    }
    if (advisorIsSwipingRef.current) {
      advisorSwipeTimerRef.current = setTimeout(() => {
        advisorIsSwipingRef.current = false;
      }, 100);
    }
  };

  const handleAdvisorScroll = () => {
    const container = advisorCardsContainerRef.current;
    if (!container) return;
    const scrollLeft = container.scrollLeft;
    const firstCard = container.firstElementChild as HTMLElement | null;
    const cardWidth = firstCard ? firstCard.offsetWidth : 220;
    const gap = 16;
    const index = Math.round(scrollLeft / (cardWidth + gap));
    setActiveAdvisorIndex(Math.max(0, Math.min(advisors.length - 1, index)));
  };

  const handleAdvisorCardClick = (index: number) => {
    if (advisorIsSwipingRef.current) {
      advisorIsSwipingRef.current = false;
      return;
    }
    setFlippedAdvisorCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const scrollToAdvisorCard = (index: number) => {
    const container = advisorCardsContainerRef.current;
    if (!container) return;
    const cards = container.querySelectorAll(".advisor-card");
    if (cards[index]) {
      (cards[index] as HTMLElement).scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
      setActiveAdvisorIndex(index);
    }
  };

  return (
    <section id="section-advisors" className="team-showcase advisors-section fullpage-slide">
      <div id="section-expert" style={{ position: "relative", top: "-80px" }}></div>
      <div className="team-showcase__container">
        {/* ADVISORY & MENTOR BOARD HEADER */}
        <div className="team-showcase__header" data-aos="fade-up">
          <span className="team-showcase__label team-showcase__label--gold">
            <span className="team-showcase__status-dot team-showcase__status-dot--gold"></span>
            EAAGRI / ADVISORY &amp; MENTORS
          </span>
          <h2 className="team-showcase__title">
            Hội Đồng <span className="team-showcase__title-highlight team-showcase__title-highlight--gold">Cố Vấn &amp; Chuyên Gia</span>
          </h2>
          <p className="team-showcase__desc">
            Đội ngũ cố vấn khoa học quốc tế, nhà đầu tư giàu kinh nghiệm và các chuyên gia học thuật hàng đầu đồng hành cùng sự phát triển của EaAgri.
          </p>
        </div>

        {/* 6 Advisor Cards Grid (Responsive + Mobile 3D Flip) */}
        <div
          ref={advisorCardsContainerRef}
          className="advisor-cards"
          data-aos="fade-up"
          data-aos-delay="100"
          onTouchStart={handleAdvisorTouchStart}
          onTouchMove={handleAdvisorTouchMove}
          onTouchEnd={handleAdvisorTouchEnd}
          onScroll={handleAdvisorScroll}
        >
          {advisors.map((advisor, index) => (
            <div
              className={`advisor-card advisor-card--${advisor.themeColor} ${flippedAdvisorCards[index] ? "is-flipped" : ""}`}
              key={advisor.advisorCode}
              onClick={() => handleAdvisorCardClick(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleAdvisorCardClick(index);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`Xem thông tin cố vấn ${advisor.name}`}
            >
              <div className="advisor-card__flipper">
                {/* FRONT: Ảnh trên, chữ ở dưới */}
                <div className="advisor-card__front">
                  <div className="advisor-card__image-box">
                    <img
                      src={advisor.avatar}
                      alt={advisor.name}
                      className="advisor-card__avatar-img"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        if (advisor.avatar.includes("chuyen-gia") || advisor.avatar.includes("liang-guei-jia")) {
                          (e.target as HTMLImageElement).src = "/images/webp/chuyen-gia.webp";
                        }
                      }}
                    />
                  </div>

                  <div className="advisor-card__body">
                    <h3 className="advisor-card__name">{advisor.name}</h3>
                    <p className="advisor-card__subrole">{advisor.subRole}</p>
                  </div>
                </div>

                {/* BACK: Detailed credentials revealed upon flip */}
                <div className="advisor-card__back">
                  <div className="advisor-card__back-main">
                    <h3 className="advisor-card__back-name">{advisor.name}</h3>
                    <p className="advisor-card__back-subrole">{advisor.subRole}</p>
                    {advisor.task && (
                      <p className="advisor-card__back-task">{advisor.task}</p>
                    )}
                  </div>

                  <div className="advisor-card__back-bottom">
                    <div
                      className="advisor-card__back-return-pill"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdvisorCardClick(index);
                      }}
                    >
                      <i className="ri-arrow-go-back-line"></i>
                      <span>Lật lại</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Advisor Mobile Pagination Dots */}
        <div className="team-showcase__mobile-nav">
          <div className="team-showcase__pagination" aria-label="Advisors navigation">
            {advisors.map((advisor, idx) => (
              <button
                key={idx}
                type="button"
                className={`team-showcase__dot team-showcase__dot--${advisor.themeColor} ${activeAdvisorIndex === idx ? "is-active" : ""}`}
                onClick={() => scrollToAdvisorCard(idx)}
                aria-label={`Xem cố vấn ${advisor.name}`}
              />
            ))}
          </div>
          <div className="team-showcase__swipe-hint" aria-hidden="true">
            <i className="ri-arrow-left-s-line"></i>
            <span>Vuốt để xem thêm cố vấn</span>
            <i className="ri-arrow-right-s-line"></i>
          </div>
        </div>
      </div>
    </section>
  );
}
