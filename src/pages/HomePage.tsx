import { useEffect, lazy } from "react";
import { useSEO } from "../hooks/useSEO";
import Hero from "../components/Hero";
import SplashIntro from "../components/SplashIntro";
import LogoMarqueeSection from "../components/LogoMarqueeSection";
import LazySection from "../components/common/LazySection";

// Progressive on-scroll loading: Only load below-the-fold sections when user scrolls down
const TeamSection = lazy(() => import("../components/TeamSection"));
const IntroductionProject = lazy(() => import("../components/IntroductionProject"));
const ProblemSolutionSection = lazy(() => import("../components/ProblemSolutionSection"));
const VideoGallerySection = lazy(() => import("../components/VideoGallerySection"));
const ResultSection = lazy(() => import("../components/ResultSection"));
const RoadmapSection = lazy(() => import("../components/RoadmapSection"));

export default function HomePage() {
  useSEO({
    title: "Ea Agri - Nông nghiệp Thông Minh | Trợ lý AI & IoT Vườn Cây",
    description:
      "Hệ sinh thái nông nghiệp thông minh EaAgri ứng dụng AI Dual-Brain, thị giác máy tính YOLOv9, trạm cảm biến IoT và dự báo giá nông sản giúp tối ưu chi phí và tăng năng suất sầu riêng.",
    keywords:
      "EaAgri, Ea Agri, nông nghiệp thông minh, AI nông nghiệp, sầu riêng, cảm biến IoT, VietGAP, Đắk Lắk, chẩn đoán bệnh cây trồng, tưới thông minh",
    canonicalUrl: "https://www.eaagri.vn/",
    structuredData: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "SoftwareApplication",
          "name": "EaAgri Digital Farming Platform",
          "operatingSystem": "Web, Android, iOS",
          "applicationCategory": "BusinessApplication, AgricultureApplication",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "VND"
          },
          "description": "Nền tảng trợ lý nông nghiệp thông minh tích hợp AI và IoT."
        },
        {
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "EaAgri hỗ trợ phát hiện những loại bệnh nào trên cây sầu riêng?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "EaAgri tích hợp mô hình thị giác máy tính YOLOv9 và AI Gemini giúp quét phát hiện nấm Phytophthora, rệp sáp, cháy lá chết ngọn, xì mủ thân và rụng trái non."
              }
            },
            {
              "@type": "Question",
              "name": "Hệ thống tưới thông minh 3 lớp của EaAgri hoạt động ra sao?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Hệ thống gồm 3 lớp: Lớp Sinh học (tính nhu cầu nước theo tuổi cây), Lớp Môi trường (tự ngắt nếu dự báo mưa >10mm), Lớp Bảo vệ (ngắt bơm khẩn cấp khi độ ẩm đất vượt 70%)."
              }
            },
            {
              "@type": "Question",
              "name": "EaAgri có tính năng dự báo giá thị trường không?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Có, EaAgri sử dụng mô hình học máy chuỗi thời gian (LSTM) để phân tích dữ liệu lịch sử và đưa ra dự báo xu hướng giá ngắn hạn 1-7 ngày."
              }
            }
          ]
        }
      ]
    }
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {/* 1. Ưu tiên hàng đầu: Màn hình chào + Hero + Logo Marquee tải tức thì */}
      <SplashIntro />
      <Hero />
      <LogoMarqueeSection />

      {/* 2. Tải dần từng phần khi cuộn chuột xuống (Lazy Loading on Scroll) */}
      <LazySection minHeight="800px">
        <TeamSection />
      </LazySection>

      <LazySection minHeight="700px" className="section-bg--gradient-teal fullpage-slide">
        <IntroductionProject />
      </LazySection>

      <LazySection minHeight="650px" className="section-bg--gradient-teal fullpage-slide">
        <ProblemSolutionSection />
      </LazySection>

      <LazySection minHeight="550px" className="section-bg--gradient-warm fullpage-slide">
        <VideoGallerySection />
      </LazySection>

      <LazySection minHeight="550px" className="section-bg--gradient-warm fullpage-slide">
        <ResultSection />
      </LazySection>

      <LazySection minHeight="600px" className="fullpage-slide">
        <RoadmapSection />
      </LazySection>
    </>
  );
}
