-- =======================================================
-- EAAGRI — PROFILES TABLE HARDENING (fix ACC-01 / UI-07)
-- Run this FIRST in Supabase SQL Editor.
--
-- Vấn đề: anonymous có thể gọi /rest/v1/profiles?select=* và đọc
-- toàn bộ email + vai trò của mọi tài khoản.
--
-- Sau migration này:
--   * anon KHÔNG có bất kỳ quyền nào trên public.profiles
--   * người dùng đã đăng nhập chỉ đọc/ cập nhật hồ sơ của chính mình
--   * SA/admin đọc và quản lý được tất cả hồ sơ
--   * không ai có thể tự nâng vai trò của mình lên SA/admin
-- =======================================================

-- 1. Bảng profiles (tạo nếu dự án chưa có)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bổ sung cột nếu bảng đã tồn tại từ phiên bản cũ
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'email') THEN
        ALTER TABLE public.profiles ADD COLUMN email TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'full_name') THEN
        ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT NOT NULL DEFAULT 'user';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'created_at') THEN
        ALTER TABLE public.profiles ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 2. Đồng bộ hồ sơ còn thiếu từ auth.users (không ghi đè dữ liệu đang có)
INSERT INTO public.profiles (id, email, full_name)
SELECT
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', split_part(COALESCE(u.email, ''), '@', 1))
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 3. Helper kiểm tra quyền quản trị.
-- SECURITY DEFINER để tránh đệ quy RLS khi policy của profiles gọi lại profiles.
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

-- 4. Bật RLS và xóa toàn bộ policy cũ
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
    END LOOP;
END $$;

-- 5. Policy mới
-- Người dùng chỉ thấy hồ sơ của mình; SA/admin thấy tất cả.
CREATE POLICY "profiles_select_own_or_admin"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id OR public.is_admin_or_sa());

-- Người dùng được cập nhật hồ sơ của mình; SA/admin cập nhật tất cả.
-- Trigger bên dưới chặn việc tự đổi vai trò.
CREATE POLICY "profiles_update_own_or_admin"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id OR public.is_admin_or_sa())
WITH CHECK (auth.uid() = id OR public.is_admin_or_sa());

-- Chỉ cho phép tạo hồ sơ gắn với chính tài khoản đang đăng nhập.
-- Người dùng thường chỉ được tạo với role 'user'; nếu không, họ có thể
-- tự INSERT một hồ sơ role 'SA' và tự nâng quyền.
CREATE POLICY "profiles_insert_own"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
    public.is_admin_or_sa()
    OR (
        auth.uid() = id
        AND lower(COALESCE(role, 'user')) = 'user'
    )
);

-- Không có policy DELETE: chỉ service_role / SQL Editor mới xóa được.

-- 6. Trigger bảo vệ các trường nhạy cảm
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Service role / SQL Editor (không có JWT) được phép quản trị trực tiếp.
    IF auth.uid() IS NULL THEN
        NEW.updated_at := now();
        RETURN NEW;
    END IF;

    IF NEW.id IS DISTINCT FROM OLD.id THEN
        RAISE EXCEPTION 'Không thể thay đổi id của hồ sơ';
    END IF;

    IF NEW.email IS DISTINCT FROM OLD.email THEN
        RAISE EXCEPTION 'Không thể thay đổi email hồ sơ tại đây';
    END IF;

    IF NEW.role IS DISTINCT FROM OLD.role THEN
        IF auth.uid() = OLD.id THEN
            RAISE EXCEPTION 'Bạn không thể tự thay đổi vai trò của chính mình';
        END IF;
        IF NOT public.is_admin_or_sa() THEN
            RAISE EXCEPTION 'Chỉ quản trị viên mới có thể thay đổi vai trò';
        END IF;
    END IF;

    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_fields ON public.profiles;
CREATE TRIGGER protect_profile_fields
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_fields();

-- 7. Tự tạo hồ sơ khi có tài khoản mới
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(COALESCE(NEW.email, ''), '@', 1)),
        'user'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- 8. Quyền bảng: chặn hoàn toàn anon
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.profiles FROM authenticated;
REVOKE ALL ON public.profiles FROM PUBLIC;

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- 9. Kiểm tra nhanh sau khi chạy:
--    SELECT * FROM public.profiles;                       -- chỉ trả về hồ sơ của bạn
--    SET ROLE anon; SELECT * FROM public.profiles;        -- phải báo permission denied
