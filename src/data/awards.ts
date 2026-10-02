import { NTTU_VOTE_CONFIG } from "./voteConfig";
export { NTTU_VOTE_CONFIG };

/** Vietnamese, unaccented base path (SEO-friendly, no %-encoding when shared) */
export const AWARDS_PATH = "/giai-thuong";
export const awardPath = (id: string) => `${AWARDS_PATH}/${id}`;

export interface GalleryImage {
  url: string;
  title: string;
  caption: string;
}

export interface AwardDetail {
  /** URL slug: Vietnamese keywords without diacritics */
  id: string;
  /** Previous English slug under /awards, kept so old shared links redirect */
  legacyId?: string;
  category: "ai" | "startup";
  year: string;
  trophyIcon: string;
  badgeText: string;
  /** Short label shown on the grid card */
  shortBadge: string;
  title: string;
  organizer: string;
  /** Short organizer label shown in the grid card footer */
  shortOrganizer: string;
  description: string;
  keyPoints: {
    icon: string;
    title: string;
    desc: string;
  }[];
  images: GalleryImage[];
  metrics: {
    label: string;
    value: string;
    icon: string;
  }[];
  /** Custom object-position for square thumbnails (e.g. "center 60%" for portrait photos) */
  thumbnailPosition?: string;
  /** Optional contest milestones shown as a "Hành trình" timeline */
  timeline?: {
    date: string;
    title: string;
    desc?: string;
    upcoming?: boolean;
    /** Compact label for the grid card chip, e.g. "Chung kết · 31/10" */
    short?: string;
    /** ISO dates (YYYY-MM-DD) used for the upcoming-event countdown */
    startDate?: string;
    endDate?: string;
    location?: string;
  }[];
  verificationUrl?: string;
  facebookUrl?: string;
  voteUrl?: string;
}

