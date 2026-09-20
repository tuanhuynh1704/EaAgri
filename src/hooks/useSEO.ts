import { useEffect } from "react";

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  canonicalUrl?: string;
  noindex?: boolean;
  structuredData?: Record<string, any> | Array<Record<string, any>>;
}

const DEFAULT_TITLE = "Ea Agri - Nông nghiệp Thông Minh | Trợ lý AI & IoT";
const DEFAULT_DESCRIPTION =
  "Hệ sinh thái nông nghiệp thông minh EaAgri ứng dụng AI, IoT và dữ liệu thời gian thực giúp tối ưu hóa chi phí, chẩn đoán sâu bệnh và nâng cao năng suất sầu riêng.";
const DEFAULT_KEYWORDS =
  "EaAgri, Ea Agri, nông nghiệp thông minh, AI nông nghiệp, sầu riêng, cảm biến IoT, VietGAP, Đắk Lắk, sâu bệnh sầu riêng, tưới thông minh";
const DEFAULT_IMAGE = "https://www.eaagri.vn/logo_v1.jpg";
const BASE_URL = "https://www.eaagri.vn";

function updateMetaTag(attrName: string, attrVal: string, content: string) {
  let element = document.querySelector(`meta[${attrName}="${attrVal}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attrName, attrVal);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function updateCanonical(url: string) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", url);
}

export function useSEO({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  ogType = "website",
  canonicalUrl,
  noindex = false,
  structuredData,
}: SEOProps) {
  useEffect(() => {
    const finalTitle = title ? `${title} | EaAgri` : DEFAULT_TITLE;
    const finalDescription = description || DEFAULT_DESCRIPTION;
    const finalKeywords = keywords || DEFAULT_KEYWORDS;
    const finalImage = ogImage || DEFAULT_IMAGE;
    const finalUrl = ogUrl || canonicalUrl || (typeof window !== "undefined" ? window.location.href : BASE_URL);

    // 1. Title
    document.title = finalTitle;

    // 2. Standard Meta
    updateMetaTag("name", "description", finalDescription);
    updateMetaTag("name", "keywords", finalKeywords);
    updateMetaTag(
      "name",
      "robots",
      noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
    );

    // 3. Open Graph
    updateMetaTag("property", "og:title", ogTitle || finalTitle);
    updateMetaTag("property", "og:description", ogDescription || finalDescription);
    updateMetaTag("property", "og:image", finalImage);
    updateMetaTag("property", "og:url", finalUrl);
    updateMetaTag("property", "og:type", ogType);
    updateMetaTag("property", "og:site_name", "EaAgri");
    updateMetaTag("property", "og:locale", "vi_VN");

    // 4. Twitter Card
    updateMetaTag("name", "twitter:card", "summary_large_image");
    updateMetaTag("name", "twitter:title", ogTitle || finalTitle);
    updateMetaTag("name", "twitter:description", ogDescription || finalDescription);
    updateMetaTag("name", "twitter:image", finalImage);

    // 5. Canonical link
    updateCanonical(canonicalUrl || finalUrl);

    // 6. Dynamic JSON-LD Structured Data
    const SCRIPT_ID = "dynamic-page-schema";
    let scriptTag = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

    if (structuredData) {
      if (!scriptTag) {
        scriptTag = document.createElement("script");
        scriptTag.id = SCRIPT_ID;
        scriptTag.type = "application/ld+json";
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(structuredData);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    return () => {
      // Cleanup dynamic page schema when unmounting if needed
      const schema = document.getElementById(SCRIPT_ID);
      if (schema) schema.remove();
    };
  }, [
    title,
    description,
    keywords,
    ogTitle,
    ogDescription,
    ogImage,
    ogUrl,
    ogType,
    canonicalUrl,
    noindex,
    structuredData,
  ]);
}
