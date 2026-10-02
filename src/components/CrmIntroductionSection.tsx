import { useState } from "react";

interface CrmModule {
  id: string;
  title: string;
  tag: string;
  icon: string;
  badgeColor: string;
  description: string;
  keyPoints: string[];
}

const CRM_MODULES: CrmModule[] = [
  {
    id: "support-tickets",
    title: "Hộp thư & Ca hỗ trợ kỹ thuật",
    tag: "Chăm sóc & Phác đồ",
    icon: "ri-customer-service-2-line",
    badgeColor: "emerald",
    description: "Tiếp nhận ca sâu bệnh gửi trực tiếp từ App nông hộ, phân công kỹ thuật viên chuyên trách, kê phác đồ xử lý chuẩn xác và đánh giá chất lượng phục vụ.",
    keyPoints: [
      "Tiếp nhận ảnh chụp và triệu chứng sâu bệnh từ nông hộ",
      "Kê đơn phác đồ điều trị gắn liền với sản phẩm của đại lý",
      "Hỗ trợ quyền thu hồi chia sẻ dữ liệu (Consent Revoke)"
    ]
  },
  {
    id: "pos-orders",
    title: "Đơn hàng & POS Commerce",
    tag: "Bán lẻ & Đơn App",
    icon: "ri-shopping-cart-2-line",
    badgeColor: "blue",
    description: "Hệ thống POS bán lẻ trực tiếp tại quầy kết hợp tiếp nhận đơn đặt hàng trực tuyến từ nông hộ, tự động trừ kho tức thời theo thời gian thực.",
    keyPoints: [
      "Tạo đơn bán lẻ tại quầy siêu tốc, tìm kiếm mã SKU tức thì",
      "Tự động in hóa đơn nhiệt / A4 đính kèm mã QR định danh đại lý",
      "Đồng bộ tồn kho hai chiều với app di động của nông dân"
    ]
  },
  {
    id: "debt-ledger",
    title: "Sổ cái công nợ (Debt Ledger)",
    tag: "Sổ cái bất biến",
    icon: "ri-booklet-line",
    badgeColor: "purple",
    description: "Sổ cái giao dịch kép dạng Append-only (không cho phép sửa hoặc xóa), tự động tính toán dư nợ tức thời (Debit / Credit) theo từng mùa vụ.",
    keyPoints: [
      "Lưu vết bất biến, loại bỏ hoàn toàn tranh chấp tài chính mùa vụ",
      "Theo dõi hạn mức nợ, lịch sử thanh toán từng đợt của nông hộ",
      "Cảnh báo thông minh khi công nợ vượt ngưỡng an toàn"
    ]
  },
  {
    id: "returns-refunds",
    title: "Đổi trả & Hoàn tiền",
    tag: "Minh bạch hậu mãi",
    icon: "ri-arrow-go-back-line",
    badgeColor: "orange",
    description: "Quy trình xử lý hàng lỗi, hết hạn có đối soát bằng chứng ảnh thực tế; hoàn tiền linh hoạt qua tiền mặt, cấn trừ công nợ hoặc cấp mã voucher đền bù.",
    keyPoints: [
      "Đính kèm hình ảnh thực tế hàng lỗi/hỏng làm căn cứ thẩm định",
      "Đa dạng phương thức hoàn: tiền mặt, cấn trừ nợ hoặc voucher",
      "Cập nhật trạng thái tự động và đồng bộ sổ sách tài chính"
    ]
  },
  {
    id: "discounts-promotions",
    title: "Mã giảm giá & Khuyến mãi",
    tag: "Tiếp thị & Bồi hoàn",
    icon: "ri-coupon-3-line",
    badgeColor: "rose",
    description: "Khởi tạo voucher theo chiến dịch bán hàng hoặc chính sách bồi hoàn; cơ chế kiểm tra hợp lệ chặt chẽ, chống race-condition trong giao dịch thanh toán.",
    keyPoints: [
      "Tạo mã khuyến mãi theo giá trị tiền hoặc phần trăm chiết khấu",
      "Kiểm soát điều kiện áp dụng, thời hạn và số lượt sử dụng tối đa",
      "Giao dịch an toàn, chống gian lận và xung đột thanh toán đồng thời"
    ]
  },
  {
    id: "multichannel-chat",
    title: "Chat đa kênh & Ghi chú nội bộ",
    tag: "Giao tiếp an toàn",
    icon: "ri-message-3-line",
    badgeColor: "cyan",
    description: "Kênh trò chuyện 1-1 bảo mật giữa nhân viên đại lý và bà con nông dân; tích hợp tab ghi chú nội bộ bí mật chỉ nhân sự đại lý được xem.",
    keyPoints: [
      "Trao đổi trực tiếp, gửi ảnh thực địa và tư vấn kỹ thuật nhanh",
      "Tab ghi chú nội bộ bảo mật thông tin nội bộ giữa các nhân viên",
      "Lưu trữ lịch sử hội thoại hỗ trợ theo dõi tiến trình mùa vụ"
    ]
  },
  {
    id: "farmer-simulator",
    title: "Farmer Simulator",
    tag: "Dev Tool / Testing",
    icon: "ri-terminal-box-line",
    badgeColor: "amber",
    description: "Công cụ Dev Tool tích hợp sẵn trên giao diện Web (/dev/farmer) giúp kiểm thử toàn bộ luồng nghiệp vụ phía nông dân mà không cần cài app di động.",
    keyPoints: [
      "Giả lập thao tác đặt hàng, gửi ca bệnh và tương tác từ app",
      "Kiểm thử end-to-end các ca biên nghiệp vụ nhanh chóng",
      "Hỗ trợ đại lý demo và đào tạo nhân viên mới trực quan"
    ]
  }
];

