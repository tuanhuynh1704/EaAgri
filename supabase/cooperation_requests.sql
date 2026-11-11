-- =======================================================
-- EAAGRI — COOPERATION REQUESTS RLS (fix COOP-01)
-- Chạy SAU file supabase/profiles.sql trong Supabase SQL Editor.
--
-- Vấn đề: anonymous gửi form hợp tác bị 401/RLS chặn, trong khi
-- frontend vẫn báo "Gửi thành công".
--
-- Sau migration này:
--   * anon/authenticated chỉ được INSERT yêu cầu mới với dữ liệu hợp lệ
--   * không được đọc, sửa, xóa danh sách yêu cầu
--   * chỉ SA/admin được SELECT / UPDATE / DELETE
-- =======================================================

-- 1. Bảng cooperation_requests
CREATE TABLE IF NOT EXISTS public.cooperation_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    organization TEXT,
    cooperation_type TEXT NOT NULL DEFAULT 'Hợp tác xã / Tổ hợp tác nông nghiệp',
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'negotiating', 'partnered', 'cancelled')),
    notes TEXT,
    submitted_xid BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bổ sung cột nếu bảng đã tồn tại từ phiên bản cũ
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'cooperation_requests' AND column_name = 'notes') THEN
        ALTER TABLE public.cooperation_requests ADD COLUMN notes TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'cooperation_requests' AND column_name = 'updated_at') THEN
        ALTER TABLE public.cooperation_requests ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'cooperation_requests' AND column_name = 'submitted_xid') THEN
        ALTER TABLE public.cooperation_requests ADD COLUMN submitted_xid BIGINT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_coop_requests_status ON public.cooperation_requests(status);
CREATE INDEX IF NOT EXISTS idx_coop_requests_created_at ON public.cooperation_requests(created_at DESC);

-- 2. Helper quyền quản trị (dùng chung với profiles.sql)
CREATE OR REPLACE FUNCTION public.is_admin_or_sa()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
          AND lower(COALESCE(role, '')) IN
              ('sa', 'admin', 'administrator', 'superadmin', 'super_admin')
    );
$$;

REVOKE ALL ON FUNCTION public.is_admin_or_sa() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin_or_sa() TO authenticated;

-- 3. Trigger cập nhật updated_at
CREATE OR REPLACE FUNCTION public.set_cooperation_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_cooperation_updated_at ON public.cooperation_requests;
CREATE TRIGGER set_cooperation_updated_at
BEFORE UPDATE ON public.cooperation_requests
FOR EACH ROW
EXECUTE FUNCTION public.set_cooperation_updated_at();

-- 4. Bật RLS và xóa toàn bộ policy cũ
ALTER TABLE public.cooperation_requests ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'cooperation_requests'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.cooperation_requests', pol.policyname);
    END LOOP;
END $$;

-- 5. Policy mới
-- Cho phép khách gửi yêu cầu, nhưng chỉ với dữ liệu hợp lệ và trạng thái pending.
CREATE POLICY "cooperation_requests_public_insert"
ON public.cooperation_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (
    length(btrim(full_name)) BETWEEN 2 AND 200
    AND length(btrim(phone)) BETWEEN 8 AND 30
    AND (email IS NULL OR email = '' OR (position('@' IN email) > 1 AND length(email) <= 320))
    AND (organization IS NULL OR length(organization) <= 300)
    AND (message IS NULL OR length(message) <= 5000)
    AND status = 'pending'
);

