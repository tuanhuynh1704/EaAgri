import { useState } from "react";

const baseLogos = [
  { src: "/Logo/NTTU.png", alt: "Nguyễn Tất Thành University", name: "Đại học Nguyễn Tất Thành" },
  { src: "/Logo/FIT.webp", alt: "Khoa CNTT - NTTU", name: "FIT - NTTU" },
  { src: "/Logo/NIIC.png", alt: "Trung tâm Sáng tạo & Ươm tạo Khởi nghiệp NIIC", name: "NIIC" },
  { src: "/Logo/vietfuturelogo.png", alt: "VietFuture 2026", name: "VietFuture" },
  { src: "/Logo/Intech.webp", alt: "Intech Innovation and Technology", name: "Intech" },
  { src: "/Logo/BSA.webp", alt: "Trung tâm BSA", name: "BSA" },
  { src: "/Logo/KNX.webp", alt: "Dự án Khởi nghiệp Xanh", name: "Khởi nghiệp Xanh" },
];

// Nhân bản danh sách 3 lần trong mỗi nhóm để đảm bảo chiều dài vượt xa mọi kích thước màn hình
const marqueeItems = [...baseLogos, ...baseLogos, ...baseLogos];

export default function LogoMarqueeSection() {
  const [activeItemKey, setActiveItemKey] = useState<string | null>(null);

  const handleItemTouch = (key: string) => {
    setActiveItemKey((prev) => (prev === key ? null : key));
  };

  const renderGroup = (groupKey: string, hidden = false) => (
    <div className="logo-marquee__group" aria-hidden={hidden || undefined}>
      {marqueeItems.map((logo, index) => {
        const itemKey = `${groupKey}-${index}`;
        const isActive = activeItemKey === itemKey;

        return (
          <div
            className={`logo-marquee__item ${isActive ? "is-active" : ""}`}
            key={itemKey}
            tabIndex={0}
            onClick={() => handleItemTouch(itemKey)}
            title={logo.name || logo.alt}
            aria-label={logo.name || logo.alt}
          >
            <span className="logo-marquee__media">
              <img src={logo.src} alt={hidden ? "" : logo.alt} loading="lazy" />
            </span>
          </div>
        );
      })}
    </div>
  );

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
          {renderGroup("grp1")}
          {renderGroup("grp2", true)}
        </div>
      </div>
    </section>
  );
}
