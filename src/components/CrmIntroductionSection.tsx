export default function CrmIntroductionSection() {
  const crmFeatures = [
    {
      icon: "ri-shopping-cart-2-line",
      color: "emerald",
      title: "Bán Lẻ POS & Đơn App",
      desc: "Tạo đơn tại quầy siêu tốc, tự động in hóa đơn và đồng bộ tồn kho thời gian thực với app nông hộ.",
    },
    {
      icon: "ri-booklet-line",
      color: "blue",
      title: "Sổ Cái Công Nợ Bất Biến",
      desc: "Sổ cái Append-only theo dõi dư nợ mùa vụ minh bạch, triệt tiêu tranh chấp tài chính giữa đại lý và nông dân.",
    },
    {
      icon: "ri-customer-service-2-line",
      color: "purple",
      title: "Tư Vấn & Kê Phác Đồ 1:1",
      desc: "Tiếp nhận ảnh chụp sâu bệnh gửi từ vườn, phân công kỹ thuật viên kê phác đồ điều trị gắn liền sản phẩm đại lý.",
    },
    {
      icon: "ri-shield-keyhole-line",
      color: "orange",
      title: "Phân Quyền Đa Thuê An Toàn",
      desc: "Kiến trúc Multi-tenant phân quyền 3 cấp (Super Admin - Đại lý - Nông hộ), bảo mật dữ liệu riêng tư tuyệt đối.",
    },
  ];

  return (
    <section id="section-crm" className="crm-section fullpage-slide">
      <div className="section__container crm__container">
        <div className="crm__compact-card" data-aos="fade-up">
          {/* Top Eyebrow Badge */}
          <div className="crm__badge">
            <i className="ri-building-4-line"></i>
            <span>EAAGRI SAAS B2B • QUẢN TRỊ ĐA THUÊ</span>
          </div>

          {/* Heading */}
          <h2 className="crm__title">
            🌾 EaAgri CRM —{" "}
            <span className="highlight">Nền Tảng Quản Trị & Thương Mại Nông Nghiệp Đa Thuê</span>
          </h2>

          {/* Short Positioning Description */}
          <p className="crm__desc">
            Hệ thống CRM & POS chuyên biệt dành cho các <strong>Đại lý Vật tư Nông nghiệp (VTNN)</strong>, đóng vai trò cầu nối số đồng bộ hai chiều giữa đại lý và bà con <strong>Nông hộ</strong> qua ứng dụng di động.
          </p>

          {/* 4 Feature Highlights Grid */}
          <div className="crm__highlights-grid">
            {crmFeatures.map((item, idx) => (
              <div key={idx} className={`crm__highlight-item crm__highlight-item--${item.color}`}>
                <div className={`highlight-icon highlight-icon--${item.color}`}>
                  <i className={item.icon}></i>
                </div>
                <div className="highlight-text">
                  <strong>{item.title}</strong>
                  <span>{item.desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="crm__actions">
            <a
              href="https://crm.eaagri.vn/"
              target="_blank"
              rel="noopener noreferrer"
              className="crm__btn crm__btn--primary"
              title="Truy cập nền tảng EaAgri CRM tại crm.eaagri.vn"
            >
              <i className="ri-external-link-line"></i>
              <span>Truy Cập Nền Tảng EaAgri CRM</span>
              <span className="crm__btn-badge">crm.eaagri.vn ↗</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
