const ExpertSection = () => {
  return (
    <section id="section-expert" className="expert-section fullpage-slide">
      <div className="expert-bg-aura expert-bg-aura--1" aria-hidden="true"></div>
      <div className="expert-bg-aura expert-bg-aura--2" aria-hidden="true"></div>

      <div className="section__container expert-section__inner">
        {/* LEFT COLUMN: Concise Authority Bio */}
        <div className="expert-section-copy" data-aos="fade-right">
          <div className="expert-eyebrow">
            <span className="expert-eyebrow__icon">
              <i className="ri-award-line"></i>
            </span>
            <span className="expert-eyebrow__text">EA SCIENTIFIC ADVISORY • CỐ VẤN KHOA HỌC</span>
          </div>

          <h2 className="expert-title">
            Cố Vấn Khoa Học &<br />
            <span className="text-gradient">Nghiên Cứu Quốc Tế</span>
          </h2>

          {/* Concise Info Card */}
          <div className="expert-summary-card">
            <div className="expert-summary-card__header">
              <span className="expert-summary-tag">
                <span className="tag-flag">🇹🇼</span> NSTC ĐÀI LOAN
              </span>
              <h3 className="expert-summary-name">ThS. LIANG GUEI JIA</h3>
            </div>

            <p className="expert-summary-position">
              <i className="ri-government-line"></i>
              <span>Nghiên cứu viên Dự án Nông nghiệp — <strong>Hội đồng Khoa học và Công nghệ Quốc gia Đài Loan (NSTC)</strong></span>
            </p>

            <p className="expert-summary-desc">
              Cố vấn nghiên cứu chuyển giao kỹ thuật canh tác sinh thái, quản lý dinh dưỡng và chuẩn hóa quy trình sầu riêng chất lượng cao cho hệ sinh thái EaAgri.
            </p>
          </div>

          {/* Direct Contact Buttons */}
          <div className="expert-contact-row">
            <a
              href="tel:0782711721"
              className="expert-contact-btn expert-contact-btn--phone"
              title="Gọi hotline chuyên gia"
            >
              <i className="ri-phone-line"></i>
              <span>0782-711721</span>
            </a>
            <a
              href="mailto:horticulture1992@gmail.com"
              className="expert-contact-btn expert-contact-btn--email"
              title="Gửi email cho chuyên gia"
            >
              <i className="ri-mail-send-line"></i>
              <span>horticulture1992@gmail.com</span>
            </a>
          </div>
        </div>

        {/* RIGHT COLUMN: Big Standalone Expert Portrait */}
        <div className="expert-visual-showcase" data-aos="zoom-in" data-aos-delay="150">
          <div className="expert-big-card">
            {/* Main Expert Image */}
            <img
              src="/chuyen-gia.jpg"
              alt="ThS. LIANG GUEI JIA"
              className="expert-big-img"
            />

            {/* Glowing Backdrop Light */}
            <div className="expert-img-aura" aria-hidden="true"></div>

            {/* Floating Badge */}
            <div className="expert-floating-tag expert-floating-tag--top">
              <span className="tag-flag">🇹🇼</span>
              <span className="tag-text">NSTC Taiwan • Cố vấn Quốc tế</span>
            </div>

            {/* Bottom Caption Overlay */}
            <div className="expert-big-card__caption">
              <h3 className="caption-name">ThS. LIANG GUEI JIA</h3>
              <p className="caption-role">
                <i className="ri-government-line"></i> Nghiên cứu viên Dự án Nông nghiệp — NSTC Đài Loan
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExpertSection;
