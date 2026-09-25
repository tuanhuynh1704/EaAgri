import { useState, useEffect, useRef } from "react";

const appScreenshots = [
  "/assets/main screen.webp",
  "/assets/2.webp",
  "/assets/3.webp",
  "/assets/4.webp",
  "/assets/5.webp",
  "/assets/6.webp",
  "/assets/7.webp",
  "/assets/8.webp",
  "/assets/9.webp",
  "/assets/10.webp",
  "/assets/11.webp",
  "/assets/12.webp",
];

const appSlideContent = [
  ["Tổng quan Ea Agri", "Quản lý toàn bộ hoạt động canh tác trong một giao diện."],
  ["Trợ lý Ea AI", "Tư vấn kỹ thuật dựa trên dữ liệu thực tế của khu vườn."],
  ["Câu hỏi thường gặp", "Tra cứu nhanh các tình huống phổ biến trong canh tác."],
  ["Kho tri thức", "Tra cứu nhanh các tình huống thường gặp trong canh tác."],
  ["Lịch tưới thông minh", "Điều phối lượng nước theo điều kiện môi trường."],
  ["Nhật ký nông hộ", "Ghi nhận hoạt động và lịch sử chăm sóc mùa vụ."],
  ["Phân tích cây trồng", "Nhận diện và đánh giá tình trạng cây bằng AI."],
  ["Phân tích hình ảnh", "Theo dõi dấu hiệu bất thường trực tiếp từ khu vườn."],
  ["Cộng đồng nhà nông", "Chia sẻ kinh nghiệm và kết nối người dùng Ea Agri."],
  ["Quản lý mùa vụ", "Theo dõi tiến độ từ chăm sóc đến thu hoạch."],
  ["Dữ liệu thời gian thực", "Giám sát cảm biến IoT ngay trên điện thoại."],
  ["Hệ sinh thái số", "Một nền tảng xuyên suốt cho nông nghiệp thông minh."],
];

