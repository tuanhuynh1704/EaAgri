const logos = [
  { src: "/Logo/NTTU.jpg", alt: "Nguyễn Tất Thành University" },
  { src: "/Logo/FIT.png", alt: "FIT" },
  { src: "/Logo/NIIC.jpg", alt: "NIIC" },
  { src: "/Logo/vietfuturelogo.png", alt: "VietFuture" },
  { src: "/Logo/Intech.png", alt: "Intech" },
  { src: "/Logo/BSA.png", alt: "BSA" },
  { src: "/Logo/KNX.png", alt: "KNX" },
];

function LogoGroup({ hidden = false }: { hidden?: boolean }) {
  return (
    <div className="logo-marquee__group" aria-hidden={hidden || undefined}>
      {logos.map((logo) => (
        <div className="logo-marquee__item" key={`${hidden ? "copy-" : ""}${logo.src}`}>
          <span className="logo-marquee__media">
            <img src={logo.src} alt={hidden ? "" : logo.alt} loading="lazy" />
          </span>
        </div>
      ))}
    </div>
  );
}

export default function LogoMarqueeSection() {
  return (
    <section className="logo-marquee" aria-labelledby="logo-marquee-title">
      <div className="logo-marquee__heading">
        <span className="logo-marquee__eyebrow">
          <i className="ri-links-line" /> Hành trình Ea Agri
        </span>
        <h2 id="logo-marquee-title">Dấu ấn kết nối</h2>
        <p>Những môi trường học thuật, đổi mới sáng tạo và công nghệ trên hành trình phát triển dự án.</p>
      </div>

      <div className="logo-marquee__viewport">
        <div className="logo-marquee__track">
          <LogoGroup />
          <LogoGroup hidden />
        </div>
      </div>
    </section>
  );
}
