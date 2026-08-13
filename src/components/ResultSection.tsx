const resultImages = [
  { src: "/assets/phancung", label: "Bộ thiết bị IoT", icon: "ri-cpu-line" },
  { src: "/assets/anhthucte", label: "Chẩn đoán sâu bệnh", icon: "ri-scan-2-line" },
  { src: "/assets/anhthucte1", label: "Giám sát vi khí hậu", icon: "ri-radar-line" },
  { src: "/assets/anhthucte2", label: "Tư vấn cùng chuyên gia", icon: "ri-customer-service-2-line" },
  { src: "/assets/anhthucte3", label: "Phân tích tại vườn", icon: "ri-leaf-line" },
];

const stats = [
  { value: "24/7", label: "Hoạt động liên tục", note: "Hệ thống trực tuyến", icon: "ri-pulse-line" },
  { value: "< 2s", label: "Độ trễ phản hồi", note: "Dữ liệu thời gian thực", icon: "ri-flashlight-line" },
  { value: "< 5%", label: "Sai số dự báo giá", note: "Mô hình đã kiểm chứng", icon: "ri-line-chart-line" },
];

const ResultSection = () => (
  <section className="section__container download__container result-section" data-aos="fade-up">
    <header className="result__header">
      <span className="result__eyebrow"><i className="ri-map-pin-2-line" /> Tân Tiến · Đắk Lắk</span>
      <h2 className="section__header">Kết quả <span>triển khai thực tế</span></h2>
      <p className="section__description">
        Ea Agri vận hành ổn định tại vườn thử nghiệm, kết nối dữ liệu IoT, AI và chuyên gia
        trong một quy trình chăm sóc sầu riêng khép kín.
      </p>
    </header>

    <div className="result__stats">
      {stats.map((stat) => (
        <article className="stat__card" key={stat.label}>
          <span className="stat__icon"><i className={stat.icon} /></span>
          <div className="stat__content">
            <h3>{stat.value}</h3>
            <p>{stat.label}</p>
            <small>{stat.note}</small>
          </div>
          <span className="stat__status"><i /> LIVE</span>
        </article>
      ))}
    </div>

    <div className="result__gallery">
      {resultImages.map((image, index) => (
        <figure className={`result__photo result__photo--${index + 1}`} key={image.src} data-aos="zoom-in" data-aos-delay={index * 70}>
          <img src={image.src} alt={image.label} />
          <figcaption><i className={image.icon} /><span>{image.label}</span></figcaption>
        </figure>
      ))}
    </div>
  </section>
);

export default ResultSection;
