interface PhaseItem {
  title: string;
  time: string;
  status: string;
  statusText: string;
  icon: string;
  details: string;
}

export default function RoadmapSection() {
  const phases: PhaseItem[] = [
    {
      title: "Giai Đoạn 1: Nghiên Cứu & Đạt Giải",
      time: "2025 - Đầu 2026",
      status: "completed",
      statusText: "Đã hoàn thành",
      icon: "ri-checkbox-circle-line",
      details: "Xây dựng lõi AI dự đoán sức khỏe cây trồng, chế tạo cảm biến thử nghiệm và vinh dự đạt giải Nhất cuộc thi Trí Tuệ Nhân Tạo 2026."
    },
    {
      title: "Giai Đoạn 2: Số Hóa & Hợp Tác Xã",
      time: "Hiện tại",
      status: "active",
      statusText: "Đang triển khai",
      icon: "ri-loader-4-line",
      details: "Triển khai ứng dụng EaAgri, mở rộng hợp tác xã sầu riêng tại Tây Nguyên để đưa quy trình canh tác số (Data-driven farming) vào thực tế."
    },
    {
      title: "Giai Đoạn 3: Thiết Bị EaAgri Box & Fintech",
      time: "Kế hoạch 2027",
      status: "upcoming",
      statusText: "Kế hoạch",
      icon: "ri-time-line",
      details: "Thương mại hóa phần cứng EaAgri Box tự động hóa tưới tiêu và tích hợp cổng thanh toán hỗ trợ vốn cho nông dân."
    },
    {
      title: "Giai Đoạn 4: Mở Rộng Đa Cây Trồng",
      time: "Tương lai",
      status: "upcoming",
      statusText: "Kế hoạch",
      icon: "ri-seedling-line",
      details: "Phát triển bộ giải pháp nông nghiệp thông minh cho Cà phê, Hồ tiêu và các loại nông sản chủ lực khác của Tây Nguyên."
    }
  ];

  return (
    <section className="section__container roadmap__container">
      <div className="roadmap__grid">
        {/* Left Side: Mascot and call to action */}
        <div className="roadmap__illustration-side" data-aos="fade-right">
          <div className="roadmap__mascot-card">
            <div className="roadmap__mascot-img-wrap">
              <img
                src="/assets/tải xuống.png"
                alt="Mascot EaAgri"
                className="roadmap__mascot-img"
              />
            </div>
            <div className="roadmap__mascot-info">
              <h3>Đồng Hành Cùng Nhà Nông</h3>
              <p>Hợp tác phát triển nông nghiệp số bền vững, gia tăng giá trị chuỗi sầu riêng Tây Nguyên.</p>
            </div>
            <a 
              href="https://www.facebook.com/profile.php?id=61577351045350" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn roadmap__cta-btn"
            >
              <i className="ri-shake-hands-line"></i> Liên Hệ Hợp Tác
            </a>
          </div>
        </div>

        {/* Right Side: Visual Timeline */}
        <div className="roadmap__timeline-side" data-aos="fade-left">
          <div className="roadmap__header">
            <span className="roadmap__tag">
              <i className="ri-road-map-line"></i> BẢN ĐỒ ĐƯỜNG ĐI
            </span>
            <h2 className="roadmap__title">Lộ Trình Phát Triển</h2>
          </div>

          <div className="roadmap__timeline">
            <div className="roadmap__timeline-bar"></div>
            
            {phases.map((phase, idx) => (
              <div 
                key={idx} 
                className={`roadmap__timeline-item roadmap__timeline-item--${phase.status}`}
              >
                <div className="roadmap__timeline-icon">
                  <i className={phase.icon}></i>
                </div>
                <div className="roadmap__timeline-content">
                  <div className="roadmap__timeline-meta">
                    <span className="roadmap__timeline-time">{phase.time}</span>
                    <span className="roadmap__timeline-status">{phase.statusText}</span>
                  </div>
                  <h3>{phase.title}</h3>
                  <p>{phase.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}