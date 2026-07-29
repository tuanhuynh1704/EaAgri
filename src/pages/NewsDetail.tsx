import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../utils/supabase/client";
import { useAuth } from "../context/AuthContext";
import "react-quill-new/dist/quill.snow.css";
import { cleanContent } from "../utils/cleanContent";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  author: string;
  category: string;
  image_url: string | null;
  created_at: string;
}

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [article, setArticle] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isSA = profile?.role === "SA";

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("news")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          throw error;
        }

        if (!data) {
          setError("Không tìm thấy bài viết này.");
        } else {
          setArticle(data as NewsItem);
        }
      } catch (err: any) {
        console.error("Error fetching article:", err);
        setError(err.message || "Đã xảy ra lỗi khi tải bài viết.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  const handleDelete = async () => {
    if (!article) return;

    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn xóa bài viết "${cleanContent(article.title)}"? Hành động này không thể hoàn tác.`
    );
    if (!confirmDelete) return;

    setDeleting(true);
    try {
      // 1. If article has a storage image, we might want to delete it from Storage too.
      // But since we don't know the exact file name format or bucket rules, we'll focus on deleting the db row first.
      // If we want to delete from storage, we can extract the path from image_url, but deleting the record is the main requirement.
      const { error: deleteError } = await supabase
        .from("news")
        .delete()
        .eq("id", article.id);

      if (deleteError) throw deleteError;

      alert("Xóa bài viết thành công!");
      navigate("/news");
    } catch (err: any) {
      console.error("Error deleting article:", err);
      alert("Đã xảy ra lỗi khi xóa bài viết: " + (err.message || "Lỗi không xác định"));
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  if (loading) {
    return (
      <section className="news-detail">
        <div className="news-detail__container news-detail__container--loading">
          <div className="spinner"></div>
          <p>Đang tải bài viết...</p>
        </div>
      </section>
    );
  }

  if (error || !article) {
    return (
      <section className="news-detail">
        <div className="news-detail__container news-detail__container--error">
          <i className="ri-error-warning-line error-icon"></i>
          <h2>Đã xảy ra lỗi</h2>
          <p>{error || "Không tìm thấy bài viết."}</p>
          <Link to="/news" className="btn btn-secondary">
            <i className="ri-arrow-left-line"></i> Quay lại Bản Tin
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="news-detail">
      <div className="news-detail__container">
        
        {/* Navigation Breadcrumb / Back button */}
        <div className="news-detail__actions">
          <Link to="/news" className="news-detail__back-link">
            <i className="ri-arrow-left-line"></i>
            <span>Quay lại Bản Tin</span>
          </Link>

          {isSA && (
            <button
              onClick={handleDelete}
              className="news-detail__delete-btn"
              disabled={deleting}
            >
              <i className="ri-delete-bin-line"></i>
              <span>{deleting ? "Đang xóa..." : "Xóa bài viết"}</span>
            </button>
          )}
        </div>

        <article className="news-detail__card">
          
          {/* Cover Image or Category Badge */}
          {article.image_url ? (
            <div className="news-detail__hero">
              <img src={article.image_url} alt={cleanContent(article.title)} />
              <div className="news-detail__category-badge">{article.category}</div>
            </div>
          ) : (
            <div className="news-detail__no-hero">
              <span className="news-detail__category-badge">{article.category}</span>
            </div>
          )}

          {/* Article Header Content */}
          <div className="news-detail__body">
            <h1 className="news-detail__title">{cleanContent(article.title)}</h1>

            <div className="news-detail__meta">
              <div className="news-detail__meta-item">
                <i className="ri-user-3-line"></i>
                <span>Tác giả: <strong>{article.author}</strong></span>
              </div>
              <div className="news-detail__meta-item">
                <i className="ri-calendar-line"></i>
                <span>Ngày đăng: <strong>{formatDate(article.created_at)}</strong></span>
              </div>
            </div>

            {/* Main Content */}
            <div 
              className="news-detail__content ql-editor"
              dangerouslySetInnerHTML={{ __html: cleanContent(article.content) }}
            />

          </div>
        </article>

      </div>
    </section>
  );
}
