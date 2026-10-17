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

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handleDotClick = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(idx);
  };

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [currentIndex, images.length]);

  const getSubTag = (title: string) => {
    if (title.includes("1. IoT")) return "MODULE 01 // IOT HARDWARE & AUTOMATION";
    if (title.includes("2. AI")) return "MODULE 02 // DUAL-BRAIN AI REASONING";
    if (title.includes("3. Hệ thống RAG")) return "MODULE 03 // RETRIEVAL-AUGMENTED GENERATION";
    if (title.includes("4. Module Dự Báo")) return "MODULE 04 // PREDICTIVE ANALYTICS & MARKET FORECAST";
    return "SYSTEM COMPONENT";
  };

  const getIconClass = (itemTitle: string) => {
    const t = itemTitle.toLowerCase();
    if (t.includes("sinh học")) return "ri-seedling-line";
    if (t.includes("môi trường")) return "ri-cloud-windy-line";
    if (t.includes("bảo vệ")) return "ri-shield-flash-line";
    
    if (t.includes("thị giác") || t.includes("vision")) return "ri-eye-line";
    if (t.includes("suy luận") || t.includes("reasoning")) return "ri-cpu-line";
    if (t.includes("ngrok") || t.includes("app")) return "ri-smartphone-line";
    if (t.includes("đa phương thức")) return "ri-mic-line";
    if (t.includes("kho tri thức")) return "ri-book-open-line";
    
    if (t.includes("prompt") || t.includes("embedding")) return "ri-code-s-slash-line";
    if (t.includes("database")) return "ri-database-2-line";
    if (t.includes("retriever")) return "ri-terminal-window-line";
    if (t.includes("chatbot") || t.includes("llm")) return "ri-chat-3-line";
    
    if (t.includes("ml") || t.includes("model")) return "ri-bubble-chart-line";
    if (t.includes("forecast") || t.includes("báo")) return "ri-line-chart-line";
    if (t.includes("impact") || t.includes("tránh")) return "ri-hand-coin-line";
    
    return "ri-checkbox-circle-line";
  };

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
        <span className="story__sub-tag">
          <i className="ri-terminal-box-line"></i> {getSubTag(title)}
        </span>

        <h2 className="section__header">{title}</h2>

        <p className="section__description">
          {description}
        </p>

        <div className="story__cards-list">
          {list.map((item, idx) => (
            <div key={idx} className="story__card-item">
              <div className="story__card-badge">
                <i className={getIconClass(item.title)}></i>
                <span className="story__card-number">0{idx + 1}</span>
              </div>
              <div className="story__card-info">
                <h3>{item.title}</h3>
                <p>{item.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="story__image-panel"
        data-aos={reverse ? "fade-right" : "fade-left"}
      >
        {/* Browser Mockup Frame */}
        <div className="story__browser-frame">
          <div className="story__browser-header">
            <div className="story__browser-dots">
              <span className="dot dot--red"></span>
              <span className="dot dot--yellow"></span>
              <span className="dot dot--green"></span>
            </div>
            <div className="story__browser-tab">Sơ đồ hệ thống</div>
          </div>
          <div className="story__browser-body">
            {images.length > 1 ? (
              <div className="story__slider">
                <button className="story__slider-btn story__slider-btn--prev" onClick={handlePrev} aria-label="Previous image">
                  <i className="ri-arrow-left-s-line"></i>
                </button>
                
                <img loading="lazy" decoding="async" src={images[currentIndex]} alt={`${title} ${currentIndex + 1}`} className="story__slider-img" />
                
                <button className="story__slider-btn story__slider-btn--next" onClick={handleNext} aria-label="Next image">
                  <i className="ri-arrow-right-s-line"></i>
                </button>
                
                <div className="story__slider-dots">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      className={`story__slider-dot ${idx === currentIndex ? "active" : ""}`}
                      onClick={(e) => handleDotClick(idx, e)}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <img loading="lazy" decoding="async" src={images[0]} alt={title} className="story__single-img" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoryFeatureSection;