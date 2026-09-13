# 🌾 EaAgri — Tài Liệu Đặc Tả Toàn Bộ Hệ Thống API (API Specification Document)

> **Dự án:** Hệ Sinh Thái Nông Nghiệp Thông Minh EaAgri (Digital Farming System)  
> **Phiên bản tài liệu:** 1.0.0  
> **Ngày cập nhật:** 2026-09-13  
> **Đơn vị phát triển:** EaAgri Team — Trường Đại học Nguyễn Tất Thành  

---

## 📑 Mục Lục
1. [Tổng Quan & Cấu Hình Môi Trường](#1-tổng-quan--cấu-hình-môi-trường)
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
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
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

## 2. Xác Thực & Quản Trị Người Dùng (Authentication & Profiles)

### 2.1 Đăng ký tài khoản (Sign Up)
- **Method:** `POST`
- **Endpoint:** `/auth/v1/signup`
- **Quyền truy cập:** Public
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
- **Response `200 OK`:**
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

---

### 2.2 Đăng nhập (Sign In)
- **Method:** `POST`
- **Endpoint:** `/auth/v1/token?grant_type=password`
- **Quyền truy cập:** Public
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

---

### 2.3 Đăng xuất (Sign Out)
- **Method:** `POST`
- **Endpoint:** `/auth/v1/logout`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Response `204 No Content`**

---

### 2.4 Lấy danh sách tài khoản (Super Admin only)
- **Method:** `GET`
- **Endpoint:** `/rest/v1/profiles?select=*&order=created_at.desc`
- **Headers:** `Authorization: Bearer <SA_TOKEN>`
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

---

### 2.5 Cập nhật vai trò tài khoản (Change User Role)
- **Method:** `PATCH`
- **Endpoint:** `/rest/v1/profiles?id=eq.{user_id}`
- **Headers:** `Authorization: Bearer <SA_TOKEN>`
- **Request Body:**
```json
{
  "role": "SA"
}
```
- **Response `200 OK` / `204 No Content`**

---

## 3. Quản Lý Tin Tức & Tri Thức Nông Nghiệp (News & Articles)

### 3.1 Lấy danh sách tin tức (Public & Filterable)
- **Method:** `GET`
- **Endpoint:** `/rest/v1/news?select=*&order=created_at.desc`
- **Query Parameters:**
  - `category=eq.{category_name}`: Lọc theo chuyên mục (`Kỹ thuật`, `Tin tức`, `Thị trường`, `Thời tiết`, `Sinh học`, `Bền vững`)
  - `limit={number}`: Giới hạn số lượng bài viết (ví dụ: `limit=10`)
  - `offset={number}`: Phân trang bài viết (ví dụ: `offset=0`)
  - `title=ilike.*{keyword}*`: Tìm kiếm theo tiêu đề bài viết
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

---

### 3.2 Lấy chi tiết bài viết theo ID
- **Method:** `GET`
- **Endpoint:** `/rest/v1/news?id=eq.{id}&select=*`
- **Response `200 OK`:** Trả về một mảng chứa 1 bài viết chi tiết hoặc mã lỗi `404` nếu không tìm thấy.

---

### 3.3 Đăng bài viết mới (Super Admin only)
- **Method:** `POST`
- **Endpoint:** `/rest/v1/news`
- **Headers:** `Authorization: Bearer <SA_TOKEN>`
- **Request Body:**
```json
{
  "title": "Dự báo giá sầu riêng Monthong tuần tới: Xu hướng tăng nhẹ",
  "content": "<p>Nhu cầu xuất khẩu sang thị trường Trung Quốc duy trì ở mức cao...</p>",
  "author": "Phan Đăng Huy",
  "category": "Thị trường",
  "image_url": "https://<project-ref>.supabase.co/storage/v1/object/public/news-images/1726231200_market.jpg#pos=48,52",
  "created_at": "2026-09-13T10:00:00.000Z"
}
```
- **Response `201 Created`**

---

### 3.4 Chỉnh sửa bài viết
- **Method:** `PATCH`
- **Endpoint:** `/rest/v1/news?id=eq.{id}`
- **Headers:** `Authorization: Bearer <SA_TOKEN>`
- **Request Body:**
```json
{
  "title": "Tiêu đề cập nhật mới",
  "content": "<p>Nội dung sau khi chỉnh sửa...</p>",
  "category": "Kỹ thuật",
  "image_url": "https://...#pos=50,50"
}
```
- **Response `200 OK` / `204 No Content`**

---

### 3.5 Xóa bài viết
- **Method:** `DELETE`
- **Endpoint:** `/rest/v1/news?id=eq.{id}`
- **Headers:** `Authorization: Bearer <SA_TOKEN>`
- **Response `204 No Content`**

---

## 4. Lưu Trữ Tệp Tin & Hình Ảnh (Storage Service)

### 4.1 Tải lên ảnh tin tức (Upload Article Image)
- **Method:** `POST`
- **Endpoint:** `/storage/v1/object/news-images/{fileName}`
- **Headers:**
  - `Authorization: Bearer <TOKEN>`
  - `Content-Type: image/jpeg` | `image/png` | `image/webp`
- **Request Body:** Binary data của ảnh
- **Response `200 OK`:**
```json
{
  "Key": "news-images/1726231200000_ri6.jpg"
}
```

---

### 4.2 Lấy đường dẫn công khai (Get Public URL)
- **Method:** `GET`
- **Endpoint:** `/storage/v1/object/public/news-images/{fileName}`
- **Response:** File ảnh định dạng binary/stream trực tiếp.

---

## 5. AI Chatbot & RAG Tri Thức VietGAP (Dual-Brain Gateway)

### 5.1 Gửi tin nhắn hỏi đáp AI (AI Chat Query)
- **Method:** `POST`
- **Endpoint:** `${VITE_API_CHATBOT_URL}` (ví dụ: `https://api-ai.eaagri.vn/chat`)
- **Headers:**
  - `Content-Type: application/json`
  - `ngrok-skip-browser-warning: true`
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
- **Tham số hỗ trợ `model_provider`:** `gemini` (Gemini 2.0 Flash / Pro), `ollama`, `deepseek`.
- **Response `200 OK`:**
```json
{
  "answer": "Hiện tượng lá sầu riêng xuất hiện đốm vàng rồi rụng hàng loạt thường do nấm **Phytophthora palmivora** gây ra hoặc do thiếu hụt vi lượng Magie kết hợp úng rễ.\n\n### Phác đồ xử lý chuẩn VietGAP:\n1. **Cách ly & Vệ sinh:** Gom tiêu hủy toàn bộ lá bệnh rụng quanh gốc.\n2. **Kiểm tra độ ẩm đất:** Đảm bảo độ ẩm dưới 70%, dừng tưới nếu đất còn ướt.\n3. **Xử lý thuốc sinh học:** Phun luân phiên hoạt chất Metalaxyl-M hoặc Phosphonate sinh học.\n4. **Bồi dưỡng rễ:** Tưới chế phẩm Trichoderma sau 7 ngày xử lý nấm.",
  "context_used": "Tài liệu VietGAP sầu riêng 2026 — Quy trình phòng trừ bệnh Phytophthora trang 45-48."
}
```

---

### 5.2 Lịch sử trò chuyện người dùng (Chat History Database)
- **Lấy lịch sử:**
  - `GET /rest/v1/chat_history?user_id=eq.{user_id}&order=created_at.asc`
- **Lưu tin nhắn:**
  - `POST /rest/v1/chat_history`
  - **Body:**
  ```json
  {
    "user_id": "7f654321-abcd-ef01-2345-6789abcdef01",
    "role": "user",
    "content": "Làm thế nào để chặn đọt sầu riêng?"
  }
  ```

---

## 6. Thị Giác Máy Tính & Chẩn Đoán Bệnh Cây Trồng (AI Computer Vision - YOLOv9)

### 6.1 Quét & Chẩn đoán bệnh trên lá / quả sầu riêng (Disease Scanner)
- **Method:** `POST`
- **Endpoint:** `/api/v1/ai/diagnose-disease`
- **Headers:**
  - `Content-Type: multipart/form-data`
  - `Authorization: Bearer <TOKEN>`
- **Request Body (FormData):**
  - `image`: File ảnh lá hoặc quả sầu riêng chụp từ vườn (`.jpg`, `.png`).
  - `mode`: `"overall"` | `"flesh"` | `"disease"`
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

---

### 6.2 Chuyển đổi giọng nói đa phương thức (Text-to-Speech gTTS)
- **Method:** `POST`
- **Endpoint:** `/api/v1/ai/text-to-speech`
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

---

## 7. IoT & Trạm Tưới Thông Minh 3 Lớp (Smart Irrigation & Sensors)

### 7.1 Đẩy dữ liệu cảm biến vi khí hậu & độ ẩm đất (Sensor Ingestion)
- **Method:** `POST` / **MQTT Topic:** `eaagri/stations/{station_id}/telemetry`
- **Endpoint:** `/api/v1/iot/telemetry`
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

---

### 7.2 Lấy trạng thái trạm tưới thời gian thực
- **Method:** `GET`
- **Endpoint:** `/api/v1/iot/stations/{station_id}/status`
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

---

### 7.3 Điều khiển máy bơm & van tưới (Pump / Valve Control)
- **Method:** `POST`
- **Endpoint:** `/api/v1/iot/pump/control`
- **Headers:** `Authorization: Bearer <TOKEN>`
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
- **Response `200 OK`:**
```json
{
  "command_id": "CMD-20260913-9821",
  "status": "EXECUTED",
  "pump_state": "RUNNING",
  "valve_zone": "ZONE_A_RI6",
  "auto_stop_at": "2026-09-13T10:40:00Z"
}
```

---

## 8. Dự Báo Giá Thị Trường & Xu Hướng Nông Sản (Market LSTM Model)

### 8.1 Lấy giá nông sản thời gian thực theo khu vực
- **Method:** `GET`
- **Endpoint:** `/api/v1/market/prices/current`
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

---

### 8.2 Dự báo xu hướng giá ngắn hạn (LSTM 1–7 Ngày)
- **Method:** `GET`
- **Endpoint:** `/api/v1/market/prices/forecast`
- **Query Parameters:**
  - `commodity`: `saurieng_monthong`
  - `days`: `7`
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

---

## 9. Truy Xuất Nguồn Gốc & Mã QR Chuỗi Cung Ứng (Traceability System)

### 9.1 Tra cứu mã lô xuất xứ nông sản (Traceability Lookup)
- **Method:** `GET`
- **Endpoint:** `/api/v1/traceability/{lot_code}`
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
