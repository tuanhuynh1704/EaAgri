import { useState, useRef } from "react";

interface TeamMember {
  name: string;
  roleTag: string;
  task: string;
  avatar: string;
  themeColor: "green" | "blue" | "purple" | "orange";
  topIcon: string;
  roleIcon: string;
  skillIcon: string;
  decorIcon1: string;
  decorIcon2: string;
  memberCode: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "PHAN ĐĂNG HUY",
    roleTag: "FOUNDER & CEO",
    task: "Chiến lược sản phẩm - Điều phối - Gọi vốn",
    avatar: "/images/webp/huy.webp",
    themeColor: "green",
    topIcon: "ri-shield-star-line",
    roleIcon: "ri-vip-crown-fill",
    skillIcon: "ri-database-2-fill",
    decorIcon1: "ri-leaf-fill",
    decorIcon2: "ri-leaf-line",
    memberCode: "EA-01",
  },
  {
    name: "NGUYỄN ANH GIẢNG",
    roleTag: "CTO / AI & DATA LEAD",
    task: "AI & dữ liệu - Kiến trúc kỹ thuật - Phát triển giải pháp",
    avatar: "/images/webp/giang-1.webp",
    themeColor: "blue",
    topIcon: "ri-brain-line",
    roleIcon: "ri-user-fill",
    skillIcon: "ri-database-2-fill",
    decorIcon1: "ri-bubble-chart-fill",
    decorIcon2: "ri-checkbox-blank-circle-fill",
    memberCode: "EA-02",
  },
  {
    name: "ĐẶNG VĂN CHUNG",
    roleTag: "FIELD OPERATION LEAD",
    task: "Khảo sát vườn - Hỗ trợ kỹ thuật - Triển khai Pilot",
    avatar: "/images/webp/chung-1.webp",
    themeColor: "purple",
    topIcon: "ri-code-s-slash-line",
    roleIcon: "ri-user-fill",
    skillIcon: "ri-settings-4-fill",
    decorIcon1: "ri-leaf-fill",
    decorIcon2: "ri-leaf-line",
    memberCode: "EA-03",
  },
  {
    name: "HUỲNH ANH TUẤN",
    roleTag: "GROWTH & OPERATIONS LEAD",
    task: "Truyền thông - Onboarding người dùng - Vận hành.",
    avatar: "/images/webp/tuan1.webp",
    themeColor: "orange",
    topIcon: "ri-megaphone-line",
    roleIcon: "ri-user-fill",
    skillIcon: "ri-database-2-fill",
    decorIcon1: "ri-leaf-fill",
    decorIcon2: "ri-leaf-line",
    memberCode: "EA-04",
  },
];

