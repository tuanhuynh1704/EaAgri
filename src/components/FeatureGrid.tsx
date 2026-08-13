interface FeatureItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  tag: string;
}

const features: FeatureItem[] = [
  {
    id: "01",
    title: "Mobile App",
    subtitle: "Flutter cross-platform",
    description: "Đa nền tảng Android/iOS, đảm bảo trải nghiệm mượt mà, phản hồi tức thời cho người nông dân.",
    icon: "ri-smartphone-line",
    tag: "CLIENT APP",
  },
  {
    id: "02",
    title: "Backend Cloud",
    subtitle: "Firebase Ecosystem",
    description: "Sử dụng Firestore, Authentication, Cloud Functions cho việc đồng bộ và lưu trữ dữ liệu thời gian thực.",
    icon: "ri-server-line",
    tag: "DATABASE & API",
  },
  {
    id: "03",
    title: "AI Neural Core",
    subtitle: "YOLOv9 & Gemini 2.0",
    description: "Tích hợp YOLOv9 (PyTorch/TFLite) phát hiện sâu bệnh và Google Gemini API phân tích chuẩn đoán chuyên sâu.",
    icon: "ri-cpu-line",
    tag: "COGNITIVE INTELLIGENCE",
  },
  {
    id: "04",
    title: "Hardware Controller",
    subtitle: "ESP32 & Sensors",
    description: "Vi điều khiển chi phí thấp, hỗ trợ WiFi/Bluetooth kết nối các cảm biến độ ẩm đất và điều khiển rơ-le tưới.",
    icon: "ri-sensor-line",
    tag: "IOT AUTOMATION",
  },
  {
    id: "05",
    title: "Knowledge Base RAG",
    subtitle: "Vector Search Pipeline",
    description: "Kết nối dữ liệu API thời tiết sầu riêng, chuẩn canh tác VietGAP để làm giàu tri thức địa phương.",
    icon: "ri-node-tree",
    tag: "DATA ENRICHMENT",
  },
];

const FeatureGrid = () => {
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

      <div className="feature__tech-grid">
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
              <span className="feature__tech-tag">{feature.tag}</span>
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
    </section>
  );
};

export default FeatureGrid;