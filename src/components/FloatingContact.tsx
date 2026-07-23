import React from "react";

export default function FloatingContact() {
  return (
    <div className="floating-contact">
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
