<div align="center">

  <img src="public/logo_v1.jpg" alt="EaAgri Logo" width="130" style="border-radius: 50%; box-shadow: 0 8px 28px rgba(46,125,50,0.35); margin-bottom: 12px;" />

  # 🌾 EaAgri — Digital Smart Farming Platform
  ### *Modern Angular 19 • TypeScript • RxJS • Three.js 3D • SCSS Modular Design System*

  <p align="center">
    <strong>Nền tảng Nông nghiệp Số Toàn diện kết hợp AI & IoT — Hồ sơ Dự án Chuẩn mực ứng tuyển vị trí Angular / Frontend Developer Intern.</strong>
  </p>

  <p align="center">
    <a href="https://www.eaagri.vn/"><img src="https://img.shields.io/badge/Live_Demo-eaagri.vn-2e7d32?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Live Demo" /></a>
    <a href="https://github.com/TuansHuynh/EaAgri"><img src="https://img.shields.io/badge/Source_Code-GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" /></a>
    <a href="https://play.google.com/store/apps/details?id=com.eaagri.app"><img src="https://img.shields.io/badge/Mobile_App-Google_Play-414141?style=for-the-badge&logo=googleplay&logoColor=white" alt="Google Play" /></a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Angular-19.0-DD0031?style=flat-square&logo=angular&logoColor=white" alt="Angular 19" />
    <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/RxJS-7.8-B7178C?style=flat-square&logo=reactivex&logoColor=white" alt="RxJS" />
    <img src="https://img.shields.io/badge/SCSS-Modular_BEM-CC6699?style=flat-square&logo=sass&logoColor=white" alt="Sass / SCSS" />
    <img src="https://img.shields.io/badge/Three.js-3D_Graphics-000000?style=flat-square&logo=threedotjs&logoColor=white" alt="Three.js" />
    <img src="https://img.shields.io/badge/Supabase-Backend_&_Storage-3ECF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/Award-NTTU_Startup_2026_Champion-FFD700?style=flat-square&logo=trophy&logoColor=black" alt="Champion NTTU Startup 2026" />
  </p>

</div>

---

## 🎯 Mục Tiêu Tài Liệu & Góc Nhìn Tuyển Dụng (Angular Frontend Intern Portfolio)

Dự án **EaAgri Web Platform** được thiết kế và xây dựng theo chuẩn kiến trúc doanh nghiệp hiện đại với **Angular 19 Standalone Components**, **Signals Reactive State**, **RxJS Streams** và **SCSS Design System**. 

Tài liệu này được biên soạn chuyên biệt nhằm chứng minh toàn diện năng lực của ứng viên cho vị trí **Frontend Intern / Angular Developer**:
1. **Tư duy Kiến trúc Angular:** Nắm vững Standalone Components, Signal State, Dependency Injection, Services, Functional Route Guards và Reactive Programming.
2. **Kỹ năng UI/UX & Đồ họa 3D:** Xây dựng hệ thống Design System chuẩn BEM, hiệu ứng Glassmorphism, tích hợp Three.js Canvas 3D vào Angular Lifecycle và Mascot State Machine tương tác.
3. **Quản lý Dữ liệu & BaaS:** Xử lý luồng dữ liệu bất đồng bộ RxJS, phân quyền RBAC, tích hợp Supabase Auth / PostgreSQL / Storage.
4. **Tối ưu Hiệu Năng & SEO:** Chiến lược `OnPush ChangeDetection`, Control Flow mới (`@if`, `@for`, `@defer`), Dynamic Meta Tags & Schema JSON-LD.

---

## 🏆 Thành Tựu & Giải Thưởng (Awards & Honors)

* 🥇 **Quán quân Bảng 1C** (*Công nghệ Nông nghiệp & Công nghệ Thực phẩm*) — **NTTU Innovation Startup Challenge 2026**.
* 🌟 Dự án xuất sắc đại diện cho chuyển đổi nông nghiệp số vùng Tây Nguyên với nền tảng Web & Mobile kết nối trạm IoT thực tế.

