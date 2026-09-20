import React, { useState, useMemo } from "react";
import { cleanContent } from "../utils/cleanContent";

export interface SEOAnalyzerProps {
  title: string;
  content: string;
  category: string;
  imageUrl?: string | null;
  focusKeyword: string;
  onFocusKeywordChange: (keyword: string) => void;
  customTitle: string;
  onCustomTitleChange: (title: string) => void;
  customDescription: string;
  onCustomDescriptionChange: (desc: string) => void;
}

// Map categories to curated smart keyword suggestions
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Kỹ thuật": [
    "kỹ thuật chăm sóc sầu riêng",
    "phòng trừ nấm phytophthora",
    "tưới nước tiết kiệm sầu riêng",
    "quy trình bón phân nuôi trái",
    "xử lý sầu riêng ra hoa nghịch vụ",
  ],
  "Tin tức": [
    "tin tức nông nghiệp tây nguyên",
    "xuất khẩu sầu riêng đắk lắk",
    "chuyển đổi số nông nghiệp 4.0",
    "ứng dụng AI trong nông nghiệp",
  ],
  "Thị trường": [
    "giá sầu riêng hôm nay",
    "giá sầu riêng dona đắk lắk",
    "thị trường xuất khẩu nông sản",
    "dự báo giá sầu riêng",
    "giá sầu riêng ri6",
  ],
  "Thời tiết": [
    "dự báo thời tiết đắk lắk",
    "cảnh báo mưa bão nông nghiệp",
    "thời tiết và sâu bệnh sầu riêng",
    "độ ẩm đất mùa khô",
  ],
  "Sinh học": [
    "chế phẩm vi sinh trichoderma",
    "phòng trừ sinh học bệnh cây trồng",
    "cải tạo đất hữu cơ vi sinh",
    "nông nghiệp tuần hoàn",
  ],
  "Bền vững": [
    "canh tác sầu riêng vietgap",
    "mã số vùng trồng sầu riêng",
    "nông nghiệp thông minh bền vững",
    "truy xuất nguồn gốc nông sản",
  ],
};

function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(cleanContent(html || ""), "text/html");
  return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
}

