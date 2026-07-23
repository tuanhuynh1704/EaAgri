import { useState, useEffect } from "react";

interface StoryFeatureSectionProps {
  title: string;
  description: string;
  image: string | string[];
  list: {
    title: string;
    content: string;
  }[];
  reverse?: boolean;
}

const StoryFeatureSection = ({
  title,
  description,
  image,
  list,
  reverse = false,
}: StoryFeatureSectionProps) => {
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
      className={`story__container section__container ${
        reverse ? "reverse" : ""
      }`}
    >
      <div
        className="story__content"
        data-aos={reverse ? "fade-left" : "fade-right"}
      >
        <h2 className="section__header">{title}</h2>

        <p className="section__description">
          {description}
        </p>

        <ul className="story__list">
          {list.map((item, idx) => (
            <li key={idx}>
              <strong>{item.title}:</strong> {item.content}
            </li>
          ))}
        </ul>
      </div>

      <div
        className="story__image"
        data-aos={reverse ? "fade-right" : "fade-left"}
      >
        {images.length > 1 ? (
          <div className="story__slider">
            <button className="story__slider-btn story__slider-btn--prev" onClick={handlePrev} aria-label="Previous image">
              <i className="ri-arrow-left-s-line"></i>
            </button>
            
            <img src={images[currentIndex]} alt={`${title} ${currentIndex + 1}`} />
            
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
          <img src={images[0]} alt={title} />
        )}
      </div>
    </section>
  );
};

export default StoryFeatureSection;