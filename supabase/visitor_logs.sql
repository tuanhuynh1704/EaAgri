-- =======================================================
-- SQL MIGRATION FOR EAAGRI VISITOR LOGS & REALTIME ACCESS TRACKING
-- Run this script in your Supabase SQL Editor (SQL Editor -> New Query -> Run)
-- =======================================================

-- 1. Create main visitor_logs table (Device & Aggregated Traffic)
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
    is_authenticated BOOLEAN NOT NULL DEFAULT false,
    user_id TEXT,
    user_email TEXT,
    user_name TEXT,
    user_role TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure all columns exist if the table was partially created previously
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'visitor_logs' AND column_name = 'is_real') THEN
        ALTER TABLE public.visitor_logs ADD COLUMN is_real BOOLEAN NOT NULL DEFAULT true;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'visitor_logs' AND column_name = 'is_authenticated') THEN
        ALTER TABLE public.visitor_logs ADD COLUMN is_authenticated BOOLEAN NOT NULL DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'visitor_logs' AND column_name = 'user_id') THEN
        ALTER TABLE public.visitor_logs ADD COLUMN user_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'visitor_logs' AND column_name = 'user_email') THEN
        ALTER TABLE public.visitor_logs ADD COLUMN user_email TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'visitor_logs' AND column_name = 'user_name') THEN
        ALTER TABLE public.visitor_logs ADD COLUMN user_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'visitor_logs' AND column_name = 'user_role') THEN
        ALTER TABLE public.visitor_logs ADD COLUMN user_role TEXT;
    END IF;
END $$;

-- 2. Create visitor_history_logs table (Detailed access timeline / page view event stream)
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Indexes for high performance querying & sorting
CREATE INDEX IF NOT EXISTS idx_visitor_logs_last_visit ON public.visitor_logs(last_visit DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_ip ON public.visitor_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_device_id ON public.visitor_logs(device_id);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_is_online ON public.visitor_logs(is_online);

CREATE INDEX IF NOT EXISTS idx_visitor_history_created_at ON public.visitor_history_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_history_device_id ON public.visitor_history_logs(device_id);
CREATE INDEX IF NOT EXISTS idx_visitor_history_ip ON public.visitor_history_logs(ip_address);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.visitor_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_history_logs ENABLE ROW LEVEL SECURITY;

-- 5. Policies: Allow public (anon + authenticated) to insert, upsert, and read logs
DROP POLICY IF EXISTS "Allow public to record visit logs" ON public.visitor_logs;
CREATE POLICY "Allow public to record visit logs"
ON public.visitor_logs
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public to record history logs" ON public.visitor_history_logs;
CREATE POLICY "Allow public to record history logs"
ON public.visitor_history_logs
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 6. Enable Supabase Realtime for instant synchronization across all machines
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
