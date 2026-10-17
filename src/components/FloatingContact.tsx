import { useState, useEffect, useRef } from "react";

export default function FloatingContact() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const contactRef = useRef<HTMLDivElement>(null);

  // Kiểm tra thiết bị chuột (PC / Laptop) vs thiết bị cảm ứng thuần (Mobile / Tablet)
  const isMouseDevice = () => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Đóng menu liên hệ khi click/chạm ra bên ngoài hoặc chuyển tab
  useEffect(() => {
    if (!isContactOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (contactRef.current && !contactRef.current.contains(target)) {
        setIsContactOpen(false);
      }
    };

    const handleWindowBlur = () => {
      setIsContactOpen(false);
    };

    document.addEventListener("touchstart", handleClickOutside, { passive: true });
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [isContactOpen]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Rê chuột vào trên PC / Laptop -> Tự động mở
  const handleMouseEnter = () => {
    if (isMouseDevice()) {
      setIsContactOpen(true);
    }
  };

  // Rê chuột ra ngoài trên PC / Laptop -> Tự động đóng
  const handleMouseLeave = () => {
    if (isMouseDevice()) {
      setIsContactOpen(false);
    }
  };

  // Khi click/nhấn nút ở Ảnh 2 (Headset / Toggle button):
  // - Gỡ bỏ focus ngay lập tức để tránh trình duyệt giữ trạng thái focus
  // - Toggle mở / đóng (nếu đang mở thì đóng lại ngay, không bao giờ bị đứng/đơ)
  const handleToggleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    setIsContactOpen((prev) => !prev);
  };

  return (
    <div
      className="floating-contact-container"
      onMouseLeave={handleMouseLeave}
    >
      {/* Scroll To Top Button */}
      <button
        type="button"
        onClick={scrollToTop}
        className={`floating-contact__btn floating-contact__btn--scroll-top ${
          showScrollTop ? "show" : ""
        }`}
        title="Quay lại đầu trang"
        aria-label="Quay lại đầu trang"
      >
        <i className="ri-arrow-up-line"></i>
      </button>

      {/* Floating Contact Panel (Headset and channels) */}
      <div
        ref={contactRef}
        className={`floating-contact ${isContactOpen ? "is-open" : ""}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="floating-contact__channels">
          {/* Zalo Button */}
          <a
            href="https://zalo.me/0397594024"
            target="_blank"
            rel="noreferrer"
            className="floating-contact__btn floating-contact__btn--channel floating-contact__btn--zalo"
            title="Liên hệ qua Zalo"
            aria-label="Liên hệ qua Zalo"
          >
            <div className="zalo-text">Zalo</div>
          </a>

          {/* Messenger Button */}
          <a
            href="https://www.facebook.com/profile.php?id=61577351045350"
            target="_blank"
            rel="noreferrer"
            className="floating-contact__btn floating-contact__btn--channel floating-contact__btn--messenger"
            title="Liên hệ qua Messenger"
            aria-label="Liên hệ qua Messenger"
          >
            <i className="ri-messenger-fill"></i>
          </a>

          {/* Phone Button */}
          <a
            href="tel:0397594024"
            className="floating-contact__btn floating-contact__btn--channel floating-contact__btn--phone"
            title="Gọi điện liên hệ"
            aria-label="Gọi điện liên hệ"
          >
            <i className="ri-phone-fill"></i>
          </a>
        </div>

        <button
          type="button"
          className="floating-contact__btn floating-contact__btn--toggle"
          onClick={handleToggleClick}
          aria-expanded={isContactOpen}
          aria-label={isContactOpen ? "Đóng kênh liên hệ" : "Mở kênh liên hệ"}
        >
          <i className={isContactOpen ? "ri-close-line" : "ri-customer-service-2-line"}></i>
        </button>
      </div>
    </div>
  );
}
