export const MAX_IMAGE_SIZE_MB = 15;
export const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const sanitizeFileName = (fileName: string, prefix = ""): string => {
  const dotIndex = fileName.lastIndexOf(".");
  const ext = dotIndex !== -1 ? fileName.slice(dotIndex).toLowerCase() : ".jpg";
  const nameWithoutExt = dotIndex !== -1 ? fileName.slice(0, dotIndex) : fileName;

  // Normalize Vietnamese diacritics to clean ASCII
  const normalized = nameWithoutExt
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");

  const safeName = normalized
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 40);

  const basePrefix = prefix ? `${prefix}-` : "";
  return `${basePrefix}${Date.now()}-${safeName || "image"}${ext}`;
};

export const parseImageUrlAndPosition = (rawUrl: string | null) => {
  if (!rawUrl) return { url: null, posX: 50, posY: 50 };
  
  const parts = rawUrl.split('#pos=');
  if (parts.length > 1) {
    const coords = parts[1].split(',');
    return {
      url: parts[0],
      posX: !isNaN(parseInt(coords[0])) ? parseInt(coords[0]) : 50,
      posY: !isNaN(parseInt(coords[1])) ? parseInt(coords[1]) : 50,
    };
  }
  
  return { url: rawUrl, posX: 50, posY: 50 };
};

export const buildImageUrlWithPosition = (url: string, posX: number, posY: number) => {
  if (!url) return url;
  // Remove existing pos if any
  const cleanUrl = url.split('#pos=')[0];
  return `${cleanUrl}#pos=${posX},${posY}`;
};

