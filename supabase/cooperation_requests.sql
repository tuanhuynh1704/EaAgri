-- =======================================================
-- SQL MIGRATION FOR EAAGRI COOPERATION REQUESTS TABLE
-- Run this script in your Supabase SQL Editor
-- =======================================================

-- 1. Create table
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create index for fast filtering and search
CREATE INDEX IF NOT EXISTS idx_coop_requests_status ON public.cooperation_requests(status);
CREATE INDEX IF NOT EXISTS idx_coop_requests_created_at ON public.cooperation_requests(created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.cooperation_requests ENABLE ROW LEVEL SECURITY;

-- 4. Policy: Allow anyone (anon or authenticated) to submit a cooperation request
DROP POLICY IF EXISTS "Allow public to insert cooperation requests" ON public.cooperation_requests;
CREATE POLICY "Allow public to insert cooperation requests"
ON public.cooperation_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 5. Policy: Allow authenticated users (e.g. SA / Admin) to read, update, delete cooperation requests
DROP POLICY IF EXISTS "Allow admins to read cooperation requests" ON public.cooperation_requests;
CREATE POLICY "Allow admins to read cooperation requests"
ON public.cooperation_requests
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow admins to update cooperation requests" ON public.cooperation_requests;
CREATE POLICY "Allow admins to update cooperation requests"
ON public.cooperation_requests
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admins to delete cooperation requests" ON public.cooperation_requests;
CREATE POLICY "Allow admins to delete cooperation requests"
ON public.cooperation_requests
FOR DELETE
TO authenticated
USING (true);
