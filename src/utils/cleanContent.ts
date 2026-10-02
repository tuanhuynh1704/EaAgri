/**
 * Utility function to clean news article content and titles, preventing display formatting errors
 * such as broken words across lines, non-breaking spaces preventing natural word wrap, etc.
 */
export const cleanContent = (content?: string | null): string => {
  if (!content) return "";

  // 1. Replace all non-breaking spaces (&nbsp;, &#160;, \u00A0) with standard breaking spaces (" ").
  // This prevents browsers from treating entire paragraphs or word groups as single unbreakable tokens,
  // which forces arbitrary mid-word line breaks when word-break / overflow-wrap applies.
  let cleaned = content.replace(/&nbsp;|&#160;|\u00A0/gi, " ");

  // 2. Remove zero-width spaces or soft hyphens that cause unexpected word splitting
  cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF\u00AD]/g, "");

  return cleaned;
};

/**
 * Tách ghi chú/tóm tắt và phần thân nội dung của bài viết
 */
export const extractSummaryAndBody = (rawContent?: string | null): { summary: string; body: string } => {
  if (!rawContent) return { summary: "", body: "" };

  const match = rawContent.match(/<div class="news-article-lead-box"[^>]*>([\s\S]*?)<\/div>/i);
  if (match) {
    const summaryText = match[1]
      .replace(/<[^>]+>/g, " ")
      .replace(/Ghi chú:\s*/i, "")
      .replace(/\s+/g, " ")
      .trim();
    const bodyContent = rawContent.replace(match[0], "").trim();
    return {
      summary: summaryText,
      body: bodyContent,
    };
  }

  return {
    summary: "",
    body: rawContent,
  };
};

/**
 * Ghép ghi chú/tóm tắt vào nội dung để lưu trữ nhất quán
 */
export const buildContentWithSummary = (summary?: string | null, body?: string | null): string => {
  const cleanBody = cleanContent(body || "").trim();
  const cleanSummary = (summary || "").trim();

  if (!cleanSummary) return cleanBody;

  return `<div class="news-article-lead-box" data-summary="true"><strong>Ghi chú:</strong> ${cleanSummary}</div>\n${cleanBody}`;
};

