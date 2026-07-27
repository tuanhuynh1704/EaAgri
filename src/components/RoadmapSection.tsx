import { useNavigate } from "react-router-dom";

const RoadmapSection = () => {
  const navigate = useNavigate();

  const linkHandle = () => {
    navigate('https://www.facebook.com/profile.php?id=61577351045350')
  }

  return (
    <section
      className="membership__container section__container"
      data-aos="fade-up"
    >
      <div
        className="membership__image"
        data-aos="zoom-in"
      >
        <img
          src="/assets/tải xuống.png"
          alt="EaAgri Roadmap"
        />
      </div>

      <div
        className="membership__content"
        data-aos="fade-left"
      >
        <h2 className="section__header">
          Lộ Trình
          <br />
          Phát Triển
        </h2>

        <p className="section__description">
          Mở rộng quy mô <span>Hợp Tác Xã</span>
          {" "}
          và thương mại hóa hệ sinh thái EaAgri.
        </p>

        <p className="section__description">
          Giai đoạn tiếp theo: Tích hợp thanh toán, phát triển phần cứng EaAgri Box và mở rộng sang Hồ tiêu, Cà phê.
        </p>

        <div className="membership__btn">
          <a href="https://www.facebook.com/profile.php?id=61577351045350" target="blank" className="btn">
            Liên Hệ Hợp Tác
          </a>
        </div>
      </div>
    </section>
  );
};

export default RoadmapSection;