export default function CoreTeamSection() {
  const [flippedCards, setFlippedCards] = useState<{ [key: number]: boolean }>({});
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);
  const touchStartTimeRef = useRef<number>(0);
  const isSwipingRef = useRef<boolean>(false);
  const swipeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCardsTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    touchStartTimeRef.current = Date.now();
    isSwipingRef.current = false;
    if (swipeTimerRef.current) {
      clearTimeout(swipeTimerRef.current);
      swipeTimerRef.current = null;
    }
  };

  const handleCardsTouchMove = (e: React.TouchEvent) => {
    const deltaX = Math.abs(e.touches[0].clientX - touchStartXRef.current);
    const deltaY = Math.abs(e.touches[0].clientY - touchStartYRef.current);
    if (deltaX > 10 || deltaY > 10) {
      isSwipingRef.current = true;
    }
  };

  const handleCardsTouchEnd = (e: React.TouchEvent) => {
    const touchDuration = Date.now() - touchStartTimeRef.current;
    if (e.changedTouches && e.changedTouches[0]) {
      const deltaX = Math.abs(e.changedTouches[0].clientX - touchStartXRef.current);
      const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartYRef.current);
      if (deltaX <= 10 && deltaY <= 10 && touchDuration < 350) {
        isSwipingRef.current = false;
        return;
      }
    }
    if (isSwipingRef.current) {
      swipeTimerRef.current = setTimeout(() => {
        isSwipingRef.current = false;
      }, 100);
    }
  };

  const handleCardsScroll = () => {
    const container = cardsContainerRef.current;
    if (!container) return;
    const scrollLeft = container.scrollLeft;
    const firstCard = container.firstElementChild as HTMLElement | null;
    const cardWidth = firstCard ? firstCard.offsetWidth : 250;
    const gap = 14;
    const index = Math.round(scrollLeft / (cardWidth + gap));
    setActiveCardIndex(Math.max(0, Math.min(teamMembers.length - 1, index)));
  };

  const handleCardClick = (index: number) => {
    if (isSwipingRef.current) {
      isSwipingRef.current = false;
      return;
    }
    setFlippedCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const scrollToCard = (index: number) => {
    const container = cardsContainerRef.current;
    if (!container) return;
    const cards = container.querySelectorAll(".team-card");
    if (cards[index]) {
      (cards[index] as HTMLElement).scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
      setActiveCardIndex(index);
    }
  };

  return (
    <section id="section-team" className="team-showcase core-team-section fullpage-slide">
      <div className="team-showcase__container">
        {/* CORE TEAM: ĐỘI NGŨ VẬN HÀNH */}
        <div className="team-showcase__header" data-aos="fade-up">
          <span className="team-showcase__label">
            <span className="team-showcase__status-dot"></span>
            BAN ĐIỀU HÀNH &amp; KỸ THUẬT
          </span>
          <h2 className="team-showcase__title">
            Đội Ngũ <span className="team-showcase__title-highlight">Vận Hành</span>
          </h2>
          <p className="team-showcase__desc">
            Những người trẻ giàu nhiệt huyết công nghệ, gắn bó cùng từng nương rẫy để phát triển giải pháp số hóa nông nghiệp bền vững.
          </p>
        </div>

        {/* Member Cards Grid */}
        <div
          ref={cardsContainerRef}
          className="team-showcase__cards"
          data-aos="fade-up"
          data-aos-delay="100"
          onTouchStart={handleCardsTouchStart}
          onTouchMove={handleCardsTouchMove}
          onTouchEnd={handleCardsTouchEnd}
          onScroll={handleCardsScroll}
        >
          {teamMembers.map((member, index) => (
            <div
              className={`team-card team-card--${member.themeColor} ${flippedCards[index] ? "is-flipped" : ""}`}
              key={index}
              onClick={() => handleCardClick(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleCardClick(index);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`Xem thông tin ${member.name}`}
            >
              {/* 3D Flipper Container */}
              <div className="team-card__flipper">
                {/* FRONT: Full Portrait Photo with Name & Role Pill Overlay */}
                <div className="team-card__front">
                  <div className="team-card__image-box">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="team-card__rect-avatar-img"
                      loading="lazy"
                      decoding="async"
                    />

                    {/* Bottom Info Overlay */}
                    <div className="team-card__front-overlay">
                      <div className="team-card__role-pill">
                        <span>{member.roleTag}</span>
                      </div>
                      <h3 className="team-card__name">{member.name}</h3>
                    </div>
                  </div>
                </div>

                {/* BACK: Detailed Info (Full-card 3D flip) */}
                <div className="team-card__back">
                  <div className="team-card__back-main">
                    <div className="team-card__back-role">
                      <span>{member.roleTag}</span>
                    </div>
                    <h3 className="team-card__back-name">{member.name}</h3>
                    <p className="team-card__back-task">{member.task}</p>
                  </div>

                  <div className="team-card__back-bottom">
                    <div
                      className="team-card__back-return-pill"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(index);
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

        {/* Mobile Pagination Dots */}
        <div className="team-showcase__mobile-nav">
          <div className="team-showcase__pagination" aria-label="Team members navigation">
            {teamMembers.map((member, idx) => (
              <button
                key={idx}
                type="button"
                className={`team-showcase__dot team-showcase__dot--${member.themeColor} ${activeCardIndex === idx ? "is-active" : ""}`}
                onClick={() => scrollToCard(idx)}
                aria-label={`Xem thành viên ${member.name}`}
              />
            ))}
          </div>
          <div className="team-showcase__swipe-hint" aria-hidden="true">
            <i className="ri-arrow-left-s-line"></i>
            <span>Vuốt để xem thêm</span>
            <i className="ri-arrow-right-s-line"></i>
          </div>
        </div>
      </div>
    </section>
  );
}
