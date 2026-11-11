-- =======================================================
-- EAAGRI — VISITOR LOGS RLS HARDENING (fix VISIT-07 / VISIT-08)
-- Chạy SAU file supabase/profiles.sql trong Supabase SQL Editor.
--
-- Vấn đề: policy "FOR ALL" cho phép anonymous đọc toàn bộ IP/email
-- và xóa dữ liệu visitor logs.
--
-- Sau migration này:
--   * anon chỉ được ghi/ cập nhật lượt truy cập, KHÔNG đọc được bảng
--     (không thấy IP, email, tên, user_id của bất kỳ ai)
--   * chỉ SA/admin được đọc đầy đủ và xóa log
--   * RPC get_device_visit_stats chỉ trả visit_count + first_visit
-- =======================================================

-- 1. Bảng visitor_logs (Device & Aggregated Traffic)
CREATE TABLE IF NOT EXISTS public.visitor_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id TEXT NOT NULL UNIQUE,
    ip_address TEXT NOT NULL,
    city TEXT DEFAULT 'Không xác định',
    region TEXT DEFAULT 'Việt Nam',
    country TEXT DEFAULT 'Việt Nam',
    device_type TEXT NOT NULL DEFAULT 'Desktop',
    os TEXT DEFAULT 'Windows',
    browser TEXT DEFAULT 'Chrome',
    screen_resolution TEXT DEFAULT '1920x1080',
    visit_count INTEGER NOT NULL DEFAULT 1,
    last_path TEXT DEFAULT '/',
    referrer TEXT DEFAULT 'Trực tiếp (Direct)',
    is_online BOOLEAN NOT NULL DEFAULT true,
    first_visit TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_visit TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_real BOOLEAN NOT NULL DEFAULT true,
    is_bot BOOLEAN NOT NULL DEFAULT false,
    is_authenticated BOOLEAN NOT NULL DEFAULT false,
    user_id TEXT,
    user_email TEXT,
    user_name TEXT,
    user_role TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bổ sung cột nếu bảng đã tồn tại từ phiên bản cũ
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'visitor_logs' AND column_name = 'is_real') THEN
        ALTER TABLE public.visitor_logs ADD COLUMN is_real BOOLEAN NOT NULL DEFAULT true;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'visitor_logs' AND column_name = 'is_bot') THEN
        ALTER TABLE public.visitor_logs ADD COLUMN is_bot BOOLEAN NOT NULL DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'visitor_logs' AND column_name = 'is_authenticated') THEN
        ALTER TABLE public.visitor_logs ADD COLUMN is_authenticated BOOLEAN NOT NULL DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'visitor_logs' AND column_name = 'user_id') THEN
        ALTER TABLE public.visitor_logs ADD COLUMN user_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'visitor_logs' AND column_name = 'user_email') THEN
        ALTER TABLE public.visitor_logs ADD COLUMN user_email TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'visitor_logs' AND column_name = 'user_name') THEN
        ALTER TABLE public.visitor_logs ADD COLUMN user_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'visitor_logs' AND column_name = 'user_role') THEN
        ALTER TABLE public.visitor_logs ADD COLUMN user_role TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'visitor_logs' AND column_name = 'updated_at') THEN
        ALTER TABLE public.visitor_logs ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
    END IF;
END $$;

