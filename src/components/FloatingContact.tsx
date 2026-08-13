import { useState, useEffect } from "react";

export default function FloatingContact() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isPastHero = window.scrollY >= window.innerHeight * 0.5;
      setShowContact(isPastHero);

      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className={`floating-contact-container ${showContact ? "is-visible" : ""}`}>
      {/* Scroll To Top Button */}
      <button
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
      <div className={`floating-contact ${isContactOpen ? "is-open" : ""}`}>
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
          onClick={() => setIsContactOpen((open) => !open)}
          aria-expanded={isContactOpen}
          aria-label={isContactOpen ? "Đóng kênh liên hệ" : "Mở kênh liên hệ"}
        >
          <i className={isContactOpen ? "ri-close-line" : "ri-customer-service-2-line"}></i>
        </button>
      </div>
    </div>
  );
}