export const AWARDS_LIST: AwardDetail[] = [
  {
    id: "quan-quan-tri-tue-nhan-tao-2026",
    legacyId: "ai-champion-2026",
    category: "ai",
    year: "2026",
    trophyIcon: "ri-vip-crown-fill",
    badgeText: "QUÁN QUÂN TOÀN TRƯỜNG • EXCELLENT NO. 1",
    shortBadge: "Quán quân",
    title: "Cuộc Thi Trí Tuệ Nhân Tạo 2026",
    organizer: "Khoa Công Nghệ Thông Tin — Trường Đại học Nguyễn Tất Thành",
    shortOrganizer: "Khoa CNTT · ĐH Nguyễn Tất Thành",
    description:
      'Vượt qua hàng chục đề tài công nghệ AI chuyên sâu, dự án EaAgri đã xuất sắc giành ngôi vị Quán quân cao nhất nhờ mô hình "Trợ lý nông nghiệp thông minh" tích hợp mạng nơ-ron nhận diện sâu bệnh và hệ thống khuyến nông tự động.',
    keyPoints: [
      {
        icon: "ri-cpu-line",
        title: "Lõi AI Tự Huấn Luyện & Nhận Diện Đa Tầng",
        desc: "Ứng dụng mô hình thị giác máy tính YOLOv9 kết hợp phân tích tương quan vi khí hậu, phát hiện sớm bệnh xì mủ, thán thư với độ chính xác trên 92%.",
      },
      {
        icon: "ri-shield-star-line",
        title: "Đánh Giá Xuất Sắc Từ Hội Đồng Khoa Học",
        desc: "Hệ thống được các chuyên gia đầu ngành đánh giá là giải pháp thực chứng có tính khả thi cao nhất nhằm hóa giải rủi ro thời tiết và dịch bệnh tại vùng sầu riêng Tây Nguyên.",
      },
      {
        icon: "ri-seedling-line",
        title: "Bệ Phóng Chuyển Đổi Số Nông Nghiệp",
        desc: "Giải thưởng là động lực mạnh mẽ để nhóm kỹ sư tiếp tục hoàn thiện, chuẩn hóa quy trình VietGAP số hóa, đồng hành lâu dài cùng bà con nông dân.",
      },
    ],
    images: [
      {
        url: "/assets/IMG_2695-crop.webp",
        title: "Giấy Chứng Nhận & Cúp Vinh Danh Quán Quân",
        caption: "Bằng khen Quán quân cuộc thi Trí Tuệ Nhân Tạo 2026 cùng cúp vinh danh trao tặng cho dự án EaAgri.",
      },
    ],
    metrics: [
      { icon: "ri-trophy-fill", label: "Thứ hạng", value: "Quán Quân (No. 1)" },
      { icon: "ri-cpu-fill", label: "Độ chính xác AI", value: "> 92%" },
      { icon: "ri-leaf-fill", label: "Hạng mục", value: "AI Nông Nghiệp" },
    ],
  },
  {
    id: "nhat-bang-1c-nttu-startup-challenge-2026",
    legacyId: "nttu-startup-2026",
    category: "startup",
    year: "2026",
    trophyIcon: "ri-rocket-2-fill",
    badgeText: "GIẢI NHẤT BẢNG 1C • BÁN KẾT TOÀN QUỐC",
    shortBadge: "Giải Nhất Bảng 1C",
    title: "NTTU Innovation Startup Challenge 2026",
    organizer: "Trung tâm Đổi mới Sáng tạo & Ươm tạo Doanh nghiệp NIIC — ĐH Nguyễn Tất Thành",
    shortOrganizer: "NIIC · ĐH Nguyễn Tất Thành",
    description:
      "Dự án EaAgri (Mã dự thi NTT-144) xuất sắc dẫn đầu Bảng 1C (Công nghệ Nông nghiệp & Công nghệ Thực phẩm), giành tấm vé danh giá tiến thẳng vào Vòng Chung Kết toàn quốc.",
    keyPoints: [
      {
        icon: "ri-funds-line",
        title: "Tiềm Năng Thương Mại Hóa & Thị Trường Thực Địa",
        desc: "Mô hình kinh doanh khả thi, giải pháp đo đạc độ ẩm đất đa tầng và dự báo sâu bệnh được các quỹ đầu tư mạo hiểm và giám khảo doanh nghiệp đánh giá rất cao.",
      },
      {
        icon: "ri-user-star-line",
        title: "Báo Cáo Thuyết Phục Trước Hội Đồng Giám Khảo",
        desc: "Đội ngũ sáng lập đã trình diễn thiết bị cảm biến IoT thực tế kết hợp ứng dụng di động EaAgri, nhận được phản hồi tích cực về tính tiện dụng cho người nông dân.",
      },
      {
        icon: "ri-medal-fill",
        title: "Tiến Thẳng Chung Kết & Ươm Tạo Doanh Nghiệp",
        desc: "Thành tích Bán kết mở ra cơ hội kết nối cố vấn chuyên gia quốc tế, bảo trợ pháp lý và tài trợ ươm tạo mở rộng quy mô hợp tác xã tại Đắk Lắk.",
      },
    ],
    images: [
      {
        url: "/Khởi nghiệp 3.webp",
        title: "Bằng Khen Giải Nhất Bảng 1C & Huy Chương",
        caption: "Giấy chứng nhận Giải Nhất Bảng 1C cùng Huy chương danh dự từ Ban Tổ Chức NTTU Innovation Startup 2026.",
      },
      {
        url: "/Khởi nghiệp 1.webp",
        title: "Trình Báo Cáo Hội Đồng Ban Giám Khảo",
        caption: "Đội ngũ kỹ sư EaAgri thuyết minh mô hình trạm quan trắc IoT và giải thuật AI tại bàn triển lãm vòng Bán kết.",
      },
      {
        url: "/Khởi nghiệp 2.webp",
        title: "Đội Ngũ Sáng Lập EaAgri",
        caption: "Các thành viên nòng cốt của dự án EaAgri trong ngày vinh danh chiến thắng vòng Bán kết.",
      },
    ],
    metrics: [
      { icon: "ri-medal-fill", label: "Bảng đấu", value: "Nhất Bảng 1C" },
      { icon: "ri-flag-fill", label: "Vòng thi", value: "Tiến Chung Kết" },
      { icon: "ri-barcode-line", label: "Mã dự thi", value: "NTT-144" },
    ],
    verificationUrl:
      "https://cntt.ntt.edu.vn/nghien-cuu-khoa-hoc/phat-trien-san-pham/ea-agri-xuat-sac-gianh-giai-nhat-vong-ban-ket-nttu-innovation-startup-challenge-2026-bang-cong-nghe-nong-nghiep-va-cong-nghe-thuc-pham/",
    facebookUrl: "https://www.facebook.com/share/p/1CA44S7p5M/",
    voteUrl: NTTU_VOTE_CONFIG.url,
  },
  {
    id: "chung-ket-khoi-nghiep-xanh-2026",
    legacyId: "khoi-nghiep-xanh-2026",
    category: "startup",
    year: "2026",
    trophyIcon: "ri-plant-fill",
    badgeText: "VÀO CHUNG KẾT • BẢNG A",
    shortBadge: "Vào Chung kết",
    title: "Khởi Nghiệp Xanh Lần 12 – 2026",
    thumbnailPosition: "center 60%",
    organizer: "Chương trình Khởi nghiệp xanh — Trung tâm Nghiên cứu Kinh doanh & Hỗ trợ Doanh nghiệp (BSA)",
    shortOrganizer: "Khởi nghiệp xanh · BSA",
    description:
      'Dự án "EaAgri – Hệ sinh thái Nông nghiệp thông minh" thi đấu tại Bảng A, Vòng Bán kết 03 khu vực phía Nam và được Ban tổ chức chọn vào Vòng Chung kết cuộc thi Khởi Nghiệp Xanh lần 12.',
    keyPoints: [
      {
        icon: "ri-flag-line",
        title: "Vượt qua Vòng Bán kết 03 – Khu vực phía Nam",
        desc: "Vòng Bán kết diễn ra ngày 19–20/09/2026 tại Trường Đại học Khoa học Xã hội và Nhân văn – ĐHQG TP.HCM; EaAgri thi đấu tại Bảng A và giành vé vào Chung kết.",
      },
      {
        icon: "ri-store-2-line",
        title: "Gian hàng trưng bày EaAgri",
        desc: "Đội giới thiệu ứng dụng trợ lý cây sầu riêng tới khách tham quan qua tờ rơi, mã QR tải ứng dụng và bảng nhận diện “Nông nghiệp thông minh”.",
      },
      {
        icon: "ri-award-line",
        title: "Chứng nhận từ Ban tổ chức",
        desc: "Dự án nhận Giấy chứng nhận được xét chọn thi Vòng Bán kết (Bảng A) và Giấy chứng nhận Vào Chung kết cuộc thi Khởi Nghiệp Xanh lần 12 – 2026.",
      },
    ],
    images: [
      {
        url: "/assets/khoi-nghiep-xanh/chung-nhan-vao-chung-ket.webp",
        title: "Chứng Nhận Vào Chung Kết",
        caption: "Đại diện đội EaAgri nhận Giấy chứng nhận Vào Chung kết cuộc thi Khởi Nghiệp Xanh lần 12.",
      },
      {
        url: "/assets/khoi-nghiep-xanh/doi-thi-ban-ket.webp",
        title: "Đội EaAgri tại Vòng Bán kết 03",
        caption: "Các thành viên EaAgri tại sân khấu Vòng Bán kết 03 – Khu vực phía Nam, cuộc thi Khởi Nghiệp Xanh lần 12 – 2026.",
      },
      {
        url: "/assets/khoi-nghiep-xanh/vinh-danh-san-khau.webp",
        title: "Vinh Danh Trên Sân Khấu",
        caption: "Các đội vào Chung kết nhận chứng nhận trên sân khấu Vòng Bán kết 03 tại ĐH KHXH&NV – ĐHQG TP.HCM.",
      },
      {
        url: "/assets/khoi-nghiep-xanh/chung-nhan-ban-ket.webp",
        title: "Chứng Nhận Thi Vòng Bán Kết – Bảng A",
        caption: "Giấy chứng nhận dự án EaAgri – Hệ sinh thái Nông nghiệp thông minh được xét chọn thi Vòng Bán kết, Bảng A.",
      },
      {
        url: "/assets/khoi-nghiep-xanh/gian-hang-eaagri.webp",
        title: "Gian Hàng Trưng Bày EaAgri",
        caption: "Tờ rơi giới thiệu ứng dụng EaAgri, mã QR tải app và bảng nhận diện tại gian hàng của đội.",
      },
    ],
    metrics: [
      { icon: "ri-flag-fill", label: "Vòng thi", value: "Vào Chung kết" },
      { icon: "ri-medal-fill", label: "Bảng đấu", value: "Bảng A" },
      { icon: "ri-map-pin-2-fill", label: "Bán kết", value: "Khu vực phía Nam" },
    ],
    timeline: [
      {
        date: "15/08/2026",
        title: "Được xét chọn thi Vòng Bán kết",
        desc: "Ban tổ chức cấp Giấy chứng nhận dự án được xét chọn thi Vòng Bán kết – Bảng A.",
      },
      {
        date: "19–20/09/2026",
        title: "Thi Bán kết 03 & giành vé Chung kết",
        desc: "Thi đấu tại Trường ĐH KHXH&NV – ĐHQG TP.HCM, nhận chứng nhận Vào Chung kết.",
      },
      {
        date: "31/10 – 01/11/2026 · Sắp diễn ra",
        title: "Vòng Chung kết",
        desc: "Diễn ra trong 2 ngày tại Dinh Độc Lập, TP.HCM.",
        upcoming: true,
        short: "Chung kết · 31/10",
        startDate: "2026-10-31",
        endDate: "2026-11-01",
        location: "Dinh Độc Lập, TP.HCM",
      },
    ],
  },
];

export const getAwardById = (id: string | undefined) =>
  AWARDS_LIST.find((a) => a.id === id);

export const getAwardByLegacyId = (id: string | undefined) =>
  AWARDS_LIST.find((a) => a.legacyId === id);
