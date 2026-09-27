import { useEffect } from "react";
import { useSEO } from "../hooks/useSEO";
import VideoSection from "../components/VideoSection";
import StoryFeatureSection from "../components/StoryFeatureSection";
import FeatureGrid from "../components/FeatureGrid";

export default function ArchitecturePage() {
    useSEO({
        title: "Kiến Trúc Hệ Thống Nông Nghiệp Thông Minh IoT & AI",
        description:
            "Khám phá kiến trúc công nghệ Hybrid của EaAgri: Mạng lưới cảm biến độ ẩm đất đa tầng, bộ não kép AI Vision YOLOv9 và Gemini reasoning, hệ thống RAG và dự báo giá LSTM.",
        keywords:
            "Kiến trúc EaAgri, IoT nông nghiệp, AI Dual-Brain, YOLOv9 VietGAP, tưới tự động 3 lớp, LSTM dự báo giá",
        canonicalUrl: "https://www.eaagri.vn/architecture",
        structuredData: {
            "@context": "https://schema.org",
            "@type": "TechArticle",
            "headline": "Kiến Trúc Hệ Thống Nông Nghiệp Thông Minh EaAgri (IoT & AI)",
            "description": "Mô hình Hybrid kết hợp cảm biến IoT thời gian thực, AI thị giác máy tính và hệ thống RAG tri thức chuẩn hóa VietGAP.",
            "url": "https://www.eaagri.vn/architecture",
            "author": {
                "@type": "Organization",
                "name": "EaAgri Team"
            },
            "publisher": {
                "@type": "Organization",
                "name": "EaAgri"
            }
        }
    });

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="section-bg--gradient-soft" style={{ paddingTop: '90px' }}>
            <section className="architecture-tech-hero section__container" data-aos="fade-up">
                <div className="architecture-tech-hero__copy">
                    <span className="architecture-tech-hero__eyebrow">
                        <i className="ri-radar-line"></i>
                        DIGITAL FARMING SYSTEM
                    </span>
                    <h1>Công nghệ vận hành ngay tại khu vườn</h1>
                    <p>
                        Cảm biến IoT, AI và dữ liệu thời gian thực phối hợp trong một hệ thống
                        thống nhất, giúp nhà nông theo dõi và ra quyết định chính xác hơn.
                    </p>
                    <div className="architecture-tech-hero__signals" aria-label="Các năng lực chính">
                        <span><i className="ri-wifi-line"></i> IoT 24/7</span>
                        <span><i className="ri-brain-line"></i> AI phân tích</span>
                        <span><i className="ri-drop-line"></i> Tưới thông minh</span>
                    </div>
                </div>

                <div className="architecture-tech-hero__visual">
                    <span className="architecture-tech-hero__glow" aria-hidden="true"></span>
                    <img
                        src="/Cây 2.webp"
                        alt="Mô hình cây sầu riêng ứng dụng IoT và AI của Ea Agri"
                    />
                    <span className="architecture-tech-hero__status">
                        <i className="ri-checkbox-circle-fill"></i>
                        Hệ thống đang trực tuyến
                    </span>
                </div>
            </section>

            <VideoSection
                tag="EAAGRI HYBRID SYSTEM"
                title="Kiến Trúc Hệ Thống"
                description="Mô hình Hybrid kết hợp giữa sức mạnh AI, IoT và chuyên gia con người."
                videoUrl="https://www.youtube.com/embed/QgVPizuOCdg?rel=0"
                fallbackUrl="https://www.youtube.com/watch?v=QgVPizuOCdg"
            />

            <div className="section-bg--gradient-teal">
                <StoryFeatureSection
                    title="1. IoT & Tưới Thông Minh"
                    description="Hệ thống sử dụng mạng lưới cảm biến độ ẩm đất đa tầng để ra quyết định tưới thông minh dựa trên logic 3 lớp:"
                    image="/assets/mohinhtuoi.jpg"
                    list={[
                        {
                            title: "Lớp Sinh học",
                            content:
                                "Tính toán nhu cầu nước theo tuổi cây và giai đoạn sinh trưởng.",
                        },
                        {
                            title: "Lớp Môi trường (Pre-emptive Stop)",
                            content:
                                "Tích hợp API thời tiết để tự động ngưng tưới nếu dự báo có mưa >10mm.",
                        },
                        {
                            title: "Lớp Bảo vệ",
                            content:
                                "Cưỡng chế ngắt bơm nếu độ ẩm đất >70% để chống úng rễ.",
                        },
                    ]}
                />
            </div>

            <div className="section-bg--gradient-warm">
                <StoryFeatureSection
                    title='2. AI "Dual-Brain" (Bộ Não Kép)'
                    description="Kết hợp sức mạnh giữa thị giác máy tính và khả năng suy luận ngôn ngữ:"
                    image={[
                        "/assets/hethonglongtext.jpg",
                    ]}
                    reverse
                    list={[
                        {
                            title: "Thị giác máy tính (Vision)",
                            content:
                                "Sử dụng YOLOv9 để phát hiện và khoanh vùng bệnh trên lá cây theo thời gian thực.",
                        },
                        {
                            title: "Suy luận sâu (Reasoning)",
                            content:
                                "Sử dụng Gemini 2.0 Flash với cửa sổ ngữ cảnh rộng để phân tích nguyên nhân gốc rễ và đưa ra phác đồ điều trị chuẩn VietGAP.",
                        },
                        {
                            title: "📲 App Flutter & Ngrok Tunnel",
                            content:
                                "Giao tiếp an toàn giữa người dùng và Backend Server thông qua đường hầm mã hóa Ngrok.",
                        },
                        {
                            title: "📲🔊 Đa Phương Thức (GTTS)",
                            content:
                                "Tích hợp Google Text-to-Speech chuyển đổi kết quả tư vấn thành giọng nói (.mp3) hỗ trợ bà con..",
                        },
                        {
                            title: "📚 Kho Tri Thức Chuẩn Hóa",
                            content:
                                " Truy xuất dữ liệu cục bộ (VietGAP, BĐKH) đảm bảo độ chính xác chuyên môn cao.",
                        },
                    ]}
                />
            </div>

            <div className="section-bg--gradient-soft">
                <StoryFeatureSection
                    title="3. Hệ thống RAG"
                    description="Hệ thống chuẩn hóa và chuyển đổi dữ liệu đầu vào thành vector để truy xuất ngữ cảnh chính xác từ cơ sở dữ liệu, từ đó giúp LLM phản hồi thông minh về giá cả và kỹ thuật canh tác cây trồng."
                    image="/assets/Rag1.webp"
                    list={[
                        {
                            title: "Prompt & Embedding",
                            content: "Chuẩn hóa câu hỏi và chuyển văn bản thành vector.",
                        },
                        {
                            title: "Vector Database",
                            content: " Lưu trữ dữ liệu về giá cả, ứng dụng và cây trồng.",
                        },
                        {
                            title: "Retriever",
                            content: "Tìm kiếm ngữ cảnh liên quan bằng similarity search.",
                        },
                        {
                            title: "LLM/Chatbot",
                            content: "Sinh câu trả lời tiếng Việt dựa trên ngữ cảnh truy xuất.",
                        },
                    ]}
                />
            </div>

            <div className="section-bg--gradient-teal">
                <StoryFeatureSection
                    title="4. Module Dự Báo Thị Trường"
                    description="Giải quyết vấn đề bất đối xứng thông tin thị trường cho nông dân:"
                    image="/assets/mohinhgia.webp"
                    reverse
                    list={[
                        {
                            title: "ML Model",
                            content: "Sử dụng các mô hình học máy (như LSTM) để phân tích chuỗi dữ liệu giá cả lịch sử.",
                        },
                        {
                            title: "Forecast",
                            content: "Đưa ra dự báo xu hướng giá trong ngắn hạn (1-7 ngày).",
                        },
                        {
                            title: "Impact",
                            content: "Giúp nông dân tránh bán đáy.",
                        },
                    ]}
                />
            </div>

            <div className="section-bg--gradient-mint">
                <FeatureGrid />
            </div>
        </div>
    );
}