export default function CrmIntroductionSection() {
  const [activeTab, setActiveTab] = useState<"features" | "architecture" | "roles">("features");
  const [selectedModule, setSelectedModule] = useState<CrmModule>(CRM_MODULES[0]);

  return (
    <section id="section-crm" className="crm-section fullpage-slide">
      <div className="section__container crm__container">
        {/* SECTION HEADER */}
        <div className="crm__header" data-aos="fade-down">
          <span className="crm__eyebrow">
            <i className="ri-building-4-line"></i> EAAGRI SAAS B2B • QUẢN TRỊ ĐA THUÊ
          </span>
          <h2 className="crm__title">
            🌾 EaAgri CRM — <span className="highlight">Nền Tảng Quản Trị & Thương Mại Nông Nghiệp Đa Thuê</span>
          </h2>
          <div className="crm__positioning-callout" data-aos="fade-up" data-aos-delay="100">
            <div className="callout__icon">
              <i className="ri-compass-3-fill"></i>
            </div>
            <div className="callout__content">
              <strong>Định vị chiến lược:</strong> Hệ thống CRM & POS chuyên biệt dành cho các{" "}
              <span className="text-bold-accent">Đại lý Vật tư Nông nghiệp (VTNN)</span>, đóng vai trò cầu nối số đồng bộ hai chiều
              giữa đại lý và bà con <span className="text-bold-accent">Nông hộ</span> qua ứng dụng di động.
            </div>
          </div>

          {/* Header Action Portal Button */}
          <div className="crm__header-action" data-aos="fade-up" data-aos-delay="120">
            <a
              href="https://crm.eaagri.vn/"
              target="_blank"
              rel="noopener noreferrer"
              className="crm__portal-btn"
              title="Truy cập nền tảng EaAgri CRM (crm.eaagri.vn)"
            >
              <i className="ri-external-link-line"></i>
              <span>Truy Cập Nền Tảng EaAgri CRM</span>
              <span className="crm__portal-badge">crm.eaagri.vn</span>
            </a>
          </div>
        </div>

        {/* 3 PROBLEM-SOLVER PILLARS */}
        <div className="crm__pillars-grid" data-aos="fade-up" data-aos-delay="150">
          <div className="crm__pillar-card">
            <div className="pillar__icon-wrap pillar__icon-wrap--emerald">
              <i className="ri-file-shred-line"></i>
            </div>
            <div className="pillar__body">
              <span className="pillar__tag">Minh Bạch Tài Chính</span>
              <h3 className="pillar__title">Xóa Bỏ Sổ Sách Thủ Công</h3>
              <p className="pillar__desc">
                Kiểm soát công nợ mùa vụ phức tạp bằng <strong>sổ cái bất biến (Append-only)</strong>, hạn chế tối đa rủi ro thất thoát và triệt tiêu tranh chấp tài chính.
              </p>
            </div>
          </div>

          <div className="crm__pillar-card">
            <div className="pillar__icon-wrap pillar__icon-wrap--blue">
              <i className="ri-shield-check-line"></i>
            </div>
            <div className="pillar__body">
              <span className="pillar__tag">Quyền Riêng Tư &amp; Chuẩn Hóa</span>
              <h3 className="pillar__title">Số Hóa Tư Vấn Kỹ Thuật</h3>
              <p className="pillar__desc">
                Quy trình tiếp nhận và xử lý ca bệnh cây trồng minh bạch, gắn liền với cơ chế <strong>chấp thuận chia sẻ dữ liệu (Data Privacy / Consent)</strong>.
              </p>
            </div>
          </div>

          <div className="crm__pillar-card">
            <div className="pillar__icon-wrap pillar__icon-wrap--purple">
              <i className="ri-store-3-line"></i>
            </div>
            <div className="pillar__body">
              <span className="pillar__tag">Bán Hàng Đa Kênh</span>
              <h3 className="pillar__title">Hợp Nhất Kênh Bán Hàng</h3>
              <p className="pillar__desc">
                Đồng bộ tồn kho tức thì theo thời gian thực giữa bán lẻ trực tiếp tại quầy <strong>(Counter POS)</strong> và đơn đặt trực tuyến từ <strong>App nông dân</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* INTERACTIVE NAVIGATION TABS */}
        <div className="crm__tabs-wrapper" data-aos="fade-up" data-aos-delay="200">
          <div className="crm__tabs-nav" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "features"}
              className={`crm__tab-btn ${activeTab === "features" ? "is-active" : ""}`}
              onClick={() => setActiveTab("features")}
            >
              <i className="ri-dashboard-3-line"></i>
              <span>7 Phân Hệ Tính Năng Trọng Tâm</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "roles"}
              className={`crm__tab-btn ${activeTab === "roles" ? "is-active" : ""}`}
              onClick={() => setActiveTab("roles")}
            >
              <i className="ri-group-line"></i>
              <span>Mô Hình Người Dùng 3 Cấp</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "architecture"}
              className={`crm__tab-btn ${activeTab === "architecture" ? "is-active" : ""}`}
              onClick={() => setActiveTab("architecture")}
            >
              <i className="ri-cpu-line"></i>
              <span>Công Nghệ &amp; Điểm Nhấn Kiến Trúc</span>
            </button>
          </div>
        </div>

        {/* TAB 1: 7 PHÂN HỆ TÍNH NĂNG */}
        {activeTab === "features" && (
          <div className="crm__tab-content crm__features-view" data-aos="fade-up">
            <div className="crm__modules-layout">
              {/* Left List of Modules */}
              <div className="crm__modules-list">
                {CRM_MODULES.map((mod) => {
                  const isSelected = selectedModule.id === mod.id;
                  return (
                    <div
                      key={mod.id}
                      className={`crm__module-nav-item ${isSelected ? "is-selected" : ""}`}
                      onClick={() => setSelectedModule(mod)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") setSelectedModule(mod);
                      }}
                    >
                      <div className={`module-item__icon module-item__icon--${mod.badgeColor}`}>
                        <i className={mod.icon}></i>
                      </div>
                      <div className="module-item__text">
                        <span className="module-item__tag">{mod.tag}</span>
                        <h4 className="module-item__title">{mod.title}</h4>
                      </div>
                      <i className="ri-arrow-right-s-line module-item__arrow"></i>
                    </div>
                  );
                })}
              </div>

              {/* Right Detail Showcase */}
              <div className="crm__module-detail-card">
                <div className="detail-card__header">
                  <div className={`detail-card__badge detail-card__badge--${selectedModule.badgeColor}`}>
                    <i className={selectedModule.icon}></i>
                    <span>{selectedModule.tag}</span>
                  </div>
                  <h3 className="detail-card__title">{selectedModule.title}</h3>
                  <p className="detail-card__desc">{selectedModule.description}</p>
                </div>

                <div className="detail-card__points">
                  <h4 className="points-heading">
                    <i className="ri-check-double-line"></i> Năng lực nghiệp vụ cốt lõi:
                  </h4>
                  <ul className="points-list">
                    {selectedModule.keyPoints.map((point, idx) => (
                      <li key={idx} className="point-item">
                        <i className="ri-checkbox-circle-fill text-green"></i>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="detail-card__footer">
                  <span className="detail-card__tip">
                    <i className="ri-shield-star-line"></i> Đồng bộ chuẩn thời gian thực &amp; an toàn dữ liệu đa thuê
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MÔ HÌNH NGƯỜI DÙNG */}
        {activeTab === "roles" && (
          <div className="crm__tab-content crm__roles-view" data-aos="fade-up">
            <div className="crm__roles-grid">
              {/* Role 1: Super Admin */}
              <div className="crm__role-card crm__role-card--gold">
                <div className="role-card__header">
                  <div className="role-card__icon-box">
                    <i className="ri-vip-crown-fill"></i>
                  </div>
                  <span className="role-card__badge">TẦNG 1 • QUẢN TRỊ NỀN TẢNG</span>
                  <h3 className="role-card__title">Super Admin</h3>
                  <p className="role-card__subtitle">Quản trị viên toàn hệ thống SaaS</p>
                </div>
                <ul className="role-card__duties">
                  <li>
                    <i className="ri-check-line"></i> Quản trị danh bạ đại lý toàn quốc
                  </li>
                  <li>
                    <i className="ri-check-line"></i> Cấu hình gói cước SaaS (Plans &amp; Subscriptions)
                  </li>
                  <li>
                    <i className="ri-check-line"></i> Giám sát hệ thống &amp; tra cứu Audit Logs an ninh
                  </li>
                </ul>
                <div className="role-card__action">
                  <a
                    href="https://crm.eaagri.vn/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="role-card__link"
                    title="Truy cập cổng Super Admin trên crm.eaagri.vn"
                  >
                    <span>Cổng Quản Trị Hệ Thống</span>
                    <i className="ri-arrow-right-up-line"></i>
                  </a>
                </div>
              </div>

              {/* Role 2: Đại lý Agency */}
              <div className="crm__role-card crm__role-card--emerald is-featured">
                <div className="role-card__header">
                  <div className="role-card__icon-box">
                    <i className="ri-store-3-fill"></i>
                  </div>
                  <span className="role-card__badge">TẦNG 2 • ĐẠI LÝ VẬT TƯ (AGENCY)</span>
                  <h3 className="role-card__title">Đại Lý VTNN</h3>
                  <p className="role-card__subtitle">3 phân quyền nhân sự rõ ràng trong đại lý</p>
                </div>
                <div className="agency-subroles">
                  <div className="subrole-item">
                    <strong>Chủ đại lý (OWNER):</strong>
                    <span>Quản trị thành viên, gói thuê bao SaaS &amp; chính sách bán hàng.</span>
                  </div>
                  <div className="subrole-item">
                    <strong>Quản lý (MANAGER):</strong>
                    <span>Quản lý kho hàng, duyệt đổi trả/hoàn tiền, ghi sổ công nợ &amp; xem báo cáo.</span>
                  </div>
                  <div className="subrole-item">
                    <strong>Nhân viên (AGENT):</strong>
                    <span>Tiếp nhận ca hỗ trợ, tạo đơn POS tại quầy, đóng gói &amp; nhắc việc chăm sóc.</span>
                  </div>
                </div>
                <div className="role-card__action">
                  <a
                    href="https://crm.eaagri.vn/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="role-card__link"
                    title="Truy cập cổng Đại lý trên crm.eaagri.vn"
                  >
                    <span>Cổng Đăng Nhập Đại Lý</span>
                    <i className="ri-arrow-right-up-line"></i>
                  </a>
                </div>
              </div>

              {/* Role 3: Nông hộ Farmer */}
              <div className="crm__role-card crm__role-card--blue">
                <div className="role-card__header">
                  <div className="role-card__icon-box">
                    <i className="ri-user-smile-fill"></i>
                  </div>
                  <span className="role-card__badge">TẦNG 3 • NGƯỜI DÙNG CUỐI</span>
                  <h3 className="role-card__title">Nông Hộ (Farmer)</h3>
                  <p className="role-card__subtitle">Bà con canh tác sử dụng app di động</p>
                </div>
                <ul className="role-card__duties">
                  <li>
                    <i className="ri-check-line"></i> Đặt mua vật tư nông nghiệp chính hãng từ đại lý quen
                  </li>
                  <li>
                    <i className="ri-check-line"></i> Gửi ảnh chụp sâu bệnh để được tư vấn phác đồ kỹ thuật
                  </li>
                  <li>
                    <i className="ri-check-line"></i> Tra cứu lịch sử đơn hàng, phiếu bảo hành &amp; công nợ mùa vụ
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CÔNG NGHỆ & ĐIỂM NHẤN KIẾN TRÚC */}
        {activeTab === "architecture" && (
          <div className="crm__tab-content crm__arch-view" data-aos="fade-up">
            {/* Tech Stack Grid */}
            <div className="crm__tech-matrix">
              <div className="tech-matrix__card">
                <div className="tech-matrix__head">
                  <i className="ri-reactjs-line text-cyan"></i>
                  <h4>Frontend Hiện Đại</h4>
                </div>
                <p>
                  <strong>React 19</strong> • <strong>TypeScript (Strict Mode)</strong> • Vite • React Router DOM v7 • Vanilla CSS Glassmorphism với bộ HSL Design Tokens chuẩn mực.
                </p>
              </div>

              <div className="tech-matrix__card">
                <div className="tech-matrix__head">
                  <i className="ri-nodejs-line text-green"></i>
                  <h4>Backend Hiệu Năng Cao</h4>
                </div>
                <p>
                  <strong>Node.js (ESM)</strong> • Express.js RESTful API • Thư viện <code>jose</code> (Xác thực Firebase RS256 JWT qua JWKS tự động xoay khóa) • <code>scrypt</code> hashing.
                </p>
              </div>

              <div className="tech-matrix__card">
                <div className="tech-matrix__head">
                  <i className="ri-database-2-line text-blue"></i>
                  <h4>Cơ Sở Dữ Liệu</h4>
                </div>
                <p>
                  <strong>PostgreSQL</strong> • Native Connection Pool • Database Triggers tự động hóa • Composite Foreign Keys bảo đảm toàn vẹn dữ liệu đa chi nhánh.
                </p>
              </div>

              <div className="tech-matrix__card">
                <div className="tech-matrix__head">
                  <i className="ri-shield-keyhole-line text-purple"></i>
                  <h4>Bảo Mật Defense-in-Depth</h4>
                </div>
                <p>
                  <strong>4 tầng bảo vệ:</strong> Cookie HttpOnly / Firebase Auth ➜ Dynamic Membership ➜ Row-Level Security (RLS) ➜ Composite Foreign Keys. Chống brute-force rate limit.
                </p>
              </div>
            </div>

            {/* Architecture Highlights 3 Cards */}
            <div className="crm__highlights-row">
              <div className="highlight-pill highlight-pill--speed">
                <div className="highlight-pill__icon">
                  <i className="ri-flashlight-line"></i>
                </div>
                <div className="highlight-pill__text">
                  <strong>Zero Docker Overhead:</strong> Chạy dịch vụ Native tối ưu RAM trên VPS cấu hình vừa phải nhưng duy trì tốc độ phản hồi cực nhanh, độ trễ tối thiểu.
                </div>
              </div>

              <div className="highlight-pill highlight-pill--privacy">
                <div className="highlight-pill__icon">
                  <i className="ri-lock-password-line"></i>
                </div>
                <div className="highlight-pill__text">
                  <strong>Bảo Mật Dữ Liệu Cá Nhân:</strong> Tuân thủ tuyệt đối quyền riêng tư nông hộ, hỗ trợ hủy chia sẻ dữ liệu tức thì (<code>Consent Revoke</code>).
                </div>
              </div>

              <div className="highlight-pill highlight-pill--ledger">
                <div className="highlight-pill__icon">
                  <i className="ri-file-history-line"></i>
                </div>
                <div className="highlight-pill__text">
                  <strong>Sổ Sách Bất Biến:</strong> Mọi biến động công nợ và trạng thái đơn hàng đều ghi vết dạng append-only, chống gian lận và can thiệp số liệu.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CRM BOTTOM CTA BANNER */}
        <div className="crm__cta-banner" data-aos="fade-up">
          <div className="crm__cta-content">
            <div className="crm__cta-badge">
              <span className="cta-dot"></span> ĐÃ TRIỂN KHAI THỰC TẾ
            </div>
            <h3 className="crm__cta-title">Sẵn sàng trải nghiệm EaAgri CRM cho đại lý của bạn?</h3>
            <p className="crm__cta-desc">
              Hệ thống CRM &amp; POS đa thuê: Sổ cái công nợ bất biến, bán lẻ tại quầy siêu tốc và kết nối đồng bộ hai chiều với hàng nghìn nông hộ.
            </p>
          </div>
          <div className="crm__cta-action">
            <a
              href="https://crm.eaagri.vn/"
              target="_blank"
              rel="noopener noreferrer"
              className="crm__cta-btn"
              title="Truy cập trực tiếp https://crm.eaagri.vn/"
            >
              <span>Vào Cổng EaAgri CRM</span>
              <i className="ri-arrow-right-up-line"></i>
            </a>
            <span className="crm__cta-url">https://crm.eaagri.vn</span>
          </div>
        </div>
      </div>
    </section>
  );
}
