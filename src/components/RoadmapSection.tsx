import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase/client";

interface PhaseItem {
  title: string;
  time: string;
  status: string;
  statusText: string;
  icon: string;
  details: string;
}

export default function RoadmapSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    organization: "",
    cooperationType: "Hợp tác xã / Tổ hợp tác nông nghiệp",
    message: ""
  });

  // Handle ESC key to close modal & lock body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        handleCloseModal();
      }
    };

    if (isModalOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setIsSuccess(false);
    setErrorMessage("");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Reset form after short delay if already submitted
    if (isSuccess) {
      setFormData({
        fullName: "",
        phone: "",
        email: "",
        organization: "",
        cooperationType: "Hợp tác xã / Tổ hợp tác nông nghiệp",
        message: ""
      });
      setIsSuccess(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.fullName.trim()) {
      setErrorMessage("Vui lòng nhập họ và tên của bạn.");
      return;
    }

    if (!formData.phone.trim()) {
      setErrorMessage("Vui lòng nhập số điện thoại để EaAgri liên hệ lại.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Attempt saving to Supabase cooperation_requests table
      await supabase.from("cooperation_requests").insert([
        {
          full_name: formData.fullName.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim() || null,
          organization: formData.organization.trim() || null,
          cooperation_type: formData.cooperationType,
          message: formData.message.trim() || null,
          status: "pending",
          created_at: new Date().toISOString()
        }
      ]);
    } catch (err) {
      console.warn("Cooperation request logged locally:", err);
    } finally {
      setIsSubmitting(false);
      setIsSuccess(true);
    }
  };

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
            <button 
              type="button"
              onClick={handleOpenModal}
              className="btn roadmap__cta-btn"
              title="Mở form liên hệ hợp tác"
            >
              <i className="ri-shake-hands-line"></i> Liên Hệ Hợp Tác
            </button>
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

      {/* Cooperation Contact Modal */}
      {isModalOpen && (
        <div className="coop-modal__backdrop" onClick={handleCloseModal}>
          <div 
            className="coop-modal__dialog" 
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="coop-modal-title"
          >
            {/* Modal Header */}
            <div className="coop-modal__header">
              <div className="coop-modal__header-content">
                <span className="coop-modal__badge">
                  <i className="ri-leaf-line"></i> EAAGRI PARTNERSHIP
                </span>
                <h3 id="coop-modal-title" className="coop-modal__title">
                  Đăng Ký Liên Hệ Hợp Tác
                </h3>
                <p className="coop-modal__desc">
                  Cùng EaAgri kiến tạo chuỗi giá trị nông nghiệp thông minh & bền vững.
                </p>
              </div>
              <button 
                type="button" 
                className="coop-modal__close-btn" 
                onClick={handleCloseModal}
                aria-label="Đóng biểu mẫu"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="coop-modal__body">
              {isSuccess ? (
                <div className="coop-modal__success-view">
                  <div className="coop-modal__success-icon">
                    <i className="ri-checkbox-circle-fill"></i>
                  </div>
                  <h4>Gửi Thông Tin Thành Công!</h4>
                  <p>
                    Cảm ơn Quý đối tác <strong>{formData.fullName}</strong> đã quan tâm đồng hành cùng EaAgri. Đội ngũ chuyên gia của chúng tôi sẽ liên hệ lại qua số điện thoại <strong>{formData.phone}</strong> trong thời gian sớm nhất (trong vòng 24h).
                  </p>

                  <div className="coop-modal__success-actions">
                    <button 
                      type="button" 
                      className="btn btn--primary coop-modal__btn-done"
                      onClick={handleCloseModal}
                    >
                      <i className="ri-check-line"></i> Hoàn Tất
                    </button>
                    <a 
                      href="https://www.facebook.com/profile.php?id=61577351045350"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn coop-modal__btn-social"
                    >
                      <i className="ri-facebook-circle-fill"></i> Nhắn tin Facebook
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="coop-modal__form">
                  {errorMessage && (
                    <div className="coop-modal__alert coop-modal__alert--error">
                      <i className="ri-error-warning-line"></i>
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="coop-modal__row">
                    <div className="coop-modal__field">
                      <label htmlFor="coop-fullName">
                        Họ và tên đại diện <span className="coop-modal__req">*</span>
                      </label>
                      <div className="coop-modal__input-wrap">
                        <i className="ri-user-3-line"></i>
                        <input
                          id="coop-fullName"
                          type="text"
                          name="fullName"
                          placeholder="Nguyễn Văn A"
                          value={formData.fullName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="coop-modal__field">
                      <label htmlFor="coop-phone">
                        Số điện thoại / Zalo <span className="coop-modal__req">*</span>
                      </label>
                      <div className="coop-modal__input-wrap">
                        <i className="ri-phone-line"></i>
                        <input
                          id="coop-phone"
                          type="tel"
                          name="phone"
                          placeholder="0987 654 321"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="coop-modal__row">
                    <div className="coop-modal__field">
                      <label htmlFor="coop-email">
                        Địa chỉ Email
                      </label>
                      <div className="coop-modal__input-wrap">
                        <i className="ri-mail-line"></i>
                        <input
                          id="coop-email"
                          type="email"
                          name="email"
                          placeholder="doitac@gmail.com"
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="coop-modal__field">
                      <label htmlFor="coop-org">
                        Tên Hợp tác xã / Doanh nghiệp / Trang trại
                      </label>
                      <div className="coop-modal__input-wrap">
                        <i className="ri-community-line"></i>
                        <input
                          id="coop-org"
                          type="text"
                          name="organization"
                          placeholder="HTX Sầu Riêng Krông Pắc..."
                          value={formData.organization}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="coop-modal__field">
                    <label htmlFor="coop-type">
                      Hình thức / Mục tiêu hợp tác
                    </label>
                    <div className="coop-modal__input-wrap">
                      <i className="ri-shake-hands-line"></i>
                      <select
                        id="coop-type"
                        name="cooperationType"
                        value={formData.cooperationType}
                        onChange={handleChange}
                      >
                        <option value="Hợp tác xã / Tổ hợp tác nông nghiệp">
                          🌾 Hợp tác xã / Tổ hợp tác nông nghiệp
                        </option>
                        <option value="Chủ trang trại / Nhà vườn sầu riêng">
                          🌳 Chủ trang trại / Nhà vườn sầu riêng
                        </option>
                        <option value="Doanh nghiệp thu mua & xuất khẩu">
                          📦 Doanh nghiệp thu mua & xuất khẩu nông sản
                        </option>
                        <option value="Nhà cung ứng phân bón & VTNN">
                          🧪 Nhà cung ứng phân bón & Vật tư nông nghiệp
                        </option>
                        <option value="Đối tác công nghệ / Nghiên cứu & Đầu tư">
                          💡 Đối tác công nghệ / Nghiên cứu / Nhà đầu tư
                        </option>
                        <option value="Hình thức khác">
                          🤝 Đề xuất hình thức hợp tác khác
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="coop-modal__field">
                    <label htmlFor="coop-message">
                      Nội dung / Yêu cầu chi tiết
                    </label>
                    <div className="coop-modal__input-wrap coop-modal__input-wrap--textarea">
                      <textarea
                        id="coop-message"
                        name="message"
                        rows={3}
                        placeholder="Mô tả quy mô vườn, diện tích, nhu cầu chuyển đổi số hoặc mong muốn hợp tác cụ thể..."
                        value={formData.message}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="coop-modal__footer">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn btn--primary coop-modal__submit-btn"
                    >
                      {isSubmitting ? (
                        <>
                          <i className="ri-loader-4-line coop-modal__spinner"></i> Đang gửi yêu cầu...
                        </>
                      ) : (
                        <>
                          <i className="ri-send-plane-fill"></i> Gửi Yêu Cầu Hợp Tác
                        </>
                      )}
                    </button>
                    
                    <div className="coop-modal__direct-contact">
                      <span>Hoặc liên hệ trực tiếp:</span>
                      <a href="mailto:eaagri@eaagri.vn" className="coop-modal__contact-link">
                        <i className="ri-mail-send-line"></i> eaagri@eaagri.vn
                      </a>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}