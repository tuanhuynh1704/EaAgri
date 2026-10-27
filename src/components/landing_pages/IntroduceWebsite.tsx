import { Link } from "react-router-dom";
import { useSEO } from "../../hooks/useSEO";
import reportText from "../../data/eaagri-report.txt?raw";

const pageUrl = "https://www.eaagri.vn/gioi-thieu-eaagri";
const firstPartIndex = reportText.indexOf("Phần 1:");
const articleHeadline = reportText.slice(0, firstPartIndex).trim();
const sectionTitles = [
  "Phần 1: Lời Mở Đầu Và Tuyên Ngôn Chuyển Đổi Số Trong Nông Nghiệp",
  "Phần 2: Bối Cảnh Vĩ Mô Ngành Hàng Sầu Riêng Và Điểm Nghẽn Chuỗi Giá Trị",
  "Phần 3: Kiến Trúc Công Nghệ Lõi Của Hệ Sinh Thái EaAgri",
  "Phần 4: Nền Tảng EaAgri CRM Và Chiến Lược Thương Mại Hóa B2B2C",
  'Phần 5: Phân Tích Yếu Tố Tâm Lý Hành Vi: Hóa Giải Điểm Nghẽn "TRUST" Trong Nông Nghiệp Số',
  "Phần 6: Nền Tảng Học Thuật, Năng Lực Đội Ngũ Và Sự Ghi Nhận Của Hệ Sinh Thái Khởi Nghiệp",
  "Phần 7: Tác Động Chiến Lược Và Động Lực Phát Triển Tương Lai",
];
const paragraphStarts = [
  "Nền kinh tế nông nghiệp Việt Nam", "Để đánh giá chính xác giá trị nội tại", "Sầu riêng hiện đã vượt qua",
  "Mã số vùng trồng (Planting Area Code", "Song song với bài toán định danh", "Đáp lại những thách thức mang tính hệ thống",
  "Tại tầng nhận thức", "Nếu chỉ dừng lại ở việc gán nhãn bệnh lý", "Để AI có thể tư duy chính xác",
  "Sự vượt trội về mặt kỹ thuật", "Lõi của chiến lược thương mại", "Việc tiếp cận trực tiếp từng nông hộ",
  "Bất kỳ sự đột phá công nghệ nào", "Ông Nguyễn Khắc Minh Trí", "Nhận thức được \"nỗi đau\" về niềm tin",
  "Khác với các startup công nghệ", "Dự án được khởi xướng bởi nhóm sinh viên",
  "Quá trình chuyển hóa từ một đồ án môn học", "Việc triển khai thành công hệ sinh thái EaAgri",
  "Lợi thế cạnh tranh dài hạn của EaAgri", "Bắt đầu từ vùng trọng điểm Đắk Lắk",
  "Chuyển đổi số trong nông nghiệp chưa bao giờ",
  "Hạn Chế Của Canh Tác Truyền Thống",
  "Quản lý mã vùng trồng thủ công",
  "Chẩn đoán dịch bệnh bằng kinh nghiệm",
  "Lạm dụng hóa chất bảo vệ thực vật",
  "Tưới tiêu và điều tiết vi khí hậu cảm tính",
  "Phân hệ Viễn thám (Vĩ mô)",
  "Phân hệ IoT & Cảm biến (Vi mô)",
  "Phân hệ Nhận thức AI (Dual-Brain)",
  "Phân hệ Phân tích & Suy luận",
  "Phân hệ Minh bạch hóa Dữ liệu",
  "Đấu Trường Khởi Nghiệp & Khoa Học",
  "NTTU Innovation Startup Challenge 2026",
  "Hội Thảo Khoa Học Quốc Tế AIIIA 2026",
  "Cuộc thi Khởi nghiệp Xanh 2026 (Lần thứ 12)",
];
const formattedReport = sectionTitles.reduce(
  (text, title) => text.replace(title, `\n\n${title}\n\n`),
  reportText.slice(firstPartIndex),
);
const articleBlocks = paragraphStarts
  .reduce((text, start) => text.replace(start, `\n\n${start}`), formattedReport)
  .replace(/(?=Phần \d+:)/g, "\n\n")
  .replace(/(?=\d+\.\d+\.\s)/g, "\n\n")
  .split(/\n{2,}/)
  .map((block) => block.trim())
  .filter(Boolean);
const description =
  "Phân tích hệ sinh thái nông nghiệp thông minh EaAgri: AI, IoT, dữ liệu vùng trồng, EaAgri CRM và mô hình kết nối nhà vườn, đại lý, hợp tác xã trong chuỗi giá trị sầu riêng.";

const sections = [
  { id: "boi-canh", title: "Bài toán của ngành sầu riêng" },
  { id: "cong-nghe", title: "Kiến trúc công nghệ EaAgri" },
  { id: "thuong-mai-hoa", title: "Mô hình B2B2C và CRM" },
  { id: "niem-tin", title: "Con người và niềm tin" },
  { id: "doi-ngu", title: "Đội ngũ và dấu ấn" },
  { id: "tuong-lai", title: "Hướng phát triển" },
];

