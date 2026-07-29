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
