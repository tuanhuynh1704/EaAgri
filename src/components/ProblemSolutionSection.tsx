interface ProblemSolutionSectionProps {
  image: string;
  imageAlt: string;
}

export default function ProblemSolutionSection({ image, imageAlt }: ProblemSolutionSectionProps) {
  return (
    <section className="section__container problem-solution__container">
      <div className="problem-solution__grid">
        <div className="problem-solution__image-side" data-aos="fade-right">
          <div className="problem-solution__image-wrapper">
            <div className="problem-solution__window-header">
              <span className="dot dot--red"></span>
              <span className="dot dot--yellow"></span>
              <span className="dot dot--green"></span>
              <span className="problem-solution__window-title">EaAgri System Diagram</span>
            </div>
            <div className="problem-solution__image-container">
              <img src={image} alt={imageAlt} className="problem-solution__img" />
              <div className="problem-solution__image-overlay"></div>
            </div>
            {/* Floating dashboard widgets */}
            <div className="problem-solution__widget problem-solution__widget--sensors">
              <i className="ri-temp-hot-line"></i>
              <div>
                <strong>Nhiệt độ đất</strong>
                <span>28.5°C - Ổn định</span>
              </div>
            </div>
            <div className="problem-solution__widget problem-solution__widget--ai">
              <i className="ri-cpu-line"></i>
              <div>
                <strong>Chẩn đoán AI</strong>
                <span>Cây khỏe mạnh 98%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="problem-solution__content-side" data-aos="fade-left">
          <span className="problem-solution__tag">
            <i className="ri-lightbulb-line"></i> Tầm Nhìn & Sứ Mệnh
          </span>
          <h2 className="problem-solution__title">
            Vấn Đề & <span className="highlight">Giải Pháp</span>
          </h2>

          <div className="problem-solution__cards">
            {/* The Problem Card */}
            <div className="problem-solution__card problem-solution__card--problem">
              <div className="problem-solution__card-icon">
                <i className="ri-error-warning-line"></i>
              </div>
              <div className="problem-solution__card-body">
                <h3>"Tứ Giác Rủi Ro" Trong Nông Nghiệp</h3>
                <p>
                  Nông nghiệp Tây Nguyên đối mặt thách thức lớn: <strong>sốc nước</strong> cực đoan, <strong>dịch bệnh</strong> phức tạp, <strong>thiếu hụt tri thức</strong> canh tác chuyên sâu và <strong>bất đối xứng thông tin</strong> thị trường.
                </p>
              </div>
            </div>

            {/* The Solution Card */}
            <div className="problem-solution__card problem-solution__card--solution">
              <div className="problem-solution__card-icon">
                <i className="ri-checkbox-circle-line"></i>
              </div>
              <div className="problem-solution__card-body">
                <h3>Số Hóa Với "Data-Driven Farming"</h3>
                <p>
                  <strong>EaAgri</strong> ra đời để số hóa quy trình canh tác, tối ưu hóa tài nguyên nước/phân bón, và kết nối nông dân trực tiếp với các chuyên gia kỹ thuật thông qua công nghệ <strong>AI & IoT</strong> tiên tiến.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