export default function IntroduceWebsite() {
  useSEO({
    title: "Hệ sinh thái nông nghiệp thông minh EaAgri",
    description,
    keywords:
      "EaAgri, giới thiệu EaAgri, hệ sinh thái nông nghiệp số, nông nghiệp thông minh, AI nông nghiệp, IoT nông nghiệp, sầu riêng, EaAgri CRM",
    ogTitle: "EaAgri – Hệ sinh thái nông nghiệp thông minh cho ngành sầu riêng",
    ogDescription: description,
    ogImage: "https://www.eaagri.vn/images-1/logo-1.jpg",
    ogUrl: pageUrl,
    ogType: "article",
    canonicalUrl: pageUrl,
    structuredData: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Article",
          "@id": `${pageUrl}#article`,
          headline: articleHeadline,
          description,
          inLanguage: "vi-VN",
          mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
          image: "https://www.eaagri.vn/images-1/logo-1.jpg",
          author: { "@type": "Organization", name: "EaAgri", url: "https://www.eaagri.vn/" },
          publisher: {
            "@type": "Organization",
            name: "EaAgri",
            url: "https://www.eaagri.vn/",
            logo: { "@type": "ImageObject", url: "https://www.eaagri.vn/images-1/logo-1.jpg" },
          },
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Trang chủ", item: "https://www.eaagri.vn/" },
            { "@type": "ListItem", position: 2, name: "Giới thiệu EaAgri", item: pageUrl },
          ],
        },
      ],
    },
  });

  return (
    <main className="introduce-article">
      <div className="introduce-article__shell">
        <nav className="introduce-article__breadcrumb" aria-label="Điều hướng">
          <Link to="/">Trang chủ</Link><span aria-hidden="true">/</span><span>Giới thiệu EaAgri</span>
        </nav>

        <header className="introduce-article__header">
          <span className="introduce-article__eyebrow"><i className="ri-leaf-line" /> HỆ SINH THÁI NÔNG NGHIỆP SỐ</span>
          <h1>{articleHeadline}</h1>
          <p className="introduce-article__lead">Báo cáo phân tích toàn diện hệ sinh thái EaAgri, từ bối cảnh ngành hàng sầu riêng và kiến trúc công nghệ đến mô hình thương mại hóa, niềm tin người dùng và định hướng phát triển.</p>
          <div className="introduce-article__meta"><span><i className="ri-time-line" /> Báo cáo chuyên sâu</span><span><i className="ri-building-line" /> Ban biên tập EaAgri</span></div>
        </header>

        <div className="introduce-article__layout">
          <aside className="introduce-article__toc" aria-label="Mục lục bài viết">
            <strong>Trong bài viết này</strong>
            {sections.map((section, index) => <a key={section.id} href={`#${section.id}`}><span>0{index + 1}</span>{section.title}</a>)}
          </aside>

          <article className="introduce-article__body">
            {articleBlocks.map((block, index) => {
              const isPart = /^Phần \d+:/.test(block);
              const isSubsection = /^\d+\.\d+\.\s/.test(block);
              const isConclusion = block === "Kết Luận";
              const anchorId = isPart
                ? ["boi-canh", "cong-nghe", "thuong-mai-hoa", "niem-tin", "doi-ngu", "tuong-lai"][Number(block.match(/^Phần (\d+)/)?.[1]) - 2]
                : undefined;
              const isTableLabel = /^(?:Hạn Chế Của Canh Tác|Quản lý mã vùng trồng thủ công|Chẩn đoán dịch bệnh bằng kinh nghiệm|Lạm dụng hóa chất bảo vệ thực vật|Tưới tiêu và điều tiết vi khí hậu|Phân hệ |Đấu Trường Khởi Nghiệp|NTTU Innovation Startup|Hội Thảo Khoa Học Quốc Tế|Cuộc thi Khởi nghiệp Xanh)/.test(block);
              const isHeading = isPart || isSubsection || isConclusion;
              return (
                <section key={`${index}-${block.slice(0, 24)}`} id={anchorId} className={isSubsection ? "introduce-article__subsection" : undefined}>
                  {isPart && <h2>{block}</h2>}
                  {isSubsection && <h3>{block}</h3>}
                  {isConclusion && <h2>{block}</h2>}
                  {!isHeading && (isTableLabel ? <h3>{block}</h3> : <p>{block}</p>)}
                </section>
              );
            })}
            <footer className="introduce-article__byline"><img src="/images-1/logo-1.jpg" alt="Logo EaAgri" /><span><strong>Ban biên tập EaAgri</strong><small>Nội dung giới thiệu hệ sinh thái EaAgri</small></span></footer>
          </article>
        </div>
      </div>
    </main>
  );
}