export const SEOAnalyzer: React.FC<SEOAnalyzerProps> = ({
  title,
  content,
  category,
  imageUrl,
  focusKeyword,
  onFocusKeywordChange,
  customTitle,
  onCustomTitleChange,
  customDescription,
  onCustomDescriptionChange,
}) => {
  const [activePreviewTab, setActivePreviewTab] = useState<"desktop" | "mobile" | "social">("desktop");
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);

  const plainContent = useMemo(() => stripHtml(content), [content]);
  const wordCount = useMemo(() => {
    if (!plainContent) return 0;
    return plainContent.split(/\s+/).filter(Boolean).length;
  }, [plainContent]);

  // Derive final effective SEO title and meta description
  const effectiveTitle = customTitle.trim() || title.trim() || "Tiêu đề bài viết EaAgri";
  const autoSnippet = useMemo(() => {
    return plainContent.slice(0, 160).trim();
  }, [plainContent]);
  const effectiveDescription = customDescription.trim() || autoSnippet || "Khám phá kiến thức, kỹ thuật và tin tức nông nghiệp thông minh mới nhất từ Hệ sinh thái EaAgri.";

  // Generate a URL slug for preview
  const previewSlug = useMemo(() => {
    const slugBase = (title || "bai-viet-moi")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return slugBase || "bai-viet-moi";
  }, [title]);

  // Smart suggestions for keywords based on category
  const suggestedKeywords = CATEGORY_KEYWORDS[category] || CATEGORY_KEYWORDS["Kỹ thuật"];

  // Compute SEO Checklist & Score
  const analysis = useMemo(() => {
    const kw = focusKeyword.trim().toLowerCase();
    const titleLower = effectiveTitle.toLowerCase();
    const descLower = effectiveDescription.toLowerCase();

    const checks = [];

    // 1. Focus Keyword Provided
    const hasKeyword = kw.length > 0;
    checks.push({
      id: "keyword_set",
      title: "Từ khóa chính mục tiêu",
      status: hasKeyword ? "pass" : "warning",
      points: hasKeyword ? 10 : 0,
      maxPoints: 10,
      msg: hasKeyword
        ? `Đã thiết lập từ khóa: "${focusKeyword}"`
        : "Chưa nhập từ khóa chính để đo độ chuẩn SEO.",
    });

    // 2. Keyword in Title
    const inTitle = hasKeyword && titleLower.includes(kw);
    checks.push({
      id: "kw_in_title",
      title: "Từ khóa trong Tiêu đề",
      status: inTitle ? "pass" : hasKeyword ? "fail" : "warning",
      points: inTitle ? 15 : 0,
      maxPoints: 15,
      msg: inTitle
        ? "Tiêu đề đã chứa từ khóa chính."
        : "Tiêu đề bài viết chưa xuất hiện từ khóa mục tiêu.",
    });

    // 3. Title Length
    const titleLen = effectiveTitle.length;
    const isTitleGood = titleLen >= 40 && titleLen <= 70;
    checks.push({
      id: "title_length",
      title: `Độ dài tiêu đề (${titleLen} ký tự)`,
      status: isTitleGood ? "pass" : titleLen > 0 ? "warning" : "fail",
      points: isTitleGood ? 15 : titleLen > 20 ? 8 : 0,
      maxPoints: 15,
      msg: isTitleGood
        ? "Độ dài tiêu đề đạt chuẩn Google (40 - 70 ký tự)."
        : titleLen < 40
        ? `Tiêu đề hơi ngắn (${titleLen}/40 ký tự tối thiểu). Nên bổ sung thêm ngữ cảnh.`
        : `Tiêu đề quá dài (${titleLen}/70 ký tự). Có thể bị Google cắt bớt bằng dấu '...'.`,
    });

    // 4. Keyword in Meta Description
    const inDesc = hasKeyword && descLower.includes(kw);
    checks.push({
      id: "kw_in_desc",
      title: "Từ khóa trong Thẻ mô tả (Meta Description)",
      status: inDesc ? "pass" : hasKeyword ? "fail" : "warning",
      points: inDesc ? 15 : 0,
      maxPoints: 15,
      msg: inDesc
        ? "Thẻ mô tả đã chứa từ khóa chính."
        : "Nên đưa từ khóa chính vào thẻ mô tả để tăng tỷ lệ nhấp (CTR).",
    });

    // 5. Meta Description Length
    const descLen = effectiveDescription.length;
    const isDescGood = descLen >= 120 && descLen <= 165;
    checks.push({
      id: "desc_length",
      title: `Độ dài thẻ mô tả (${descLen} ký tự)`,
      status: isDescGood ? "pass" : descLen > 50 ? "warning" : "fail",
      points: isDescGood ? 15 : descLen > 50 ? 8 : 0,
      maxPoints: 15,
      msg: isDescGood
        ? "Độ dài thẻ mô tả lý tưởng (120 - 165 ký tự)."
        : descLen < 120
        ? `Thẻ mô tả hơi ngắn (${descLen}/120 ký tự). Nên viết chi tiết tóm tắt bài viết.`
        : `Thẻ mô tả vượt quá 165 ký tự (${descLen} ký tự). Google sẽ cắt ngắn khi hiển thị.`,
    });

    // 6. Content Word Count
    const isContentLong = wordCount >= 600;
    const isContentOk = wordCount >= 300;
    checks.push({
      id: "word_count",
      title: `Độ dài nội dung (${wordCount} từ)`,
      status: isContentLong ? "pass" : isContentOk ? "warning" : "fail",
      points: isContentLong ? 15 : isContentOk ? 10 : wordCount > 50 ? 5 : 0,
      maxPoints: 15,
      msg: isContentLong
        ? `Nội dung sâu sắc và đầy đủ (${wordCount} từ). Rất tốt cho SEO!`
        : isContentOk
        ? `Nội dung đạt mức cơ bản (${wordCount} từ). Khuyến nghị > 600 từ để xếp hạng cao hơn.`
        : `Nội dung còn quá ngắn (${wordCount}/300 từ tối thiểu).`,
    });

    // 7. Keyword Density in Content
    let keywordCount = 0;
    if (hasKeyword && plainContent) {
      const regex = new RegExp(kw.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"), "gi");
      const matches = plainContent.match(regex);
      keywordCount = matches ? matches.length : 0;
    }
    const density = wordCount > 0 ? ((keywordCount * kw.split(" ").length) / wordCount) * 100 : 0;
    const isDensityGood = density >= 0.8 && density <= 3.5;
    checks.push({
      id: "kw_density",
      title: `Mật độ từ khóa (${keywordCount} lần - ${density.toFixed(1)}%)`,
      status: !hasKeyword ? "warning" : isDensityGood ? "pass" : keywordCount > 0 ? "warning" : "fail",
      points: isDensityGood ? 10 : keywordCount > 0 ? 5 : 0,
      maxPoints: 10,
      msg: !hasKeyword
        ? "Hãy nhập từ khóa để đo mật độ lặp lại."
        : isDensityGood
        ? `Mật độ từ khóa đạt chuẩn (${density.toFixed(1)}%). Phân bố tự nhiên.`
        : keywordCount === 0
        ? "Từ khóa chính chưa xuất hiện lần nào trong bài viết."
        : `Mật độ từ khóa ${density > 3.5 ? "quá dày (nhồi nhét từ khóa)" : "hơi thấp"}. Khuyến nghị 1% - 3%.`,
    });

    // 8. Cover Image Check
    const hasImage = Boolean(imageUrl && imageUrl.trim().length > 0);
    checks.push({
      id: "image_cover",
      title: "Ảnh đại diện & Đa phương tiện",
      status: hasImage ? "pass" : "warning",
      points: hasImage ? 5 : 0,
      maxPoints: 5,
      msg: hasImage
        ? "Đã có ảnh bìa bài viết, tối ưu hiển thị rich snippet và mạng xã hội."
        : "Chưa có ảnh bìa. Bài viết có ảnh sẽ thu hút lượng xem cao hơn 94%.",
    });

    // Calculate total score
    const totalEarned = checks.reduce((sum, c) => sum + c.points, 0);
    const score = Math.min(100, Math.round(totalEarned));

    return {
      score,
      checks,
      keywordCount,
      density,
    };
  }, [
    focusKeyword,
    effectiveTitle,
    effectiveDescription,
    plainContent,
    wordCount,
    imageUrl,
  ]);

  // Score Badge Color & Evaluation
  const getScoreInfo = (score: number) => {
    if (score >= 80) {
      return {
        level: "Tối ưu xuất sắc",
        colorClass: "seo-score--excellent",
        barColor: "#2e7d32",
        icon: "ri-checkbox-circle-fill",
      };
    }
    if (score >= 55) {
      return {
        level: "Đạt chuẩn cơ bản",
        colorClass: "seo-score--good",
        barColor: "#f57c00",
        icon: "ri-error-warning-fill",
      };
    }
    return {
      level: "Cần cải thiện",
      colorClass: "seo-score--poor",
      barColor: "#d32f2f",
      icon: "ri-alert-fill",
    };
  };

  const scoreInfo = getScoreInfo(analysis.score);

  // Auto extract snippet button handler
  const handleAutoExtractSnippet = (e: React.MouseEvent) => {
    e.preventDefault();
    if (plainContent) {
      const snippet = plainContent.slice(0, 155).trim() + "...";
      onCustomDescriptionChange(snippet);
    }
  };

  return (
    <div className="seo-analyzer" data-aos="fade-up">
      {/* Header Bar */}
      <div 
        className="seo-analyzer__header"
        onClick={() => setIsAccordionOpen((prev) => !prev)}
      >
        <div className="seo-analyzer__title-area">
          <div className="seo-analyzer__badge">
            <i className="ri-search-eye-line"></i>
            <span>Trợ Lý & Đo Điểm SEO</span>
          </div>
          <span className="seo-analyzer__subtitle">
            Tối ưu hóa tiêu đề, thẻ meta & thứ hạng tìm kiếm Google
          </span>
        </div>

        <div className="seo-analyzer__score-pill-wrap">
          <div className={`seo-analyzer__score-pill ${scoreInfo.colorClass}`}>
            <i className={scoreInfo.icon}></i>
            <span>{analysis.score} / 100</span>
            <small>({scoreInfo.level})</small>
          </div>
          <button 
            type="button" 
            className="seo-analyzer__toggle-btn"
            aria-label="Toggle SEO panel"
          >
            <i className={isAccordionOpen ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}></i>
          </button>
        </div>
      </div>

      {isAccordionOpen && (
        <div className="seo-analyzer__body">
          {/* Top Row: Focus Keyword Input & Suggested Chips */}
          <div className="seo-analyzer__section">
            <div className="seo-analyzer__field-group">
              <div className="seo-analyzer__label-row">
                <label htmlFor="seo-focus-kw">
                  <i className="ri-key-2-line"></i>
                  <strong>Từ khóa chính mục tiêu (Focus Keyword)</strong>
                </label>
                <span className="seo-analyzer__help-hint">
                  Từ khóa bà con nông dân thường tìm kiếm
                </span>
              </div>
              <input
                id="seo-focus-kw"
                type="text"
                placeholder="Ví dụ: kỹ thuật sầu riêng, giá sầu riêng hôm nay, phytophthora..."
                className="seo-analyzer__input"
                value={focusKeyword}
                onChange={(e) => onFocusKeywordChange(e.target.value)}
              />
            </div>

            {/* Keyword Suggestions */}
            <div className="seo-analyzer__suggestions">
              <span className="seo-analyzer__suggestions-label">
                <i className="ri-sparkling-fill"></i> Gợi ý từ khóa cho danh mục <strong>{category}</strong>:
              </span>
              <div className="seo-analyzer__chip-list">
                {suggestedKeywords.map((kw) => (
                  <button
                    key={kw}
                    type="button"
                    className={`seo-analyzer__chip ${focusKeyword.toLowerCase() === kw.toLowerCase() ? "seo-analyzer__chip--active" : ""}`}
                    onClick={() => onFocusKeywordChange(kw)}
                  >
                    + {kw}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid Layout: Left is Meta Customizer & Preview, Right is Audit Checklist */}
          <div className="seo-analyzer__grid">
            {/* Left Column: Meta Customization & Previews */}
            <div className="seo-analyzer__left-col">
              
              {/* Custom Meta Title & Description Inputs */}
              <div className="seo-analyzer__meta-form">
                <div className="seo-analyzer__field-group">
                  <div className="seo-analyzer__label-row">
                    <label htmlFor="seo-custom-title">
                      <strong>Tiêu đề SEO tùy chỉnh</strong> (Title Tag)
                    </label>
                    <span className={`seo-analyzer__char-count ${effectiveTitle.length > 70 ? "text-danger" : ""}`}>
                      {effectiveTitle.length} / 70 ký tự
                    </span>
                  </div>
                  <input
                    id="seo-custom-title"
                    type="text"
                    placeholder="Mặc định lấy tiêu đề bài viết..."
                    className="seo-analyzer__input"
                    value={customTitle}
                    onChange={(e) => onCustomTitleChange(e.target.value)}
                  />
                </div>

                <div className="seo-analyzer__field-group">
                  <div className="seo-analyzer__label-row">
                    <label htmlFor="seo-custom-desc">
                      <strong>Thẻ mô tả SEO</strong> (Meta Description)
                    </label>
                    <div className="seo-analyzer__actions-row">
                      <button
                        type="button"
                        className="seo-analyzer__btn-text"
                        onClick={handleAutoExtractSnippet}
                        title="Trích xuất tự động từ nội dung bài viết"
                      >
                        <i className="ri-magic-line"></i> Trích xuất từ bài viết
                      </button>
                      <span className={`seo-analyzer__char-count ${effectiveDescription.length > 165 ? "text-danger" : ""}`}>
                        {effectiveDescription.length} / 165 ký tự
                      </span>
                    </div>
                  </div>
                  <textarea
                    id="seo-custom-desc"
                    rows={3}
                    placeholder="Nhập 120-160 ký tự mô tả tóm tắt lôi cuốn để thu hút người đọc trên Google..."
                    className="seo-analyzer__textarea"
                    value={customDescription}
                    onChange={(e) => onCustomDescriptionChange(e.target.value)}
                  />
                </div>
              </div>

              {/* Live Preview Tabs */}
              <div className="seo-analyzer__preview-card">
                <div className="seo-analyzer__preview-tabs">
                  <span className="seo-analyzer__preview-title">
                    <i className="ri-eye-line"></i> Xem trước hiển thị:
                  </span>
                  <div className="seo-analyzer__tab-btns">
                    <button
                      type="button"
                      className={`seo-analyzer__tab-btn ${activePreviewTab === "desktop" ? "active" : ""}`}
                      onClick={() => setActivePreviewTab("desktop")}
                    >
                      <i className="ri-computer-line"></i> Google Desktop
                    </button>
                    <button
                      type="button"
                      className={`seo-analyzer__tab-btn ${activePreviewTab === "mobile" ? "active" : ""}`}
                      onClick={() => setActivePreviewTab("mobile")}
                    >
                      <i className="ri-smartphone-line"></i> Google Mobile
                    </button>
                    <button
                      type="button"
                      className={`seo-analyzer__tab-btn ${activePreviewTab === "social" ? "active" : ""}`}
                      onClick={() => setActivePreviewTab("social")}
                    >
                      <i className="ri-facebook-circle-line"></i> Facebook / Zalo
                    </button>
                  </div>
                </div>

                <div className="seo-analyzer__preview-display">
                  {/* Google Desktop Preview */}
                  {activePreviewTab === "desktop" && (
                    <div className="google-preview google-preview--desktop">
                      <div className="google-preview__cite">
                        <div className="google-preview__favicon">
                          <img src="/favicon.png" alt="EaAgri" />
                        </div>
                        <div className="google-preview__url-wrap">
                          <span className="google-preview__site-name">EaAgri - Nông nghiệp Thông Minh</span>
                          <span className="google-preview__url">https://www.eaagri.vn › tintuc › {previewSlug}</span>
                        </div>
                      </div>
                      <h4 className="google-preview__title">
                        {effectiveTitle} | EaAgri
                      </h4>
                      <p className="google-preview__snippet">
                        {effectiveDescription}
                      </p>
                    </div>
                  )}

                  {/* Google Mobile Preview */}
                  {activePreviewTab === "mobile" && (
                    <div className="google-preview google-preview--mobile">
                      <div className="google-preview__cite">
                        <div className="google-preview__favicon">
                          <img src="/favicon.png" alt="EaAgri" />
                        </div>
                        <div className="google-preview__url-wrap">
                          <span className="google-preview__site-name">EaAgri</span>
                          <span className="google-preview__url">eaagri.vn › tintuc › {previewSlug}</span>
                        </div>
                      </div>
                      <h4 className="google-preview__title">
                        {effectiveTitle}
                      </h4>
                      <p className="google-preview__snippet">
                        {effectiveDescription}
                      </p>
                    </div>
                  )}

                  {/* Social Share Preview (Facebook / Zalo) */}
                  {activePreviewTab === "social" && (
                    <div className="social-preview">
                      <div className="social-preview__image-box">
                        {imageUrl ? (
                          <img src={imageUrl} alt={effectiveTitle} className="social-preview__img" />
                        ) : (
                          <div className="social-preview__placeholder">
                            <i className="ri-image-line"></i>
                            <span>Chưa chọn ảnh đại diện</span>
                          </div>
                        )}
                      </div>
                      <div className="social-preview__content">
                        <span className="social-preview__domain">EAAGRI.VN</span>
                        <h4 className="social-preview__title">{effectiveTitle}</h4>
                        <p className="social-preview__desc">{effectiveDescription}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: SEO Audit Checklist & Progress */}
            <div className="seo-analyzer__right-col">
              <div className="seo-audit">
                <div className="seo-audit__top">
                  <div className="seo-audit__score-circle">
                    <svg viewBox="0 0 36 36" className="circular-chart">
                      <path
                        className="circle-bg"
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="circle"
                        strokeDasharray={`${analysis.score}, 100`}
                        stroke={scoreInfo.barColor}
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <text x="18" y="20.35" className="percentage">
                        {analysis.score}
                      </text>
                    </svg>
                  </div>
                  <div className="seo-audit__summary">
                    <span className="seo-audit__rating-title">Điểm chuẩn SEO</span>
                    <h3 style={{ color: scoreInfo.barColor }}>{scoreInfo.level}</h3>
                    <p>
                      {analysis.score >= 80
                        ? "Bài viết đã được tối ưu hóa xuất sắc để đạt thứ hạng cao trên Google."
                        : analysis.score >= 50
                        ? "Bài viết khá tốt, hãy hoàn thiện thêm các tiêu chí màu vàng/đỏ bên dưới."
                        : "Vui lòng bổ sung từ khóa, tiêu đề và nội dung để đạt chuẩn tìm kiếm."}
                    </p>
                  </div>
                </div>

                {/* Audit Items List */}
                <div className="seo-audit__list">
                  <span className="seo-audit__list-heading">
                    <i className="ri-list-check-2"></i> Chi tiết các tiêu chuẩn SEO on-page:
                  </span>
                  
                  {analysis.checks.map((item) => (
                    <div
                      key={item.id}
                      className={`seo-audit__item seo-audit__item--${item.status}`}
                    >
                      <div className="seo-audit__item-icon">
                        {item.status === "pass" && <i className="ri-checkbox-circle-fill"></i>}
                        {item.status === "warning" && <i className="ri-error-warning-fill"></i>}
                        {item.status === "fail" && <i className="ri-close-circle-fill"></i>}
                      </div>
                      <div className="seo-audit__item-body">
                        <div className="seo-audit__item-header">
                          <strong>{item.title}</strong>
                          <span className="seo-audit__item-pts">
                            +{item.points}/{item.maxPoints}đ
                          </span>
                        </div>
                        <p>{item.msg}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
