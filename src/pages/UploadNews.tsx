import React, { useState, useRef, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../utils/supabase/client";
import { useAuth } from "../context/AuthContext";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { cleanContent, buildContentWithSummary } from "../utils/cleanContent";
import { quillModules, quillFormats } from "../utils/quillConfig";
import { buildImageUrlWithPosition } from "../utils/imageUtils";

interface AlertState {
  type: "success" | "error" | null;
  message: string;
}

export default function UploadNews() {
  const { user, profile, loading: authLoading } = useAuth();
  
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("Kỹ thuật");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePosX, setImagePosX] = useState(50);
  const [imagePosY, setImagePosY] = useState(50);
  
  // File upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Drag to pan states
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState>({ type: null, message: "" });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const quillRef = useRef<any>(null);

  // Custom image handler: upload to Supabase storage or insert base64
  const handleImageUpload = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files ? input.files[0] : null;
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        setAlert({
          type: "error",
          message: "Kích thước ảnh chèn vào bài viết quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB."
        });
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

        const editor = quillRef.current?.getEditor();
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
        const editor = quillRef.current?.getEditor();
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

  const modules = useMemo(() => ({
    toolbar: {
      container: quillModules.toolbar,
      handlers: {
        image: handleImageUpload,
      },
    },
  }), [handleImageUpload]);

  if (authLoading) {
    return (
      <section className="upload-news">
        <div className="news-list__loading">
          <div className="spinner"></div>
          <p>Đang kiểm tra quyền truy cập...</p>
        </div>
      </section>
    );
  }

  if (!user || profile?.role !== "SA") {
    return (
      <section className="ac-mgmt" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div className="ac-mgmt__unauthorized" data-aos="fade-up">
          <i className="ri-shield-keyhole-line"></i>
          <h2>Truy Cập Bị Từ Chối</h2>
          <p>Trang này chỉ dành riêng cho tài khoản Super Admin (SA) để viết bài. Vui lòng đăng nhập với tài khoản có thẩm quyền hoặc quay lại trang chủ.</p>
          <Link to="/" className="btn">
            <i className="ri-home-4-line"></i>
            Quay về Trang chủ
          </Link>
        </div>
      </section>
    );
  }

  const categories = [
    "Kỹ thuật",
    "Tin tức",
    "Thị trường",
    "Thời tiết",
    "Sinh học",
    "Bền vững"
  ];

  // Handle image file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Limit file size to 5MB
      if (file.size > 5 * 1024 * 1024) {
        setAlert({
          type: "error",
          message: "Kích thước ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB."
        });
        return;
      }
      
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      // Clear manual image URL when local file is chosen
      setImageUrl("");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        if (file.size > 5 * 1024 * 1024) {
          setAlert({
            type: "error",
            message: "Kích thước ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB."
          });
          return;
        }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setImageUrl("");
      } else {
        setAlert({
          type: "error",
          message: "Định dạng file không hợp lệ. Vui lòng chọn một file ảnh."
        });
      }
    }
  };

  const removeSelectedImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImageFile(null);
    setImagePreview(null);
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
    
    setImagePosX(prev => Math.max(0, Math.min(100, prev - (deltaX * 0.3))));
    setImagePosY(prev => Math.max(0, Math.min(100, prev - (deltaY * 0.3))));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (!title.trim()) {
      setAlert({ type: "error", message: "Vui lòng nhập tiêu đề bài viết." });
      return;
    }
    if (!content.trim() || content.replace(/<[^>]*>/g, '').trim() === '') {
      setAlert({ type: "error", message: "Vui lòng nhập nội dung bài viết." });
      return;
    }

    setIsLoading(true);
    setAlert({ type: null, message: "" });

    try {
      let finalImageUrl = imageUrl.trim();

      // 1. Upload local file if selected
      if (imageFile) {
        // Generate a unique filename: timestamp + sanitized original name
        const cleanFileName = imageFile.name.replace(/[^\w.-]/g, "_");
        const fileName = `${Date.now()}-${cleanFileName}`;

        const { error: uploadError } = await supabase.storage
          .from("news-images")
          .upload(fileName, imageFile, {
            cacheControl: "3600",
            upsert: false
          });

        if (uploadError) {
          console.error("Storage upload error details:", uploadError);
          throw new Error(
            `Không thể tải ảnh lên Storage: ${uploadError.message}. Hãy chắc chắn rằng bạn đã tạo bucket 'news-images' ở chế độ Public trong Supabase.`
          );
        }

        // Get public URL
        const { data } = supabase.storage.from("news-images").getPublicUrl(fileName);
        finalImageUrl = data.publicUrl;
      }

      // Append position to the URL
      const finalImageUrlWithPos = finalImageUrl ? buildImageUrlWithPosition(finalImageUrl, imagePosX, imagePosY) : null;
      const finalContent = buildContentWithSummary(summary, content);

      // 2. Insert post metadata to database
      const { error: insertError } = await supabase.from("news").insert([
        {
          title: cleanContent(title.trim()),
          content: finalContent,
          author: "EaAgri",
          category,
          image_url: finalImageUrlWithPos
        }
      ]);

      if (insertError) {
        console.error("Database insert error details:", insertError);
        throw new Error(`Lưu bài viết thất bại: ${insertError.message}`);
      }

      // Success Reset
      setAlert({
        type: "success",
        message: "Chúc mừng! Bài viết của bạn đã được đăng thành công lên hệ thống."
      });
      setTitle("");
      setSummary("");
      setCategory("Kỹ thuật");
      setContent("");
      setImageUrl("");
      setImageFile(null);
      setImagePreview(null);
      setImagePosX(50);
      setImagePosY(50);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: any) {
      setAlert({
        type: "error",
        message: err.message || "Đã xảy ra lỗi không xác định."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="upload-news">
      <div className="upload-news__container">
        
        {/* Back Link */}
        <Link to="/" className="upload-news__back">
          <i className="ri-arrow-left-line"></i>
          Quay lại Trang chủ
        </Link>

        {/* Header Title */}
        <div className="upload-news__header" data-aos="fade-up">
          <h1>Đăng Bài Viết Mới</h1>
          <p>Chia sẻ kiến thức, tin tức nông nghiệp và dự báo thị trường cho bà con nông dân EaAgri</p>
        </div>

        {/* Form Container */}
        <div className="upload-news__card" data-aos="fade-up" data-aos-delay="100">
          
          {/* Status Alert */}
          {alert.type && (
            <div style={{ marginBottom: "2rem" }}>
              <div className={`upload-news__alert upload-news__alert--${alert.type}`}>
                <i className={alert.type === "success" ? "ri-checkbox-circle-line" : "ri-error-warning-line"}></i>
                <span>{alert.message}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="upload-news__form">
            
            {/* Top Grid: Media Upload (Left) & Basic Information (Right) */}
            <div className="upload-news__top-grid">
              
              {/* Left Column: Media Upload */}
              <div className="upload-news__media-section">
                <span className="upload-news__upload-label">Ảnh bìa đại diện bài viết</span>
                
                <div 
                  className={`upload-news__dropzone ${imagePreview ? "upload-news__dropzone--has-file" : ""}`}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => !imagePreview && fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                  
                  {imagePreview ? (
                    <div className="upload-news__preview-wrapper">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="upload-news__preview" 
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        draggable={false}
                        style={{ objectPosition: `${imagePosX}% ${imagePosY}%`, width: '100%', height: '240px', objectFit: 'cover', borderRadius: '12px', cursor: isDragging ? 'grabbing' : 'grab' }} 
                      />
                      <button type="button" className="upload-news__remove-file" onClick={removeSelectedImage} title="Xóa ảnh">
                        <i className="ri-close-line"></i>
                      </button>
                    </div>
                  ) : (
                    <>
                      <i className="ri-image-add-line"></i>
                      <span>Kéo thả ảnh vào đây hoặc nhấp để chọn</span>
                      <small>Chấp nhận định dạng JPG, PNG, WEBP (Tối đa 5MB)</small>
                    </>
                  )}
                </div>

                {/* Image Position Sliders */}
                {imagePreview && (
                  <div className="upload-news__position-box">
                    <label className="upload-news__position-title">Căn chỉnh vị trí ảnh bìa</label>
                    
                    <div className="upload-news__slider-row">
                      <div className="upload-news__slider-header">
                        <span>Ngang (Trái ↔ Phải)</span>
                        <strong>{imagePosX}%</strong>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={imagePosX} 
                        onChange={(e) => setImagePosX(parseInt(e.target.value))}
                        className="upload-news__range"
                      />
                    </div>

                    <div className="upload-news__slider-row">
                      <div className="upload-news__slider-header">
                        <span>Dọc (Lên ↕ Xuống)</span>
                        <strong>{imagePosY}%</strong>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={imagePosY} 
                        onChange={(e) => setImagePosY(parseInt(e.target.value))}
                        className="upload-news__range"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Title, Summary, Category */}
              <div className="upload-news__fields-section">
                
                {/* Title */}
                <div className="upload-news__group">
                  <label htmlFor="title">Tiêu đề bài viết <span style={{ color: "#c62828" }}>*</span></label>
                  <input
                    type="text"
                    id="title"
                    placeholder="Nhập tiêu đề chính bài viết..."
                    className="upload-news__input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                {/* Ghi chú / Tóm tắt */}
                <div className="upload-news__group">
                  <label htmlFor="summary">Ghi chú / Tóm tắt bài viết</label>
                  <textarea
                    id="summary"
                    placeholder="Nhập ghi chú tóm tắt, trích dẫn ngắn cho bài viết (sapo)..."
                    className="upload-news__input upload-news__textarea"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                  />
                </div>

                {/* Category */}
                <div className="upload-news__group">
                  <label htmlFor="category">Danh mục bài viết</label>
                  <select
                    id="category"
                    className="upload-news__select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

            </div>

            {/* Bottom Section: Full-width Rich Text Editor */}
            <div className="upload-news__editor-section">
              <div className="upload-news__editor-header">
                <label htmlFor="content" className="upload-news__editor-label">
                  Nội dung chi tiết (Có chèn ảnh và chữ) <span style={{ color: "#c62828" }}>*</span>
                </label>
                <span className="upload-news__editor-tip">
                  <i className="ri-information-line"></i>
                  Nhấn biểu tượng <strong>🖼️</strong> trên thanh công cụ hoặc dán <strong>(Ctrl+V)</strong> để chèn ảnh
                </span>
              </div>
              
              <div className="upload-news__quill-wrapper">
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  modules={modules}
                  formats={quillFormats}
                  placeholder="Viết nội dung bài chia sẻ của bạn vào đây (chèn ảnh, định dạng tiêu đề, danh sách...)..."
                />
              </div>
            </div>

            {/* Bottom Section: Clean Actions Bar */}
            <div className="upload-news__actions-bar">
              <Link to="/tintuc" className="upload-news__btn-cancel">
                <i className="ri-arrow-left-line"></i>
                <span>Hủy bỏ</span>
              </Link>

              <button 
                type="submit" 
                className="upload-news__btn-submit" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="upload-news__spinner"></div>
                    <span>Đang lưu bài viết...</span>
                  </>
                ) : (
                  <>
                    <i className="ri-send-plane-fill"></i>
                    <span>Đăng bài viết</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </div>
      </div>
    </section>
  );
}