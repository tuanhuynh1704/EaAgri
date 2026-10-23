import { useState, useRef } from "react";

interface Achievement {
  title: string;
  desc?: string;
}

interface TeamMember {
  name: string;
  displayName?: string;
  roleTag: string;
  bio?: string;
  task: string;
  achievements?: Achievement[];
  avatar: string;
  avatarPosition?: string;
  themeColor: "green" | "blue" | "purple" | "orange";
  topIcon: string;
  roleIcon: string;
  skillIcon: string;
  decorIcon1: string;
  decorIcon2: string;
  memberCode: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "PHAN ĐĂNG HUY",
    displayName: "Phan Đăng Huy",
    roleTag: "FOUNDER & CEO",
    bio: "Founder & CEO EaAgri. Dự án ứng dụng AI trong nông nghiệp thông minh.",
    task: `Founder & CEO EaAgri – Dự án ứng dụng AI trong nông nghiệp thông minh.

• Best Student Paper – AIIA 2026 – Nghiên cứu EaAgri về AI và RAG trong hỗ trợ chẩn đoán bệnh sầu riêng.
  Trường Đại học Nguyễn Tất Thành

• Á quân & Giải Đội thi được yêu thích nhất – NTTU Innovation Startup Challenge 2026.
  Khoa Công Nghệ Thông Tin

• Giải Nhất vòng Bán kết – NTTU Innovation Startup Challenge 2026, bảng Công nghệ Nông nghiệp và Công nghệ Thực phẩm.
  Khoa Công Nghệ Thông Tin

• Giải Nhì – Cuộc thi Trí tuệ nhân tạo trong sinh viên 2026, Khoa Công nghệ Thông tin, NTTU.
  Khoa Công Nghệ Thông Tin

• Giải Khuyến khích – Cuộc thi Khoa học dữ liệu Khoa CNTT 2026, với dự án phân tích dữ liệu bán lẻ tích hợp AI Agent và dự báo thông minh.
  Khoa Công Nghệ Thông Tin

• Á quân & Giải Đội thi được yêu thích nhất.`,
    achievements: [
      {
        title: "Best Student Paper – AIIA 2026",
        desc: "Nghiên cứu EaAgri về AI và RAG trong hỗ trợ chẩn đoán bệnh sầu riêng · Trường Đại học Nguyễn Tất Thành",
      },
      {
        title: "Á quân & Đội thi được yêu thích nhất",
        desc: "NTTU Innovation Startup Challenge 2026 · Khoa Công Nghệ Thông Tin",
      },
      {
        title: "Giải Nhất vòng Bán kết",
        desc: "NTTU Innovation Startup Challenge 2026, bảng Công nghệ Nông nghiệp và Thực phẩm · Khoa CNTT",
      },
      {
        title: "Giải Nhì – AI trong sinh viên 2026",
        desc: "Khoa Công nghệ Thông tin, Trường Đại học Nguyễn Tất Thành",
      },
      {
        title: "Giải Khuyến khích – Khoa học dữ liệu 2026",
        desc: "Dự án phân tích bán lẻ tích hợp AI Agent và dự báo thông minh · Khoa CNTT",
      },
      {
        title: "Á quân & Đội thi được yêu thích nhất",
        desc: "Dự án khởi nghiệp đổi mới sáng tạo ứng dụng công nghệ số",
      },
    ],
    avatar: "/images/webp/Huy-CEO.webp",
    avatarPosition: "40% 15%",
    themeColor: "green",
    topIcon: "ri-shield-star-line",
    roleIcon: "ri-vip-crown-fill",
    skillIcon: "ri-database-2-fill",
    decorIcon1: "ri-leaf-fill",
    decorIcon2: "ri-leaf-line",
    memberCode: "EA-01",
  },
  {
    name: "NGUYỄN ANH GIẢNG",
    displayName: "Nguyễn Anh Giảng",
    roleTag: "Co-founder & CTO",
    bio: "Co-founder & CTO. Dự án ứng dụng AI trong nông nghiệp thông minh.",
    task: `Co-founder & CTO – Dự án ứng dụng AI trong nông nghiệp thông minh.

• Best Student Paper – AIIA 2026 – Nghiên cứu EaAgri về AI và RAG trong hỗ trợ chẩn đoán bệnh sầu riêng.
  Trường Đại học Nguyễn Tất Thành

• Á quân & Giải Đội thi được yêu thích nhất – NTTU Innovation Startup Challenge 2026.
  Khoa Công Nghệ Thông Tin

• Giải Nhất vòng Bán kết – NTTU Innovation Startup Challenge 2026, bảng Công nghệ Nông nghiệp và Công nghệ Thực phẩm.
  Khoa Công Nghệ Thông Tin

• Giải Nhì – Cuộc thi Trí tuệ nhân tạo trong sinh viên 2026, Khoa Công nghệ Thông tin, NTTU.
  Khoa Công Nghệ Thông Tin

• Giải Khuyến khích – Cuộc thi Khoa học dữ liệu Khoa CNTT 2026, với dự án phân tích dữ liệu bán lẻ tích hợp AI Agent và dự báo thông minh.
  Khoa Công Nghệ Thông Tin

• Á quân & Giải Đội thi được yêu thích nhất.`,
    achievements: [
      {
        title: "Best Student Paper – AIIA 2026",
        desc: "Nghiên cứu EaAgri về AI và RAG trong hỗ trợ chẩn đoán bệnh sầu riêng · Trường Đại học Nguyễn Tất Thành",
      },
      {
        title: "Á quân & Đội thi được yêu thích nhất",
        desc: "NTTU Innovation Startup Challenge 2026 · Khoa Công Nghệ Thông Tin",
      },
      {
        title: "Giải Nhất vòng Bán kết",
        desc: "NTTU Innovation Startup Challenge 2026, bảng Công nghệ Nông nghiệp và Thực phẩm · Khoa CNTT",
      },
      {
        title: "Giải Nhì – AI trong sinh viên 2026",
        desc: "Khoa Công nghệ Thông tin, Trường Đại học Nguyễn Tất Thành",
      },
      {
        title: "Giải Khuyến khích – Khoa học dữ liệu 2026",
        desc: "Dự án phân tích bán lẻ tích hợp AI Agent và dự báo thông minh · Khoa CNTT",
      },
      {
        title: "Á quân & Đội thi được yêu thích nhất",
        desc: "Dự án khởi nghiệp đổi mới sáng tạo ứng dụng công nghệ số",
      },
    ],
    avatar: "/images/webp/giang-1.webp",
    themeColor: "blue",
    topIcon: "ri-brain-line",
    roleIcon: "ri-user-fill",
    skillIcon: "ri-database-2-fill",
    decorIcon1: "ri-bubble-chart-fill",
    decorIcon2: "ri-checkbox-blank-circle-fill",
    memberCode: "EA-02",
  },
  {
    name: "ĐẶNG VĂN CHUNG",
    displayName: "Đặng Văn Chung",
    roleTag: "FIELD OPERATION LEAD",
    bio: "Field Operation Lead EaAgri. Dự án ứng dụng AI trong nông nghiệp thông minh.",
    task: `Field Operation Lead EaAgri – Dự án ứng dụng AI trong nông nghiệp thông minh.

• Á quân & Giải Đội thi được yêu thích nhất – NTTU Innovation Startup Challenge 2026.
  Khoa Công Nghệ Thông Tin

• Giải Nhất vòng Bán kết – NTTU Innovation Startup Challenge 2026, bảng Công nghệ Nông nghiệp và Công nghệ Thực phẩm.
  Khoa Công Nghệ Thông Tin

• Giải Khuyến khích – Cuộc thi Khoa học dữ liệu Khoa CNTT 2026, với dự án phân tích dữ liệu bán lẻ tích hợp AI Agent và dự báo thông minh.
  Khoa Công Nghệ Thông Tin

• Á quân & Giải Đội thi được yêu thích nhất.`,
    achievements: [
      {
        title: "Á quân & Đội thi được yêu thích nhất",
        desc: "NTTU Innovation Startup Challenge 2026 · Khoa Công Nghệ Thông Tin",
      },
      {
        title: "Giải Nhất vòng Bán kết",
        desc: "NTTU Innovation Startup Challenge 2026, bảng Công nghệ Nông nghiệp và Thực phẩm · Khoa CNTT",
      },
      {
        title: "Giải Khuyến khích – Khoa học dữ liệu 2026",
        desc: "Dự án phân tích bán lẻ tích hợp AI Agent và dự báo thông minh · Khoa CNTT",
      },
      {
        title: "Á quân & Đội thi được yêu thích nhất",
        desc: "Dự án khởi nghiệp đổi mới sáng tạo ứng dụng công nghệ số",
      },
    ],
    avatar: "/images/webp/chung-1.webp",
    themeColor: "purple",
    topIcon: "ri-code-s-slash-line",
    roleIcon: "ri-user-fill",
    skillIcon: "ri-settings-4-fill",
    decorIcon1: "ri-leaf-fill",
    decorIcon2: "ri-leaf-line",
    memberCode: "EA-03",
  },
  {
    name: "HUỲNH ANH TUẤN",
    displayName: "Huỳnh Anh Tuấn",
    roleTag: "GROWTH & OPERATIONS LEAD",
    bio: "Growth & Operations Lead EaAgri. Dự án ứng dụng AI trong nông nghiệp thông minh.",
    task: "Growth & Operations Lead EaAgri – Dự án ứng dụng AI trong nông nghiệp thông minh.",
    achievements: [
      {
        title: "Á quân & Đội thi được yêu thích nhất",
        desc: "NTTU Innovation Startup Challenge 2026 · Khoa Công Nghệ Thông Tin",
      },
      {
        title: "Giải Nhất vòng Bán kết",
        desc: "NTTU Innovation Startup Challenge 2026, bảng Công nghệ Nông nghiệp và Thực phẩm · Khoa CNTT",
      },
      {
        title: "Giải Khuyến khích – Kỹ thuật phần mềm 2026",
        desc: "Dự án quản lí thông tin, lên lịch học và tóm tắt, chấm bài thi, báo cáo thông minh · Khoa CNTT",
      },
      {
        title: "Á quân & Đội thi được yêu thích nhất",
        desc: "Dự án khởi nghiệp đổi mới sáng tạo ứng dụng công nghệ số",
      },
    ],
    avatar: "/images/webp/tuan1.webp",
    themeColor: "orange",
    topIcon: "ri-megaphone-line",
    roleIcon: "ri-user-fill",
    skillIcon: "ri-database-2-fill",
    decorIcon1: "ri-leaf-fill",
    decorIcon2: "ri-leaf-line",
    memberCode: "EA-04",
  },
];

