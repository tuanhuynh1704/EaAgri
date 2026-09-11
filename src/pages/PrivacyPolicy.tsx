import { useEffect } from "react";

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="privacy-page">
      <div className="privacy-page__container">
        {/* Header / Hero Section */}
        <section className="privacy-page__hero" data-aos="fade-up">
          <div className="privacy-page__hero-left">
            <span className="privacy-page__eyebrow">
              NỀN TẢNG INTELLIGENTPACK / AI + IOT
            </span>
            <h1 className="privacy-page__title">
              Chính sách bảo<br />mật của<br />IntelligentPack
            </h1>
            <p className="privacy-page__desc">
              Chính sách bảo mật này giải thích cách IntelligentPack thu thập, sử dụng và bảo vệ dữ liệu cho nền tảng giám sát bưu kiện dựa trên IoT và trí tuệ nhân tạo của mình.
            </p>
          </div>

          <div className="privacy-page__hero-right">
            <div className="privacy-page__badge-matrix">
              <div className="privacy-page__badge-item">
                ĐO LƯỜNG TỪ XA IOT
              </div>
              <div className="privacy-page__badge-item">
                GIÁM SÁT QR
              </div>
              <div className="privacy-page__badge-item">
                CẢNH BÁO THỜI GIAN THỰC
              </div>
              <div className="privacy-page__badge-item">
                PHÂN TÍCH AI
              </div>
            </div>
          </div>
        </section>

        {/* Content Cards Grid */}
        <div className="privacy-page__grid">
          {/* Card 1 */}
          <div className="privacy-page__card" data-aos="fade-up" data-aos-delay="100">
            <h2 className="privacy-page__card-title">
              THÔNG TIN CHÚNG TÔI THU THẬP
            </h2>
            <ul className="privacy-page__list">
              <li className="privacy-page__list-item">Địa chỉ email</li>
              <li className="privacy-page__list-item">Thông tin tài khoản người dùng</li>
              <li className="privacy-page__list-item">Dữ liệu đo từ xa của thiết bị IntelligentPack</li>
              <li className="privacy-page__list-item">Thông tin gói hàng QR</li>
              <li className="privacy-page__list-item">Phân tích sử dụng</li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="privacy-page__card" data-aos="fade-up" data-aos-delay="200">
            <h2 className="privacy-page__card-title">
              CÁCH CHÚNG TÔI SỬ DỤNG THÔNG TIN
            </h2>
            <ul className="privacy-page__list">
              <li className="privacy-page__list-item">Xác thực</li>
              <li className="privacy-page__list-item">Giám sát gói hàng</li>
              <li className="privacy-page__list-item">Cảnh báo thời gian thực</li>
              <li className="privacy-page__list-item">phân tích dựa trên trí tuệ nhân tạo</li>
              <li className="privacy-page__list-item">Hỗ trợ khách hàng</li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="privacy-page__card" data-aos="fade-up" data-aos-delay="150">
            <h2 className="privacy-page__card-title">
              BẢO MẬT DỮ LIỆU
            </h2>
            <ul className="privacy-page__list">
              <li className="privacy-page__list-item">Lưu trữ đám mây an toàn</li>
              <li className="privacy-page__list-item">Giao tiếp được mã hóa</li>
              <li className="privacy-page__list-item">Kiểm soát truy cập</li>
            </ul>
          </div>

          {/* Card 4 */}
          <div className="privacy-page__card" data-aos="fade-up" data-aos-delay="250">
            <h2 className="privacy-page__card-title">
              QUYỀN CỦA NGƯỜI DÙNG
            </h2>
            <ul className="privacy-page__list">
              <li className="privacy-page__list-item">Truy cập dữ liệu cá nhân</li>
              <li className="privacy-page__list-item">Yêu cầu chỉnh sửa</li>
              <li className="privacy-page__list-item">Yêu cầu xóa</li>
            </ul>
          </div>

          {/* Card 5 */}
          <div className="privacy-page__card privacy-page__card--full" data-aos="fade-up" data-aos-delay="300">
            <h2 className="privacy-page__card-title">
              DỊCH VỤ CỦA BÊN THỨ BA
            </h2>
            <ul className="privacy-page__list">
              <li className="privacy-page__list-item">Supabase</li>
              <li className="privacy-page__list-item">Gửi lại email</li>
              <li className="privacy-page__list-item">OpenAI (Phân tích AI)</li>
            </ul>
          </div>
        </div>

        {/* Contact / Footer Support Section */}
        <section className="privacy-page__contact-section" data-aos="fade-up" data-aos-delay="350">
          <div className="privacy-page__contact-header">
            <h2 className="privacy-page__contact-title">
              LIÊN HỆ
            </h2>
          </div>
          <div className="privacy-page__contact-body">
            <div className="privacy-page__contact-info">
              <span>Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật hoặc yêu cầu xử lý dữ liệu cá nhân, vui lòng liên hệ:</span>
              <a href="mailto:eaagri@eaagri.id.vn">
                <i className="ri-mail-send-line"></i> eaagri@eaagri.id.vn
              </a>
            </div>
            <a href="mailto:eaagri@eaagri.id.vn" className="privacy-page__contact-btn">
              <i className="ri-send-plane-fill"></i>
              <span>Gửi yêu cầu hỗ trợ</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
