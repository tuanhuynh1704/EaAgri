export default function EaAgriStoreSection() {
  const storeHighlights = [
    {
      title: "100% Chính Hãng",
      desc: "Tem QR truy xuất nguồn gốc, có kiểm định lưu hành",
    },
    {
      title: "Giao Tận Vườn Cây",
      desc: "Đồng kiểm an toàn, miễn phí vận chuyển từ 500k",
    },
    {
      title: "Kỹ Sư Tư Vấn 1:1",
      desc: "Bắt bệnh thực địa & kê toa chuẩn liều lượng miễn phí",
    },
    {
      title: "Đổi Trả 7 Ngày",
      desc: "Cam kết bồi hoàn minh bạch bảo vệ bà con nông dân",
    },
  ];

  return (
    <section id="section-store" className="store-section">
      <div className="section__container store__container">
        <div className="store__compact-card" data-aos="fade-up">
          {/* Top Eyebrow */}
          {/* <div className="store__badge">
            <span>EAAGRI STORE • SÀN THƯƠNG MẠI NÔNG NGHIỆP & VẬT TƯ CHÍNH HÃNG</span>
          </div> */}

          {/* Heading */}
          <h2 className="store__title">
            EaAgri Store —{" "}
            <span className="highlight">Giải Pháp Toàn Diện Cho Cây Trồng Bội Thu</span>
          </h2>

          {/* Short Description */}
          <p className="store__desc">
            Sàn thương mại điện tử kết nối trực tiếp nhà nông với hơn <strong>100+ đại lý vật tư uy tín</strong> tại Tây Nguyên.
            Cung cấp phân bón, thuốc BVTV sinh học, hạt giống và dinh dưỡng cây trồng chính hãng, giao tận vườn cùng đội ngũ kỹ sư đồng hành 24/7.
          </p>

          {/* 4 Mini Highlights */}
          <div className="store__highlights-row">
            {storeHighlights.map((item, idx) => (
              <div key={idx} className="store__highlight-item">
                <div className="highlight-text">
                  <strong>{item.title}</strong>
                  <span>{item.desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="store__actions">
            <a
              href="https://store.eaagri.vn/"
              target="_blank"
              rel="noopener noreferrer"
              className="store__btn store__btn--primary"
              title="Truy cập sàn thương mại EaAgri Store tại store.eaagri.vn"
            >
              <span>Truy Cập EaAgri Store Ngay</span>
              <span className="store__btn-badge">store.eaagri.vn</span>
            </a>

            <a
              href="tel:1900886688"
              className="store__btn store__btn--secondary"
              title="Hotline kỹ sư nông học 1900 886 688"
            >
              <span>Hotline Tư Vấn: <strong>1900 886 688</strong></span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