export default function CoreTeamSection() {
  const [flippedCards, setFlippedCards] = useState<{ [key: number]: boolean }>({});
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);
  const touchStartTimeRef = useRef<number>(0);
  const isSwipingRef = useRef<boolean>(false);
  const swipeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCardsTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    touchStartTimeRef.current = Date.now();
    isSwipingRef.current = false;
    if (swipeTimerRef.current) {
      clearTimeout(swipeTimerRef.current);
      swipeTimerRef.current = null;
    }
  };

  const handleCardsTouchMove = (e: React.TouchEvent) => {
    const deltaX = Math.abs(e.touches[0].clientX - touchStartXRef.current);
    const deltaY = Math.abs(e.touches[0].clientY - touchStartYRef.current);
    if (deltaX > 10 || deltaY > 10) {
      isSwipingRef.current = true;
    }
  };

  const handleCardsTouchEnd = (e: React.TouchEvent) => {
    const touchDuration = Date.now() - touchStartTimeRef.current;
    if (e.changedTouches && e.changedTouches[0]) {
      const deltaX = Math.abs(e.changedTouches[0].clientX - touchStartXRef.current);
      const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartYRef.current);
      if (deltaX <= 10 && deltaY <= 10 && touchDuration < 350) {
        isSwipingRef.current = false;
        return;
      }
    }
    if (isSwipingRef.current) {
      swipeTimerRef.current = setTimeout(() => {
        isSwipingRef.current = false;
      }, 100);
    }
  };

  const handleCardsScroll = () => {
    const container = cardsContainerRef.current;
    if (!container) return;
    const scrollLeft = container.scrollLeft;
    const firstCard = container.firstElementChild as HTMLElement | null;
    const cardWidth = firstCard ? firstCard.offsetWidth : 250;
    const gap = 14;
    const index = Math.round(scrollLeft / (cardWidth + gap));
    setActiveCardIndex(Math.max(0, Math.min(teamMembers.length - 1, index)));
  };

  const handleCardClick = (index: number) => {
    if (isSwipingRef.current) {
      isSwipingRef.current = false;
      return;
    }
    setFlippedCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const scrollToCard = (index: number) => {
    const container = cardsContainerRef.current;
    if (!container) return;
    const cards = container.querySelectorAll(".team-card");
    if (cards[index]) {
      (cards[index] as HTMLElement).scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
      setActiveCardIndex(index);
    }
  };

  return (
    <section id="section-team" className="team-showcase core-team-section fullpage-slide">
      <div className="team-showcase__container">
        {/* CORE TEAM: ĐỘI NGŨ VẬN HÀNH */}
        <div className="team-showcase__header" data-aos="fade-up">
          <span className="team-showcase__label">
            <span className="team-showcase__status-dot"></span>
            BAN ĐIỀU HÀNH &amp; KỸ THUẬT
          </span>
          <h2 className="team-showcase__title">
            Đội Ngũ <span className="team-showcase__title-highlight">Vận Hành</span>
          </h2>
          <p className="team-showcase__desc">
            Những người trẻ giàu nhiệt huyết công nghệ, gắn bó cùng từng nương rẫy để phát triển giải pháp số hóa nông nghiệp bền vững.
          </p>
        </div>

        {/* Member Cards Grid */}
        <div
          ref={cardsContainerRef}
          className="team-showcase__cards"
          data-aos="fade-up"
          data-aos-delay="100"
          onTouchStart={handleCardsTouchStart}
          onTouchMove={handleCardsTouchMove}
          onTouchEnd={handleCardsTouchEnd}
          onScroll={handleCardsScroll}
        >
          {teamMembers.map((member, index) => (
            <div
              className={`team-card team-card--${member.themeColor} ${flippedCards[index] ? "is-flipped" : ""}`}
              key={index}
              onClick={() => handleCardClick(index)}
              onMouseLeave={() => {
                setFlippedCards((prev) => (prev[index] ? { ...prev, [index]: false } : prev));
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleCardClick(index);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`Xem thông tin ${member.name}`}
            >
              {/* 3D Flipper Container */}
              <div className="team-card__flipper">
                {/* FRONT: Full Portrait Photo with Name & Role Pill Overlay */}
                <div className="team-card__front">
                  <div className="team-card__image-box">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="team-card__rect-avatar-img"
                      style={member.avatarPosition ? { objectPosition: member.avatarPosition } : undefined}
                      loading="lazy"
                      decoding="async"
                    />

                    {/* Bottom Info Overlay */}
                    <div className="team-card__front-overlay">
                      <div className="team-card__role-pill">
                        <span>{member.roleTag}</span>
                      </div>
                      <h3 className="team-card__name">{member.name}</h3>
                    </div>
                  </div>
                </div>

                {/* BACK: Detailed Info (Full-card 3D flip) */}
                {/* BACK: Editorial Profile Card (Matching reference photo) */}
                <div className="team-card__back">
                  {/* Subtle Portrait Watermark in background */}
                  <div
                    className="team-card__back-watermark"
                    style={{
                      backgroundImage: `url(${member.avatar})`,
                      backgroundPosition: member.avatarPosition || "center 15%",
                    }}
                    aria-hidden="true"
                  />

                  {/* Scrollable Editorial Content */}
                  <div className="team-card__back-content">
                    <div className="team-card__back-header">
                      <h3 className="team-card__back-name">
                        {member.displayName || member.name}
                      </h3>
                      <p className="team-card__back-bio">
                        {member.bio || member.task}
                      </p>
                    </div>

                    <div className="team-card__back-divider" />

                    <div className="team-card__back-section-label">THÀNH TỰU</div>

                    <div className="team-card__back-list">
                      {member.achievements && member.achievements.length > 0 ? (
                        member.achievements.map((item, aIdx) => (
                          <div key={aIdx} className="team-card__back-item">
                            <h4 className="team-card__back-item-title">{item.title}</h4>
                            {item.desc && (
                              <p className="team-card__back-item-desc">{item.desc}</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="team-card__back-task">{member.task}</p>
                      )}
                    </div>
                  </div>


                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Pagination Dots */}
        <div className="team-showcase__mobile-nav">
          <div className="team-showcase__pagination" aria-label="Team members navigation">
            {teamMembers.map((member, idx) => (
              <button
                key={idx}
                type="button"
                className={`team-showcase__dot team-showcase__dot--${member.themeColor} ${activeCardIndex === idx ? "is-active" : ""}`}
                onClick={() => scrollToCard(idx)}
                aria-label={`Xem thành viên ${member.name}`}
              />
            ))}
          </div>
          <div className="team-showcase__swipe-hint" aria-hidden="true">
            <i className="ri-arrow-left-s-line"></i>
            <span>Vuốt để xem thêm</span>
            <i className="ri-arrow-right-s-line"></i>
          </div>
        </div>
      </div>
    </section>
  );
}
