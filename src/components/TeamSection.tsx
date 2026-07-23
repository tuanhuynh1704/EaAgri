import { useState, useEffect } from "react";

const appScreenshots = [
  "/assets/1.jpg",
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

const teamMembers = [
  {
    name: "Phan Đăng Huy",
    major: "Khoa học dữ liệu",
    id: "2311559215",
  },
  {
    name: "Nguyễn Anh Giảng",
    major: "Khoa học dữ liệu",
    id: "2311558913",
  },
  {
    name: "Đặng Văn Chung",
    major: "Khoa học dữ liệu",
    id: "2311558913",
  },
  {
    name: "Huỳnh Anh Tuấn",
    major: "Kỹ thuật phần mềm",
    id: "2200005725",
  },
];

const TeamSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % appScreenshots.length);
    }, 4000); // Rotate every 4s

    return () => clearInterval(interval);
  }, []);

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
    <section className="team-showcase">
      <div className="team-showcase__container">
        {/* TOP: Team Info */}
        <div className="team-showcase__header" data-aos="fade-up">
          <span className="team-showcase__label">OUR TEAM</span>
          <h2 className="team-showcase__title">Đội Ngũ Thực Hiện</h2>
          <p className="team-showcase__desc">
            Dự án được thực hiện bởi sinh viên Khoa Công nghệ Thông tin —
            Trường Đại học Nguyễn Tất Thành.
          </p>
        </div>

        {/* Member Cards */}
        <div className="team-showcase__cards" data-aos="fade-up" data-aos-delay="100">
          {teamMembers.map((member, index) => (
            <div
              className="team-card"
              key={index}
              data-aos="fade-up"
              data-aos-delay={150 + index * 80}
            >
              <div className="team-card__avatar">
                {member.name.charAt(0)}
              </div>
              <div className="team-card__info">
                <strong className="team-card__name">{member.name}</strong>
                <span className="team-card__major">{member.major}</span>
                <span className="team-card__id">MSSV: {member.id}</span>
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM: 3D Carousel Phone Showcase */}
        <div className="team-showcase__carousel-area" data-aos="fade-up" data-aos-delay="300">
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

            {/* FIXED CENTER FRAME */}
            <div className="phone-mockup__fixed-wrapper">
              <img
                src="/iPhone 14 Pro Max Mockup HD PNG.png"
                alt="Phone frame"
                className="phone-mockup__frame"
              />
            </div>

            <button className="carousel-btn carousel-btn--next" onClick={handleNext} aria-label="Next">
              <i className="ri-arrow-right-s-line"></i>
            </button>
          </div>

          {/* Dot indicators */}
          <div className="phone-mockup__dots mt-5">
            {appScreenshots.map((_, index) => (
              <button
                key={index}
                className={`phone-mockup__dot ${index === currentIndex ? "active" : ""}`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to screenshot ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;