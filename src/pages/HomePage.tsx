import { useEffect } from "react";
import { useSEO } from "../hooks/useSEO";
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
      <SplashIntro />
      <Hero />
      <LogoMarqueeSection />
      <DurianScannerSection />
      <TeamSection />

      <div className="section-bg--gradient-soft fullpage-slide">
        <AwardsSection />
      </div>

      <div className="section-bg--gradient-teal fullpage-slide">
        <ProblemSolutionSection />
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
