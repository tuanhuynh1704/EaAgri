import React, { useEffect, useState, useRef } from "react";
import { Link, 
  // useNavigate
 } from "react-router-dom";
import { supabase } from "../utils/supabase/client";
import { useAuth } from "../context/AuthContext";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { cleanContent } from "../utils/cleanContent";
import { quillModules, quillFormats } from "../utils/quillConfig";
import { parseImageUrlAndPosition, buildImageUrlWithPosition } from "../utils/imageUtils";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  author: string;
  category: string;
  image_url: string | null;
  created_at: string;
}

interface AlertState {
  type: "success" | "error" | null;
  message: string;
}

export default function ManageNews() {
  const { user, profile, loading: authLoading } = useAuth();
  // const navigate = useNavigate();

  // News list states
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [alertState, setAlertState] = useState<AlertState>({ type: null, message: "" });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formAuthor, setFormAuthor] = useState("");
  const [formCategory, setFormCategory] = useState("Kỹ thuật");
  const [formContent, setFormContent] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formImagePosX, setFormImagePosX] = useState(50);
  const [formImagePosY, setFormImagePosY] = useState(50);
  
  // Upload states
  const [formImageFile, setFormImageFile] = useState<File | null>(null);
  const [formImagePreview, setFormImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Drag to pan states
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    "Kỹ thuật",
    "Tin tức",
    "Thị trường",
    "Thời tiết",
    "Sinh học",
    "Bền vững"
  ];

  const filterCategories = ["Tất cả", ...categories];

  // Fetch all articles
  const fetchNews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNews((data as NewsItem[]) || []);
    } catch (err: any) {
      console.error("Error fetching news:", err);
      setAlertState({
        type: "error",
        message: `Không thể tải danh sách bài viết: ${err.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && profile?.role === "SA") {
      fetchNews();
    }
  }, [user, profile]);

  // Auth gate
  if (authLoading) {
    return (
      <section className="manage-news">
        <div className="news-list__loading">
          <div className="spinner"></div>
          <p>Đang kiểm tra quyền truy cập...</p>
        </div>
      </section>
    );
  }

  if (!user || profile?.role !== "SA") {
    return (
      <section className="manage-news" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "calc(100vh - 160px)" }}>
        <div className="ac-mgmt__unauthorized" data-aos="fade-up">
          <i className="ri-shield-keyhole-line"></i>
          <h2>Truy Cập Bị Từ Chối</h2>
          <p>Trang này chỉ dành riêng cho tài khoản Super Admin (SA). Vui lòng đăng nhập với tài khoản có thẩm quyền hoặc quay lại trang chủ.</p>
          <Link to="/" className="btn">
            <i className="ri-home-4-line"></i>
            Quay về Trang chủ
          </Link>
        </div>
      </section>
    );
  }

  // Handle Delete
  const handleDelete = async (id: string, title: string) => {
    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn xóa bài viết "${title}"? Hành động này không thể hoàn tác.`
    );
    if (!confirmDelete) return;

    setDeletingId(id);
    setAlertState({ type: null, message: "" });
    try {
      const { error } = await supabase
        .from("news")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setNews((prev) => prev.filter((item) => item.id !== id));
      setAlertState({
        type: "success",
        message: "Xóa bài viết thành công!"
      });
    } catch (err: any) {
      console.error("Error deleting news:", err);
      setAlertState({
        type: "error",
        message: `Xóa bài viết thất bại: ${err.message}`
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Open modal for Create
  const handleOpenCreate = () => {
    setModalMode("create");
    setEditingId(null);
    setFormTitle("");
    setFormAuthor(profile?.full_name || "");
    setFormCategory("Kỹ thuật");
    setFormContent("");
    setFormImageUrl("");
    setFormImagePosX(50);
    setFormImagePosY(50);
    setFormImageFile(null);
    setFormImagePreview(null);
    setAlertState({ type: null, message: "" });
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (item: NewsItem) => {
    setModalMode("edit");
    setEditingId(item.id);
    setFormTitle(cleanContent(item.title));
    setFormAuthor(item.author);
    setFormCategory(item.category);
    setFormContent(cleanContent(item.content));
    
    const parsed = parseImageUrlAndPosition(item.image_url);
    setFormImageUrl(parsed.url || "");
    setFormImagePosX(parsed.posX);
    setFormImagePosY(parsed.posY);
    
    setFormImageFile(null);
    // If there is an existing image URL, set it as preview
    setFormImagePreview(parsed.url);
    setAlertState({ type: null, message: "" });
    setIsModalOpen(true);
  };

  // Handle File Input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert("Kích thước ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB.");
        return;
      }
      setFormImageFile(file);
      setFormImagePreview(URL.createObjectURL(file));
      setFormImageUrl(""); // Clear URL input if file is selected
    }
  };

  const removeSelectedImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFormImageFile(null);
    setFormImagePreview(null);
    setFormImageUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    setFormImagePosX(prev => Math.max(0, Math.min(100, prev - (deltaX * 0.3))));
    setFormImagePosY(prev => Math.max(0, Math.min(100, prev - (deltaY * 0.3))));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle Submit Form (Add/Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      alert("Vui lòng nhập tiêu đề bài viết.");
      return;
    }
    if (!formAuthor.trim()) {
      alert("Vui lòng nhập tên tác giả.");
      return;
    }
    if (!formContent.trim()) {
      alert("Vui lòng nhập nội dung bài viết.");
      return;
    }

    setIsSaving(true);
    setAlertState({ type: null, message: "" });

    try {
      let finalImageUrl = formImageUrl.trim();

      // Upload file to Supabase storage if file is selected
      if (formImageFile) {
        const cleanFileName = formImageFile.name.replace(/[^\w.-]/g, "_");
        const fileName = `${Date.now()}-${cleanFileName}`;

        const { error: uploadError } = await supabase.storage
          .from("news-images")
          .upload(fileName, formImageFile, {
            cacheControl: "3600",
            upsert: false
          });

        if (uploadError) {
          throw new Error(`Lỗi tải ảnh lên: ${uploadError.message}`);
        }

        const { data } = supabase.storage.from("news-images").getPublicUrl(fileName);
        finalImageUrl = data.publicUrl;
      } else if (!formImagePreview) {
        // If image preview was cleared/removed, we clear the image URL
        finalImageUrl = "";
      }

      const finalImageUrlWithPos = finalImageUrl ? buildImageUrlWithPosition(finalImageUrl, formImagePosX, formImagePosY) : null;

      if (modalMode === "create") {
        // Insert new post
        const { data, error } = await supabase
          .from("news")
          .insert([
            {
              title: cleanContent(formTitle.trim()),
              content: cleanContent(formContent.trim()),
              author: formAuthor.trim(),
              category: formCategory,
              image_url: finalImageUrlWithPos
            }
          ])
          .select();

        if (error) throw error;

        // Add to state
        if (data && data.length > 0) {
          setNews((prev) => [data[0] as NewsItem, ...prev]);
        } else {
          // Fallback fetch
          fetchNews();
        }

        setAlertState({
          type: "success",
          message: "Thêm bài viết mới thành công!"
        });
      } else {
        // Edit post
        if (!editingId) return;

        const { data, error } = await supabase
          .from("news")
          .update({
            title: cleanContent(formTitle.trim()),
            content: cleanContent(formContent.trim()),
            author: formAuthor.trim(),
            category: formCategory,
            image_url: finalImageUrlWithPos
          })
          .eq("id", editingId)
          .select();

        if (error) throw error;

        // Update state
        if (data && data.length > 0) {
          setNews((prev) =>
            prev.map((item) => (item.id === editingId ? (data[0] as NewsItem) : item))
          );
        } else {
          // Fallback fetch
          fetchNews();
        }

        setAlertState({
          type: "success",
          message: "Cập nhật bài viết thành công!"
        });
      }

      // Close modal on success
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Error saving article:", err);
      alert(`Lỗi lưu bài viết: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Filter logic
  const filteredNews = news.filter((item) => {
    const matchesCategory =
      selectedCategory === "Tất cả" || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
  };

  return (
    <section className="manage-news">
      <div className="manage-news__container">
        
        {/* Back Link */}
        <Link to="/" className="manage-news__back">
          <i className="ri-arrow-left-line"></i>
          Quay lại Trang chủ
        </Link>

        {/* Header */}
        <div className="manage-news__header" data-aos="fade-up">
          <h1>Quản Lý Bài Viết</h1>
          <p>Danh sách toàn bộ bài tin tức, hướng dẫn kỹ thuật canh tác nông nghiệp trên hệ thống</p>
        </div>

        {/* Main Content Dashboard */}
        <div className="manage-news__card" data-aos="fade-up" data-aos-delay="100">
          
          {/* Status Alert */}
          {alertState.type && (
            <div className={`manage-news__alert manage-news__alert--${alertState.type}`}>
              <i className={alertState.type === "success" ? "ri-checkbox-circle-line" : "ri-error-warning-line"}></i>
              <span>{alertState.message}</span>
            </div>
          )}

          {/* Toolbar */}
          <div className="manage-news__toolbar">
            
            {/* Search Box */}
            <div className="manage-news__search">
              <i className="ri-search-line"></i>
              <input
                type="text"
                placeholder="Tìm tiêu đề, tác giả..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter and Add button */}
            <div className="manage-news__actions-bar">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="manage-news__select"
              >
                {filterCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <button className="manage-news__add-btn" onClick={handleOpenCreate}>
                <i className="ri-add-line"></i>
                <span>Thêm bài viết</span>
              </button>
            </div>

          </div>

          {/* Table list */}
          {loading ? (
            <div className="news-list__loading" style={{ minHeight: "200px" }}>
              <div className="spinner"></div>
              <p>Đang tải danh sách bài viết...</p>
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="manage-news__empty">
              <i className="ri-article-line"></i>
              <p>Không có bài viết nào khớp với tìm kiếm của bạn.</p>
            </div>
          ) : (
            <div className="manage-news__table-wrapper">
              <table className="manage-news__table">
                <thead>
                  <tr>
                    <th>Ảnh</th>
                    <th>Tiêu đề bài viết</th>
                    <th>Danh mục</th>
                    <th>Tác giả</th>
                    <th>Ngày tạo</th>
                    <th style={{ textAlign: "center" }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNews.map((item) => (
                    <tr key={item.id}>
                      {/* Image Thumbnail */}
                      <td style={{ width: "80px" }}>
                        <div className="manage-news__thumb">
                          {item.image_url ? (
                            <img src={parseImageUrlAndPosition(item.image_url).url!} alt={cleanContent(item.title)} style={{ objectPosition: `${parseImageUrlAndPosition(item.image_url).posX}% ${parseImageUrlAndPosition(item.image_url).posY}%` }} />
                          ) : (
                            <div className="manage-news__thumb-placeholder">
                              <i className="ri-image-line"></i>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Title */}
                      <td>
                        <div className="manage-news__item-title">
                          <Link to={`/news/${item.id}`} className="title-link">
                            {cleanContent(item.title)}
                          </Link>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td>
                        <span className={`manage-news__badge`}>
                          {item.category}
                        </span>
                      </td>

                      {/* Author */}
                      <td>
                        <span className="manage-news__author">{item.author}</span>
                      </td>

                      {/* Date */}
                      <td>
                        <span className="manage-news__date">{formatDate(item.created_at)}</span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="manage-news__row-actions">
                          <button
                            className="btn-edit"
                            onClick={() => handleOpenEdit(item)}
                            title="Chỉnh sửa bài viết"
                          >
                            <i className="ri-edit-line"></i>
                            <span>Sửa</span>
                          </button>
                          
                          <button
                            className="btn-delete"
                            onClick={() => handleDelete(item.id, item.title)}
                            disabled={deletingId === item.id}
                            title="Xóa bài viết"
                          >
                            <i className="ri-delete-bin-line"></i>
                            <span>{deletingId === item.id ? "Đang xóa" : "Xóa"}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Stats footer */}
          <div className="manage-news__footer-stats">
            <span>Tổng cộng: {filteredNews.length} bài viết</span>
          </div>

        </div>

      </div>

      {/* CREATE/EDIT DIALOG MODAL */}
      {isModalOpen && (
        <div className="manage-news-modal">
          <div className="manage-news-modal__backdrop" onClick={() => !isSaving && setIsModalOpen(false)}></div>
          
          <div className="manage-news-modal__content" data-aos="zoom-in" data-aos-duration="300">
            
            {/* Modal Header */}
            <div className="manage-news-modal__header">
              <h2>{modalMode === "create" ? "Đăng Bài Viết Mới" : "Chỉnh Sửa Bài Viết"}</h2>
              <button 
                className="manage-news-modal__close" 
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
              >
                <i className="ri-close-line"></i>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="manage-news-modal__form">
              
              <div className="manage-news-modal__grid">
                
                {/* Image Upload section */}
                <div className="manage-news-modal__image-section">
                  <label className="field-label">Ảnh bài viết</label>
                  
                  <div 
                    className={`manage-news-modal__dropzone ${formImagePreview ? "has-image" : ""}`}
                    onClick={() => !formImagePreview && fileInputRef.current?.click()}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      style={{ display: "none" }}
                    />
                    
                    {formImagePreview ? (
                      <div className="preview-container">
                        <img 
                          src={formImagePreview} 
                          alt="Preview" 
                          onMouseDown={handleMouseDown}
                          onMouseMove={handleMouseMove}
                          onMouseUp={handleMouseUp}
                          onMouseLeave={handleMouseUp}
                          draggable={false}
                          style={{ objectPosition: `${formImagePosX}% ${formImagePosY}%`, width: '100%', height: '250px', objectFit: 'cover', borderRadius: '12px', cursor: isDragging ? 'grabbing' : 'grab' }} 
                        />
                        <button 
                          className="remove-btn" 
                          onClick={removeSelectedImage} 
                          title="Xóa ảnh"
                          disabled={isSaving}
                          type="button"
                        >
                          <i className="ri-close-line"></i>
                        </button>
                      </div>
                    ) : (
                      <div className="dropzone-prompt">
                        <i className="ri-image-add-line"></i>
                        <span>Nhấp để tải lên ảnh bìa</span>
                        <small>Chấp nhận JPG, PNG, WEBP (Tối đa 5MB)</small>
                      </div>
                    )}
                  </div>

                  <div className="modal-url-input">
                    <span className="or-divider">Hoặc liên kết ảnh bên ngoài</span>
                    <input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={formImageUrl}
                      onChange={(e) => {
                        setFormImageUrl(e.target.value);
                        setFormImageFile(null);
                        setFormImagePreview(e.target.value || null);
                      }}
                      className="modal-input"
                      disabled={formImageFile !== null || isSaving}
                    />
                  </div>

                  {/* Image Position Sliders */}
                  {(formImagePreview || formImageUrl) && (
                    <div className="upload-news__group" style={{ marginTop: '1.5rem', background: '#f8faf9', padding: '1rem', borderRadius: '12px', border: '1px solid #e1e8e3' }}>
                      <label style={{ marginBottom: '1rem', display: 'block', fontWeight: 600 }}>Căn chỉnh vị trí ảnh bìa</label>
                      
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem', color: '#1b3323' }}>
                          <span>Ngang (Trái ↔ Phải)</span>
                          <strong>{formImagePosX}%</strong>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={formImagePosX} 
                          onChange={(e) => setFormImagePosX(parseInt(e.target.value))}
                          style={{ width: '100%', accentColor: '#43a047', height: '6px' }}
                        />
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem', color: '#1b3323' }}>
                          <span>Dọc (Lên ↕ Xuống)</span>
                          <strong>{formImagePosY}%</strong>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={formImagePosY} 
                          onChange={(e) => setFormImagePosY(parseInt(e.target.value))}
                          style={{ width: '100%', accentColor: '#43a047', height: '6px' }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Form fields section */}
                <div className="manage-news-modal__fields-section">
                  
                  {/* Title */}
                  <div className="modal-field">
                    <label htmlFor="modal-title">Tiêu đề bài viết <span className="required">*</span></label>
                    <input
                      type="text"
                      id="modal-title"
                      placeholder="Nhập tiêu đề..."
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="modal-input"
                      required
                      disabled={isSaving}
                    />
                  </div>

                  {/* Row grid: Author & Category */}
                  <div className="modal-fields-row">
                    
                    {/* Author */}
                    <div className="modal-field">
                      <label htmlFor="modal-author">Tác giả <span className="required">*</span></label>
                      <input
                        type="text"
                        id="modal-author"
                        placeholder="Tác giả..."
                        value={formAuthor}
                        onChange={(e) => setFormAuthor(e.target.value)}
                        className="modal-input"
                        required
                        disabled={isSaving}
                      />
                    </div>

                    {/* Category */}
                    <div className="modal-field">
                      <label htmlFor="modal-category">Danh mục</label>
                      <select
                        id="modal-category"
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="modal-select"
                        disabled={isSaving}
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                  </div>

                  {/* Content */}
                  <div className="modal-field modal-field--full" style={{ gridColumn: "1 / -1", minHeight: "350px", display: "flex", flexDirection: "column" }}>
                    <label htmlFor="modal-content">Nội dung chi tiết <span className="required">*</span></label>
                    <ReactQuill
                      theme="snow"
                      value={formContent}
                      onChange={setFormContent}
                      modules={quillModules}
                      formats={quillFormats}
                      readOnly={isSaving}
                      placeholder="Nhập nội dung bài viết..."
                      style={{ flex: 1, display: "flex", flexDirection: "column" }}
                    />
                  </div>

                </div>

              </div>

              {/* Modal Footer Actions */}
              <div className="manage-news-modal__footer">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn-save" 
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <div className="modal-spinner"></div>
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <i className="ri-save-line"></i>
                      <span>Lưu lại</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </section>
  );
}
