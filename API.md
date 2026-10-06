# 🌾 EaAgri — Tài Liệu Đặc Tả Toàn Bộ Hệ Thống API (API Specification Document)

> **Dự án:** Hệ Sinh Thái Nông Nghiệp Thông Minh EaAgri (Digital Farming System)  
> **Phiên bản tài liệu:** 1.0.0  
> **Ngày cập nhật:** 2026-09-13  
> **Đơn vị phát triển:** EaAgri Team — Trường Đại học Nguyễn Tất Thành  

---

## 📑 Mục Lục
1. [Tổng Quan & Cấu Hình Môi Trường](#1-tổng-quan--cấu-hình-môi-trường)
   - [1.1 Base URLs](#11-base-urls)
   - [1.2 Biến môi trường Frontend](#12-biến-môi-trường-frontend-envlocal)
   - [1.3 Headers chuẩn](#13-headers-chuẩn)
   - [1.4 🚀 Bảng Tổng Hợp API Test Nhanh Không Cần Token (No-Auth / Public APIs)](#14--bảng-tổng-hợp-api-test-nhanh-không-cần-token-no-auth--public-apis)
   - [1.5 📮 Danh Sách Toàn Bộ API GET Chạy Trên POSTMAN Không Cần Token](#15--danh-sách-toàn-bộ-api-get-chạy-trên-postman-không-cần-token)
2. [Xác Thực & Quản Trị Người Dùng (Authentication & Profiles)](#2-xác-thực--quản-trị-người-dùng-authentication--profiles)
3. [Quản Lý Tin Tức & Tri Thức Nông Nghiệp (News & Articles)](#3-quản-lý-tin-tức--tri-thức-nông-nghiệp-news--articles)
4. [Lưu Trữ Tệp Tin & Hình Ảnh (Storage Service)](#4-lưu-trữ-tệp-tin--hình-ảnh-storage-service)
5. [AI Chatbot & RAG Tri Thức VietGAP (Dual-Brain Gateway)](#5-ai-chatbot--rag-tri-thức-vietgap-dual-brain-gateway)
6. [Thị Giác Máy Tính & Chẩn Đoán Bệnh Cây Trồng (AI Computer Vision - YOLOv9)](#6-thị-giác-máy-tính--chẩn-đoán-bệnh-cây-trồng-ai-computer-vision---yolov9)
7. [IoT & Trạm Tưới Thông Minh 3 Lớp (Smart Irrigation & Sensors)](#7-iot--trạm-tưới-thông-minh-3-lớp-smart-irrigation--sensors)
8. [Dự Báo Giá Thị Trường & Xu Hướng Nông Sản (Market LSTM Model)](#8-dự-báo-giá-thị-trường--xu-hướng-nông-sản-market-lstm-model)
9. [Truy Xuất Nguồn Gốc & Mã QR Chuỗi Cung Ứng (Traceability System)](#9-truy-xuất-nguồn-gốc--mã-qr-chuỗi-cung-ứng-traceability-system)
10. [Bảng Mã Lỗi & HTTP Status Codes](#10-bảng-mã-lỗi--http-status-codes)

---

## 1. Tổng Quan & Cấu Hình Môi Trường

### 1.1 Base URLs
| Phân hệ / Dịch vụ | Môi trường Local / Dev | Môi trường Production | Giao thức |
| :--- | :--- | :--- | :--- |
| **Supabase Database & Auth** | `http://localhost:54321` | `https://<project-ref>.supabase.co` | HTTPS / WSS |
| **AI Gateway (Chatbot, RAG)** | `http://localhost:8000` hoặc Ngrok Tunnel | `https://api-ai.eaagri.vn` | HTTPS |
| **AI Vision (YOLOv9)** | `http://localhost:8001` | `https://vision.eaagri.vn` | HTTPS |
| **IoT Telemetry & MQTT Broker** | `mqtt://localhost:1883` | `mqtts://iot.eaagri.vn:8883` / HTTPS | MQTTS / HTTPS |
| **Market Forecast API** | `http://localhost:8002` | `https://forecast.eaagri.vn` | HTTPS |

### 1.2 Biến môi trường Frontend (`.env.local`)
```env
VITE_SUPABASE_URL=https://eaktsegoxxbcdtixrgdg.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_CLqbj4pweJWegtHVttQ1lQ_w41PEN1_
VITE_API_CHATBOT_URL=https://your-ai-gateway-ngrok-or-domain.ngrok-free.app/chat
```

### 1.3 Headers chuẩn
```http
Content-Type: application/json
apikey: <SUPABASE_ANON_KEY>
Authorization: Bearer <ACCESS_TOKEN>
ngrok-skip-browser-warning: true
```

---

### 1.4 🚀 Bảng Tổng Hợp API Test Nhanh Không Cần Token (No-Auth / Public APIs)

Dưới đây là danh sách các API **không yêu cầu Bearer User Token** (`Authorization: Bearer <TOKEN>`), có thể đưa trực tiếp vào Postman, Thunder Client, Hoppscotch hoặc cURL để kiểm thử ngay lập tức.

#### 📊 Bảng tra cứu nhanh

| STT | Phân hệ | Method | Endpoint | Yêu cầu Header | Mục đích kiểm thử |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **1** | **AI Chatbot** | `POST` | `${VITE_API_CHATBOT_URL}` (`/chat`) | `Content-Type: application/json`<br>`ngrok-skip-browser-warning: true` | Hỏi đáp AI RAG VietGAP, thử nghiệm phản hồi từ Gemini / DeepSeek / Ollama |
| **2** | **Tin tức (Tất cả)** | `GET` | `/rest/v1/news?select=*&order=created_at.desc` | `apikey: <ANON_KEY>` | Lấy toàn bộ danh sách bài viết & tin tức canh tác |
| **3** | **Tin tức (Lọc)** | `GET` | `/rest/v1/news?category=eq.Kỹ thuật&select=*` | `apikey: <ANON_KEY>` | Lọc tin theo danh mục (`Kỹ thuật`, `Thị trường`, `Thời tiết`,...) |
| **4** | **Tin tức (Chi tiết)**| `GET` | `/rest/v1/news?id=eq.{id}&select=*` | `apikey: <ANON_KEY>` | Xem chi tiết 1 bài viết theo UUID |
| **5** | **Tin tức (Tìm kiếm)**| `GET` | `/rest/v1/news?title=ilike.*sầu riêng*&select=*` | `apikey: <ANON_KEY>` | Tìm kiếm bài viết theo từ khóa không phân biệt hoa thường |
| **6** | **Storage CDN** | `GET` | `/storage/v1/object/public/news-images/{fileName}` | *Không cần bất kỳ Header nào* | Tải và xem ảnh công khai trực tiếp trên trình duyệt |
| **7** | **Giá Thị Trường** | `GET` | `/api/v1/market/prices/current?commodity=saurieng_ri6&region=tay_nguyen` | `Content-Type: application/json` | Tra cứu giá nông sản tươi theo ngày và theo vùng |
| **8** | **Dự Báo Giá AI** | `GET` | `/api/v1/market/prices/forecast?commodity=saurieng_monthong&days=7` | `Content-Type: application/json` | Lấy dữ liệu chuỗi thời gian dự báo giá 1–7 ngày từ mô hình LSTM |
| **9** | **IoT Telemetry** | `POST` | `/api/v1/iot/telemetry` | `Content-Type: application/json` | Giả lập trạm IoT gửi chỉ số 3 tầng đất, nhiệt độ, độ ẩm |
| **10** | **IoT Trạng Thái** | `GET` | `/api/v1/iot/stations/{station_id}/status` | `Content-Type: application/json` | Đọc trạng thái hoạt động của trạm bơm & van tưới |
| **11** | **Truy Xuất Nguồn Gốc**| `GET` | `/api/v1/traceability/{lot_code}` | `Content-Type: application/json` | Tra cứu hồ sơ xuất xứ VietGAP, nhật ký canh tác của lô hàng |
| **12** | **AI Giọng Nói (TTS)**| `POST` | `/api/v1/ai/text-to-speech` | `Content-Type: application/json` | Sinh file âm thanh hướng dẫn canh tác cho bà con nông dân |
| **13** | **Auth - Đăng Nhập** | `POST` | `/auth/v1/token?grant_type=password` | `apikey: <ANON_KEY>` | Gửi email + mật khẩu để nhận Access Token dùng cho các API bảo mật |
| **14** | **Auth - Đăng Ký** | `POST` | `/auth/v1/signup` | `apikey: <ANON_KEY>` | Tạo tài khoản người dùng mới |

---

### 1.5 📮 Danh Sách Toàn Bộ API GET Chạy Trên POSTMAN Không Cần Token

Dưới đây là tập hợp toàn bộ các API sử dụng phương thức **`GET`** được thiết kế để copy trực tiếp vào **Postman**, **Thunder Client** (VS Code) hoặc trình duyệt mà **hoàn toàn không cần Bearer Access Token**.

> [!TIP]
> **Cấu hình Postman Environment Variables khuyến nghị:**
> - `SUPABASE_URL`: `https://<your-project>.supabase.co`
> - `SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (Anon public key, không phải Service Role Key)
> - `MARKET_URL`: `https://forecast.eaagri.vn`
> - `IOT_URL`: `https://iot.eaagri.vn`
> - `WEB_URL`: `https://www.eaagri.vn`

---

#### 📰 Nhóm 1: Tin Tức & Tri Thức Nông Nghiệp (Supabase REST)
*Header yêu cầu trên Postman:* `apikey: {{SUPABASE_ANON_KEY}}`

| Tên Request Postman | Method | URL & Query Params | Mô tả kiểm thử |
| :--- | :---: | :--- | :--- |
| **1. Lấy tất cả tin tức mới nhất** | `GET` | `{{SUPABASE_URL}}/rest/v1/news?select=*&order=created_at.desc` | Lấy toàn bộ danh sách bài viết sắp xếp mới nhất |
| **2. Lấy Top 6 tin trang chủ** | `GET` | `{{SUPABASE_URL}}/rest/v1/news?select=id,title,category,image_url,created_at&limit=6&order=created_at.desc` | Lấy dữ liệu rút gọn tối ưu băng thông cho trang chủ |
| **3. Lọc tin chuyên mục Kỹ thuật** | `GET` | `{{SUPABASE_URL}}/rest/v1/news?category=eq.Kỹ thuật&select=*&order=created_at.desc` | Lọc các bài viết hướng dẫn canh tác & phòng trừ sâu bệnh |
| **4. Lọc tin chuyên mục Thị trường** | `GET` | `{{SUPABASE_URL}}/rest/v1/news?category=eq.Thị trường&select=*&order=created_at.desc` | Lọc tin biến động giá cả và phân tích cung cầu |
| **5. Lọc tin chuyên mục Thời tiết** | `GET` | `{{SUPABASE_URL}}/rest/v1/news?category=eq.Thời tiết&select=*&order=created_at.desc` | Lọc bản tin thời tiết & cảnh báo vi khí hậu vùng trồng |
| **6. Lọc tin chuyên mục Sinh học** | `GET` | `{{SUPABASE_URL}}/rest/v1/news?category=eq.Sinh học&select=*&order=created_at.desc` | Lọc tin phân bón hữu cơ vi sinh, nấm đối kháng |
| **7. Lọc tin chuyên mục Bền vững** | `GET` | `{{SUPABASE_URL}}/rest/v1/news?category=eq.Bền vững&select=*&order=created_at.desc` | Lọc tin tiêu chuẩn VietGAP, GlobalGAP, canh tác xanh |
| **8. Tìm kiếm theo từ khóa** | `GET` | `{{SUPABASE_URL}}/rest/v1/news?title=ilike.*sầu riêng*&select=id,title,category,created_at` | Tìm kiếm bài viết có chứa từ khóa (không phân biệt hoa/thường) |
| **9. Xem chi tiết 1 bài viết** | `GET` | `{{SUPABASE_URL}}/rest/v1/news?id=eq.99c1589e-56e6-4298-90c1-3f6289b4317a&select=*` | Xem toàn bộ nội dung HTML và ảnh của 1 bài viết theo UUID |
| **10. Phân trang - Trang 1** | `GET` | `{{SUPABASE_URL}}/rest/v1/news?select=*&order=created_at.desc&limit=10&offset=0` | Lấy 10 bài viết đầu tiên |
| **11. Phân trang - Trang 2** | `GET` | `{{SUPABASE_URL}}/rest/v1/news?select=*&order=created_at.desc&limit=10&offset=10` | Lấy 10 bài viết tiếp theo (Next Page) |

---

#### 🖼️ Nhóm 2: Lưu Trữ Ảnh & File Tĩnh (Storage Public CDN)
*Header yêu cầu trên Postman:* **Không cần bất kỳ Header nào** (truy cập công khai trên trình duyệt và Postman).

| Tên Request Postman | Method | URL Hoàn Chỉnh | Mô tả kiểm thử |
| :--- | :---: | :--- | :--- |
| **12. Xem ảnh bài viết tin tức** | `GET` | `{{SUPABASE_URL}}/storage/v1/object/public/news-images/saurieng-ri6.jpg` | Tải và hiển thị trực tiếp ảnh sầu riêng Ri6 |
| **13. Tải tài nguyên đồ họa hệ thống** | `GET` | `{{SUPABASE_URL}}/storage/v1/object/public/system-assets/logo-eaagri.png` | Tải file logo chính thức của EaAgri |

---

#### 📈 Nhóm 3: Giá Nông Sản & Dự Báo AI (Market Forecast Model)
*Header yêu cầu trên Postman:* `Content-Type: application/json`

| Tên Request Postman | Method | URL & Query Params | Mô tả kiểm thử |
| :--- | :---: | :--- | :--- |
| **14. Giá Sầu riêng Ri6 Tây Nguyên** | `GET` | `{{MARKET_URL}}/api/v1/market/prices/current?commodity=saurieng_ri6&region=tay_nguyen` | Lấy giá loại 1, loại 2, hàng xô hôm nay tại Đắk Lắk/Gia Lai |
| **15. Giá Sầu riêng Monthong ĐNB** | `GET` | `{{MARKET_URL}}/api/v1/market/prices/current?commodity=saurieng_monthong&region=dong_nam_bo` | Lấy giá Monthong tại Đồng Nai, Bình Phước |
| **16. Giá Sầu riêng Musang King ĐBSCL** | `GET` | `{{MARKET_URL}}/api/v1/market/prices/current?commodity=musang_king&region=dong_bang_song_cuu_long` | Lấy giá Musang King tại Tiền Giang, Bến Tre |
| **17. Dự báo giá AI LSTM 7 ngày tới** | `GET` | `{{MARKET_URL}}/api/v1/market/prices/forecast?commodity=saurieng_monthong&days=7` | Lấy chuỗi giá dự báo 7 ngày + khuyến nghị "GIỮ HÀNG" / "BÁN NGAY" |
| **18. Dự báo giá AI LSTM 3 ngày tới** | `GET` | `{{MARKET_URL}}/api/v1/market/prices/forecast?commodity=saurieng_ri6&days=3` | Lấy dự báo ngắn hạn 3 ngày cho sầu riêng Ri6 |
| **19. Lịch sử biến động giá 30 ngày** | `GET` | `{{MARKET_URL}}/api/v1/market/prices/history?commodity=saurieng_ri6&limit=30` | Lấy tập dữ liệu lịch sử giá 30 ngày phục vụ vẽ biểu đồ |

---

#### 📡 Nhóm 4: IoT & Giám Sát Trạm Tưới Thông Minh (Smart Irrigation)
*Header yêu cầu trên Postman:* `Content-Type: application/json`

| Tên Request Postman | Method | URL & Query Params | Mô tả kiểm thử |
| :--- | :---: | :--- | :--- |
| **20. Trạng thái trạm tưới Đắk Lắk** | `GET` | `{{IOT_URL}}/api/v1/iot/stations/STATION-DAKLAK-001/status` | Đọc trạng thái máy bơm (ON/OFF), van tưới, độ ẩm 3 tầng đất |
| **21. Đọc 10 bản ghi đo cảm biến gần nhất** | `GET` | `{{IOT_URL}}/api/v1/iot/stations/STATION-DAKLAK-001/sensors/recent?limit=10` | Lấy lịch sử độ ẩm tầng 10cm, 30cm, 60cm gần nhất |
| **22. Danh sách các trạm quan trắc** | `GET` | `{{IOT_URL}}/api/v1/iot/stations/list` | Lấy danh mục tất cả trạm quan trắc công khai của HTX |
| **23. Dữ liệu thời tiết vi khí hậu tại trạm** | `GET` | `{{IOT_URL}}/api/v1/iot/weather/current?station_id=STATION-DAKLAK-001` | Đọc nhiệt độ không khí, độ ẩm, cường độ bức xạ mặt trời (W/m²) |

---

#### 🔍 Nhóm 5: Truy Xuất Nguồn Gốc & Mã QR Chuỗi Cung Ứng (Traceability)
*Header yêu cầu trên Postman:* `Content-Type: application/json`

| Tên Request Postman | Method | URL & Query Params | Mô tả kiểm thử |
| :--- | :---: | :--- | :--- |
| **24. Tra cứu mã lô Ri6 Đắk Lắk** | `GET` | `{{WEB_URL}}/api/v1/traceability/EA-DL-2026-RI6-0042` | Tra cứu thông tin nông hộ, mã VietGAP, nhật ký bón phân |
| **25. Tra cứu mã lô Monthong Tiền Giang** | `GET` | `{{WEB_URL}}/api/v1/traceability/EA-TG-2026-MON-0018` | Tra cứu lô hàng sầu riêng Monthong chuẩn xuất khẩu |
| **26. Xác thực tem QR VietGAP** | `GET` | `{{WEB_URL}}/api/v1/traceability/verify?code=EA-DL-2026-RI6-0042` | Kiểm tra tính hợp lệ và nguyên vẹn của tem truy xuất nguồn gốc |

---

#### 🩺 Nhóm 6: Health Check Các Máy Chủ Backend (Health & System Status)
*Header yêu cầu trên Postman:* **Không cần Header**

| Tên Request Postman | Method | URL Hoàn Chỉnh | Mô tả kiểm thử |
| :--- | :---: | :--- | :--- |
| **27. Health Check AI Gateway** | `GET` | `https://api-ai.eaagri.vn/health` | Kiểm tra server RAG Chatbot và kết nối Gemini / DeepSeek |
| **28. Health Check AI Vision YOLOv9**| `GET` | `https://vision.eaagri.vn/health` | Kiểm tra server phân tích hình ảnh và GPU inference |
| **29. Health Check Market Model** | `GET` | `https://forecast.eaagri.vn/health` | Kiểm tra server dự báo chuỗi thời gian LSTM |
| **30. Health Check IoT Ingestion** | `GET` | `https://iot.eaagri.vn/health` | Kiểm tra máy chủ tiếp nhận telemetry và MQTT broker |

---

#### 🧪 Mã cURL mẫu để chạy thử ngay (Quick cURL Snippets)

##### 1. Test AI Chatbot RAG Gateway (Không cần Token)
```bash
curl -X POST "https://api-ai.eaagri.vn/chat" \
  -H "Content-Type: application/json" \
  -H "ngrok-skip-browser-warning: true" \
  -d '{
    "question": "Lá sầu riêng bị vàng đốm mắt cua xử lý như thế nào theo chuẩn VietGAP?",
    "history": [],
    "model_provider": "gemini"
  }'
```

##### 2. Lấy danh sách Tin tức Nông nghiệp (Supabase REST - Public)
```bash
curl -X GET "https://<project-ref>.supabase.co/rest/v1/news?select=*&order=created_at.desc&limit=5" \
  -H "apikey: <VITE_SUPABASE_ANON_KEY>"
```

##### 3. Tìm kiếm bài viết theo từ khóa
```bash
curl -X GET "https://<project-ref>.supabase.co/rest/v1/news?title=ilike.*s%E1%BA%A7u%20ri%C3%AAng*&select=id,title,category,created_at" \
  -H "apikey: <VITE_SUPABASE_ANON_KEY>"
```

##### 4. Xem ảnh từ Storage Public Bucket (Mở trực tiếp trên Trình duyệt)
```text
https://<project-ref>.supabase.co/storage/v1/object/public/news-images/sample-image.jpg
```

##### 5. Tra cứu Giá Nông sản Hiện tại
```bash
curl -X GET "https://forecast.eaagri.vn/api/v1/market/prices/current?commodity=saurieng_ri6&region=tay_nguyen" \
  -H "Content-Type: application/json"
```

##### 6. Lấy Dự báo Giá AI LSTM 7 ngày
```bash
curl -X GET "https://forecast.eaagri.vn/api/v1/market/prices/forecast?commodity=saurieng_monthong&days=7" \
  -H "Content-Type: application/json"
```

##### 7. Giả lập đẩy dữ liệu cảm biến IoT (Sensor Ingestion)
```bash
curl -X POST "https://iot.eaagri.vn/api/v1/iot/telemetry" \
  -H "Content-Type: application/json" \
  -d '{
    "station_id": "STATION-DAKLAK-001",
    "timestamp": "2026-09-13T10:15:00Z",
    "soil_moisture": {
      "layer_10cm": 58.5,
      "layer_30cm": 64.2,
      "layer_60cm": 68.0
    },
    "soil_temperature": 26.4,
    "air_temperature": 31.2,
    "air_humidity": 72.0,
    "solar_radiation": 850.0,
    "battery_voltage": 4.12
  }'
```

##### 8. Tra cứu Trạng thái Trạm tưới IoT
```bash
curl -X GET "https://iot.eaagri.vn/api/v1/iot/stations/STATION-DAKLAK-001/status" \
  -H "Content-Type: application/json"
```

##### 9. Tra cứu Nguồn gốc Lô Nông sản qua Mã QR
```bash
curl -X GET "https://www.eaagri.vn/api/v1/traceability/EA-DL-2026-RI6-0042" \
  -H "Content-Type: application/json"
```

##### 10. Chuyển đổi Văn bản thành Giọng nói (Text-to-Speech)
```bash
curl -X POST "https://vision.eaagri.vn/api/v1/ai/text-to-speech" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Độ ẩm đất vườn hiện tại đạt 62%, trạng thái cây phát triển tốt.",
    "lang": "vi-VN",
    "voice_gender": "female"
  }'
```

##### 11. Đăng nhập để lấy Token (Auth Sign-In)
```bash
curl -X POST "https://<project-ref>.supabase.co/auth/v1/token?grant_type=password" \
  -H "Content-Type: application/json" \
  -H "apikey: <VITE_SUPABASE_ANON_KEY>" \
  -d '{
    "email": "nongdan@eaagri.vn",
    "password": "SecurePassword@123"
  }'
```

---

## 2. Xác Thực & Quản Trị Người Dùng (Authentication & Profiles)

### 2.1 Đăng ký tài khoản (Sign Up)
- **Method:** `POST`
- **Endpoint:** `{{SUPABASE_URL}}/auth/v1/signup`
- **Quyền truy cập:** Public (Không yêu cầu Bearer Token)
- **Headers:**
  ```http
  Content-Type: application/json
  apikey: {{SUPABASE_ANON_KEY}}
  ```
- **Request Body:**
```json
{
  "email": "nongdan@eaagri.vn",
  "password": "SecurePassword@123",
  "data": {
    "full_name": "Nguyễn Văn Nông",
    "role": "user"
  }
}
```
- **Response `200 OK` (hoặc `201 Created`):**
```json
{
  "id": "7f654321-abcd-ef01-2345-6789abcdef01",
  "email": "nongdan@eaagri.vn",
  "created_at": "2026-09-13T10:00:00.000Z",
  "user_metadata": {
    "full_name": "Nguyễn Văn Nông",
    "role": "user"
  }
}
```

#### 🧪 Hướng dẫn kiểm thử (Cách Test)
- **Cấu hình trên Postman / Thunder Client:**
  1. Method: Chọn `POST`
  2. URL: Nhập `{{SUPABASE_URL}}/auth/v1/signup`
  3. Tab **Headers**:
     - `apikey`: `{{SUPABASE_ANON_KEY}}`
     - `Content-Type`: `application/json`
  4. Tab **Body**: Chọn `raw` -> `JSON`, dán khối Request Body ở trên.
  5. Nhấn **Send** và kiểm tra status code trả về `200 OK`.
- **Lệnh cURL chạy trực tiếp:**
```bash
curl -X POST "https://<project-ref>.supabase.co/auth/v1/signup" \
  -H "Content-Type: application/json" \
  -H "apikey: <VITE_SUPABASE_ANON_KEY>" \
  -d '{
    "email": "test_user_01@eaagri.vn",
    "password": "SecurePassword@123",
    "data": {
      "full_name": "Người Dùng Mới",
      "role": "user"
    }
  }'
```
- **Kịch bản kiểm thử (Test Cases):**
  - ✅ **TC-AUTH-01 (Đăng ký thành công):** Email mới chưa tồn tại, mật khẩu $\ge 6$ ký tự $\rightarrow$ Trả về `200 OK` kèm thông tin User ID.
  - ❌ **TC-AUTH-02 (Email đã tồn tại):** Đăng ký lại email cũ $\rightarrow$ Trả về `400 Bad Request` hoặc `422 Unprocessable Entity` (`"User already registered"`).
  - ❌ **TC-AUTH-03 (Mật khẩu yếu):** Password dưới 6 ký tự $\rightarrow$ Trả về `422` (`"Password should be at least 6 characters"`).

---

### 2.2 Đăng nhập (Sign In)
- **Method:** `POST`
- **Endpoint:** `{{SUPABASE_URL}}/auth/v1/token?grant_type=password`
- **Quyền truy cập:** Public
- **Headers:**
  ```http
  Content-Type: application/json
  apikey: {{SUPABASE_ANON_KEY}}
  ```
- **Request Body:**
```json
{
  "email": "admin@eaagri.vn",
  "password": "AdminPassword@2026"
}
```
- **Response `200 OK`:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "d76df8s7f...",
  "user": {
    "id": "1e123456-789a-bcde-f012-3456789abcde",
    "email": "admin@eaagri.vn",
    "role": "authenticated"
  }
}
```

#### 🧪 Hướng dẫn kiểm thử (Cách Test)
- **Cấu hình trên Postman / Thunder Client:**
  1. Method: `POST`
  2. URL: `{{SUPABASE_URL}}/auth/v1/token?grant_type=password`
  3. Headers: `apikey: {{SUPABASE_ANON_KEY}}`, `Content-Type: application/json`
  4. Body (`raw JSON`): Dán JSON tài khoản email & mật khẩu.
  5. **Tự động lưu Token vào biến môi trường Postman (Tab Tests / Scripts):**
     ```javascript
     const res = pm.response.json();
     if (res.access_token) {
         pm.environment.set("ACCESS_TOKEN", res.access_token);
         console.log("Token saved successfully!");
     }
     ```
- **Lệnh cURL chạy trực tiếp:**
```bash
curl -X POST "https://<project-ref>.supabase.co/auth/v1/token?grant_type=password" \
  -H "Content-Type: application/json" \
  -H "apikey: <VITE_SUPABASE_ANON_KEY>" \
  -d '{
    "email": "admin@eaagri.vn",
    "password": "AdminPassword@2026"
  }'
```
- **Kịch bản kiểm thử (Test Cases):**
  - ✅ **TC-AUTH-04 (Đăng nhập đúng):** Nhận được `access_token` hợp lệ và `refresh_token` (`200 OK`).
  - ❌ **TC-AUTH-05 (Sai mật khẩu / Sai Email):** Trả về `400 Bad Request` với message `"Invalid login credentials"`.

---

### 2.3 Đăng xuất (Sign Out)
- **Method:** `POST`
- **Endpoint:** `{{SUPABASE_URL}}/auth/v1/logout`
- **Headers:**
  ```http
  apikey: {{SUPABASE_ANON_KEY}}
  Authorization: Bearer {{ACCESS_TOKEN}}
  ```
- **Response `204 No Content`**

#### 🧪 Hướng dẫn kiểm thử (Cách Test)
- **Cấu hình trên Postman:**
  1. Method: `POST`
  2. URL: `{{SUPABASE_URL}}/auth/v1/logout`
  3. Headers: `apikey: {{SUPABASE_ANON_KEY}}`, `Authorization: Bearer {{ACCESS_TOKEN}}`
  4. Body: Trống (None)
  5. Nhấn **Send** $\rightarrow$ Kết quả Status `204 No Content`.
- **Lệnh cURL:**
```bash
curl -X POST "https://<project-ref>.supabase.co/auth/v1/logout" \
  -H "apikey: <VITE_SUPABASE_ANON_KEY>" \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```
- **Kịch bản kiểm thử (Test Cases):**
  - ✅ **TC-AUTH-06 (Đăng xuất thành công):** Trả về `204 No Content`, token bị vô hiệu hóa session.
  - ❌ **TC-AUTH-07 (Thiếu Token):** Không truyền Authorization header $\rightarrow$ Trả về `401 Unauthorized`.

---

### 2.4 Lấy danh sách tài khoản (Super Admin only)
- **Method:** `GET`
- **Endpoint:** `{{SUPABASE_URL}}/rest/v1/profiles?select=*&order=created_at.desc`
- **Headers:**
  ```http
  apikey: {{SUPABASE_ANON_KEY}}
  Authorization: Bearer {{SA_TOKEN}}
  ```
- **Response `200 OK`:**
```json
[
  {
    "id": "1e123456-789a-bcde-f012-3456789abcde",
    "email": "admin@eaagri.vn",
    "full_name": "Quản Trị Viên",
    "role": "SA",
    "created_at": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "7f654321-abcd-ef01-2345-6789abcdef01",
    "email": "nongdan@eaagri.vn",
    "full_name": "Nguyễn Văn Nông",
    "role": "user",
    "created_at": "2026-09-13T10:00:00.000Z"
  }
]
```

#### 🧪 Hướng dẫn kiểm thử (Cách Test)
- **Cấu hình trên Postman:**
  1. Method: `GET`
  2. URL: `{{SUPABASE_URL}}/rest/v1/profiles?select=*&order=created_at.desc`
  3. Headers: `apikey: {{SUPABASE_ANON_KEY}}`, `Authorization: Bearer {{SA_TOKEN}}`
- **Lệnh cURL:**
```bash
curl -X GET "https://<project-ref>.supabase.co/rest/v1/profiles?select=*&order=created_at.desc" \
  -H "apikey: <VITE_SUPABASE_ANON_KEY>" \
  -H "Authorization: Bearer <SA_BEARER_TOKEN>"
```
- **Kịch bản kiểm thử (Test Cases):**
  - ✅ **TC-PROF-01 (Truy cập bằng tài khoản Super Admin):** Trả về `200 OK` danh sách toàn bộ tài khoản người dùng và vai trò.
  - ❌ **TC-PROF-02 (Truy cập bằng tài khoản User thường):** Trả về `200 OK` nhưng RLS (Row Level Security) chỉ trả về profile của chính user đó (không xem được tài khoản khác).
  - ❌ **TC-PROF-03 (Không truyền Token):** Trả về `401 Unauthorized` hoặc mảng rỗng `[]` tùy cấu hình RLS.

---

### 2.5 Cập nhật vai trò tài khoản (Change User Role)
- **Method:** `PATCH`
- **Endpoint:** `{{SUPABASE_URL}}/rest/v1/profiles?id=eq.{user_id}`
- **Headers:**
  ```http
  apikey: {{SUPABASE_ANON_KEY}}
  Authorization: Bearer {{SA_TOKEN}}
  Content-Type: application/json
  ```
- **Request Body:**
```json
{
  "role": "SA"
}
```
- **Response `200 OK` / `204 No Content`**

#### 🧪 Hướng dẫn kiểm thử (Cách Test)
- **Cấu hình trên Postman:**
  1. Method: `PATCH`
  2. URL: `{{SUPABASE_URL}}/rest/v1/profiles?id=eq.7f654321-abcd-ef01-2345-6789abcdef01`
  3. Headers: `apikey: {{SUPABASE_ANON_KEY}}`, `Authorization: Bearer {{SA_TOKEN}}`, `Content-Type: application/json`
  4. Body: `{"role": "SA"}`
- **Lệnh cURL:**
```bash
curl -X PATCH "https://<project-ref>.supabase.co/rest/v1/profiles?id=eq.7f654321-abcd-ef01-2345-6789abcdef01" \
  -H "apikey: <VITE_SUPABASE_ANON_KEY>" \
  -H "Authorization: Bearer <SA_BEARER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"role": "SA"}'
```
- **Kịch bản kiểm thử (Test Cases):**
  - ✅ **TC-PROF-04 (Cập nhật thành công):** Trả về `204 No Content` (hoặc `200 OK`), vai trò user được nâng cấp lên Super Admin.
  - ❌ **TC-PROF-05 (User thường tự nâng quyền mình):** Trả về `403 Forbidden` hoặc không có dòng nào được cập nhật do chặn RLS Policy.

---

## 3. Quản Lý Tin Tức & Tri Thức Nông Nghiệp (News & Articles)

### 3.1 Lấy danh sách tin tức (Public & Filterable)
- **Method:** `GET`
- **Endpoint:** `{{SUPABASE_URL}}/rest/v1/news?select=*&order=created_at.desc`
- **Quyền truy cập:** Public
- **Headers:**
  ```http
  apikey: {{SUPABASE_ANON_KEY}}
  ```
- **Query Parameters hỗ trợ:**
  - `category=eq.{category_name}`: Lọc theo danh mục (`Kỹ thuật`, `Thị trường`, `Thời tiết`, `Sinh học`, `Bền vững`)
  - `limit={number}`: Giới hạn số bản ghi (ví dụ: `limit=6` cho trang chủ)
  - `offset={number}`: Phân trang (ví dụ: `offset=10` cho trang 2)
  - `title=ilike.*{keyword}*`: Tìm kiếm gần đúng tiêu đề không phân biệt hoa/thường
- **Response `200 OK`:**
```json
[
  {
    "id": "99c1589e-56e6-4298-90c1-3f6289b4317a",
    "title": "Kỹ thuật siết nước kích bông sầu riêng Ri6 vụ nghịch",
    "content": "<p>Để kích bông sầu riêng đồng loạt, cần tiến hành tạo khô hạn 20-30 ngày kết hợp chặn đọt non...</p>",
    "author": "Ban Kỹ Thuật EaAgri",
    "category": "Kỹ thuật",
    "image_url": "https://<project-ref>.supabase.co/storage/v1/object/public/news-images/saurieng-ri6.jpg#pos=50,50",
    "created_at": "2026-09-13T08:30:00.000Z"
  }
]
```

#### 🧪 Hướng dẫn kiểm thử (Cách Test)
- **Cấu hình trên Postman:**
  1. Method: `GET`
  2. URL: `{{SUPABASE_URL}}/rest/v1/news?select=*&order=created_at.desc`
  3. Header: `apikey: {{SUPABASE_ANON_KEY}}`
  4. Nhấn **Send** để lấy toàn bộ tin tức.
- **Lệnh cURL kiểm thử các trường hợp:**
```bash
# 1. Lấy tất cả tin tức mới nhất
curl -X GET "https://<project-ref>.supabase.co/rest/v1/news?select=*&order=created_at.desc" \
  -H "apikey: <VITE_SUPABASE_ANON_KEY>"

# 2. Lọc chuyên mục Kỹ thuật
curl -X GET "https://<project-ref>.supabase.co/rest/v1/news?category=eq.K%E1%BB%B9%20thu%E1%BA%ADt&select=*" \
  -H "apikey: <VITE_SUPABASE_ANON_KEY>"

# 3. Tìm kiếm theo từ khóa 'sầu riêng'
curl -X GET "https://<project-ref>.supabase.co/rest/v1/news?title=ilike.*s%E1%BA%A7u%20ri%C3%AAng*&select=id,title,category" \
  -H "apikey: <VITE_SUPABASE_ANON_KEY>"
```
- **Kịch bản kiểm thử (Test Cases):**
  - ✅ **TC-NEWS-01 (Lấy danh sách thành công):** Trả về `200 OK` kèm mảng JSON chứa các bài viết.
  - ✅ **TC-NEWS-02 (Lọc danh mục không có bài viết):** Trả về `200 OK` với mảng rỗng `[]`.
  - ✅ **TC-NEWS-03 (Phân trang limit & offset):** Kiểm tra số lượng phần tử trả về khớp với tham số `limit`.

---

### 3.2 Lấy chi tiết bài viết theo ID
- **Method:** `GET`
- **Endpoint:** `{{SUPABASE_URL}}/rest/v1/news?id=eq.{id}&select=*`
- **Headers:** `apikey: {{SUPABASE_ANON_KEY}}`
- **Response `200 OK`:**
```json
[
  {
    "id": "99c1589e-56e6-4298-90c1-3f6289b4317a",
    "title": "Kỹ thuật siết nước kích bông sầu riêng Ri6 vụ nghịch",
    "content": "<p>Nội dung chi tiết bài viết...</p>",
    "author": "Ban Kỹ Thuật EaAgri",
    "category": "Kỹ thuật",
    "image_url": "https://<project-ref>.supabase.co/storage/v1/object/public/news-images/saurieng-ri6.jpg#pos=50,50",
    "created_at": "2026-09-13T08:30:00.000Z"
  }
]
```

#### 🧪 Hướng dẫn kiểm thử (Cách Test)
- **Lệnh cURL:**
```bash
curl -X GET "https://<project-ref>.supabase.co/rest/v1/news?id=eq.99c1589e-56e6-4298-90c1-3f6289b4317a&select=*" \
  -H "apikey: <VITE_SUPABASE_ANON_KEY>"
```
- **Kịch bản kiểm thử (Test Cases):**
  - ✅ **TC-NEWS-04 (ID tồn tại):** Trả về `200 OK` với mảng chứa 1 bài viết đầy đủ `content`, `image_url`.
  - ❌ **TC-NEWS-05 (ID không tồn tại):** Trả về `200 OK` với mảng rỗng `[]`.

---

### 3.3 Đăng bài viết mới (Super Admin only)
- **Method:** `POST`
- **Endpoint:** `{{SUPABASE_URL}}/rest/v1/news`
- **Headers:**
  ```http
  apikey: {{SUPABASE_ANON_KEY}}
  Authorization: Bearer {{SA_TOKEN}}
  Content-Type: application/json
  Prefer: return=representation
  ```
- **Request Body:**
```json
{
  "title": "Dự báo giá sầu riêng Monthong tuần tới: Xu hướng tăng nhẹ",
  "content": "<p>Nhu cầu xuất khẩu sang thị trường Trung Quốc duy trì ở mức cao...</p>",
  "author": "Phan Đăng Huy",
  "category": "Thị trường",
  "image_url": "https://<project-ref>.supabase.co/storage/v1/object/public/news-images/market-01.jpg#pos=50,50"
}
```
- **Response `201 Created`:**
```json
[
  {
    "id": "b1234567-89ab-cdef-0123-456789abcdef",
    "title": "Dự báo giá sầu riêng Monthong tuần tới: Xu hướng tăng nhẹ",
    "content": "<p>Nhu cầu xuất khẩu sang thị trường Trung Quốc duy trì ở mức cao...</p>",
    "author": "Phan Đăng Huy",
    "category": "Thị trường",
    "image_url": "https://<project-ref>.supabase.co/storage/v1/object/public/news-images/market-01.jpg#pos=50,50",
    "created_at": "2026-09-13T10:00:00.000Z"
  }
]
```

#### 🧪 Hướng dẫn kiểm thử (Cách Test)
- **Cấu hình trên Postman:**
  1. Method: `POST`
  2. URL: `{{SUPABASE_URL}}/rest/v1/news`
  3. Headers:
     - `apikey`: `{{SUPABASE_ANON_KEY}}`
     - `Authorization`: `Bearer {{SA_TOKEN}}`
     - `Content-Type`: `application/json`
     - `Prefer`: `return=representation`
  4. Body: Chọn `raw` $\rightarrow$ `JSON` và dán nội dung bài viết mới.
- **Lệnh cURL:**
```bash
curl -X POST "https://<project-ref>.supabase.co/rest/v1/news" \
  -H "apikey: <VITE_SUPABASE_ANON_KEY>" \
  -H "Authorization: Bearer <SA_BEARER_TOKEN>" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "title": "Thử nghiệm bài viết mới",
    "content": "<p>Nội dung thử nghiệm API đăng bài...</p>",
    "author": "EaAgri Admin",
    "category": "Kỹ thuật",
    "image_url": "https://<project-ref>.supabase.co/storage/v1/object/public/news-images/sample.jpg#pos=50,50"
  }'
```
- **Kịch bản kiểm thử (Test Cases):**
  - ✅ **TC-NEWS-06 (Tạo bài thành công):** Trả về `201 Created` kèm UUID bài viết mới.
  - ❌ **TC-NEWS-07 (Thiếu Token / Token không phải SA):** Trả về `401 Unauthorized` hoặc `403 Forbidden`.
  - ❌ **TC-NEWS-08 (Thiếu trường bắt buộc `title` hoặc `content`):** Trả về `400 Bad Request`.

---

### 3.4 Chỉnh sửa bài viết
- **Method:** `PATCH`
- **Endpoint:** `{{SUPABASE_URL}}/rest/v1/news?id=eq.{id}`
- **Headers:**
  ```http
  apikey: {{SUPABASE_ANON_KEY}}
  Authorization: Bearer {{SA_TOKEN}}
  Content-Type: application/json
  ```
- **Request Body:**
```json
{
  "title": "Tiêu đề cập nhật mới sau kiểm duyệt",
  "category": "Kỹ thuật"
}
```
- **Response `204 No Content`** (hoặc `200 OK`)

#### 🧪 Hướng dẫn kiểm thử (Cách Test)
- **Lệnh cURL:**
```bash
curl -X PATCH "https://<project-ref>.supabase.co/rest/v1/news?id=eq.99c1589e-56e6-4298-90c1-3f6289b4317a" \
  -H "apikey: <VITE_SUPABASE_ANON_KEY>" \
  -H "Authorization: Bearer <SA_BEARER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Tiêu đề cập nhật mới sau kiểm duyệt"}'
```
- **Kịch bản kiểm thử (Test Cases):**
  - ✅ **TC-NEWS-09 (Cập nhật thành công):** Trả về `204 No Content`, dữ liệu bài viết được thay đổi.
  - ❌ **TC-NEWS-10 (User thường cập nhật):** Trả về `403 Forbidden`.

---

### 3.5 Xóa bài viết
- **Method:** `DELETE`
- **Endpoint:** `{{SUPABASE_URL}}/rest/v1/news?id=eq.{id}`
- **Headers:**
  ```http
  apikey: {{SUPABASE_ANON_KEY}}
  Authorization: Bearer {{SA_TOKEN}}
  ```
- **Response `204 No Content`**

#### 🧪 Hướng dẫn kiểm thử (Cách Test)
- **Lệnh cURL:**
```bash
curl -X DELETE "https://<project-ref>.supabase.co/rest/v1/news?id=eq.99c1589e-56e6-4298-90c1-3f6289b4317a" \
  -H "apikey: <VITE_SUPABASE_ANON_KEY>" \
  -H "Authorization: Bearer <SA_BEARER_TOKEN>"
```
- **Kịch bản kiểm thử (Test Cases):**
  - ✅ **TC-NEWS-11 (Xóa thành công):** Trả về `204 No Content`, bản ghi bị xóa khỏi cơ sở dữ liệu.
  - ❌ **TC-NEWS-12 (Không có quyền SA):** Trả về `401 Unauthorized` hoặc `403 Forbidden`.

---

## 4. Lưu Trữ Tệp Tin & Hình Ảnh (Storage Service)

### 4.1 Tải lên ảnh tin tức (Upload Article Image)
- **Method:** `POST`
- **Endpoint:** `{{SUPABASE_URL}}/storage/v1/object/news-images/{fileName}`
- **Headers:**
  ```http
  apikey: {{SUPABASE_ANON_KEY}}
  Authorization: Bearer {{TOKEN}}
  Content-Type: image/jpeg (hoặc image/png, image/webp)
  ```
- **Request Body:** File ảnh dạng Binary (nhị phân).
- **Response `200 OK`:**
```json
{
  "Key": "news-images/1726231200000_ri6.jpg"
}
```

#### 🧪 Hướng dẫn kiểm thử (Cách Test)
- **Cấu hình trên Postman:**
  1. Method: `POST`
  2. URL: `{{SUPABASE_URL}}/storage/v1/object/news-images/test_upload_01.jpg`
  3. Headers: `apikey: {{SUPABASE_ANON_KEY}}`, `Authorization: Bearer {{TOKEN}}`, `Content-Type: image/jpeg`
  4. Tab **Body**: Chọn `binary` $\rightarrow$ Nhấn **Select File** và chọn 1 ảnh `.jpg` từ máy tính.
  5. Nhấn **Send** và kiểm tra response trả về `{ "Key": "news-images/test_upload_01.jpg" }`.
- **Lệnh cURL:**
```bash
curl -X POST "https://<project-ref>.supabase.co/storage/v1/object/news-images/test_upload_01.jpg" \
  -H "apikey: <VITE_SUPABASE_ANON_KEY>" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: image/jpeg" \
  --data-binary "@C:/path/to/your/image.jpg"
```
- **Kịch bản kiểm thử (Test Cases):**
  - ✅ **TC-STOR-01 (Upload ảnh mới):** Trả về `200 OK` kèm đường dẫn file Key.
  - ❌ **TC-STOR-02 (Tên file bị trùng không có flag overwrite):** Trả về `400 Bad Request` (`"The resource already exists"`).
  - ❌ **TC-STOR-03 (Chưa đăng nhập):** Trả về `401 Unauthorized` do bucket yêu cầu Authenticated Role.

---

### 4.2 Lấy đường dẫn công khai (Get Public URL)
- **Method:** `GET`
- **Endpoint:** `{{SUPABASE_URL}}/storage/v1/object/public/news-images/{fileName}`
- **Quyền truy cập:** Hoàn toàn Public (**Không cần bất kỳ Header nào**)
- **Response:** File ảnh stream trực tiếp (`image/jpeg`, `image/png`, `image/webp`).

#### 🧪 Hướng dẫn kiểm thử (Cách Test)
- **Test trên trình duyệt Web (Chrome, Edge, Firefox):**
  - Mở tab mới trên trình duyệt, dán đường dẫn:
    `https://<project-ref>.supabase.co/storage/v1/object/public/news-images/saurieng-ri6.jpg`
  - Hình ảnh sẽ hiển thị trực tiếp trên trình duyệt.
- **Lệnh cURL tải ảnh về máy:**
```bash
curl -X GET "https://<project-ref>.supabase.co/storage/v1/object/public/news-images/saurieng-ri6.jpg" \
  -o "downloaded_image.jpg"
```
- **Kịch bản kiểm thử (Test Cases):**
  - ✅ **TC-STOR-04 (Ảnh tồn tại):** Trả về `200 OK` với header `Content-Type: image/jpeg`, dữ liệu ảnh hiển thị đầy đủ.
  - ❌ **TC-STOR-05 (File không tồn tại):** Trả về `404 Not Found` (`{"statusCode":"404","error":"Not Found","message":"Object not found"}`).

---

## 5. AI Chatbot & RAG Tri Thức VietGAP (Dual-Brain Gateway)

### 5.1 Gửi tin nhắn hỏi đáp AI (AI Chat Query)
- **Method:** `POST`
- **Endpoint:** `${VITE_API_CHATBOT_URL}` (Ví dụ: `https://api-ai.eaagri.vn/chat`)
- **Headers:**
  ```http
  Content-Type: application/json
  ngrok-skip-browser-warning: true
  ```
- **Request Body:**
```json
{
  "question": "Lá sầu riêng xuất hiện đốm vàng và rụng hàng loạt là bệnh gì và cách xử lý theo VietGAP?",
  "history": [
    {
      "role": "user",
      "content": "Chào chuyên gia nông nghiệp EaAgri"
    },
    {
      "role": "assistant",
      "content": "Chào bạn! Tôi là Chuyên gia AI Nông nghiệp EaAgri. Tôi có thể giúp gì cho vườn sầu riêng của bạn?"
    }
  ],
  "model_provider": "gemini"
}
```
- **Tham số hỗ trợ `model_provider`:** `gemini` (Gemini 2.0 Flash / Pro), `deepseek`, `ollama`.
- **Response `200 OK`:**
```json
{
  "answer": "Hiện tượng lá sầu riêng xuất hiện đốm vàng rồi rụng hàng loạt thường do nấm **Phytophthora palmivora** gây ra hoặc do thiếu hụt vi lượng Magie kết hợp úng rễ.\n\n### Phác đồ xử lý chuẩn VietGAP:\n1. **Cách ly & Vệ sinh:** Gom tiêu hủy toàn bộ lá bệnh rụng quanh gốc.\n2. **Kiểm tra độ ẩm đất:** Đảm bảo độ ẩm dưới 70%, dừng tưới nếu đất còn ướt.\n3. **Xử lý thuốc sinh học:** Phun luân phiên hoạt chất Metalaxyl-M hoặc Phosphonate sinh học.\n4. **Bồi dưỡng rễ:** Tưới chế phẩm Trichoderma sau 7 ngày xử lý nấm.",
  "context_used": "Tài liệu VietGAP sầu riêng 2026 — Quy trình phòng trừ bệnh Phytophthora trang 45-48."
}
```

#### 🧪 Hướng dẫn kiểm thử (Cách Test)
- **Cấu hình trên Postman:**
  1. Method: `POST`
  2. URL: `https://api-ai.eaagri.vn/chat` (hoặc URL Ngrok đang chạy)
  3. Headers:
     - `Content-Type`: `application/json`
     - `ngrok-skip-browser-warning`: `true`
  4. Body (`raw JSON`): Nhập câu hỏi canh tác và model muốn test.
- **Lệnh cURL:**
```bash
curl -X POST "https://api-ai.eaagri.vn/chat" \
  -H "Content-Type: application/json" \
  -H "ngrok-skip-browser-warning: true" \
  -d '{
    "question": "Quy trình tưới nước cho sầu riêng giai đoạn làm bông?",
    "history": [],
    "model_provider": "gemini"
  }'
```
- **Kịch bản kiểm thử (Test Cases):**
  - ✅ **TC-AI-01 (Hỏi đáp chuẩn với Gemini):** Nhận phản hồi `200 OK` trong vòng 1-3 giây kèm trích dẫn `context_used`.
  - ✅ **TC-AI-02 (Hỏi đáp với ngữ cảnh lịch sử hội thoại):** Truyền mảng `history` và kiểm tra câu trả lời có tính liền mạch ngữ cảnh.
  - ❌ **TC-AI-03 (Thiếu trường `question`):** Trả về `400 Bad Request` hoặc `422 Validation Error`.
  - ❌ **TC-AI-04 (Model Provider không hợp lệ):** Trả về lỗi `400` với thông báo `"Unsupported model provider"`.

---

### 5.2 Lấy lịch sử trò chuyện (Get Chat History)
- **Method:** `GET`
- **Endpoint:** `{{SUPABASE_URL}}/rest/v1/chat_history?user_id=eq.{user_id}&order=created_at.asc`
- **Headers:**
  ```http
  apikey: {{SUPABASE_ANON_KEY}}
  Authorization: Bearer {{ACCESS_TOKEN}}
  ```
- **Response `200 OK`:**
```json
[
  {
    "id": "c1234567-1111-2222-3333-444455556666",
    "user_id": "7f654321-abcd-ef01-2345-6789abcdef01",
    "role": "user",
    "content": "Làm thế nào để chặn đọt sầu riêng?",
    "created_at": "2026-09-13T09:00:00.000Z"
  },
  {
    "id": "c1234567-1111-2222-3333-444455557777",
    "user_id": "7f654321-abcd-ef01-2345-6789abcdef01",
    "role": "assistant",
    "content": "Để chặn đọt sầu riêng trong thời gian nuôi trái, bạn có thể phun MKP liều lượng...",
    "created_at": "2026-09-13T09:00:05.000Z"
  }
]
```

#### 🧪 Hướng dẫn kiểm thử (Cách Test)
- **Lệnh cURL:**
```bash
curl -X GET "https://<project-ref>.supabase.co/rest/v1/chat_history?user_id=eq.7f654321-abcd-ef01-2345-6789abcdef01&order=created_at.asc" \
  -H "apikey: <VITE_SUPABASE_ANON_KEY>" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```
- **Kịch bản kiểm thử (Test Cases):**
  - ✅ **TC-CHAT-01 (Lấy đúng lịch sử của User):** Trả về `200 OK` danh sách tin nhắn theo thứ tự thời gian tăng dần.
  - ❌ **TC-CHAT-02 (User A cố đọc tin nhắn của User B):** RLS chặn và trả về mảng rỗng `[]` để bảo mật riêng tư.

---

### 5.3 Lưu tin nhắn vào lịch sử (Save Chat Message)
- **Method:** `POST`
- **Endpoint:** `{{SUPABASE_URL}}/rest/v1/chat_history`
- **Headers:**
  ```http
  apikey: {{SUPABASE_ANON_KEY}}
  Authorization: Bearer {{ACCESS_TOKEN}}
  Content-Type: application/json
  ```
- **Request Body:**
```json
{
  "user_id": "7f654321-abcd-ef01-2345-6789abcdef01",
  "role": "user",
  "content": "Bón phân hữu cơ vào thời điểm nào tốt nhất?"
}
```
- **Response `201 Created`**

#### 🧪 Hướng dẫn kiểm thử (Cách Test)
- **Lệnh cURL:**
```bash
curl -X POST "https://<project-ref>.supabase.co/rest/v1/chat_history" \
  -H "apikey: <VITE_SUPABASE_ANON_KEY>" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "7f654321-abcd-ef01-2345-6789abcdef01",
    "role": "user",
    "content": "Bón phân hữu cơ vào thời điểm nào tốt nhất?"
  }'
```
- **Kịch bản kiểm thử (Test Cases):**
  - ✅ **TC-CHAT-03 (Lưu tin nhắn thành công):** Trả về `201 Created`.
  - ❌ **TC-CHAT-04 (Chưa đăng nhập):** Trả về `401 Unauthorized`.

---

## 6. Thị Giác Máy Tính & Chẩn Đoán Bệnh Cây Trồng (AI Computer Vision - YOLOv9)

### 6.1 Quét & Chẩn đoán bệnh trên lá / quả sầu riêng (Disease Scanner)
- **Method:** `POST`
- **Endpoint:** `https://vision.eaagri.vn/api/v1/ai/diagnose-disease`
- **Headers:**
  ```http
  Authorization: Bearer {{ACCESS_TOKEN}}
  Content-Type: multipart/form-data
  ```
- **Request Body (FormData):**
  - `image`: File ảnh lá hoặc quả sầu riêng (`.jpg`, `.png`, `.webp`)
  - `mode`: `"overall"` (Tổng thể) | `"flesh"` (Cơm sầu) | `"disease"` (Chuyên sâu vết bệnh)
- **Response `200 OK`:**
```json
{
  "status": "success",
  "detection": {
    "disease_detected": true,
    "primary_diagnosis": "Nấm Phytophthora (Cháy lá đốm mắt cua)",
    "confidence": 99.4,
    "severity": "Giai đoạn 2 (Trung bình)",
    "bounding_boxes": [
      {
        "x": 120,
        "y": 85,
        "width": 140,
        "height": 95,
        "label": "phytophthora_spot",
        "confidence": 0.994
      }
    ]
  },
  "fruit_quality": {
    "grade": "Loại 1 (Xuất khẩu)",
    "brix": "18.5° Brix",
    "ripeness_percent": 85,
    "flesh_thickness": "3.2 cm",
    "harvest_window": "Thu hoạch trong 3-5 ngày"
  },
  "treatment_prescription": {
    "standard": "VietGAP 2026",
    "steps": [
      "Cắt tỉa cành bệnh tạo độ thông thoáng tán",
      "Phun hoạt chất Fosetyl-aluminium liều lượng 2g/lít nước",
      "Bổ sung phân bón lá giàu Silic và Canxi để vách tế bào dày hơn"
    ]
  }
}
```

#### 🧪 Hướng dẫn kiểm thử (Cách Test)
- **Cấu hình trên Postman:**
  1. Method: `POST`
  2. URL: `https://vision.eaagri.vn/api/v1/ai/diagnose-disease`
  3. Headers: `Authorization: Bearer {{ACCESS_TOKEN}}` *(Lưu ý: Postman sẽ tự động sinh boundary cho multipart/form-data, không cần gõ cứng Content-Type)*.
  4. Tab **Body**: Chọn `form-data`:
     - Key 1: `image` (chuyển loại từ `Text` sang `File`) $\rightarrow$ Chọn ảnh lá sầu riêng từ máy.
     - Key 2: `mode` (Text) = `disease`
  5. Nhấn **Send** và kiểm tra kết quả chẩn đoán bounding boxes và phác đồ điều trị.
- **Lệnh cURL:**
```bash
curl -X POST "https://vision.eaagri.vn/api/v1/ai/diagnose-disease" \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -F "image=@C:/Users/Public/Pictures/leaf_sample.jpg" \
  -F "mode=disease"
```
- **Kịch bản kiểm thử (Test Cases):**
  - ✅ **TC-VIS-01 (Ảnh lá bệnh rõ nét):** Trả về `200 OK` nhận diện đúng mã bệnh, độ tin cậy > 90%, tọa độ hộp bao `bounding_boxes`.
  - ✅ **TC-VIS-02 (Cây khỏe mạnh không có bệnh):** Trả về `200 OK` với `disease_detected: false`.
  - ❌ **TC-VIS-03 (Không gửi file ảnh):** Trả về `400 Bad Request` (`"Missing required form-data field: image"`).
  - ❌ **TC-VIS-04 (File không phải ảnh - vd: file .pdf, .txt):** Trả về `422 Unprocessable Entity` (`"Invalid file type, only JPG/PNG/WEBP supported"`).

---

### 6.2 Chuyển đổi giọng nói đa phương thức (Text-to-Speech gTTS)
- **Method:** `POST`
- **Endpoint:** `https://vision.eaagri.vn/api/v1/ai/text-to-speech`
- **Headers:**
  ```http
  Content-Type: application/json
  ```
- **Request Body:**
```json
{
  "text": "Vườn của bạn có dấu hiệu nhiễm nấm nhẹ. Hãy giảm lượng tưới và phun thuốc sinh học.",
  "lang": "vi-VN",
  "voice_gender": "female"
}
```
- **Response `200 OK`:**
```json
{
  "audio_url": "https://storage.eaagri.vn/tts/audio_1726231290.mp3",
  "duration_seconds": 5.4
}
```

#### 🧪 Hướng dẫn kiểm thử (Cách Test)
- **Lệnh cURL:**
```bash
curl -X POST "https://vision.eaagri.vn/api/v1/ai/text-to-speech" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Nhiệt độ hiện tại ba mươi độ C, độ ẩm đất tối ưu.",
    "lang": "vi-VN",
    "voice_gender": "female"
  }'
```
- **Kịch bản kiểm thử (Test Cases):**
  - ✅ **TC-TTS-01 (Sinh file âm thanh thành công):** Trả về `200 OK` kèm `audio_url` dạng file `.mp3` có thể phát nghe trực tiếp.
  - ❌ **TC-TTS-02 (Text rỗng):** Trả về `400 Bad Request` (`"Text content cannot be empty"`).

---

## 7. IoT & Trạm Tưới Thông Minh 3 Lớp (Smart Irrigation & Sensors)

### 7.1 Đẩy dữ liệu cảm biến vi khí hậu & độ ẩm đất (Sensor Ingestion)
- **Method:** `POST` / **MQTT Topic:** `eaagri/stations/{station_id}/telemetry`
- **Endpoint:** `https://iot.eaagri.vn/api/v1/iot/telemetry`
- **Headers:**
  ```http
  Content-Type: application/json
  ```
- **Request Body:**
```json
{
  "station_id": "STATION-DAKLAK-001",
  "timestamp": "2026-09-13T10:15:00Z",
  "soil_moisture": {
    "layer_10cm": 58.5,
    "layer_30cm": 64.2,
    "layer_60cm": 68.0
  },
  "soil_temperature": 26.4,
  "air_temperature": 31.2,
  "air_humidity": 72.0,
  "solar_radiation": 850.0,
  "battery_voltage": 4.12
}
```
- **Response `200 OK`:**
```json
{
  "status": "acknowledged",
  "next_sync_seconds": 60
}
```

#### 🧪 Hướng dẫn kiểm thử (Cách Test)
- **Cấu hình trên Postman:**
  1. Method: `POST`
  2. URL: `https://iot.eaagri.vn/api/v1/iot/telemetry`
  3. Headers: `Content-Type: application/json`
  4. Body: Chọn `raw JSON` và dán gói tin telemetry cảm biến.
- **Lệnh cURL:**
```bash
curl -X POST "https://iot.eaagri.vn/api/v1/iot/telemetry" \
  -H "Content-Type: application/json" \
  -d '{
    "station_id": "STATION-DAKLAK-001",
    "timestamp": "2026-09-13T10:15:00Z",
    "soil_moisture": {
      "layer_10cm": 58.5,
      "layer_30cm": 64.2,
      "layer_60cm": 68.0
    },
    "soil_temperature": 26.4,
    "air_temperature": 31.2,
    "air_humidity": 72.0,
    "solar_radiation": 850.0,
    "battery_voltage": 4.12
  }'
```
- **Kịch bản kiểm thử (Test Cases):**
  - ✅ **TC-IOT-01 (Đẩy chỉ số hợp lệ):** Trả về `200 OK` xác nhận dữ liệu đã được lưu vào time-series database.
  - ❌ **TC-IOT-02 (Thiếu trường station_id):** Trả về `400 Bad Request`.
  - ❌ **TC-IOT-03 (Chỉ số độ ẩm ngoài ngưỡng 0-100%):** Trả về `422 Validation Error`.

---

### 7.2 Lấy trạng thái trạm tưới thời gian thực
- **Method:** `GET`
- **Endpoint:** `https://iot.eaagri.vn/api/v1/iot/stations/{station_id}/status`
- **Headers:** `Content-Type: application/json`
- **Response `200 OK`:**
```json
{
  "station_id": "STATION-DAKLAK-001",
  "is_online": true,
  "pump_state": "OFF",
  "active_valve_zone": null,
  "current_soil_moisture_avg": 63.5,
  "three_layer_rules": {
    "layer_1_biology": { "status": "SATISFIED", "crop_stage": "Nuôi trái non 60 ngày" },
    "layer_2_weather": { "status": "CLEAR", "rain_forecast_12h_mm": 2.5 },
    "layer_3_protection": { "status": "SAFE", "cutoff_threshold_percent": 70.0 }
  }
}
```

#### 🧪 Hướng dẫn kiểm thử (Cách Test)
- **Lệnh cURL:**
```bash
curl -X GET "https://iot.eaagri.vn/api/v1/iot/stations/STATION-DAKLAK-001/status" \
  -H "Content-Type: application/json"
```
- **Kịch bản kiểm thử (Test Cases):**
  - ✅ **TC-IOT-04 (Trạm đang kết nối):** Trả về `200 OK` với `is_online: true`, trạng thái 3 lớp bảo vệ đầy đủ.
  - ❌ **TC-IOT-05 (Station ID không tồn tại):** Trả về `404 Not Found`.

---

### 7.3 Điều khiển máy bơm & van tưới (Pump / Valve Control)
- **Method:** `POST`
- **Endpoint:** `https://iot.eaagri.vn/api/v1/iot/pump/control`
- **Headers:**
  ```http
  Authorization: Bearer {{ACCESS_TOKEN}}
  Content-Type: application/json
  ```
- **Request Body:**
```json
{
  "station_id": "STATION-DAKLAK-001",
  "action": "START",
  "valve_zone": "ZONE_A_RI6",
  "duration_minutes": 25,
  "override_safety": false
}
```
- **Logic kiểm tra 3 lớp an toàn trước khi kích hoạt:**
  - **Lớp 1 (Sinh học):** Phù hợp chu kỳ nước của giai đoạn cây.
  - **Lớp 2 (Môi trường - Pre-emptive Stop):** Tự động từ chối nếu dự báo mưa > 10mm.
  - **Lớp 3 (Bảo vệ ngắt khẩn cấp):** Từ chối nếu độ ẩm đất hiện tại $\ge 70\%$ nhằm chống thối rễ.
- **Response `200 OK` (Khi thỏa mãn 3 lớp an toàn):**
```json
{
  "command_id": "CMD-20260913-9821",
  "status": "EXECUTED",
  "pump_state": "RUNNING",
  "valve_zone": "ZONE_A_RI6",
  "auto_stop_at": "2026-09-13T10:40:00Z"
}
```

#### 🧪 Hướng dẫn kiểm thử (Cách Test)
- **Cấu hình trên Postman:**
  1. Method: `POST`
  2. URL: `https://iot.eaagri.vn/api/v1/iot/pump/control`
  3. Headers: `Authorization: Bearer {{ACCESS_TOKEN}}`, `Content-Type: application/json`
  4. Body: Nhập `action: "START"` hoặc `action: "STOP"`.
- **Lệnh cURL:**
```bash
curl -X POST "https://iot.eaagri.vn/api/v1/iot/pump/control" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "station_id": "STATION-DAKLAK-001",
    "action": "START",
    "valve_zone": "ZONE_A_RI6",
    "duration_minutes": 20,
    "override_safety": false
  }'
```
- **Kịch bản kiểm thử (Test Cases):**
  - ✅ **TC-IOT-06 (Bật bơm thành công):** Các điều kiện an toàn đạt chuẩn $\rightarrow$ Trả về `200 OK` với `pump_state: "RUNNING"`.
  - ❌ **TC-IOT-07 (Từ chối do vi phạm an toàn Lớp 3 - Đất quá ướt):** Nếu độ ẩm $\ge 70\%$ $\rightarrow$ Trả về `422 Unprocessable Entity` với thông báo `"Safety Trigger: Soil moisture exceeds 70%, pump command rejected"`.
  - ❌ **TC-IOT-08 (Chưa xác thực):** Trả về `401 Unauthorized`.

---

### 7.4 Đọc lịch sử đo cảm biến gần nhất (Recent Sensor Logs)
- **Method:** `GET`
- **Endpoint:** `https://iot.eaagri.vn/api/v1/iot/stations/{station_id}/sensors/recent?limit=10`
- **Headers:** `Content-Type: application/json`
- **Response `200 OK`:** Mảng 10 bản ghi đo gần nhất gồm các tầng đất 10cm, 30cm, 60cm và nhiệt độ.

#### 🧪 Hướng dẫn kiểm thử (Cách Test)
- **Lệnh cURL:**
```bash
curl -X GET "https://iot.eaagri.vn/api/v1/iot/stations/STATION-DAKLAK-001/sensors/recent?limit=10" \
  -H "Content-Type: application/json"
```
- **Kịch bản kiểm thử (Test Cases):**
  - ✅ **TC-IOT-09 (Lấy dữ liệu đồ thị):** Trả về `200 OK` danh sách 10 điểm đo mới nhất kèm dấu thời gian.

---

## 8. Dự Báo Giá Thị Trường & Xu Hướng Nông Sản (Market LSTM Model)

### 8.1 Lấy giá nông sản thời gian thực theo khu vực
- **Method:** `GET`
- **Endpoint:** `https://forecast.eaagri.vn/api/v1/market/prices/current`
- **Headers:** `Content-Type: application/json`
- **Query Parameters:**
  - `commodity`: Tên nông sản (`saurieng_ri6`, `saurieng_monthong`, `musang_king`)
  - `region`: Khu vực (`tay_nguyen`, `dong_nam_bo`, `dong_bang_song_cuu_long`)
- **Response `200 OK`:**
```json
{
  "commodity": "saurieng_ri6",
  "region": "Tây Nguyên (Đắk Lắk, Gia Lai)",
  "unit": "VNĐ/kg",
  "updated_at": "2026-09-13T06:00:00Z",
  "prices": {
    "type_1": 88000,
    "type_2": 72000,
    "xo": 48000
  },
  "daily_change_percent": +3.5
}
```

#### 🧪 Hướng dẫn kiểm thử (Cách Test)
- **Cấu hình trên Postman:**
  1. Method: `GET`
  2. URL: `https://forecast.eaagri.vn/api/v1/market/prices/current?commodity=saurieng_ri6&region=tay_nguyen`
  3. Header: `Content-Type: application/json`
- **Lệnh cURL:**
```bash
curl -X GET "https://forecast.eaagri.vn/api/v1/market/prices/current?commodity=saurieng_ri6&region=tay_nguyen" \
  -H "Content-Type: application/json"
```
- **Kịch bản kiểm thử (Test Cases):**
  - ✅ **TC-MKT-01 (Tra cứu giá hợp lệ):** Trả về `200 OK` mức giá Loại 1, Loại 2, Hàng xô theo đúng ngày và vùng địa lý.
  - ❌ **TC-MKT-02 (Tham số nông sản không hợp lệ):** Truyền `commodity=unknown` $\rightarrow$ Trả về `400 Bad Request` (`"Unsupported commodity code"`).

---

### 8.2 Dự báo xu hướng giá ngắn hạn (LSTM 1–7 Ngày)
- **Method:** `GET`
- **Endpoint:** `https://forecast.eaagri.vn/api/v1/market/prices/forecast`
- **Headers:** `Content-Type: application/json`
- **Query Parameters:**
  - `commodity`: `saurieng_monthong` | `saurieng_ri6` | `musang_king`
  - `days`: Số ngày dự báo (`1` đến `7`)
- **Response `200 OK`:**
```json
{
  "commodity": "saurieng_monthong",
  "forecast_engine": "LSTM Time-Series Deep Learning v2.4",
  "confidence_score": 94.8,
  "recommendation": "GIỮ HÀNG — Giá có xu hướng tăng đạt đỉnh sau 4 ngày nữa.",
  "forecast_data": [
    { "date": "2026-09-14", "predicted_price": 105000, "confidence_low": 102000, "confidence_high": 108000 },
    { "date": "2026-09-15", "predicted_price": 108500, "confidence_low": 104500, "confidence_high": 112000 },
    { "date": "2026-09-16", "predicted_price": 112000, "confidence_low": 107000, "confidence_high": 116000 },
    { "date": "2026-09-17", "predicted_price": 115000, "confidence_low": 109000, "confidence_high": 120000 },
    { "date": "2026-09-18", "predicted_price": 114000, "confidence_low": 108000, "confidence_high": 119000 },
    { "date": "2026-09-19", "predicted_price": 110000, "confidence_low": 104000, "confidence_high": 115000 },
    { "date": "2026-09-20", "predicted_price": 108000, "confidence_low": 101000, "confidence_high": 113000 }
  ]
}
```

#### 🧪 Hướng dẫn kiểm thử (Cách Test)
- **Lệnh cURL:**
```bash
curl -X GET "https://forecast.eaagri.vn/api/v1/market/prices/forecast?commodity=saurieng_monthong&days=7" \
  -H "Content-Type: application/json"
```
- **Kịch bản kiểm thử (Test Cases):**
  - ✅ **TC-MKT-03 (Dự báo 7 ngày):** Trả về `200 OK` với mảng 7 phần tử dự báo, khoảng tin cậy `confidence_low`, `confidence_high` và khuyến nghị chiến lược.
  - ❌ **TC-MKT-04 (Vượt quá số ngày cho phép - vd `days=45`):** Trả về `400 Bad Request` (`"Parameter 'days' must be between 1 and 14"`).

---

### 8.3 Lịch sử biến động giá 30 ngày (Price History)
- **Method:** `GET`
- **Endpoint:** `https://forecast.eaagri.vn/api/v1/market/prices/history`
- **Headers:** `Content-Type: application/json`
- **Query Parameters:** `commodity=saurieng_ri6&limit=30`
- **Response `200 OK`:** Mảng 30 điểm giá trong quá khứ phục vụ vẽ biểu đồ Trendline.

#### 🧪 Hướng dẫn kiểm thử (Cách Test)
- **Lệnh cURL:**
```bash
curl -X GET "https://forecast.eaagri.vn/api/v1/market/prices/history?commodity=saurieng_ri6&limit=30" \
  -H "Content-Type: application/json"
```
- **Kịch bản kiểm thử (Test Cases):**
  - ✅ **TC-MKT-05 (Lấy lịch sử thành công):** Trả về `200 OK` mảng các điểm giá 30 ngày.

---

## 9. Truy Xuất Nguồn Gốc & Mã QR Chuỗi Cung Ứng (Traceability System)

### 9.1 Tra cứu mã lô xuất xứ nông sản (Traceability Lookup)
- **Method:** `GET`
- **Endpoint:** `https://www.eaagri.vn/api/v1/traceability/{lot_code}`
- **Quyền truy cập:** Public (Người tiêu dùng quét QR ngoài chợ / siêu thị)
- **Headers:** `Content-Type: application/json`
- **Response `200 OK`:**
```json
{
  "lot_code": "EA-DL-2026-RI6-0042",
  "farm": {
    "name": "Hợp tác xã Nông nghiệp Ea Ktur",
    "location": "Huyện Cư Kuin, Tỉnh Đắk Lắk",
    "vietgap_cert_number": "VG-VN-2026-88992",
    "issue_date": "2026-01-15"
  },
  "crop_info": {
    "variety": "Sầu riêng Ri6 Hạt Lép",
    "planting_year": 2018,
    "harvest_date": "2026-09-12",
    "total_volume_kg": 15000
  },
  "cultivation_log": [
    { "date": "2026-06-01", "activity": "Bón phân hữu cơ sinh học đợt 3" },
    { "date": "2026-07-20", "activity": "Phun phòng trừ rệp sáp bằng dầu khoáng sinh học" },
    { "date": "2026-09-01", "activity": "Kiểm nghiệm tồn dư thuốc BVTV đạt chuẩn 0ppm" }
  ],
  "qr_verification_url": "https://www.eaagri.vn/trace/EA-DL-2026-RI6-0042"
}
```

#### 🧪 Hướng dẫn kiểm thử (Cách Test)
- **Cấu hình trên Postman:**
  1. Method: `GET`
  2. URL: `https://www.eaagri.vn/api/v1/traceability/EA-DL-2026-RI6-0042`
  3. Header: `Content-Type: application/json`
- **Lệnh cURL:**
```bash
curl -X GET "https://www.eaagri.vn/api/v1/traceability/EA-DL-2026-RI6-0042" \
  -H "Content-Type: application/json"
```
- **Kịch bản kiểm thử (Test Cases):**
  - ✅ **TC-TRC-01 (Mã lô hợp lệ):** Trả về `200 OK` đầy đủ thông tin trang trại, chứng chỉ VietGAP và nhật ký canh tác số hóa.
  - ❌ **TC-TRC-02 (Mã lô không tồn tại):** Trả về `404 Not Found` (`"Traceability record not found for code: EA-DL-2026-XXX"`).

---

### 9.2 Xác thực tem QR VietGAP (Verify QR Code)
- **Method:** `GET`
- **Endpoint:** `https://www.eaagri.vn/api/v1/traceability/verify?code={lot_code}`
- **Headers:** `Content-Type: application/json`
- **Response `200 OK`:**
```json
{
  "is_valid": true,
  "lot_code": "EA-DL-2026-RI6-0042",
  "verification_status": "AUTHENTIC_VIETGAP",
  "scan_count": 142,
  "first_scanned_at": "2026-09-12T14:30:00Z"
}
```

#### 🧪 Hướng dẫn kiểm thử (Cách Test)
- **Lệnh cURL:**
```bash
curl -X GET "https://www.eaagri.vn/api/v1/traceability/verify?code=EA-DL-2026-RI6-0042" \
  -H "Content-Type: application/json"
```
- **Kịch bản kiểm thử (Test Cases):**
  - ✅ **TC-TRC-03 (Tem thật, hợp lệ):** Trả về `200 OK` với `is_valid: true`, tình trạng tem chính hãng.
  - ❌ **TC-TRC-04 (Mã tem giả mạo / không khớp chữ ký):** Trả về `200 OK` với `is_valid: false` và cảnh báo tem không có trên hệ thống VietGAP.

---

## 10. Bảng Mã Lỗi & HTTP Status Codes

| Mã HTTP | Tên lỗi | Mô tả chi tiết & Cách xử lý |
| :--- | :--- | :--- |
| `200 OK` | Thành công | Yêu cầu được xử lý thành công. |
| `201 Created` | Đã tạo | Bản ghi mới đã được tạo thành công trên hệ thống. |
| `204 No Content` | Thành công không có nội dung | Thực hiện thành công thao tác (Xóa, Đăng xuất, Cập nhật). |
| `400 Bad Request` | Yêu cầu không hợp lệ | Thiếu tham số bắt buộc hoặc định dạng JSON/FormData sai. |
| `401 Unauthorized` | Chưa xác thực | Chưa truyền Access Token hoặc Token đã hết hạn / không hợp lệ. |
| `403 Forbidden` | Không có quyền | Tài khoản không có quyền thao tác (Ví dụ: user bình thường gọi API của SA). |
| `404 Not Found` | Không tìm thấy | Bản ghi hoặc đường dẫn API không tồn tại. |
| `429 Too Many Requests`| Vượt quá giới hạn gọi | Vượt quá số lượt hỏi AI cho phép đối với tài khoản miễn phí (Free Tier). |
| `500 Internal Server Error` | Lỗi máy chủ | Lỗi nội bộ tại Backend Gateway hoặc kết nối cơ sở dữ liệu. |
| `503 Service Unavailable` | Dịch vụ gián đoạn | Máy chủ AI hoặc trạm IoT đang bảo trì hoặc mất kết nối mạng. |

---

<div align="center">
  <p><b>EaAgri API Documentation</b> • Bản quyền © 2026 EaAgri Team.</p>
  <p>Mọi thắc mắc kỹ thuật vui lòng gửi về: <a href="mailto:eaagri@eaagri.id.vn">eaagri@eaagri.id.vn</a></p>
</div>
