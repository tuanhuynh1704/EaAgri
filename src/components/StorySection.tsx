import { useState, useEffect } from "react";

interface StorySectionProps {
  title: string;
  image: string | string[];
  imageAlt: string;
  descriptions: React.ReactNode[];
  reverse?: boolean;
  showButton?: boolean;
  buttonText?: string;
  buttonLink?: string;
}

const StorySection = ({
  title,
  image,
  imageAlt,
  descriptions,
  reverse = false,
  // showButton = false,
  // buttonText = "Xem Chi Tiết Đề Tài",
  // buttonLink = "#",
}: StorySectionProps) => {
  const images = Array.isArray(image) ? image : [image];
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handleDotClick = (idx: number) => {
    setCurrentIndex(idx);
  };

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [currentIndex, images.length]);

  return (
    <section
      className={`section__container story__container ${
        reverse ? "reverse" : ""
      }`}
    >
      <div
        className="story__image"
        data-aos={reverse ? "fade-left" : "fade-right"}
      >
        {images.length > 1 ? (
          <div className="story__slider">
            <button className="story__slider-btn story__slider-btn--prev" onClick={handlePrev} aria-label="Previous image">
              <i className="ri-arrow-left-s-line"></i>
            </button>
            
            <img loading="lazy" decoding="async" src={images[currentIndex]} alt={`${imageAlt} ${currentIndex + 1}`} />
            
            <button className="story__slider-btn story__slider-btn--next" onClick={handleNext} aria-label="Next image">
              <i className="ri-arrow-right-s-line"></i>
            </button>
            
            <div className="story__slider-dots">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  className={`story__slider-dot ${idx === currentIndex ? "active" : ""}`}
                  onClick={() => handleDotClick(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <img loading="lazy" decoding="async" src={images[0]} alt={imageAlt} />
        )}
      </div>

      <div
        className="story__content"
        data-aos={reverse ? "fade-right" : "fade-left"}
      >
        <h2
          className="section__header"
          dangerouslySetInnerHTML={{
            __html: title,
          }}
        />

        {descriptions.map((item, index) => (
          <div
            key={index}
            className="section__description"
          >
            {item}
          </div>
        ))}

        {/* {showButton && (
          <div className="story__link">
            <a href={buttonLink}>{buttonText}</a>
          </div>
        )} */}
      </div>
    </section>
  );
};

export default StorySection;