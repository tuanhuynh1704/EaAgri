import { useEffect } from "react";
import Hero from "../components/Hero";
import TeamSection from "../components/TeamSection";
import AwardsSection from "../components/AwardsSection";
import ProblemSolutionSection from "../components/ProblemSolutionSection";
import VideoGallerySection from "../components/VideoGallerySection";
import ResultSection from "../components/ResultSection";
import RoadmapSection from "../components/RoadmapSection";
import SplashIntro from "../components/SplashIntro";
import DurianScannerSection from "../components/DurianScannerSection";
import LogoMarqueeSection from "../components/LogoMarqueeSection";

export default function HomePage() {
  useEffect(() => {
    // The landing hero starts at the top. From the second section onward the
    // page deliberately uses the browser's native, continuous scrolling.
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <SplashIntro />
      <Hero />
      <LogoMarqueeSection />
      <DurianScannerSection />
      <TeamSection />

      <div className="section-bg--gradient-soft fullpage-slide">
        <AwardsSection />
      </div>

      <div className="section-bg--gradient-teal fullpage-slide">
        <ProblemSolutionSection
          image="/ẢNh 1.png"
          imageAlt="Vườn sầu riêng thông minh kết nối cảm biến IoT và ứng dụng Ea Agri"
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