-- Trigger đánh dấu xid của giao dịch đã gửi.
--
-- LÝ DO: PostgREST mặc định thêm "RETURNING *" cho POST. PostgreSQL chỉ
-- trả về dòng vừa chèn nếu dòng đó "nhìn thấy được" theo policy SELECT.
-- Nếu anon không có policy SELECT nào, POST sẽ trả lỗi
-- "new row violates row-level security policy" dù INSERT đã được phép.
--
-- Giải pháp: policy SELECT của anon chỉ cho phép thấy dòng mà CHÍNH
-- giao dịch hiện tại vừa tạo (submitted_xid = txid_current()). Nhờ vậy:
--   * POST trả về 201 với đúng bản ghi vừa gửi  -> COOP-01 PASS
--   * Mọi request sau đó của khách vẫn KHÔNG đọc được danh sách yêu cầu
CREATE OR REPLACE FUNCTION public.stamp_submission_xid()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.submitted_xid := txid_current();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS stamp_submission_xid ON public.cooperation_requests;
CREATE TRIGGER stamp_submission_xid
BEFORE INSERT ON public.cooperation_requests
FOR EACH ROW
EXECUTE FUNCTION public.stamp_submission_xid();

-- Chỉ thấy được đúng yêu cầu mình vừa gửi trong giao dịch hiện tại.
-- Áp dụng cho cả anon lẫn authenticated (người đã đăng nhập nhưng không
-- phải admin cũng phải gửi được form công khai).
CREATE POLICY "cooperation_requests_anon_select"
ON public.cooperation_requests
FOR SELECT
TO anon, authenticated
USING (submitted_xid = txid_current());

-- Chỉ SA/admin được đọc danh sách yêu cầu (chứa PII: tên, SĐT, email).
CREATE POLICY "cooperation_requests_admin_select"
ON public.cooperation_requests
FOR SELECT
TO authenticated
USING (public.is_admin_or_sa());

CREATE POLICY "cooperation_requests_admin_update"
ON public.cooperation_requests
FOR UPDATE
TO authenticated
USING (public.is_admin_or_sa())
WITH CHECK (public.is_admin_or_sa());

CREATE POLICY "cooperation_requests_admin_delete"
ON public.cooperation_requests
FOR DELETE
TO authenticated
USING (public.is_admin_or_sa());

-- 6. Quyền bảng
REVOKE ALL ON public.cooperation_requests FROM anon;
REVOKE ALL ON public.cooperation_requests FROM authenticated;
REVOKE ALL ON public.cooperation_requests FROM PUBLIC;

-- Anon chỉ được ghi các cột của biểu mẫu, không được đặt id/created_at/notes.
GRANT INSERT (
    full_name,
    phone,
    email,
    organization,
    cooperation_type,
    message,
    status
) ON public.cooperation_requests TO anon;

-- PostgREST mặc định thêm "RETURNING *" cho POST. PostgreSQL yêu cầu quyền
-- SELECT cho các cột được trả về, nếu thiếu sẽ trả lỗi "permission denied
-- for table cooperation_requests" dù RLS đã cho phép INSERT. Vì vậy anon
-- cần quyền SELECT — nhưng RLS vẫn giới hạn: policy
-- cooperation_requests_anon_select chỉ cho thấy dòng của chính giao dịch
-- hiện tại, và không có policy nào cho phép đọc danh sách yêu cầu.
GRANT SELECT ON public.cooperation_requests TO anon;

-- Người đã đăng nhập (kể cả không phải admin) cũng gửi được form công khai.
-- RLS vẫn giới hạn: policy anon_select chỉ cho thấy dòng của chính giao dịch
-- hiện tại, policy admin_select mới cho đọc toàn bộ danh sách.
GRANT INSERT ON public.cooperation_requests TO authenticated;
GRANT SELECT, UPDATE, DELETE ON public.cooperation_requests TO authenticated;
GRANT ALL ON public.cooperation_requests TO service_role;

-- 7. Kiểm tra nhanh sau khi chạy:
--    SET ROLE anon;
--    INSERT INTO public.cooperation_requests (full_name, phone)
--    VALUES ('Khách thử', '0901234567') RETURNING *;   -- phải thành công, trả 1 dòng
--    SELECT * FROM public.cooperation_requests;        -- giao dịch MỚI phải trả 0 dòng
