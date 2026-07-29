// import Navbar from "../components/Navbar";
// import Footer from "../components/Footer";
import Hero from "../components/Hero";
import TeamSection from "../components/TeamSection";
import AIChat from "../components/AIChat";
import StorySection from "../components/StorySection";
import VideoSection from "../components/VideoSection";
import ResultSection from "../components/ResultSection";
import RoadmapSection from "../components/RoadmapSection";

export default function HomePage() {
    return (
        <>
            {/* Thêm thông tin chi tiết cho sản phẩm bằng cách nhấn vào hình ảnh, các hình phải liên quan với nhau */}
            {/* <Navbar /> */}
            <Hero />

            <div className="section-bg--white">
                <TeamSection />
            </div>

            {/* <AIChat /> */}

            <div className="section-bg--gradient-soft">
                <StorySection
                    title={"Danh hiệu &<br />Giải Thưởng"}
                    image="/assets/IMG_2695.JPEG"
                    imageAlt="Durian Farm"
                    showButton
                    descriptions={[
                        <>
                            <strong>1. Thách thức:</strong>
                            {" "}
                            Phá vỡ "Tứ giác rủi ro" Nông nghiệp Tây Nguyên đang đứng trước những thách thức lớn từ môi trường và thị trường. EaAgri được phát triển để giải quyết triệt để 4 rào cản cốt lõi: Biến đổi khí hậu: Ứng phó tình trạng sốc nước và cực đoan thời tiết. Dịch bệnh: Kiểm soát các biến chủng dịch bệnh phức tạp trên cây trồng. Tri thức: Khỏa lấp khoảng trống về kỹ thuật canh tác chuyên sâu. Thị trường: Xóa bỏ sự bất đối xứng thông tin, tối ưu hóa chuỗi giá trị.
                        </>,

                        <>
                            <strong>2. Giải pháp:</strong>
                            {" "}
                            Số hóa quy trình canh tác (Data-driven Farming) Chúng tôi không chỉ cung cấp công cụ, mà xây dựng một tư duy canh tác mới dựa trên dữ liệu thực tế: AI & IoT Tiên tiến: Hệ thống cảm biến thu thập dữ liệu thời gian thực, kết hợp trí tuệ nhân tạo để đưa ra các kịch bản ứng phó chính xác. Tối ưu tài nguyên: Giảm thiểu lãng phí nước và phân bón, hướng tới nông nghiệp bền vững. Kết nối mạng lưới: Thu hẹp khoảng cách giữa người nông dân và đội ngũ chuyên gia kỹ thuật thông qua nền tảng công nghệ trực tuyến.
                        </>,
                    ]}
                />
            </div>

            <div className="section-bg--gradient-teal">
                <StorySection
                    title={"Vấn Đề &<br />Giải Pháp"}
                    image="/assets/mohinhtongquan"
                    imageAlt="System Overview"
                    showButton
                    descriptions={[
                        <>
                            Nông nghiệp Tây Nguyên đang đối mặt với "Tứ giác rủi ro": Sốc nước do biến đổi khí hậu, dịch bệnh phức tạp, thiếu hụt tri thức chuyên môn và bất đối xứng thông tin thị trường.
                        </>,

                        <>
                            <strong>EaAgri</strong>
                            {" "}
                            ra đời nhằm số hóa quy trình canh tác, chuyển dịch sang "Data-driven farming", giúp giảm thiểu lãng phí tài nguyên và kết nối nông dân với chuyên gia kỹ thuật thông qua công nghệ AI & IoT tiên tiến.
                        </>,
                    ]}
                />
            </div>

            <div className="section-bg--gradient-warm">
                <VideoSection
                    title="Lời Giải Cho Nông Dân"
                    description="Sự khởi đầu của dự án!"
                    videoUrl="https://www.youtube.com/embed/ap6V_7nSDm8?start=1"
                    fallbackUrl="https://www.youtube.com/watch?v=ap6V_7nSDm8"
                />
            </div>



            <div className="section-bg--gradient-soft">
                <VideoSection
                    title="Demo Thực Tế Sản Phẩm"
                    description="Trải nghiệm thực tế hệ thống EaAgri."
                    videoUrl="https://www.youtube.com/embed/WxfKTEIxSjQ"
                    fallbackUrl="https://www.youtube.com/watch?v=WxfKTEIxSjQ"
                    footerText="Video demo thực tế sản phẩm EaAgri"
                />
            </div>



            <div className="section-bg--gradient-warm">
                <ResultSection />
            </div>

            <RoadmapSection />
            {/* <Footer /> */}
        </>
    );
}