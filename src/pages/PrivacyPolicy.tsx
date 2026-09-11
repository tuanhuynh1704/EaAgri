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
              HỆ SINH THÁI NÔNG NGHIỆP THÔNG MINH EAAGRI / AI + IOT
            </span>
            <h1 className="privacy-page__title">
              Chính sách bảo<br />mật của<br />EaAgri
            </h1>
            <p className="privacy-page__desc">
              Chính sách bảo mật này giải thích cách EaAgri thu thập, sử dụng và bảo vệ dữ liệu cho hệ sinh thái trợ lý nông nghiệp thông minh dựa trên nền tảng IoT và trí tuệ nhân tạo của chúng tôi.
            </p>
          </div>

          <div className="privacy-page__hero-right">
            <div className="privacy-page__badge-matrix">
              <div className="privacy-page__badge-item">
                CẢM BIẾN IOT NÔNG NGHIỆP
              </div>
              <div className="privacy-page__badge-item">
                TRUY XUẤT NGUỒN GỐC QR
              </div>
              <div className="privacy-page__badge-item">
                CẢNH BÁO THỜI GIAN THỰC
              </div>
              <div className="privacy-page__badge-item">
                TRỢ LÝ NÔNG NGHIỆP AI
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
              <li className="privacy-page__list-item">Địa chỉ email và số điện thoại liên lạc</li>
              <li className="privacy-page__list-item">Thông tin tài khoản nông hộ / người dùng</li>
              <li className="privacy-page__list-item">Dữ liệu đo từ xa của cảm biến IoT EaAgri (độ ẩm, nhiệt độ, pH đất)</li>
              <li className="privacy-page__list-item">Thông tin mùa vụ, nhật ký canh tác và mã QR truy xuất</li>
              <li className="privacy-page__list-item">Dữ liệu tương tác và phân tích sử dụng ứng dụng</li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="privacy-page__card" data-aos="fade-up" data-aos-delay="200">
            <h2 className="privacy-page__card-title">
              CÁCH CHÚNG TÔI SỬ DỤNG THÔNG TIN
            </h2>
            <ul className="privacy-page__list">
              <li className="privacy-page__list-item">Xác thực và bảo vệ tài khoản người dùng</li>
              <li className="privacy-page__list-item">Giám sát điều kiện môi trường và sức khỏe cây trồng</li>
              <li className="privacy-page__list-item">Gửi thông báo và cảnh báo sâu bệnh thời gian thực</li>
              <li className="privacy-page__list-item">Phân tích chẩn đoán và đề xuất canh tác tối ưu bằng AI</li>
              <li className="privacy-page__list-item">Hỗ trợ kỹ thuật và chăm sóc khách hàng/nhà nông</li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="privacy-page__card" data-aos="fade-up" data-aos-delay="150">
            <h2 className="privacy-page__card-title">
              BẢO MẬT DỮ LIỆU
            </h2>
            <ul className="privacy-page__list">
              <li className="privacy-page__list-item">Lưu trữ đám mây bảo mật và độ sẵn sàng cao</li>
              <li className="privacy-page__list-item">Giao tiếp truyền dẫn được mã hóa chuẩn SSL/TLS</li>
              <li className="privacy-page__list-item">Kiểm soát và phân quyền truy cập dữ liệu nghiêm ngặt</li>
            </ul>
          </div>

          {/* Card 4 */}
          <div className="privacy-page__card" data-aos="fade-up" data-aos-delay="250">
            <h2 className="privacy-page__card-title">
              QUYỀN CỦA NGƯỜI DÙNG
            </h2>
            <ul className="privacy-page__list">
              <li className="privacy-page__list-item">Truy cập và xem dữ liệu cá nhân & dữ liệu canh tác</li>
              <li className="privacy-page__list-item">Yêu cầu cập nhật hoặc chỉnh sửa thông tin nông hộ</li>
              <li className="privacy-page__list-item">Yêu cầu xóa tài khoản và dữ liệu liên quan</li>
            </ul>
          </div>

          {/* Card 5 */}
          <div className="privacy-page__card privacy-page__card--full" data-aos="fade-up" data-aos-delay="300">
            <h2 className="privacy-page__card-title">
              DỊCH VỤ CỦA BÊN THỨ BA
            </h2>
            <ul className="privacy-page__list">
              <li className="privacy-page__list-item">Supabase (Hạ tầng lưu trữ cơ sở dữ liệu & xác thực)</li>
              <li className="privacy-page__list-item">Dịch vụ gửi email thông báo và xác nhận bảo mật</li>
              <li className="privacy-page__list-item">Google Gemini / AI Models (Mô hình Trợ lý Nông nghiệp thông minh)</li>
              <li className="privacy-page__list-item">Dịch vụ dữ liệu thời tiết và khí tượng chuyên sâu</li>
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
