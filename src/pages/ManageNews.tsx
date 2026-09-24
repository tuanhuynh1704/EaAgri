import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Link, 
  // useNavigate
 } from "react-router-dom";
import { supabase } from "../utils/supabase/client";
import { useAuth } from "../context/AuthContext";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { cleanContent, extractSummaryAndBody, buildContentWithSummary } from "../utils/cleanContent";
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
  const [formSummary, setFormSummary] = useState("");
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
  const modalQuillRef = useRef<any>(null);

  // Custom image handler for ReactQuill in ManageNews modal
  const handleModalImageUpload = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files ? input.files[0] : null;
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        alert("Kích thước ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB.");
        return;
      }

      const cleanFileName = file.name.replace(/[^\w.-]/g, "_");
      const fileName = `content-${Date.now()}-${cleanFileName}`;

      try {
        const { error: uploadError } = await supabase.storage
          .from("news-images")
          .upload(fileName, file, { cacheControl: "3600", upsert: false });

        let insertedUrl = "";
        if (!uploadError) {
          const { data } = supabase.storage.from("news-images").getPublicUrl(fileName);
          insertedUrl = data.publicUrl;
        }

        const editor = modalQuillRef.current?.getEditor();
        if (editor) {
          const range = editor.getSelection(true) || { index: editor.getLength() };
          if (insertedUrl) {
            editor.insertEmbed(range.index, "image", insertedUrl);
            editor.setSelection(range.index + 1);
          } else {
            const reader = new FileReader();
            reader.onload = () => {
              editor.insertEmbed(range.index, "image", reader.result);
              editor.setSelection(range.index + 1);
            };
            reader.readAsDataURL(file);
          }
        }
      } catch {
        const editor = modalQuillRef.current?.getEditor();
        if (editor) {
          const range = editor.getSelection(true) || { index: editor.getLength() };
          const reader = new FileReader();
          reader.onload = () => {
            editor.insertEmbed(range.index, "image", reader.result);
            editor.setSelection(range.index + 1);
          };
          reader.readAsDataURL(file);
        }
      }
    };
  }, []);

  const modalQuillModules = useMemo(() => ({
    toolbar: {
      container: quillModules.toolbar,
      handlers: {
        image: handleModalImageUpload,
      },
    },
  }), [handleModalImageUpload]);

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
    setFormSummary("");
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
    
    const { summary, body } = extractSummaryAndBody(item.content);
    setFormSummary(summary);
    setFormContent(cleanContent(body));
    
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
      const finalContent = buildContentWithSummary(formSummary, formContent);

      if (modalMode === "create") {
        // Insert new post
        const { data, error } = await supabase
          .from("news")
          .insert([
            {
              title: cleanContent(formTitle.trim()),
              content: finalContent,
              author: formAuthor.trim() || "EaAgri",
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
            content: finalContent,
            author: formAuthor.trim() || "EaAgri",
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
                    <th>Tiêu đề & Ghi chú</th>
                    <th>Danh mục</th>
                    <th>Tên báo / Nguồn</th>
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

                      {/* Title & Summary */}
                      <td>
                        <div className="manage-news__item-title">
                          <Link to={`/tintuc/${item.id}`} className="title-link">
                            {cleanContent(item.title)}
                          </Link>
                          {extractSummaryAndBody(item.content).summary && (
                            <div className="manage-news__item-summary" style={{ fontSize: "0.82rem", color: "#64748b", marginTop: "4px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                              <i className="ri-sticky-note-line" style={{ marginRight: "4px", color: "#2e7d32" }}></i>
                              {extractSummaryAndBody(item.content).summary}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td>
                        <span className={`manage-news__badge`}>
                          {item.category}
                        </span>
                      </td>

                      {/* Newspaper / Source */}
                      <td>
                        <span className="manage-news__author" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <i className="ri-newspaper-line" style={{ color: "#2e7d32" }}></i>
                          {item.author}
                        </span>
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

                  {/* Image Position Sliders */}
                  {formImagePreview && (
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
                      placeholder="Nhập tiêu đề bài viết..."
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="modal-input"
                      required
                      disabled={isSaving}
                    />
                  </div>

                  {/* Ghi chú / Tóm tắt bài viết */}
                  <div className="modal-field">
                    <label htmlFor="modal-summary">Ghi chú / Tóm tắt bài viết</label>
                    <textarea
                      id="modal-summary"
                      placeholder="Nhập ghi chú hoặc tóm tắt ngắn cho bài viết (sapo)..."
                      value={formSummary}
                      onChange={(e) => setFormSummary(e.target.value)}
                      className="modal-textarea"
                      style={{ minHeight: "80px", resize: "vertical", fontFamily: "inherit" }}
                      disabled={isSaving}
                    />
                  </div>

                  {/* Category */}
                  <div className="modal-field">
                    <label htmlFor="modal-category">Danh mục bài viết</label>
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

                  {/* Content (Có chèn ảnh và chữ) */}
                  <div className="modal-field modal-field--full" style={{ gridColumn: "1 / -1", minHeight: "350px", display: "flex", flexDirection: "column" }}>
                    <label htmlFor="modal-content">Nội dung chi tiết (Có chèn ảnh và chữ) <span className="required">*</span></label>
                    <small style={{ display: "block", color: "#64748b", fontSize: "0.85rem", marginTop: "-0.25rem", marginBottom: "0.6rem" }}>
                      <i className="ri-information-line" style={{ color: "#2e7d32", marginRight: "4px" }}></i>
                      Soạn thảo nội dung và nhấn vào biểu tượng <strong>🖼️ (Ảnh)</strong> trên thanh công cụ hoặc <strong>dán (Ctrl+V)</strong> để chèn ảnh.
                    </small>
                    <ReactQuill
                      ref={modalQuillRef}
                      theme="snow"
                      value={formContent}
                      onChange={setFormContent}
                      modules={modalQuillModules}
                      formats={quillFormats}
                      readOnly={isSaving}
                      placeholder="Nhập nội dung bài viết, có thể chèn ảnh, định dạng tiêu đề, danh sách..."
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
