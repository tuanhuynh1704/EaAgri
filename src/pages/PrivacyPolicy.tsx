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
              <i className="ri-shield-keyhole-line"></i>
              HỆ SINH THÁI NÔNG NGHIỆP THÔNG MINH EAAGRI
            </span>
            <h1 className="privacy-page__title">
              Chính sách bảo mật của<br />EaAgri
            </h1>
            <p className="privacy-page__desc">
              Chính sách bảo mật này giải thích cách EaAgri thu thập, sử dụng và bảo vệ dữ liệu cho hệ sinh thái trợ lý nông nghiệp thông minh tích hợp IoT và trí tuệ nhân tạo phục vụ bà con nông dân.
            </p>
          </div>

          <div className="privacy-page__hero-right">
            <div className="privacy-page__badge-matrix">
              <div className="privacy-page__badge-item">
                <i className="ri-radar-line"></i>
                <span>CẢM BIẾN IOT VƯỜN CÂY</span>
              </div>
              <div className="privacy-page__badge-item">
                <i className="ri-brain-line"></i>
                <span>TRỢ LÝ NÔNG NGHIỆP AI</span>
              </div>
              <div className="privacy-page__badge-item">
                <i className="ri-camera-lens-line"></i>
                <span>THỊ GIÁC MÁY TÍNH AI</span>
              </div>
              <div className="privacy-page__badge-item">
                <i className="ri-temp-hot-line"></i>
                <span>DỰ BÁO THỜI TIẾT</span>
              </div>
            </div>
          </div>
        </section>

        {/* Content Cards Grid */}
        <div className="privacy-page__grid">
          {/* Card 1 */}
          <div className="privacy-page__card" data-aos="fade-up" data-aos-delay="100">
            <h2 className="privacy-page__card-title">
              <span className="privacy-page__card-icon">
                <i className="ri-database-2-line"></i>
              </span>
              THÔNG TIN CHÚNG TÔI THU THẬP
            </h2>
            <ul className="privacy-page__list">
              <li className="privacy-page__list-item">
                <i className="ri-checkbox-circle-fill"></i>
                <span>Thông tin tài khoản: Họ tên, địa chỉ email và mật khẩu được mã hóa an toàn</span>
              </li>
              <li className="privacy-page__list-item">
                <i className="ri-checkbox-circle-fill"></i>
                <span>Hình ảnh lá và nông sản được tải lên phục vụ chẩn đoán bệnh bằng AI</span>
              </li>
              <li className="privacy-page__list-item">
                <i className="ri-checkbox-circle-fill"></i>
                <span>Tín hiệu âm thanh khi sử dụng tính năng nhận diện giọng nói (Speech-to-Text)</span>
              </li>
              <li className="privacy-page__list-item">
                <i className="ri-checkbox-circle-fill"></i>
                <span>Dữ liệu đo từ xa của trạm IoT: độ ẩm đất đa tầng, nhiệt độ, trạng thái máy tưới</span>
              </li>
              <li className="privacy-page__list-item">
                <i className="ri-checkbox-circle-fill"></i>
                <span>Lịch sử tư vấn, hội thoại hỏi đáp với Trợ lý AI và nhật ký canh tác</span>
              </li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="privacy-page__card" data-aos="fade-up" data-aos-delay="200">
            <h2 className="privacy-page__card-title">
              <span className="privacy-page__card-icon">
                <i className="ri-cpu-line"></i>
              </span>
              CÁCH CHÚNG TÔI SỬ DỤNG THÔNG TIN
            </h2>
            <ul className="privacy-page__list">
              <li className="privacy-page__list-item">
                <i className="ri-checkbox-circle-fill"></i>
                <span>Xác thực danh tính và phân quyền vai trò (Nông hộ, Quản trị viên, Biên tập viên)</span>
              </li>
              <li className="privacy-page__list-item">
                <i className="ri-checkbox-circle-fill"></i>
                <span>Chẩn đoán bệnh hại trên cây trồng và đưa ra phác đồ điều trị chuẩn VietGAP</span>
              </li>
              <li className="privacy-page__list-item">
                <i className="ri-checkbox-circle-fill"></i>
                <span>Tự động hóa chu trình tưới thông minh 3 lớp dựa trên dữ liệu cảm biến và thời tiết</span>
              </li>
              <li className="privacy-page__list-item">
                <i className="ri-checkbox-circle-fill"></i>
                <span>Hỗ trợ giao tiếp đa phương thức: phản hồi bằng văn bản và giọng nói tiếng Việt</span>
              </li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="privacy-page__card" data-aos="fade-up" data-aos-delay="150">
            <h2 className="privacy-page__card-title">
              <span className="privacy-page__card-icon">
                <i className="ri-shield-check-line"></i>
              </span>
              BẢO MẬT DỮ LIỆU
            </h2>
            <ul className="privacy-page__list">
              <li className="privacy-page__list-item">
                <i className="ri-checkbox-circle-fill"></i>
                <span>Lưu trữ đám mây an toàn với chính sách kiểm soát bảo mật Row Level Security (RLS)</span>
              </li>
              <li className="privacy-page__list-item">
                <i className="ri-checkbox-circle-fill"></i>
                <span>Truyền tải dữ liệu mã hóa đầu cuối chuẩn SSL/TLS và đường hầm bảo mật</span>
              </li>
              <li className="privacy-page__list-item">
                <i className="ri-checkbox-circle-fill"></i>
                <span>Kiểm soát phân quyền nghiêm ngặt, cam kết không bán dữ liệu cho bên thứ ba</span>
              </li>
            </ul>
          </div>

          {/* Card 4 */}
          <div className="privacy-page__card" data-aos="fade-up" data-aos-delay="250">
            <h2 className="privacy-page__card-title">
              <span className="privacy-page__card-icon">
                <i className="ri-user-settings-line"></i>
              </span>
              QUYỀN CỦA NGƯỜI DÙNG
            </h2>
            <ul className="privacy-page__list">
              <li className="privacy-page__list-item">
                <i className="ri-checkbox-circle-fill"></i>
                <span>Truy cập, tra cứu lịch sử chẩn đoán và toàn bộ hội thoại tư vấn AI của bản thân</span>
              </li>
              <li className="privacy-page__list-item">
                <i className="ri-checkbox-circle-fill"></i>
                <span>Yêu cầu chỉnh sửa, cập nhật thông tin tài khoản và bài viết/nội dung đã đăng</span>
              </li>
              <li className="privacy-page__list-item">
                <i className="ri-checkbox-circle-fill"></i>
                <span>Yêu cầu xóa tài khoản cùng toàn bộ dữ liệu lịch sử liên quan khỏi hệ thống</span>
              </li>
            </ul>
          </div>

          {/* Card 5 */}
          <div className="privacy-page__card privacy-page__card--full" data-aos="fade-up" data-aos-delay="300">
            <h2 className="privacy-page__card-title">
              <span className="privacy-page__card-icon">
                <i className="ri-links-line"></i>
              </span>
              DỊCH VỤ CỦA BÊN THỨ BA
            </h2>
            <ul className="privacy-page__list">
              <li className="privacy-page__list-item">
                <i className="ri-checkbox-circle-fill"></i>
                <span><strong>Supabase:</strong> Nền tảng Cơ sở dữ liệu Postgres, Xác thực người dùng (Auth) và Lưu trữ đám mây</span>
              </li>
              <li className="privacy-page__list-item">
                <i className="ri-checkbox-circle-fill"></i>
                <span><strong>Google Gemini & AI Models:</strong> Mô hình trí tuệ nhân tạo phân tích tri thức nông nghiệp và xử lý ngôn ngữ</span>
              </li>
              <li className="privacy-page__list-item">
                <i className="ri-checkbox-circle-fill"></i>
                <span><strong>Mô hình thị giác máy tính (Computer Vision):</strong> Nhận diện và khoanh vùng bệnh sầu riêng theo thời gian thực</span>
              </li>
              <li className="privacy-page__list-item">
                <i className="ri-checkbox-circle-fill"></i>
                <span><strong>Web Speech API & Google TTS:</strong> Chuyển đổi giọng nói - văn bản hai chiều phục vụ bà con</span>
              </li>
              <li className="privacy-page__list-item">
                <i className="ri-checkbox-circle-fill"></i>
                <span><strong>Dịch vụ dữ liệu Khí tượng & Thời tiết:</strong> Phục vụ cơ chế tự động dừng tưới phòng chống úng ngập</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact / Footer Support Section */}
        <section className="privacy-page__contact-section" data-aos="fade-up" data-aos-delay="350">
          <div className="privacy-page__contact-header">
            <h2 className="privacy-page__contact-title">
              <i className="ri-customer-service-2-line"></i>
              LIÊN HỆ & HỖ TRỢ
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
