import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSEO } from "../hooks/useSEO";
import { supabase } from "../utils/supabase/client";
import { useAuth } from "../context/AuthContext";
import { cleanContent } from "../utils/cleanContent";
import { parseImageUrlAndPosition } from "../utils/imageUtils";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  author: string;
  category: string;
  image_url: string | null;
  created_at: string;
}

// Strip HTML tags for search and snippet preview
const stripHtml = (html: string) => {
  const doc = new DOMParser().parseFromString(cleanContent(html), "text/html");
  return cleanContent(doc.body.textContent || "");
};

export default function NewsList() {
  useSEO({
    title: "Bản Tin & Kiến Thức Nông Nghiệp Thông Minh",
    description:
      "Cập nhật tin tức thị trường giá sầu riêng, kỹ thuật canh tác VietGAP, cảnh báo sâu bệnh và dự báo thời tiết nông nghiệp mới nhất từ EaAgri.",
    keywords:
      "tin tức nông nghiệp, giá sầu riêng hôm nay, kỹ thuật sầu riêng VietGAP, cảnh báo sâu bệnh Đắk Lắk, bản tin EaAgri",
    canonicalUrl: "https://www.eaagri.vn/news",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Bản Tin & Kiến Thức Nông Nghiệp EaAgri",
      "description": "Kho dữ liệu tin tức, giá cả thị trường và cẩm nang kỹ thuật canh tác nông nghiệp số.",
      "url": "https://www.eaagri.vn/news"
    }
  });

  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const { profile } = useAuth();
  const isSA = profile?.role === "SA";

  const categories = [
    "Tất cả",
    "Kỹ thuật",
    "Tin tức",
    "Thị trường",
    "Thời tiết",
    "Sinh học",
    "Bền vững"
  ];

  // Fetch articles from Supabase on mount
  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchNews = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("news")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setNews(data as NewsItem[] || []);
      } catch (err) {
        console.error("Error fetching news:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Delete article handler for SA
  const handleDelete = async (id: string, title: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa bài viết "${title}"? Hành động này không thể hoàn tác.`);
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from("news")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setNews((prevNews) => prevNews.filter((item) => item.id !== id));
      alert("Xóa bài viết thành công!");
    } catch (err: any) {
      console.error("Error deleting article:", err);
      alert("Đã xảy ra lỗi khi xóa bài viết: " + (err.message || "Lỗi không xác định"));
    }
  };

  // Filter logic
  const filteredNews = news.filter((item) => {
    const matchesCategory =
      selectedCategory === "Tất cả" || item.category === selectedCategory;
    
    const plainContent = stripHtml(item.content);
    const matchesSearch =
      cleanContent(item.title).toLowerCase().includes(searchQuery.toLowerCase()) ||
      plainContent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric"
    };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  return (
    <section className="news-list">
      <div className="news-list__container">

        {/* Header */}
        <div className="news-list__header" data-aos="fade-up">
          <h1>Bản Tin Nông Nghiệp</h1>
          <p>Cập nhật kỹ thuật canh tác, thông tin thị trường và thời tiết mới nhất</p>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="news-list__toolbar" data-aos="fade-up" data-aos-delay="100">

          {/* Search Box */}
          <div className="news-list__search">
            <i className="ri-search-line"></i>
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Categories Horizontal List */}
          <div className="news-list__categories">
            {categories.map((cat) => (
              <button
                key={cat}
                className={selectedCategory === cat ? "active" : ""}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>

        <article className="news-list__institutional-feature" data-aos="fade-up" data-aos-delay="140">
          <a
            href="https://cntt.ntt.edu.vn/nghien-cuu-khoa-hoc/phat-trien-san-pham/ea-agri-xuat-sac-gianh-giai-nhat-vong-ban-ket-nttu-innovation-startup-challenge-2026-bang-cong-nghe-nong-nghiep-va-cong-nghe-thuc-pham/"
            target="_blank"
            rel="noopener noreferrer"
            className="news-list__institutional-image"
          >
            <img src="/Khởi nghiệp 3.jpg" alt="Ea Agri đạt Giải Nhất Vòng Bán kết Bảng 1C" />
            <span><i className="ri-verified-badge-fill" /> Tin từ nhà trường</span>
          </a>
          <div className="news-list__institutional-content">
            <small>KHOA CNTT · ĐẠI HỌC NGUYỄN TẤT THÀNH</small>
            <h2>Ea Agri giành Giải Nhất Vòng Bán kết NTTU Innovation Startup Challenge 2026</h2>
            <p>Đội thi Ea Agri, mã số NTT-144, được nhà trường ghi nhận tại Bảng 1C — Công nghệ Nông nghiệp và Công nghệ Thực phẩm.</p>
            <div className="news-list__institutional-actions">
              <a href="https://cntt.ntt.edu.vn/nghien-cuu-khoa-hoc/phat-trien-san-pham/ea-agri-xuat-sac-gianh-giai-nhat-vong-ban-ket-nttu-innovation-startup-challenge-2026-bang-cong-nghe-nong-nghiep-va-cong-nghe-thuc-pham/" target="_blank" rel="noopener noreferrer">
                Đọc bài chính thức <i className="ri-arrow-right-up-line" />
              </a>
              <a href="https://www.facebook.com/share/p/1CA44S7p5M/" target="_blank" rel="noopener noreferrer" className="is-facebook">
                <i className="ri-facebook-circle-fill" /> Facebook
              </a>
            </div>
          </div>
        </article>

        {/* News Grid */}
        {loading ? (
          <div className="news-list__loading">
            <div className="spinner"></div>
            <p>Đang tải các bài viết...</p>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="news-list__empty" data-aos="fade-up">
            <i className="ri-inbox-archive-line"></i>
            <h3>Không tìm thấy bài viết nào</h3>
            <p>Hãy thử thay đổi từ khóa tìm kiếm hoặc danh mục lọc của bạn.</p>
          </div>
        ) : (
          <div className="news-list__grid">
            {filteredNews.map((item, index) => (
              <article
                key={item.id}
                className="news-list__card"
                data-aos="fade-up"
                data-aos-delay={index * 50}
              >
                {/* Card Image */}
                <Link to={`/news/${item.id}`} className="news-list__card-image-wrapper">
                  {item.image_url ? (
                    <img 
                      src={parseImageUrlAndPosition(item.image_url).url!} 
                      alt={cleanContent(item.title)} 
                      style={{ objectPosition: `${parseImageUrlAndPosition(item.image_url).posX}% ${parseImageUrlAndPosition(item.image_url).posY}%` }} 
                    />
                  ) : (
                    <div className="placeholder">
                      <i className="ri-image-line"></i>
                      <span>EaAgri News</span>
                    </div>
                  )}
                  <span className="news-list__card-badge">{item.category}</span>
                </Link>

                {/* Card Content */}
                <div className="news-list__card-content">
                  {/* Meta data */}
                  <div className="news-list__card-meta">
                    <span>
                      <i className="ri-user-3-line"></i> {item.author}
                    </span>
                    <span>
                      <i className="ri-calendar-line"></i> {formatDate(item.created_at)}
                    </span>
                  </div>

                  {/* Title */}
                  <Link to={`/news/${item.id}`} style={{ textDecoration: "none" }}>
                    <h2 className="news-list__card-title">{cleanContent(item.title)}</h2>
                  </Link>

                  {/* Snippet */}
                  <p className="news-list__card-snippet">{stripHtml(item.content)}</p>

                  {/* Card Footer Actions */}
                  <div className="news-list__card-footer">
                    <Link
                      to={`/news/${item.id}`}
                      className="news-list__read-more"
                    >
                      <span>Xem tiếp</span>
                      <i className="ri-arrow-right-line"></i>
                    </Link>

                    {isSA && (
                      <button
                        onClick={(e) => handleDelete(item.id, cleanContent(item.title), e)}
                        className="news-list__delete-btn"
                        title="Xóa bài viết"
                      >
                        <i className="ri-delete-bin-line"></i>
                        <span>Xóa</span>
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