interface TeamMember {
  name: string;
  roleTag: string;
  task: string;
  // major: string;
  // id: string;
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
    // major: "Khoa học dữ liệu",
    // id: "2311559215",
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
    // id: "2311558913",
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
    // major: "Khoa học dữ liệu",
    // id: "2311559253",
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
    // major: "Khoa học dữ liệu",
    // id: "2200005725",
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

const mentor = {
  name: "Nguyễn Khắc Minh Trí",
  role: "Co-Founder & CEO, Công ty TNHH Mimosa Technology (MimosaTEK)",
  avatar: "/images/webp/advisors/nguyen-khac-minh-tri.webp",
  stats: [
    { value: "20+", label: "năm CNTT & Viễn thông" },
    { value: "12+", label: "năm điều hành Founder/CEO" },
  ],
  fields: ["Agtech", "Internet vạn vật (IoT)", "Chuyển đổi số", "Phát triển bền vững"],
};

// avatar is optional; advisors without a photo fall back to initials
const academicAdvisors: { name: string; avatar?: string; initials: string }[] = [
  { name: "ThS. Nguyễn Huỳnh Thông", avatar: "/images/webp/advisors/nguyen-huynh-thong.webp", initials: "HT" },
  { name: "ThS. Phạm Đình Tài", avatar: "/images/webp/advisors/pham-dinh-tai.webp", initials: "ĐT" },
  { name: "TS. Hoàng Thịnh Nhân", avatar: "/images/webp/advisors/hoang-thinh-nhan.webp", initials: "HN" },
];

const TeamSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);

  // Mobile Team Cards: Flip & Swipe state
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
      // Chạm dứt khoát nhanh dưới 350ms và không dịch chuyển quá 10px -> chắc chắn là click lật thẻ
      if (deltaX <= 10 && deltaY <= 10 && touchDuration < 350) {
        isSwipingRef.current = false;
        return;
      }
    }
    // Nếu là vuốt lướt slider, nhả lock sau 100ms để lần bấm sau không bị kẹt
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
    // Chỉ kích hoạt lật thẻ ở giao diện mobile (<= 768px)
    if (typeof window !== "undefined" && window.innerWidth > 768) return;
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

  useEffect(() => {
    if (isCarouselPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % appScreenshots.length);
    }, 4000); // Rotate every 4s

    return () => clearInterval(interval);
  }, [currentIndex, isCarouselPaused]);

  const getVisibleScreenshots = () => {
    const total = appScreenshots.length;
    // We want 5 visible phones: 2 left, 1 center, 2 right
    const indices = [
      (currentIndex - 2 + total) % total,
      (currentIndex - 1 + total) % total,
      currentIndex,
      (currentIndex + 1) % total,
      (currentIndex + 2) % total,
    ];
    return indices;
  };

  const visibleIndices = getVisibleScreenshots();

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + appScreenshots.length) % appScreenshots.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % appScreenshots.length);
  };

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      handleNext();
    }
    if (isRightSwipe) {
      handlePrev();
    }
  };

  return (
    <>
      <section id="section-team" className="team-showcase fullpage-slide">
        <div className="team-showcase__container">
          {/* TOP: Team Info Header */}
          <div className="team-showcase__header" data-aos="fade-up">
            <span className="team-showcase__label">
              <span className="team-showcase__status-dot"></span>
              EAAGRI / CORE TEAM
            </span>
            <h2 className="team-showcase__title">
              Đội Ngũ <span className="team-showcase__title-highlight">Vận Hành<i className="ri-cpu-line team-title-tech-icon"></i><span className="team-title-underline"></span></span>
            </h2>
            {/* <p className="team-showcase__desc">
              Dự án được thực hiện bởi sinh viên <span className="team-desc-highlight">Khoa Công nghệ Thông tin</span> — <span className="team-desc-highlight">Trường Đại học Nguyễn Tất Thành</span>.
            </p> */}
          </div>

          {/* Member Cards Grid (3D Flip enabled for Mobile, static photo+body for Desktop) */}
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
              >
                {/* 3D Flipper Container */}
                <div className="team-card__flipper">
                  {/* FRONT: Entire Front Card (Image Header + Body Info) */}
                  <div className="team-card__front">
                    <div className="team-card__image-box">
                      {/* Floating Top Left Glass Badge Icon */}
                      <div className="team-card__top-icon">
                        <i className={member.topIcon}></i>
                      </div>
                      <span className="team-card__member-code">{member.memberCode}</span>

                      {/* Rectangular Photo Avatar */}
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="team-card__rect-avatar-img"
                        loading="lazy"
                        decoding="async"
                      />

                      {/* Role Pill Badge anchored at base of image */}
                      <div className="team-card__role-pill">
                        <span>{member.roleTag}</span>
                      </div>

                      {/* Flip Hint button visible on mobile */}
                      <div className="team-card__flip-hint" aria-hidden="true">
                        <i className="ri-repeat-2-line"></i>
                        <span>Chạm xem thông tin</span>
                      </div>
                    </div>

                    {/* Text Content Below Image (Inside Front face) */}
                    <div className="team-card__body">
                      {/* Member Name */}
                      <h3 className="team-card__name">{member.name}</h3>

                      {/* Symmetrical Underline Accent */}
                      <div className="team-card__name-accent"></div>

                      {/* Task description */}
                      <p className="team-card__task">{member.task}</p>

                      {/* Bottom Skill Capsule Badge */}
                      <div className="team-card__skill-pill">
                        <i className={member.skillIcon}></i>
                        <span>EaAgri Core Team</span>
                      </div>
                    </div>
                  </div>

                  {/* BACK: Detailed Info (Full-card 3D flip) */}
                  <div className="team-card__back">
                    <div className="team-card__back-top">
                      <div className="team-card__top-icon">
                        <i className={member.topIcon}></i>
                      </div>
                      <span className="team-card__member-code">{member.memberCode}</span>
                    </div>

                    <div className="team-card__back-main">
                      <div className="team-card__back-role">
                        <span>{member.roleTag}</span>
                      </div>
                      <h3 className="team-card__back-name">{member.name}</h3>
                      <div className="team-card__name-accent"></div>
                      <p className="team-card__back-task">{member.task}</p>

                      <div className="team-card__skill-pill">
                        <i className={member.skillIcon}></i>
                        <span>EaAgri Core Team</span>
                      </div>
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
                        <span>Lật lại ảnh</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Pagination Dots & Swipe Helper */}
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

          {/* Investor-mentor + academic advisory board */}
          <aside className="academic-advisors" aria-label="Nhà đầu tư, mentor và cố vấn chuyên môn" data-aos="fade-up" data-aos-delay="200">
            <div className="advisor-mentor">
              <div className="advisor-mentor__photo-wrap">
                <img
                  src={mentor.avatar}
                  alt={mentor.name}
                  className="advisor-mentor__photo"
                  loading="lazy"
                  decoding="async"
                />
                <span className="advisor-mentor__badge" aria-hidden="true">
                  <i className="ri-star-fill"></i>
                </span>
              </div>

              <div className="advisor-mentor__info">
                <small>NHÀ ĐẦU TƯ & MENTOR DỰ ÁN</small>
                <strong>{mentor.name}</strong>
                <span className="advisor-mentor__role">{mentor.role}</span>

                <div className="advisor-mentor__stats">
                  {mentor.stats.map((stat) => (
                    <div key={stat.label}>
                      <b>{stat.value}</b>
                      <span>{stat.label}</span>
                    </div>
                  ))}
                </div>

                <div className="advisor-mentor__fields">
                  {mentor.fields.map((field) => (
                    <span key={field}>{field}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="academic-advisors__divider" aria-hidden="true" />

            <div className="academic-advisors__board">
              <div className="academic-advisors__intro">
                <span className="academic-advisors__icon">
                  <i className="ri-graduation-cap-line"></i>
                </span>
                <div>
                  <small>ACADEMIC ADVISORY</small>
                  <strong>Cố vấn chuyên môn Khoa CNTT — ĐH Nguyễn Tất Thành</strong>
                </div>
              </div>
              <div className="academic-advisors__list">
                {academicAdvisors.map((advisor) => (
                  <span key={advisor.name}>
                    {advisor.avatar ? (
                      <img src={advisor.avatar} alt="" loading="lazy" decoding="async" />
                    ) : (
                      <b aria-hidden="true">{advisor.initials}</b>
                    )}
                    {advisor.name}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* BOTTOM: 3D Carousel Phone Showcase in the natural page flow */}
      <section className="app-showcase-slide fullpage-slide">
        <div
          className="team-showcase__carousel-area"
          data-aos="fade-up"
          data-aos-delay="300"
          onMouseEnter={() => setIsCarouselPaused(true)}
          onMouseLeave={() => setIsCarouselPaused(false)}
        >
          <div
            className="carousel-3d"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEndHandler}
          >
            <button className="carousel-btn carousel-btn--prev" onClick={handlePrev} aria-label="Previous">
              <i className="ri-arrow-left-s-line"></i>
            </button>

            {visibleIndices.map((imgIndex, i) => {
              // i ranges from 0 to 4 (0: far left, 1: left, 2: center, 3: right, 4: far right)
              let positionClass = "center";
              if (i === 0) positionClass = "far-left";
              if (i === 1) positionClass = "left";
              if (i === 3) positionClass = "right";
              if (i === 4) positionClass = "far-right";

              return (
                <div
                  key={imgIndex}
                  className={`phone-mockup ${positionClass}`}
                  onClick={() => setCurrentIndex(imgIndex)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Screenshot layer */}
                  <div className="phone-mockup__screen">
                    <img
                      src={appScreenshots[imgIndex]}
                      alt={`App screenshot ${imgIndex + 1}`}
                      className="phone-mockup__screenshot"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </div>
              );
            })}

            {/* Fixed transparent device frame over the 9:20 screenshot */}
            <div className="phone-mockup__fixed-wrapper" aria-hidden="true">
              <img
                src="/images/webp/iphone.webp"
                alt=""
                className="phone-mockup__frame"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/Iphone.webp";
                }}
              />
            </div>

            <button className="carousel-btn carousel-btn--next" onClick={handleNext} aria-label="Next">
              <i className="ri-arrow-right-s-line"></i>
            </button>
          </div>

          <div className="app-showcase__caption" aria-live="polite">
            <strong>{appSlideContent[currentIndex][0]}</strong>
            <span>{appSlideContent[currentIndex][1]}</span>
          </div>
          <div className="app-showcase__progress">
            <span>{String(currentIndex + 1).padStart(2, "0")}</span>
            <div className="app-showcase__progress-track"><i style={{ width: `${((currentIndex + 1) / appScreenshots.length) * 100}%` }}></i></div>
            <span>{String(appScreenshots.length).padStart(2, "0")}</span>
          </div>
        </div>
      </section>
    </>
  );
};

export default TeamSection;
