import VideoSection from "../components/VideoSection";
import StoryFeatureSection from "../components/StoryFeatureSection";
import FeatureGrid from "../components/FeatureGrid";

export default function ArchitecturePage() {
    return (
        <div style={{ paddingTop: '80px' }}>
            <div className="section-bg--white">
                <VideoSection
                    title="Kiến Trúc Hệ Thống"
                    description="Mô hình Hybrid kết hợp giữa sức mạnh AI, IoT và chuyên gia con người."
                    videoUrl="https://www.youtube.com/embed/QgVPizuOCdg?rel=0"
                    fallbackUrl="https://www.youtube.com/watch?v=QgVPizuOCdg"
                />
            </div>

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
                    image="/assets/Rag1.jpg"
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
                    image="/assets/mohinhgia.jpg"
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
