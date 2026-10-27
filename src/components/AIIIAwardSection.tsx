import { useEffect, useRef, useState, type PointerEvent } from "react";

const articleUrl =
  "https://ntt.edu.vn/aiiia-2026-thuc-day-nghien-cuu-lien-nganh-mo-rong-kha-nang-ung-dung-tri-tue-nhan-tao-vao-thuc-tien/";

export default function AIIIAwardSection() {
  const galleryRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const dragStart = useRef<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [videoVisible, setVideoVisible] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVideoVisible(entry.isIntersecting && entry.intersectionRatio >= 0.25),
      { threshold: [0, 0.25] },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (videoVisible && activeSlide === 0) {
      void video.play().catch(() => {
        // Keep native controls available if the browser blocks autoplay.
      });
    } else {
      video.pause();
    }
  }, [videoVisible, activeSlide]);

  const scrollGallery = (direction: -1 | 1) => {
    setActiveSlide((current) => (current + direction + 3) % 3);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if ((event.target as HTMLElement).closest("video, button, a")) return;
    const gallery = galleryRef.current;
    if (!gallery) return;
    dragStart.current = event.clientX;
    gallery.setPointerCapture(event.pointerId);
    setDragging(true);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStart.current === null) return;
    const distance = event.clientX - dragStart.current;
    if (Math.abs(distance) > 45) scrollGallery(distance < 0 ? 1 : -1);
    dragStart.current = null;
    setDragging(false);
  };

  const stopDragging = () => {
    dragStart.current = null;
    setDragging(false);
  };

  return (
    <section className="aiia-award" aria-labelledby="aiia-award-title">
      <div className="aiia-award__inner">
        <div className="aiia-award__gallery-shell">
          <div
            ref={galleryRef}
            className={`aiia-award__gallery${dragging ? " is-dragging" : ""}`}
            role="region"
            aria-label="Thư viện hình ảnh và video nhận giải AIIA 2026"
            tabIndex={0}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={stopDragging}
            onLostPointerCapture={stopDragging}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") scrollGallery(-1);
              if (event.key === "ArrowRight") scrollGallery(1);
            }}
          >
            <figure className={`aiia-award__slide aiia-award__slide--video${activeSlide === 0 ? " is-active" : ""}`}>
              <video
                ref={videoRef}
                autoPlay
                controls
                playsInline
                preload="metadata"
              muted={false}
              defaultMuted={false}
                poster="/assets/best-student-paper-award.webp"
                aria-label="Video khoảnh khắc nhóm EaAgri nhận giải tại AIIA 2026"
              >
                <source src="/Video/AIIANhanGiai.MP4" type="video/mp4" />
                Trình duyệt của bạn không hỗ trợ phát video.
              </video>
              <figcaption>Khoảnh khắc nhận giải tại hội thảo</figcaption>
            </figure>
            <figure className={`aiia-award__slide aiia-award__slide--group${activeSlide === 1 ? " is-active" : ""}`}>
              <img
                src="/images/webp/nhan-giai.webp"
                alt="Nhóm tác giả EaAgri nhận giải Best Student Paper tại hội thảo AIIA 2026 ở Trường Đại học Nguyễn Tất Thành"
                loading="lazy"
                decoding="async"
              />
              <figcaption>Nhóm tác giả EaAgri tại lễ trao giải AIIA 2026</figcaption>
            </figure>
            <figure className={`aiia-award__slide aiia-award__slide--certificate${activeSlide === 2 ? " is-active" : ""}`}>
              <img
                src="/assets/best-student-paper-award.webp"
                alt="Chứng nhận giải Best Student Paper Award trao cho nghiên cứu EaAgri tại hội thảo AIIA 2026"
                loading="lazy"
                decoding="async"
              />
              <figcaption>Chứng nhận Best Student Paper Award</figcaption>
            </figure>
          </div>
          <div className="aiia-award__gallery-controls" aria-label="Điều khiển thư viện ảnh">
            <button type="button" onClick={() => scrollGallery(-1)} aria-label="Ảnh trước">
              <i className="ri-arrow-left-s-line" aria-hidden="true" />
            </button>
            <span className="aiia-award__gallery-count" aria-live="polite">
              {String(activeSlide + 1).padStart(2, "0")} / 03
            </span>
            <button type="button" onClick={() => scrollGallery(1)} aria-label="Ảnh tiếp theo">
              <i className="ri-arrow-right-s-line" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="aiia-award__content">
          {/* <span className="aiia-award__eyebrow">DẤU ẤN NGHIÊN CỨU · AIIA 2026</span> */}
          <h2 id="aiia-award-title">
            Nghiên cứu EaAgri được vinh danh <span>Best Student Paper</span>
          </h2>
          <p className="aiia-award__lead">
            Công trình nghiên cứu kết hợp thị giác máy tính và RAG để hỗ trợ khuyến nghị bệnh sầu riêng theo định hướng VietGAP.
          </p>

          <div className="aiia-award__paper">
            <span className="aiia-award__paper-label">CÔNG TRÌNH ĐƯỢC VINH DANH</span>
            <p>“EaAgri: Nền tảng nông nghiệp thông minh tích hợp thị giác máy tính và RAG cho khuyến nghị bệnh sầu riêng tuân thủ VietGAP”</p>
            <small>Phan Đăng Huy · Phạm Đình Tài · Nguyễn Anh Giảng</small>
          </div>

          <div className="aiia-award__facts" aria-label="Thông tin hội thảo">
            <div><strong>13–14/10/2026</strong><span>Thời gian tổ chức</span></div>
            <div><strong>100 bài nghiên cứu</strong><span>Từ 18 cơ quan, tổ chức</span></div>
            <div><strong>Trường ĐH Nguyễn Tất Thành</strong><span>Đơn vị tổ chức hội thảo</span></div>
          </div>

          <a className="aiia-award__link" href={articleUrl} target="_blank" rel="noopener noreferrer">
            Đọc bài viết tại<span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

    </section>
  );
}
