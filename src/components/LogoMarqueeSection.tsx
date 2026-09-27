const baseLogos = [
  { src: "/Logo/NTTU.jpg", alt: "Nguyễn Tất Thành University" },
  { src: "/Logo/FIT.webp", alt: "FIT" },
  { src: "/Logo/NIIC.jpg", alt: "NIIC" },
  { src: "/Logo/vietfuturelogo.png", alt: "VietFuture" },
  { src: "/Logo/Intech.webp", alt: "Intech" },
  { src: "/Logo/BSA.webp", alt: "BSA" },
  { src: "/Logo/KNX.webp", alt: "KNX" },
];

// Nhân bản danh sách 3 lần trong mỗi nhóm để đảm bảo chiều dài vượt xa mọi kích thước màn hình (iPad, máy tính bảng, màn hình siêu rộng)
const marqueeItems = [...baseLogos, ...baseLogos, ...baseLogos];

function LogoGroup({ groupKey, hidden = false }: { groupKey: string; hidden?: boolean }) {
  return (
    <div className="logo-marquee__group" aria-hidden={hidden || undefined}>
      {marqueeItems.map((logo, index) => (
        <div className="logo-marquee__item" key={`${groupKey}-${logo.src}-${index}`}>
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
          <LogoGroup groupKey="grp1" />
          <LogoGroup groupKey="grp2" hidden />
        </div>
      </div>
    </section>
  );
}
