interface AwardsSectionProps {
  image: string;
  imageAlt: string;
}

export default function AwardsSection({ image, imageAlt }: AwardsSectionProps) {
  return (
    <section className="section__container awards-section__container">
      <div className="awards-section__grid">
        <div className="awards-section__image-side" data-aos="fade-right">
          <div className="awards-section__card-wrapper">
            <div className="awards-section__certificate-card">
              <div className="awards-section__shine"></div>
              <img src={image} alt={imageAlt} className="awards-section__img" />
              <div className="awards-section__badge-ribbon">
                <i className="ri-vip-crown-fill"></i>
                <span>Excellent No. 1</span>
              </div>
            </div>
            <div className="awards-section__floating-badge awards-section__floating-badge--2">
              <i className="ri-award-fill"></i>
              <div>
                <strong>Đại học NTT</strong>
                <span>Khoa CNTT vinh danh</span>
              </div>
            </div>
          </div>
        </div>

        <div className="awards-section__content-side" data-aos="fade-left">
          <span className="awards-section__tag">
            <i className="ri-trophy-line"></i> Danh Hiệu & Giải Thưởng
          </span>
          <h2 className="awards-section__title">
            Vinh Danh Tại Cuộc Thi <span className="highlight">Trí Tuệ Nhân Tạo 2026</span>
          </h2>
          <p className="awards-section__subtitle">
            Dự án <strong>EaAgri</strong> tự hào đạt giải thưởng cao nhất tại sân chơi học thuật uy tín của Trường Đại học Nguyễn Tất Thành, khẳng định tính đột phá và ứng dụng thực tiễn cao của giải pháp.
          </p>

          <div className="awards-section__points">
            <div className="awards-section__point-card">
              <div className="awards-section__point-icon">
                <i className="ri-medal-line"></i>
              </div>
              <div className="awards-section__point-info">
                <h3>Giải thưởng cao nhất (Excellent No. 1)</h3>
                <p>
                  Vượt qua hàng chục đề tài công nghệ, EaAgri xuất sắc dành ngôi vị Quán quân nhờ mô hình "Trợ lý nông nghiệp thông minh" tích hợp AI toàn diện.
                </p>
              </div>
            </div>

            <div className="awards-section__point-card">
              <div className="awards-section__point-icon">
                <i className="ri-seedling-line"></i>
              </div>
              <div className="awards-section__point-info">
                <h3>Đánh giá cao từ hội đồng chuyên gia</h3>
                <p>
                  Hệ thống cảm biến IoT kết hợp AI được các nhà khoa học đánh giá là giải pháp thực tiễn cao nhất để hóa giải "Tứ giác rủi ro" tại Tây Nguyên.
                </p>
              </div>
            </div>

            <div className="awards-section__point-card">
              <div className="awards-section__point-icon">
                <i className="ri-shield-check-line"></i>
              </div>
              <div className="awards-section__point-info">
                <h3>Động lực phát triển bền vững</h3>
                <p>
                  Thành tựu này là bệ phóng vững chắc để đội ngũ kỹ sư EaAgri tiếp tục hoàn thiện, chuyển dịch nông nghiệp Tây Nguyên sang hướng nông nghiệp số.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
