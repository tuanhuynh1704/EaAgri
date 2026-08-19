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
