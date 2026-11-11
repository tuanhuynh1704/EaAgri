# EaAgri — Security setup (bắt buộc sau khi deploy)

Các file SQL trong thư mục này sửa các lỗi bảo mật ở tầng Supabase (RLS).
**Phải chạy trên đúng project Supabase đang dùng cho production**, không chỉ chạy local.

## 1. Thứ tự chạy SQL

Mở Supabase Dashboard → SQL Editor → New query, chạy lần lượt:

1. `supabase/profiles.sql` — chặn ACC-01 / UI-07
2. `supabase/cooperation_requests.sql` — sửa COOP-01
3. `supabase/visitor_logs.sql` — sửa VISIT-07 / VISIT-08

Mỗi file đều dùng `CREATE TABLE IF NOT EXISTS`, `CREATE OR REPLACE FUNCTION`,
`DROP POLICY IF EXISTS` nên có thể chạy lại an toàn. Không đổi thứ tự vì cả ba
file cùng dùng hàm `public.is_admin_or_sa()`.

## 2. Biến môi trường trên production (Vercel)

Thêm các biến sau trong Project → Settings → Environment Variables:

| Biến | Ghi chú |
| --- | --- |
| `ADMIN_USERNAME` | Tên đăng nhập quản trị, mặc định `admin` |
| `ADMIN_EMAIL` | Email hiển thị của quản trị, mặc định `admin@eaagri.vn` |
| `ADMIN_PASSWORD` | **Bắt buộc đặt** trên production; tài khoản env-admin bị tắt nếu để trống |
| `ADMIN_SESSION_SECRET` | Chuỗi ngẫu nhiên ≥ 32 ký tự, dùng ký token admin |
| `SUPABASE_SERVICE_ROLE_KEY` | Khuyến nghị mạnh: cho phép API admin đọc/xóa visitor logs trên Supabase |

`VITE_ADMIN_USERNAME`, `VITE_ADMIN_EMAIL`, `VITE_ADMIN_PASSWORD` vẫn được đọc
làm phương án tương thích, nhưng nên chuyển sang các biến `ADMIN_*` ở trên.
Không còn mật khẩu admin nào được nhúng vào bundle client.

Nếu không đặt `ADMIN_SESSION_SECRET`, server sẽ suy ra khóa ký từ
`SUPABASE_SERVICE_ROLE_KEY`. Nếu thiếu cả hai, `/api/admin-login` trả 503 trên
production để tránh dùng khóa mặc định ai cũng biết.

`SUPABASE_SERVICE_ROLE_KEY` cũng là cách để tài khoản env-admin xem và xóa dữ liệu
visitor logs thật trên Supabase sau khi RLS đã chặn anon. Nếu không đặt biến này,
admin env vẫn dùng được dữ liệu JSON cục bộ nhưng sẽ không thấy dữ liệu Supabase.

Sau khi đổi biến môi trường, redeploy để serverless function nhận giá trị mới.

## 3. Kiểm tra nhanh sau khi chạy SQL

Thay `SUPABASE_URL` và `ANON_KEY` bằng giá trị trong `.env.local`:

```bash
# ACC-01: phải bị chặn (401/403/permission denied), không trả email
curl -i "$SUPABASE_URL/rest/v1/profiles?select=*" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY"

# COOP-01: phải trả 201
curl -i -X POST "$SUPABASE_URL/rest/v1/cooperation_requests" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Khách thử","phone":"0901234567"}'

# COOP-01: anon KHÔNG được đọc danh sách yêu cầu (phải trả 0 dòng)
curl -i "$SUPABASE_URL/rest/v1/cooperation_requests?select=*" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY"

# VISIT-07/08: phải trả 401 nếu không có token admin
curl -i -X DELETE "https://www.eaagri.vn/api/visitor-track"
curl -i -X DELETE "https://www.eaagri.vn/api/visitor-track?type=sample"

# VISIT-07/08 (tầng DB): anon không được đọc/xóa visitor logs
curl -i "$SUPABASE_URL/rest/v1/visitor_logs?select=*" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY"

# Tracking vẫn hoạt động qua RPC SECURITY DEFINER (không lộ PII)
curl -i -X POST "$SUPABASE_URL/rest/v1/rpc/upsert_visitor_log" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"p_payload":{"device_id":"dev_selftest","ip_address":"1.2.3.4","device_type":"Desktop","os":"Windows","browser":"Chrome"}}'
```

Đăng nhập admin trên web phải đi qua `/api/admin-login`. Nếu API này chưa được
deploy (hosting tĩnh), nút đăng nhập env-admin sẽ không hoạt động; khi đó dùng
tài khoản Supabase Auth có role `SA`/`admin`.

## 3.1. Sau khi chạy `visitor_logs.sql`

Anon **không còn** quyền đọc/ghi trực tiếp hai bảng `visitor_logs` và
`visitor_history_logs`. Toàn bộ tracking đi qua các RPC `SECURITY DEFINER`:

| RPC | Công dụng |
| --- | --- |
| `upsert_visitor_log(jsonb)` | Ghi/nhật lượt truy cập, trả về `visit_count` + `first_visit` |
| `record_visitor_history(jsonb)` | Ghi 1 dòng vào lịch sử truy cập |
| `touch_visitor_log(text, text)` | Heartbeat (giữ online) |
| `mark_visitor_offline(text)` | Đánh dấu rời trang |
| `get_device_visit_stats(text)` | Đếm lượt truy cập (không lộ PII) |

Các RPC này chỉ chạm đúng dòng của thiết bị gửi lên — không đọc được dữ liệu
của thiết bị khác. Chỉ SA/admin mới `SELECT` / `DELETE` được bảng gốc.

## 3.2. Về cột `submitted_xid` trong `cooperation_requests`

PostgREST mặc định thêm `RETURNING *` cho POST. PostgreSQL chỉ trả về dòng vừa
chèn nếu dòng đó **nhìn thấy được** theo policy `SELECT` — nếu không, POST trả
lỗi `new row violates row-level security policy` dù policy `INSERT` đã cho phép.
Đây chính là nguyên nhân gốc của lỗi COOP-01.

Cách xử lý trong `cooperation_requests.sql`:

- Trigger `stamp_submission_xid` ghi `txid_current()` vào cột `submitted_xid`
  khi khách gửi yêu cầu.
- Policy `cooperation_requests_anon_select` cho phép anon/authenticated thấy
  **đúng yêu cầu vừa gửi trong giao dịch hiện tại**
  (`submitted_xid = txid_current()`).
- Nhờ vậy POST trả `201` kèm bản ghi vừa gửi, nhưng mọi request sau đó vẫn
  **không đọc được** danh sách yêu cầu (PII: họ tên, SĐT, email).

Không tự ý thêm cột `submitted_xid` vào payload của form — anon không có quyền
ghi cột này (đã kiểm tra: `permission denied`).

## 4. Về các lỗi PROD-04 / PROD-05 / PROD-06

Ba lỗi này chỉ hết sau khi **deploy nhánh hiện tại (`master`) lên production**:

- PROD-04: `RoadmapSection` (Lộ trình phát triển + form hợp tác) đã có trong
  `HomePage`; production cũ chưa có.
- PROD-05: `VisitorTracker` gọi `/api/visitor-track` đã có trong `App`; production
  cũ chưa deploy.
- PROD-06: `AIChat` đã được render trong `HomePage` (lazy-load); production cũ
  chưa có widget chat.

Sau khi deploy, mở production và kiểm tra: cuộn tới khu vực "Trợ lý AI Nông nghiệp",
mở DevTools → Network thấy request `/api/visitor-track`, và form hợp tác gửi được.
