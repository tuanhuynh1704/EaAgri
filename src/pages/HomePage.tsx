import { useEffect, lazy } from "react";
import { useSEO } from "../hooks/useSEO";
import Hero from "../components/Hero";
import SplashIntro from "../components/SplashIntro";
import LogoMarqueeSection from "../components/LogoMarqueeSection";
import LazySection from "../components/common/LazySection";

// Progressive on-scroll loading according to exact sequence:
// 1. Dấu ấn kết nối (LogoMarqueeSection - rendered directly below Hero)
// 2. Hội Đồng Cố Vấn & Chuyên Gia
const AdvisorsSection = lazy(() => import("../components/AdvisorsSection"));
// 3. Hình Ảnh Sản Phẩm
const ProductShowcaseSection = lazy(() => import("../components/ProductShowcaseSection"));
// 4. Vấn Đề & Giải Pháp Đột Phá
const ProblemSolutionSection = lazy(() => import("../components/ProblemSolutionSection"));
// 5. Video & Trải Nghiệm Thực Tế + 6. PHIM TƯ LIỆU & THỰC ĐỊA
const VideoGallerySection = lazy(() => import("../components/VideoGallerySection"));
// 7. EAAGRI SAAS B2B • QUẢN TRỊ ĐA THUÊ (EaAgri CRM)
const CrmIntroductionSection = lazy(() => import("../components/CrmIntroductionSection"));
// 8. Kết quả triển khai thực tế
const ResultSection = lazy(() => import("../components/ResultSection"));
// 9. Đội Ngũ Vận Hành
const CoreTeamSection = lazy(() => import("../components/CoreTeamSection"));
// 10. Lộ trình phát triển & Hợp tác
const RoadmapSection = lazy(() => import("../components/RoadmapSection"));

export default function HomePage() {
  useSEO({
    title: "Ea Agri - Nông nghiệp Thông Minh | Trợ lý AI & IoT Vườn Cây",
    description:
      "Hệ sinh thái nông nghiệp thông minh EaAgri ứng dụng AI Dual-Brain, thị giác máy tính YOLOv9, trạm cảm biến IoT, EaAgri CRM đa thuê cho đại lý VTNN và dự báo giá nông sản.",
    keywords:
      "EaAgri, Ea Agri, nông nghiệp thông minh, AI nông nghiệp, EaAgri CRM, sầu riêng, cảm biến IoT, VietGAP, Đắk Lắk, chẩn đoán bệnh cây trồng, tưới thông minh, CRM nông nghiệp",
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
          "description": "Nền tảng trợ lý nông nghiệp thông minh tích hợp AI, IoT và EaAgri CRM đa thuê."
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
              "name": "EaAgri CRM dành cho ai và có những tính năng gì?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "EaAgri CRM là nền tảng quản trị và thương mại đa thuê chuyên biệt cho các Đại lý Vật tư Nông nghiệp (VTNN), kết nối hai chiều với Nông hộ qua App di động, gồm quản lý công nợ bất biến, bán lẻ POS, tiếp nhận ca bệnh và chống race-condition."
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
      {/* Màn hình chào + Hero Header */}
      <SplashIntro />
      <Hero />

      {/* 1. Dấu ấn kết nối */}
      <LogoMarqueeSection />

      {/* 2. Hội Đồng Cố Vấn & Chuyên Gia */}
      <LazySection minHeight="650px">
        <AdvisorsSection />
      </LazySection>

      {/* 3. Hình Ảnh Sản Phẩm */}
      <LazySection minHeight="700px">
        <ProductShowcaseSection />
      </LazySection>

      {/* 4. Vấn Đề & Giải Pháp Đột Phá */}
      <LazySection minHeight="650px" className="section-bg--gradient-teal fullpage-slide">
        <ProblemSolutionSection />
      </LazySection>

      {/* 5. Video & Trải Nghiệm Thực Tế -> 6. PHIM TƯ LIỆU & THỰC ĐỊA */}
      <LazySection minHeight="650px" className="section-bg--gradient-warm fullpage-slide">
        <VideoGallerySection />
      </LazySection>

      {/* 7. EAAGRI SAAS B2B • QUẢN TRỊ ĐA THUÊ (EaAgri CRM) */}
      <LazySection minHeight="700px" className="fullpage-slide">
        <CrmIntroductionSection />
      </LazySection>

      {/* 8. Kết quả triển khai thực tế */}
      <LazySection minHeight="550px" className="section-bg--gradient-warm fullpage-slide">
        <ResultSection />
      </LazySection>

      {/* 9. Đội Ngũ Vận Hành */}
      <LazySection minHeight="650px">
        <CoreTeamSection />
      </LazySection>

      {/* 10. Lộ trình phát triển & Hợp tác */}
      <LazySection minHeight="600px" className="fullpage-slide">
        <RoadmapSection />
      </LazySection>
    </>
  );
}
