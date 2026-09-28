-- =======================================================
-- SQL MIGRATION FOR EAAGRI VISITOR LOGS & IP TRACKING
-- Run this script in your Supabase SQL Editor
-- =======================================================

-- 1. Create table
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Indexes for high performance querying & sorting
CREATE INDEX IF NOT EXISTS idx_visitor_logs_last_visit ON public.visitor_logs(last_visit DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_ip ON public.visitor_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_device_id ON public.visitor_logs(device_id);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_is_online ON public.visitor_logs(is_online);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.visitor_logs ENABLE ROW LEVEL SECURITY;

-- 4. Policy: Allow any visitor (anon or authenticated) to insert/upsert their visit log
DROP POLICY IF EXISTS "Allow public to record visit logs" ON public.visitor_logs;
CREATE POLICY "Allow public to record visit logs"
ON public.visitor_logs
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);
