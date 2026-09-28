import React, { useState, useRef } from "react";

interface FeatureItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
}

const features: FeatureItem[] = [
  {
    id: "01",
    title: "Mobile App",
    subtitle: "Flutter cross-platform",
    description: "Đa nền tảng Android/iOS, đảm bảo trải nghiệm mượt mà, phản hồi tức thời cho người nông dân.",
    icon: "ri-smartphone-line",
  },
  {
    id: "02",
    title: "Backend Cloud",
    subtitle: "Firebase Ecosystem",
    description: "Sử dụng Firestore, Authentication, Cloud Functions cho việc đồng bộ và lưu trữ dữ liệu thời gian thực.",
    icon: "ri-server-line",
  },
  {
    id: "03",
    title: "AI Neural Core",
    subtitle: "YOLOv9 & Gemini 2.0",
    description: "Tích hợp YOLOv9 (PyTorch/TFLite) phát hiện sâu bệnh và Google Gemini API phân tích chuẩn đoán chuyên sâu.",
    icon: "ri-cpu-line",
  },
  {
    id: "04",
    title: "Hardware Controller",
    subtitle: "ESP32 & Sensors",
    description: "Vi điều khiển chi phí thấp, hỗ trợ WiFi/Bluetooth kết nối các cảm biến độ ẩm đất và điều khiển rơ-le tưới.",
    icon: "ri-sensor-line",
  },
  {
    id: "05",
    title: "Knowledge Base RAG",
    subtitle: "Vector Search Pipeline",
    description: "Kết nối dữ liệu API thời tiết sầu riêng, chuẩn canh tác VietGAP để làm giàu tri thức địa phương.",
    icon: "ri-node-tree",
  },
];

const FeatureGrid: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) return;
    const ratio = scrollLeft / maxScroll;
    const newIndex = Math.min(
      Math.round(ratio * (features.length - 1)),
      features.length - 1
    );
    setActiveSlide(newIndex);
  };

  const scrollToSlide = (index: number) => {
    if (!scrollRef.current) return;
    const cards = scrollRef.current.children;
    if (cards[index]) {
      (cards[index] as HTMLElement).scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  };
  return (
    <section className="section__container feature__container">
      <div className="feature__header-wrapper">
        <span className="feature__meta-tag">
          <i className="ri-shield-check-line"></i> EAAGRI STACK
        </span>
        <h2 className="section__header" data-aos="fade-up">
          Tổng Quan Công Nghệ
        </h2>
        <p
          className="section__description"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          Mô hình kiến trúc đa tầng hỗ trợ hệ thống vận hành bền bỉ và bảo mật.
        </p>
      </div>

      <div
        className="feature__tech-grid"
        ref={scrollRef}
        onScroll={handleScroll}
      >
        {features.map((feature, index) => (
          <div
            key={feature.id}
            className="feature__tech-card"
            data-aos={index % 2 === 0 ? "fade-up" : "fade-up"}
            data-aos-delay={index * 100}
          >
            {/* Watermark Number */}
            <div className="feature__tech-watermark">{feature.id}</div>
            
            {/* Card Header */}
            <div className="feature__tech-header">
              <div className="feature__tech-icon-box">
                <i className={feature.icon}></i>
              </div>
            </div>

            {/* Card Body */}
            <div className="feature__tech-body">
              <h3 className="feature__tech-title">{feature.title}</h3>
              <h4 className="feature__tech-subtitle">{feature.subtitle}</h4>
              <p className="feature__tech-desc">{feature.description}</p>
            </div>
            
            {/* Tech accents */}
            <div className="feature__tech-accent-bar"></div>
          </div>
        ))}
      </div>

      {/* Mobile Swipe Navigation Indicators & Hint */}
      <div className="feature__mobile-nav">
        <div className="feature__mobile-dots">
          {features.map((feature, index) => (
            <button
              key={feature.id}
              className={`feature__mobile-dot ${activeSlide === index ? "active" : ""}`}
              onClick={() => scrollToSlide(index)}
              aria-label={`Chuyển tới thẻ ${feature.id}: ${feature.title}`}
            />
          ))}
        </div>
        <div className="feature__mobile-hint">
          <i className="ri-arrow-left-right-line"></i> Vuốt ngang để xem 5 tầng công nghệ
        </div>
      </div>
    </section>
  );
};

export default FeatureGrid;