import { useEffect, useRef } from "react";
import Hero from "../components/Hero";
import TeamSection from "../components/TeamSection";
// import AIChat from "../components/AIChat";
import AwardsSection from "../components/AwardsSection";
import ProblemSolutionSection from "../components/ProblemSolutionSection";
import VideoGallerySection from "../components/VideoGallerySection";
import ResultSection from "../components/ResultSection";
import RoadmapSection from "../components/RoadmapSection";

export default function HomePage() {
  const isScrollingRef = useRef(false);
  const wheelDeltaRef = useRef(0);
  const wheelResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Reset scroll position to top instantly on mount to eliminate reload stutter
    window.scrollTo(0, 0);

    // Only enable fullpage slide snapping on desktop/laptop
    if (window.innerWidth <= 768) return;

    const getSlides = () => Array.from(document.querySelectorAll('.fullpage-slide'));

    const goToSlide = (index: number, slides: Element[]) => {
      if (index < 0 || index >= slides.length) return;
      isScrollingRef.current = true;
      slides[index].scrollIntoView({ behavior: 'smooth', block: 'start' });

      setTimeout(() => {
        isScrollingRef.current = false;
      }, 850);
    };

    const getCurrentSlideIndex = (slides: Element[]) => {
      const viewportAnchor = window.innerHeight * 0.35;

      return slides.reduce((closestIndex, slide, index) => {
        const currentDistance = Math.abs(slide.getBoundingClientRect().top - viewportAnchor);
        const closestDistance = Math.abs(
          slides[closestIndex].getBoundingClientRect().top - viewportAnchor,
        );

        return currentDistance < closestDistance ? index : closestIndex;
      }, 0);
    };

    const handleWheel = (e: WheelEvent) => {
      const slides = getSlides();
      if (slides.length < 2) return;

      const lastSlide = slides[slides.length - 1] as HTMLElement;
      const lastSlideTop = lastSlide.offsetTop;

      // After reaching the final full-page section, hand scrolling back to the
      // browser so the footer behaves like a normal document ending.
      if (window.scrollY > lastSlideTop + 4) return;

      const currentIndex = getCurrentSlideIndex(slides);
      if (currentIndex === slides.length - 1 && e.deltaY > 0) return;

      // Desktop uses one controlled scroll surface. Never let tiny trackpad
      // deltas reveal the space between two full-page slides.
      e.preventDefault();
      if (isScrollingRef.current) return;

      wheelDeltaRef.current += e.deltaY;
      if (wheelResetTimerRef.current) clearTimeout(wheelResetTimerRef.current);
      wheelResetTimerRef.current = setTimeout(() => {
        wheelDeltaRef.current = 0;
      }, 160);

      if (Math.abs(wheelDeltaRef.current) < 28) return;

      const direction = wheelDeltaRef.current > 0 ? 1 : -1;
      const nextIndex = currentIndex + direction;
      wheelDeltaRef.current = 0;

      if (nextIndex >= 0 && nextIndex < slides.length) {
        goToSlide(nextIndex, slides);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isScrollingRef.current) return;
      const slides = getSlides();
      if (slides.length < 2) return;

      const currentIndex = getCurrentSlideIndex(slides);
      const isNextKey = e.key === 'ArrowDown' || e.key === 'PageDown';
      const isPreviousKey = e.key === 'ArrowUp' || e.key === 'PageUp';
      if (!isNextKey && !isPreviousKey) return;

      const nextIndex = currentIndex + (isNextKey ? 1 : -1);
      if (nextIndex >= 0 && nextIndex < slides.length) {
        e.preventDefault();
        goToSlide(nextIndex, slides);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (wheelResetTimerRef.current) clearTimeout(wheelResetTimerRef.current);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      <Hero />
      <TeamSection />

      <div className="section-bg--gradient-soft fullpage-slide">
        <AwardsSection
          image="/assets/IMG_2695.JPEG"
          imageAlt="Danh hiệu và Giải thưởng EaAgri"
        />
      </div>

      <div className="section-bg--gradient-teal fullpage-slide">
        <ProblemSolutionSection
          image="/assets/mohinhtongquan"
          imageAlt="Sơ đồ hệ thống EaAgri"
        />
      </div>

      <div className="section-bg--gradient-warm fullpage-slide">
        <VideoGallerySection />
      </div>

      <div className="section-bg--gradient-warm fullpage-slide">
        <ResultSection />
      </div>

      <div className="fullpage-slide">
        <RoadmapSection />
      </div>
    </>
  );
}