---

## 💻 Tech Stack & Kỹ Thuật Angular Chuyên Sâu

### 1. Angular Core & Reactive Ecosystem
* **Framework:** [Angular 19](https://angular.dev/) (Standalone Architecture, New Control Flow `@if` / `@for` / `@defer`, Signals Reactive Model `signal()`, `computed()`, `effect()`).
* **Language & Compiler:** [TypeScript 5.9](https://www.typescriptlang.org/) (Strict Type Checking, Decorators, Generics).
* **State & Asynchronous Stream:** [RxJS](https://rxjs.dev/) (BehaviorSubject, Observables, Operators `switchMap`, `debounceTime`, `catchError`, `tap` cho Chatbot & Telemetry Stream).
* **Routing & Guards:** Angular Router (Lazy Loading Modules, Functional Route Guards `canActivateFn` bảo vệ trang Admin, Dynamic Route Params).
* **Dependency Injection (DI):** Tách biệt tầng logic và hiển thị qua Angular Services (`AuthService`, `NewsService`, `CooperationService`, `ChatbotService`).

### 2. Graphics, Styling & Animations
* **3D Visuals:** [Three.js](https://threejs.org/) (Tích hợp Canvas 3D mượt mà vào vòng đời Angular qua `ElementRef`, `ngAfterViewInit` và dọn dẹp memory trong `ngOnDestroy`).
* **Styles & Architecture:** 
  * **Sass / SCSS Modular (Kiến trúc 7-1 + BEM Naming):** Tách biệt `abstracts`, `base`, `components`, `pages`.
  * **Design Tokens & Glassmorphism:** CSS Custom Variables, hiệu ứng mờ viền kính `backdrop-filter: blur(16px)`.
* **Animations:** [AOS (Animate On Scroll)](https://michalsnik.github.io/aos/), [ScrollReveal](https://scrollrevealjs.org/), Angular Animation Triggers & Custom Keyframes.
* **Icons:** [Remix Icon](https://remixicon.com/).

### 3. Rich Content & AI Multimodal
* **WYSIWYG Editor:** `ngx-quill` / Custom Quill wrapper cho trình soạn thảo bài viết quản trị.
* **Markdown Rendering:** `ngx-markdown` / Markdown Parser render câu trả lời AI streaming.
* **Voice UX:** **Web Speech API** (Speech Recognition & Speech Synthesis) cho trợ lý nông nghiệp ảo.
* **Backend as a Service (BaaS):** `@supabase/supabase-js` (Auth, Database Realtime, Storage Buckets).

---

## 🎨 Thiết Kế Giao Diện UI/UX & Hệ Thống Design System

### 1. Bảng Màu Thương Hiệu (Design Tokens & Color Palette)
* 🌿 **Primary Green (`#2e7d32`, `#1b5e20`):** Đại diện cho nông nghiệp thông minh, công nghệ sinh học và phát triển bền vững.
* 🌾 **Harvest Gold (`#f59e0b`, `#d97706`):** Tượng trưng cho mùa vụ bội thu, giá trị kinh tế và giải thưởng danh giá.
* 💧 **Cyber Tech Teal / Blue (`#0284c7`, `#0f766e`):** Lớp trạm quan trắc IoT vi khí hậu và van tưới tự động 3 lớp.
* 🌑 **Deep Slate Dark (`#0f172a`, `#1e293b`):** Nền tảng hiển thị đồ họa hạt 3D và giao diện bảng điều khiển Admin.
* 🪟 **Glassmorphism Layer:** `rgba(255, 255, 255, 0.85)` kết hợp `backdrop-filter: blur(16px)` và border viền mảnh tinh tế.

### 2. Kiến Trúc SCSS Modular (Clean & Maintainable Styles)
```text
src/styles/
├── abstracts/               # Biến màu, mixins responsive, keyframe animations
│   ├── _variables.scss     # Design tokens (Colors, Shadows, Typography, Breakpoints)
│   ├── _mixins.scss        # Flex/Grid helpers, Media queries, Glassmorphism mixin
│   └── _animations.scss    # Pulse, Float, Shimmer, Radar scan, Wave keyframes
├── base/                   # Thiết lập cơ bản toàn trang
│   ├── _reset.scss         # CSS Reset chuẩn hiện đại
│   ├── _typography.scss    # Font Inter / System font hierarchy & headings
│   ├── _global.scss        # Scrollbar custom, Container, Badge & Button base styles
│   └── _mobile.scss        # Breakpoints & tinh chỉnh riêng cho Mobile / Tablet
└── components/             # SCSS cấu hình BEM cho từng Standalone Component
    ├── _navbar.scss        ├── _durian-scanner.scss   ├── _floating-mascot.scss
    ├── _hero.scss          ├── _awards.scss           ├── _ai-chat.scss
    ├── _problem-solution.scss ├── _manage-news.scss   ├── _manage-cooperation.scss
    └── ...
```

---

## 📱 Chi Tiết Toàn Bộ Giao Diện & Chức Năng Của Ứng Dụng

### I. Trang Chủ & Trải Nghiệm Landing Page (`/`)

#### 1. Màn Chào Đón Thương Hiệu (Splash Intro Component)
* **Giao diện:** Màn hình intro toàn cảnh với logo phát sáng lượn sóng, khẩu hiệu chuyển đổi số nông nghiệp và thanh tiến trình (Loading progress bar) chuyển động mượt mà.
* **Chức năng:** Tự động hoàn tất sau 1.8s hoặc hỗ trợ nút "Bỏ qua", lưu trạng thái vào `sessionStorage` để không hiển thị lại trong cùng phiên duyệt web.

#### 2. Thanh Điều Hướng Thông Minh (Glassmorphic Navbar Component)
* **Giao diện:** Navigation bar dạng kính mờ (Sticky Glassmorphism Navbar), tự động thay đổi độ trong suốt khi cuộn trang, chỉ báo Active Link trực quan.
* **Chức năng:**
  * Menu điều hướng nhanh: Trang chủ, Kiến trúc công nghệ, Tin tức nông nghiệp, Quản trị hệ thống.
  * Nút "Tải Ứng Dụng" kích hoạt Modal cài đặt App Store / Google Play.
  * Dropdown tài khoản: Nhận diện vai trò thông qua `AuthService` (Khách, Thành viên, Quản trị viên), hiển thị avatar và thao tác Đăng xuất.
  * Mobile Drawer Menu mượt mà với hiệu ứng trượt slide-in và backdrop overlay làm mờ nền.

#### 3. Khu Vực Giới Thiệu Chính (Hero Component)
* **Giao diện:** Headline ấn tượng với hiệu ứng chữ Gradient, badge công nghệ AI Dual-Brain & IoT 3 lớp, Mockup thiết bị di động 3D nổi bật.
* **Chức năng:**
  * Nút Call-to-Action (CTA) kép: "Trải Nghiệm Nền Tảng" và "Xem Kiến Trúc Kỹ Thuật".
  * Thẻ thống kê số liệu thực địa sống động: Giảm 35% chi phí tưới tiêu, độ chính xác nhận diện bệnh >98%, kết nối 50+ hợp tác xã.

#### 4. Băng Chuyền Đối Tác (Infinite Logo Marquee Component)
* **Giao diện & Kỹ thuật:** Băng chuyền chuyển động liên tục không gián đoạn (Pure CSS Infinite Linear Animation) hiển thị các đơn vị bảo trợ, trường đại học (NTTU, Vườn ươm khởi nghiệp, Sở NN&PTNT).

#### 5. Trình Mô Phỏng Quét Bệnh Sầu Riêng Tương Tác (Interactive Durian Scanner Component)
* **Giao diện:** Trình mô phỏng quét chẩn đoán thị giác máy tính với khung ngắm bounding box, tia quét Laser Radar chuyển động quét qua lại, các điểm Hotspot tương tác phát sáng trên quả sầu riêng.
* **Chức năng & Tương tác (Xử lý bằng Angular Signals):**
  * **3 Chế độ quét chuyên sâu (Tab Switch):**
    1. *Tổng thể (Overall):* Đánh giá độ chín (85%), độ ngọt Brix (18.5° Brix), phân loại xuất khẩu Loại 1.
    2. *Cơm sầu riêng (Flesh Quality):* Kiểm tra độ dày múi (3.2cm), độ dẻo sáp, tỷ lệ hạt lép (92%).
    3. *Sâu bệnh hại (Disease Detection):* Tầm soát nấm *Phytophthora*, rệp sáp, xì mủ với độ tin cậy 99.7%.
  * **Animation Tiến Trình Quét:** Người dùng bấm "Bắt đầu Quét AI" để kích hoạt tiến trình 0% -> 100% với hiệu ứng visual radar và bảng dữ liệu chẩn đoán chi tiết tức thì.

#### 6. Vinh Danh Quán Quân Khởi Nghiệp (Awards & Honors Component)
* **Giao diện:** Không gian vinh danh đạt giải Quán quân NTTU 2026 rực rỡ với hiệu ứng ánh sáng hạt vàng kim, huy chương 3D nổi bật.
* **Chức năng:**
  * Modal xem Bằng khen & Giấy chứng nhận chất lượng cao dạng Lightbox.
  * Thẻ tương tác giới thiệu hội đồng giám khảo và thông số đánh giá dự án.

#### 7. Ma Trận Vấn Đề & Lời Giải (Problem & Solution Component)
* **Giao diện:** Thiết kế thẻ đối chiếu song song: "Tứ giác rủi ro nhà nông đối mặt" vs. "Hệ sinh thái giải pháp số EaAgri".
* **Chức năng:** Các thẻ lật tương tác, icon trực quan phân loại: Dự báo giá nông sản (LSTM), Trạm cảm biến vi khí hậu, IoT tưới 3 lớp và QR Code truy xuất nguồn gốc.

#### 8. Thư Viện Media Thực Địa (Video & Media Gallery Component)
* **Giao diện:** Lưới video trình diễn thực tế vườn sầu riêng Đắk Lắk với giao diện player tùy chỉnh, thumbnail sắc nét, badge phân loại thời lượng.
* **Chức năng:** Hỗ trợ xem trực tiếp video thử nghiệm thiết bị IoT và phỏng vấn trực tiếp nhà vườn.

#### 9. Lộ Trình Phát Triển Sản Phẩm (Interactive Roadmap Component)
* **Giao diện:** Timeline lộ trình 5 giai đoạn từ R&D, Đạt giải Khởi nghiệp, Phát hành nền tảng đến Mở rộng mạng lưới hợp tác xã.
* **Chức năng:** Điểm nút timeline phát sáng tương ứng với các cột mốc đã hoàn thành và kế hoạch tương lai.

#### 10. Đội Ngũ Phát Triển (Team Showcase Component)
* **Giao diện:** Thẻ thông tin thành viên thiết kế hiệu ứng 3D Hover Tilt, avatar bo tròn viền sáng, liên kết GitHub / LinkedIn / Portfolio cá nhân.

#### 11. Chân Trang Toàn Diện (Footer Component)
* **Giao diện & Chức năng:** Footer chuẩn SEO chứa thông tin bản quyền, sitemap liên kết nhanh, địa chỉ liên hệ, form đăng ký nhận bản tin khuyến nông và badge mạng xã hội.

---

### II. Hệ Sinh Thái Tương Tác 3D & AI Độc Đáo (Interactive 3D & AI Experience)

#### 1. Mô Hình Cây 3D Hạt Tương Tác (Three.js ParticleTree3D Component)
* **Kỹ thuật:** Khởi tạo Canvas 3D trong `ngAfterViewInit` với thư viện **Three.js**, tạo hệ thống hàng ngàn hạt ánh sáng (Particle System) mô phỏng cấu trúc cây trồng sinh học.
* **Tương tác:** Cây 3D xoay chuyển động mượt mà theo tọa độ con trỏ chuột của người dùng, giải phóng bộ nhớ sạch sẽ trong `ngOnDestroy` tránh memory leak.

#### 2. Linh Vật Chú Sầu Sầu Tinh Nghịch (Floating Interactive Mascot Component)
* **Mô hình State Machine độc đáo (Quản lý qua Angular Signals):**
  * **Trạng thái Đi dạo (Roam):** Lượn nổi bồng bềnh khắp góc màn hình với chuyển động Sin/Cos mượt mà.
  * **Trạng thái Cảm xúc (Mood Animation):** Chớp mắt, vẫy tay chào người dùng, bật nhảy tung sao lấp lánh khi được click.
  * **Cơ chế "Chạy trốn & Ló đầu" (Hide & Seek):** Sau một khoảng thời gian, bé cất lời *"Mình đi trốn đây! 🏃‍♂️💨"*, quay đầu chạy thoát ra 1 trong 4 góc màn hình; sau 15 giây ẩn mình, bé từ góc khác bất ngờ ló đầu chào *"Ú òa! Tìm thấy mình chưa? 😜"* rồi chạy lon ton vào lại màn hình.

#### 3. Trợ Lý Trí Tuệ Nhân Tạo Nông Nghiệp (AI Agri Chat Assistant Component)
* **Giao diện:** Cửa sổ chat nổi chuẩn hiện đại với hiệu ứng mở slide-up, hỗ trợ chia 2 tab: "Hỏi đáp AI" và "Câu hỏi thường gặp (FAQ)".
* **Chức năng chuyên sâu (RxJS & Signals):**
  * **Streaming / Markdown UI:** Định dạng câu trả lời AI bằng Markdown parser (in đậm, danh sách, công thức phân bón, phác đồ điều trị chuẩn VietGAP).
  * **Giao tiếp Giọng nói 2 chiều (Voice Assistant):**
    * Thu âm giọng nói người dùng bằng **Web Speech API** chuyển thành văn bản tức thì.
    * Đọc câu trả lời bằng giọng nói tiếng Việt mượt mà.
  * **Lịch sử hội thoại Supabase:** Tự động đồng bộ và lưu lịch sử chat vào Supabase Database theo từng User ID.
  * **Kiểm soát hạn mức (Rate Limiting):** Theo dõi số lượt hỏi đáp trong ngày (Daily Quota counter), nhắc nhở đăng nhập hoặc nâng cấp tài khoản khi đạt giới hạn.

#### 4. Nút Liên Hệ Đa Kênh Nổi (Floating Quick Contact Component)
* **Giao diện:** Menu liên hệ nhanh dạng Popover nổi góc phải dưới màn hình: Hotline, Chat Zalo nhanh, Messenger và Gửi phản hồi.

---

### III. Cổng Tin Tức & Quản Trị Hệ Thống Toàn Diện (News & Admin Portal)

#### 1. Cổng Thông Tin & Kỹ Thuật Canh Tác (`/tintuc`, `/tintuc/:id`)
* **Danh sách tin tức (`NewsListComponent`):**
  * Hiển thị bài viết dạng lưới Card hiện đại với hình ảnh cover, tag chuyên mục, ngày đăng và tác giả.
  * Tìm kiếm bài viết theo từ khóa và bộ lọc danh mục (Kỹ thuật canh tác, Cảnh báo dịch hại, Giá cả thị trường) kết hợp `debounceTime` từ RxJS.
  * Phân trang dữ liệu mượt mà, hỗ trợ skeleton loading khi đang tải bài viết từ Supabase.
* **Chi tiết bài viết (`NewsDetailComponent`):**
  * Lấy `paramMap` từ `ActivatedRoute`, giao diện đọc bài chuẩn báo điện tử, tối ưu Typography, hiển thị nội dung HTML/Markdown phong phú.
  * Thanh chia sẻ mạng xã hội (Facebook, Twitter, Copy Link), danh sách bài viết liên quan.

#### 2. Trình Soạn Thảo Bài Viết Đa Phương Tiện (`/tintuc/create`)
* **Trình soạn thảo WYSIWYG:** Tích hợp bộ soạn thảo đa phương tiện tùy biến thanh công cụ (Heading, Bold, Italic, Blockquote, Code block, List).
* **Upload hình ảnh lên Cloud:** Xử lý kéo thả ảnh cover, upload trực tiếp lên **Supabase Storage Bucket**, sinh URL an toàn và hiển thị preview tức thì.
* **Validation chặt chẽ:** Sử dụng Angular Reactive Forms (`FormGroup`, `Validators.required`) kiểm tra dữ liệu trước khi đăng tải.

#### 3. Bảng Quản Lý Bài Viết Admin (`/admin/tintuc`)
* **Bảng dữ liệu (Data Table Component):** Hiển thị toàn bộ bài viết với các cột: Tiêu đề, Danh mục, Tác giả, Ngày tạo, Lượt xem và Trạng thái.
* **Thao tác nhanh:** Tìm kiếm, lọc theo chuyên mục, xem trước bài viết, chỉnh sửa và xóa bài viết kèm Modal cảnh báo xác nhận.

#### 4. Quản Lý Đơn Đăng Ký Hợp Tác (`/admin/cooperation`)
* **Pipeline quản lý đối tác chuyên nghiệp:** Phân loại tiến độ xử lý hồ sơ hợp tác theo 5 trạng thái với màu sắc trực quan:
  * 🟡 *Chờ xử lý (Pending)*
  * 🔵 *Đã liên hệ (Contacted)*
  * 🟣 *Đang đàm phán (Negotiating)*
  * 🟢 *Đã chốt hợp tác (Partnered)*
  * ⚫ *Tạm dừng / Hủy (Cancelled)*
* **Tính năng:** Tìm kiếm họ tên/SĐT, lọc theo loại đối tác (Hộ nông dân, Hợp tác xã, Doanh nghiệp bao tiêu), xem chi tiết nội dung trao đổi và cập nhật ghi chú nội bộ trực tiếp.

#### 5. Quản Lý Tài Khoản & Phân Quyền (`/admin/accounts`)
* **Role-Based Access Control (RBAC):** Quản lý danh sách thành viên với các quyền: `Super Admin`, `Editor`, `User`.
* **Bảo mật:** Giao diện điều chỉnh quyền tài khoản, khóa/mở tài khoản, bảo vệ route bằng Functional Route Guards `canActivateFn`.

---

### IV. Hệ Thống Xác Thực & Trang Bổ Trợ (Auth & Support Pages)

* **Trang Đăng Nhập & Đăng Ký (`/login`, `/register`):**
  * Form input thiết kế Floating Label hiện đại bằng Angular Reactive Forms, toggle ẩn/hiện mật khẩu, validation định dạng email & độ mạnh mật khẩu.
  * Tích hợp `AuthService` xử lý đăng nhập Supabase, ghi nhớ phiên làm việc, tự động chuyển hướng trang theo vai trò.
* **Chính Sách Bảo Mật (`/privacy`):**
  * Trình bày văn bản pháp lý, cam kết bảo mật dữ liệu nông hộ và cảm biến IoT theo tiêu chuẩn.
  * Mục lục điều hướng nhanh (Table of Contents) cuộn mượt mà đến từng điều khoản.
* **Trang Kiến Trúc Hệ Thống (`/architecture`):**
  * Phân tích chuyên sâu 4 lớp công nghệ: Lớp cảm biến IoT vi khí hậu, Lớp AI Dual-Brain, Lớp RAG & Vector Database và Lớp Ứng dụng Web/Mobile.
* **Modal Thông Báo Ứng Dụng Di Động (`AppStoreNoticeModalComponent`):**
  * Popup thông báo hướng dẫn cài đặt file APK / Google Play Store cho người dùng di động khi truy cập link tải app.

---

## 📂 Cấu Trúc Mã Nguồn Angular (Source Code Architecture)

```text
EaAgri-Angular/
├── public/                      # Static assets, Logo, Favicon, SEO manifests
│   ├── Amination/               # Frame spritesheet cho chuyển động Mascot
│   ├── assets/                  # Ảnh minh họa giải thưởng, đội ngũ, mockup
│   ├── logo_v1.jpg              # Logo chính thức của EaAgri
│   ├── manifest.json            # Web App Manifest PWA
│   ├── robots.txt               # Hướng dẫn thu thập dữ liệu công cụ tìm kiếm
│   └── sitemap.xml              # Sơ đồ website chuẩn SEO
├── src/
│   ├── app/
│   │   ├── core/                # Core Services & Interceptors (Singleton)
│   │   │   ├── guards/          # Functional Route Guards (auth.guard.ts, admin.guard.ts)
│   │   │   ├── interceptors/    # HTTP Interceptors (Token injection & error handler)
│   │   │   └── services/        # Supabase, Auth, Chatbot, SEO, Storage Services
│   │   ├── shared/              # Reusable UI Components, Pipes, Directives
│   │   │   ├── components/      # Navbar, Footer, Modal, Mascot, AI Chat, 3D Tree
│   │   │   ├── directives/      # ClickOutside, Tilt3D, AutoFocus Directives
│   │   │   └── pipes/           # DateFormat, SafeHtml, TruncateText Pipes
│   │   ├── features/            # Feature Modules / Standalone Views
│   │   │   ├── home/            # HomePage & Landing Sections (Hero, Scanner, Awards, Team)
│   │   │   ├── news/            # NewsList, NewsDetail, UploadNews
│   │   │   ├── admin/           # ManageNews, ManageCooperation, AccountManagement
│   │   │   ├── auth/            # LoginComponent, RegisterComponent
│   │   │   └── legal/           # PrivacyPolicy, ArchitecturePage
│   │   ├── app.routes.ts        # Định tuyến Router với Lazy Loading Standalone Components
│   │   ├── app.config.ts        # Cấu hình Application Config (provideRouter, provideHttpClient)
│   │   └── app.component.ts     # Root Component tích hợp AOS & Global Navigation
│   ├── styles/                  # Hệ thống SCSS tổ chức theo BEM & Kiến trúc Modular 7-1
│   ├── index.html               # HTML template tối ưu SEO & JSON-LD Structured Data
│   └── main.ts                  # Bootstrap Application Entry Point
├── angular.json                 # Cấu hình Angular CLI Workspace & Build Targets
├── tsconfig.json                # Cấu hình TypeScript Strict Mode
└── package.json                 # Khai báo Dependencies (@angular/core, rxjs, three, supabase)
```

---

## ⚡ Điểm Sáng Kỹ Thuật Dành Cho Ứng Tuyển Angular Frontend Intern

Khi đánh giá dự án này, nhà tuyển dụng và Tech Lead có thể thấy rõ các năng lực lập trình Angular & Frontend vững chắc:

| Năng lực / Kỹ năng | Cách triển khai thực tế trong EaAgri Angular |
| :--- | :--- |
| **Modern Angular Architecture** | Xây dựng 100% bằng **Standalone Components**, áp dụng **Signals (`signal`, `computed`)** và **Control Flow mới (`@if`, `@for`, `@defer`)** giúp code gãy gọn và hiệu năng cao. |
| **Reactive Programming (RxJS)** | Xử lý dữ liệu bất đồng bộ với Observables, Subjects, áp dụng các toán tử `debounceTime`, `distinctUntilChanged`, `switchMap` cho thanh tìm kiếm và luồng AI Chat. |
| **Dependency Injection & Clean Services** | Thiết kế tầng Services (`AuthService`, `NewsService`, `ChatService`) riêng biệt, quản lý API Supabase và business logic độc lập với giao diện. |
| **Routing & Functional Guards** | Triển khai Lazy Loading giúp giảm kích thước Initial Bundle, bảo vệ trang Quản trị bằng Functional Route Guards `canActivateFn` dựa trên quyền hạn Supabase. |
| **Graphics & 3D Web (Three.js)** | Tích hợp Three.js Canvas 3D vào Angular Lifecycle (`ngAfterViewInit`), tối ưu hóa Render Loop `requestAnimationFrame` và hủy subscription trong `ngOnDestroy`. |
| **Form Management & Validation** | Sử dụng **Reactive Forms (`FormBuilder`, `FormGroup`, `Validators`)** cho Login, Register, Soạn bài viết và Quản lý đối tác với kiểm tra lỗi tức thì. |
| **SCSS & BEM Architecture** | Cấu trúc SCSS 7-1, tận dụng CSS Custom Variables quản lý Design Tokens và Responsive Mixins cho toàn bộ màn hình từ Mobile đến Desktop. |
| **Voice & AI Multimodal** | Tích hợp **Web Speech API** cho nhận diện giọng nói và đọc bài viết, định dạng Markdown realtime cho trợ lý ảo. |

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án Cục Bộ (Getting Started)

### 1. Yêu cầu môi trường
* **Node.js**: Phiên bản 18.x hoặc cao hơn
* **Angular CLI**: Phiên bản 18.x / 19.x (`npm install -g @angular/cli`)

### 2. Các bước khởi chạy
```bash
# 1. Clone mã nguồn từ GitHub
git clone https://github.com/TuansHuynh/EaAgri.git
cd EaAgri

# 2. Cài đặt các gói phụ thuộc (Dependencies)
npm install

# 3. Cấu hình biến môi trường trong src/environments/environment.ts:
# export const environment = {
#   production: false,
#   supabaseUrl: 'https://your-project.supabase.co',
#   supabaseKey: 'your_supabase_anon_key',
#   chatbotApiUrl: 'your_chatbot_api_gateway'
# };

# 4. Khởi chạy Angular Development Server
ng serve
```
👉 Mở trình duyệt và truy cập: `http://localhost:4200/`

### 3. Lệnh Build Kiểm Tra & Triển Khai
```bash
# Đóng gói Production Bundle tối ưu hóa
ng build --configuration production

# Kiểm tra Linter chuẩn mã nguồn
npm run lint
```

---

## 👥 Thông Tin Dự Án & Tác Giả (Project & Author Information)

* 🌐 **Website Dự Án:** [https://www.eaagri.vn/](https://www.eaagri.vn/)
* 🐙 **GitHub Repository:** [TuansHuynh/EaAgri](https://github.com/TuansHuynh/EaAgri)
* 📧 **Email Liên Hệ:** [eaagri@eaagri.id.vn](mailto:eaagri@eaagri.id.vn)
* 🏛️ **Đơn vị phát triển:** Nhóm sinh viên Khoa Công nghệ Thông tin — Trường Đại học Nguyễn Tất Thành.

---

<div align="center">
  <p>Made with ❤️ and high-performance Angular Engineering for Vietnamese Farmers.</p>
  <p>© 2026 <strong>EaAgri Platform</strong>. All rights reserved.</p>
</div>