-- 2. Bảng visitor_history_logs (Detailed access timeline)
CREATE TABLE IF NOT EXISTS public.visitor_history_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    city TEXT DEFAULT 'Không xác định',
    region TEXT DEFAULT 'Việt Nam',
    country TEXT DEFAULT 'Việt Nam',
    device_type TEXT NOT NULL DEFAULT 'Desktop',
    os TEXT DEFAULT 'Windows',
    browser TEXT DEFAULT 'Chrome',
    path TEXT NOT NULL DEFAULT '/',
    referrer TEXT DEFAULT 'Trực tiếp (Direct)',
    action TEXT NOT NULL DEFAULT 'pageview',
    is_authenticated BOOLEAN NOT NULL DEFAULT false,
    user_id TEXT,
    user_email TEXT,
    user_name TEXT,
    user_role TEXT,
    is_real BOOLEAN NOT NULL DEFAULT true,
    is_bot BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'visitor_history_logs' AND column_name = 'is_bot') THEN
        ALTER TABLE public.visitor_history_logs ADD COLUMN is_bot BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_visitor_logs_last_visit ON public.visitor_logs(last_visit DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_ip ON public.visitor_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_device_id ON public.visitor_logs(device_id);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_is_online ON public.visitor_logs(is_online);

CREATE INDEX IF NOT EXISTS idx_visitor_history_created_at ON public.visitor_history_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_history_device_id ON public.visitor_history_logs(device_id);
CREATE INDEX IF NOT EXISTS idx_visitor_history_ip ON public.visitor_history_logs(ip_address);

-- 4. Helper quyền quản trị (dùng chung với profiles.sql)
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

-- 5. Bật RLS và xóa toàn bộ policy cũ (đặc biệt là policy FOR ALL)
ALTER TABLE public.visitor_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_history_logs ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename IN ('visitor_logs', 'visitor_history_logs')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- 6. Policy mới cho visitor_logs
-- Widget tracking đi qua các RPC SECURITY DEFINER bên dưới, nên anon KHÔNG
-- cần quyền trực tiếp trên bảng (kể cả INSERT/UPDATE).
--  * Không có policy SELECT cho anon: khách không đọc được IP/email của ai.
--  * Chỉ SA/admin được đọc đầy đủ và xóa log.
CREATE POLICY "visitor_logs_admin_select"
ON public.visitor_logs
FOR SELECT
TO authenticated
USING (public.is_admin_or_sa());

-- Chỉ SA/admin được xóa.
CREATE POLICY "visitor_logs_admin_delete"
ON public.visitor_logs
FOR DELETE
TO authenticated
USING (public.is_admin_or_sa());

-- 7. Policy mới cho visitor_history_logs
CREATE POLICY "visitor_history_admin_select"
ON public.visitor_history_logs
FOR SELECT
TO authenticated
USING (public.is_admin_or_sa());

CREATE POLICY "visitor_history_admin_delete"
ON public.visitor_history_logs
FOR DELETE
TO authenticated
USING (public.is_admin_or_sa());

-- 8. Quyền bảng & quyền cột
-- Anon: không có quyền trực tiếp, chỉ gọi RPC tracking.
REVOKE ALL ON public.visitor_logs FROM anon;
REVOKE ALL ON public.visitor_history_logs FROM anon;
REVOKE ALL ON public.visitor_logs FROM PUBLIC;
REVOKE ALL ON public.visitor_history_logs FROM PUBLIC;

-- Authenticated: quyền bảng đầy đủ nhưng RLS chỉ cho SA/admin đọc/xóa.
REVOKE ALL ON public.visitor_logs FROM authenticated;
REVOKE ALL ON public.visitor_history_logs FROM authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.visitor_logs TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.visitor_history_logs TO authenticated;

GRANT ALL ON public.visitor_logs TO service_role;
GRANT ALL ON public.visitor_history_logs TO service_role;

-- 9. RPC tracking (SECURITY DEFINER) — anon ghi lượt truy cập mà không cần
--    quyền đọc bảng. Chỉ ghi/cập nhật đúng dòng của chính thiết bị gửi lên.
CREATE OR REPLACE FUNCTION public.upsert_visitor_log(p_payload JSONB)
RETURNS TABLE (visit_count INTEGER, first_visit TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_device_id TEXT := COALESCE(p_payload->>'device_id', '');
    v_visit_count INTEGER;
    v_first_visit TIMESTAMPTZ;
BEGIN
    IF length(btrim(v_device_id)) < 3 THEN
        RAISE EXCEPTION 'device_id khong hop le';
    END IF;

    SELECT vl.visit_count, vl.first_visit
    INTO v_visit_count, v_first_visit
    FROM public.visitor_logs vl
    WHERE vl.device_id = v_device_id
    LIMIT 1;

    IF v_visit_count IS NULL THEN
        v_visit_count := 1;
        v_first_visit := COALESCE((p_payload->>'first_visit')::timestamptz, now());

        INSERT INTO public.visitor_logs (
            device_id, ip_address, city, region, country, device_type, os, browser,
            screen_resolution, visit_count, last_path, referrer, is_online,
            first_visit, last_visit, is_real, is_bot, is_authenticated,
            user_id, user_email, user_name, user_role
        ) VALUES (
            v_device_id,
            COALESCE(p_payload->>'ip_address', '127.0.0.1'),
            COALESCE(p_payload->>'city', 'Không xác định'),
            COALESCE(p_payload->>'region', 'Việt Nam'),
            COALESCE(p_payload->>'country', 'Việt Nam'),
            COALESCE(p_payload->>'device_type', 'Desktop'),
            COALESCE(p_payload->>'os', 'Khác'),
            COALESCE(p_payload->>'browser', 'Chrome'),
            COALESCE(p_payload->>'screen_resolution', '1920x1080'),
            1,
            COALESCE(p_payload->>'last_path', '/'),
            COALESCE(p_payload->>'referrer', 'Trực tiếp (Direct)'),
            true,
            v_first_visit,
            now(),
            COALESCE((p_payload->>'is_real')::boolean, true),
            false,
            COALESCE((p_payload->>'is_authenticated')::boolean, false),
            p_payload->>'user_id',
            p_payload->>'user_email',
            p_payload->>'user_name',
            p_payload->>'user_role'
        )
        ON CONFLICT (device_id) DO NOTHING;
    ELSE
        v_visit_count := v_visit_count + 1;

        UPDATE public.visitor_logs vl
        SET
            visit_count = v_visit_count,
            ip_address = COALESCE(p_payload->>'ip_address', vl.ip_address),
            city = COALESCE(p_payload->>'city', vl.city),
            region = COALESCE(p_payload->>'region', vl.region),
            country = COALESCE(p_payload->>'country', vl.country),
            device_type = COALESCE(p_payload->>'device_type', vl.device_type),
            os = COALESCE(p_payload->>'os', vl.os),
            browser = COALESCE(p_payload->>'browser', vl.browser),
            screen_resolution = COALESCE(p_payload->>'screen_resolution', vl.screen_resolution),
            last_path = COALESCE(p_payload->>'last_path', vl.last_path),
            referrer = COALESCE(p_payload->>'referrer', vl.referrer),
            is_online = true,
            last_visit = now(),
            is_authenticated = COALESCE((p_payload->>'is_authenticated')::boolean, vl.is_authenticated),
            user_id = COALESCE(p_payload->>'user_id', vl.user_id),
            user_email = COALESCE(p_payload->>'user_email', vl.user_email),
            user_name = COALESCE(p_payload->>'user_name', vl.user_name),
            user_role = COALESCE(p_payload->>'user_role', vl.user_role),
            updated_at = now()
        WHERE vl.device_id = v_device_id;
    END IF;

    RETURN QUERY SELECT v_visit_count, v_first_visit;
END;
$$;

REVOKE ALL ON FUNCTION public.upsert_visitor_log(JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.upsert_visitor_log(JSONB) TO anon, authenticated;

-- Ghi 1 dòng vào lịch sử truy cập (không trả về dữ liệu PII).
CREATE OR REPLACE FUNCTION public.record_visitor_history(p_payload JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF length(btrim(COALESCE(p_payload->>'device_id', ''))) < 3 THEN
        RAISE EXCEPTION 'device_id khong hop le';
    END IF;

    INSERT INTO public.visitor_history_logs (
        device_id, ip_address, city, region, country, device_type, os, browser,
        path, referrer, action, is_authenticated, user_id, user_email, user_name,
        user_role, is_real, is_bot, created_at
    ) VALUES (
        p_payload->>'device_id',
        COALESCE(p_payload->>'ip_address', '127.0.0.1'),
        COALESCE(p_payload->>'city', 'Không xác định'),
        COALESCE(p_payload->>'region', 'Việt Nam'),
        COALESCE(p_payload->>'country', 'Việt Nam'),
        COALESCE(p_payload->>'device_type', 'Desktop'),
        COALESCE(p_payload->>'os', 'Khác'),
        COALESCE(p_payload->>'browser', 'Chrome'),
        COALESCE(p_payload->>'path', p_payload->>'last_path', '/'),
        COALESCE(p_payload->>'referrer', 'Trực tiếp (Direct)'),
        COALESCE(p_payload->>'action', 'pageview'),
        COALESCE((p_payload->>'is_authenticated')::boolean, false),
        p_payload->>'user_id',
        p_payload->>'user_email',
        p_payload->>'user_name',
        p_payload->>'user_role',
        COALESCE((p_payload->>'is_real')::boolean, true),
        false,
        now()
    );
END;
$$;

REVOKE ALL ON FUNCTION public.record_visitor_history(JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_visitor_history(JSONB) TO anon, authenticated;

-- Heartbeat: giữ thiết bị ở trạng thái online (chỉ đúng dòng của thiết bị).
CREATE OR REPLACE FUNCTION public.touch_visitor_log(p_device_id TEXT, p_last_path TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF length(btrim(COALESCE(p_device_id, ''))) < 3 THEN
        RAISE EXCEPTION 'device_id khong hop le';
    END IF;

    UPDATE public.visitor_logs vl
    SET
        last_visit = now(),
        is_online = true,
        last_path = COALESCE(p_last_path, vl.last_path),
        updated_at = now()
    WHERE vl.device_id = p_device_id;
END;
$$;

REVOKE ALL ON FUNCTION public.touch_visitor_log(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.touch_visitor_log(TEXT, TEXT) TO anon, authenticated;

-- Rời trang: đánh dấu offline (chỉ đúng dòng của thiết bị).
CREATE OR REPLACE FUNCTION public.mark_visitor_offline(p_device_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF length(btrim(COALESCE(p_device_id, ''))) < 3 THEN
        RAISE EXCEPTION 'device_id khong hop le';
    END IF;

    UPDATE public.visitor_logs vl
    SET is_online = false, last_visit = now(), updated_at = now()
    WHERE vl.device_id = p_device_id;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_visitor_offline(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_visitor_offline(TEXT) TO anon, authenticated;

-- 10. RPC đếm lượt truy cập thiết bị (SECURITY DEFINER, không lộ PII)
CREATE OR REPLACE FUNCTION public.get_device_visit_stats(p_device_id TEXT)
RETURNS TABLE (visit_count INTEGER, first_visit TIMESTAMPTZ)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT vl.visit_count, vl.first_visit
    FROM public.visitor_logs vl
    WHERE vl.device_id = p_device_id
    LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_device_visit_stats(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_device_visit_stats(TEXT) TO anon, authenticated;

-- 11. Realtime (giữ nguyên hành vi cũ)
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.visitor_logs;
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.visitor_history_logs;
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_object THEN NULL;
END $$;

-- 12. Dọn dẹp bot / crawler rác
DELETE FROM public.visitor_logs
WHERE (os = 'Linux' AND (screen_resolution LIKE '%800%' OR screen_resolution = '0x0'))
   OR ip_address LIKE '13.57.%'
   OR ip_address LIKE '54.183.%'
   OR ip_address LIKE '54.215.%'
   OR ip_address LIKE '52.53.%'
   OR is_bot = true;

DELETE FROM public.visitor_history_logs
WHERE os = 'Linux'
   OR ip_address LIKE '13.57.%'
   OR ip_address LIKE '54.183.%'
   OR ip_address LIKE '54.215.%'
   OR ip_address LIKE '52.53.%'
   OR is_bot = true;

-- 13. Yêu cầu PostgREST nạp lại schema/quyền mới
NOTIFY pgrst, 'reload schema';

-- 14. Kiểm tra nhanh sau khi chạy:
--    SET ROLE anon;
--    SELECT * FROM public.visitor_logs;                     -- phải báo permission denied
--    SELECT get_device_visit_stats('dev_test');             -- chỉ trả visit_count, first_visit
--    DELETE FROM public.visitor_logs;                       -- phải báo permission denied
--    SELECT upsert_visitor_log('{"device_id":"dev_check"}');-- phải trả 1 lượt truy cập
--    SELECT record_visitor_history('{"device_id":"dev_check","path":"/"}');
--    SELECT touch_visitor_log('dev_check','/');
--    SELECT mark_visitor_offline('dev_check');
--    SET ROLE anon; DELETE FROM public.visitor_history_logs; -- phải báo permission denied
