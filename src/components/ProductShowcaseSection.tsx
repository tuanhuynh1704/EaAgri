import { useState, useEffect } from "react";

const appScreenshots = [
  "/image-banner/1.jpg",
  "/image-banner/2.jpg",
  "/image-banner/3.jpg",
  "/image-banner/4.jpg",
  "/image-banner/5.jpg",
  "/image-banner/6.jpg",
  "/image-banner/7.jpg",
  "/image-banner/8.jpg",
  "/image-banner/9.jpg",
  "/image-banner/10.jpg",
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

export default function ProductShowcaseSection() {
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
    <section id="section-san-pham" className="app-showcase-slide fullpage-slide">
      <div className="product-showcase__header-container">
        <div className="team-showcase__header" data-aos="fade-up">
          <span className="team-showcase__label">
            <span className="team-showcase__status-dot"></span>
            GIAO DIỆN &amp; TRẢI NGHIỆM TRỰC QUAN
          </span>
          <h2 className="team-showcase__title">
            Hình Ảnh <span className="team-showcase__title-highlight">Sản Phẩm</span>
          </h2>
          <p className="team-showcase__desc">
            Trải nghiệm trực quan toàn bộ hệ sinh thái ứng dụng di động EaAgri — trợ lý số đắc lực cho nông hộ và chuyên gia tại vườn sầu riêng.
          </p>
        </div>
      </div>

      <div
        className="team-showcase__carousel-area"
        data-aos="fade-up"
        data-aos-delay="200"
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
                style={{ cursor: "pointer" }}
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
          <div className="app-showcase__progress-track">
            <i style={{ width: `${((currentIndex + 1) / appScreenshots.length) * 100}%` }}></i>
          </div>
          <span>{String(appScreenshots.length).padStart(2, "0")}</span>
        </div>
      </div>
    </section>
  );
}
