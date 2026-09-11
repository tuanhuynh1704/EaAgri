import { useState, useEffect } from "react";

const appScreenshots = [
  "/assets/main screen.jpg",
  "/assets/2.jpg",
  "/assets/3.jpg",
  "/assets/4.jpg",
  "/assets/5.jpg",
  "/assets/6.jpg",
  "/assets/7.jpg",
  "/assets/8.jpg",
  "/assets/9.jpg",
  "/assets/10.jpg",
  "/assets/11.jpg",
  "/assets/12.jpg",
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
    avatar: "/huy.jpg",
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
    avatar: "/Giảng.jpg",
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
    avatar: "/chung.jpg",
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
    avatar: "/Tuấn.jpg",
    themeColor: "orange",
    topIcon: "ri-megaphone-line",
    roleIcon: "ri-user-fill",
    skillIcon: "ri-database-2-fill",
    decorIcon1: "ri-leaf-fill",
    decorIcon2: "ri-leaf-line",
    memberCode: "EA-04",
  },
];

const TeamSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);

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
            <p className="team-showcase__desc">
              Dự án được thực hiện bởi sinh viên <span className="team-desc-highlight">Khoa Công nghệ Thông tin</span> — <span className="team-desc-highlight">Trường Đại học Nguyễn Tất Thành</span>.
            </p>
          </div>

          {/* Member Cards Grid (Rectangular Photo Header - Image Top, Text Below) */}
          <div className="team-showcase__cards" data-aos="fade-up" data-aos-delay="100">
            {teamMembers.map((member, index) => (
              <div
                className={`team-card team-card--${member.themeColor}`}
                key={index}
                data-aos="fade-up"
                data-aos-delay={150 + index * 80}
              >
                {/* Top Rounded Rectangular Image Box */}
                <div className="team-card__image-box">
                  <span className="team-card__circuit-line" aria-hidden="true"></span>
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
                  />

                  {/* Role Pill Badge anchored at base of image */}
                  <div className="team-card__role-pill">
                    <span>{member.roleTag}</span>
                  </div>
                </div>

                {/* Text Content Below Image */}
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
                    {/* <span>{member.major}</span> */}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* <aside className="team-advisors" data-aos="fade-up" data-aos-delay="180" aria-label="Cố vấn chuyên môn">
          <div className="team-advisors__intro">
            <span className="team-advisors__icon"><i className="ri-graduation-cap-line" /></span>
            <div>
              <small>ACADEMIC SUPPORT</small>
              <strong>Cố vấn chuyên môn</strong>
            </div>
          </div>
          <div className="team-advisors__list">
            <span><i className="ri-user-star-line" /> ThS. Nguyễn Huỳnh Thông</span>
            <span><i className="ri-user-star-line" /> ThS. Phạm Đình Tài</span>
            <span><i className="ri-user-star-line" /> TS. Hoàng Thịnh Nhân</span>
          </div>
        </aside> */}
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
                    />
                  </div>
                </div>
              );
            })}

            {/* Fixed transparent device frame over the 9:20 screenshot */}
            <div className="phone-mockup__fixed-wrapper" aria-hidden="true">
              <img src="/Iphone.png" alt="" className="phone-mockup__frame" />
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
