import { useState, useEffect } from "react";

export default function FloatingContact() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="floating-contact">
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

      {/* Zalo Button */}
      <a
        href="+84 397 594 024"
        target="_blank"
        rel="noreferrer"
        className="floating-contact__btn floating-contact__btn--zalo"
        title="Liên hệ qua Zalo"
      >
        <div className="zalo-text">
          Zalo
        </div>
      </a>

      {/* Messenger Button */}
      <a
        href="https://www.facebook.com/profile.php?id=61577351045350"
        target="_blank"
        rel="noreferrer"
        className="floating-contact__btn floating-contact__btn--messenger"
        title="Liên hệ qua Messenger"
      >
        <i className="ri-messenger-fill"></i>
      </a>
    </div>
  );
}



