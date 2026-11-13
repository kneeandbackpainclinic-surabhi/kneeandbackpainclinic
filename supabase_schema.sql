-- ==============================================================================
-- CHARAK HEALTH SOLUTIONS - SUPABASE DATABASE INITIALIZATION & MIGRATION SCRIPT
-- Dr. Surabhi Vaidya Knee & Back Pain Clinic (Thane West)
-- ==============================================================================

-- 1. Base 'leads' table
CREATE TABLE IF NOT EXISTS public.leads (
    id TEXT PRIMARY KEY DEFAULT ('LEAD-' || floor(random() * 900 + 100)::text),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    city TEXT DEFAULT 'Thane',
    pain_area TEXT DEFAULT 'Knee / Back Pain',
    severity TEXT,
    prior_treatments TEXT,
    readiness TEXT,
    recommended_step TEXT DEFAULT '₹1,000 In-Clinic Diagnostic Consultation',
    slot_preference TEXT,
    status TEXT DEFAULT 'Lead Captured',
    delivered_message TEXT DEFAULT 'None',
    delivered_message_time TIMESTAMPTZ,
    payment_status TEXT DEFAULT 'Unpaid',
    payment_order_id TEXT,
    payment_updated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Idempotent column additions for Consultation-Only Funnel
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS staff_notes TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS delivered_message TEXT DEFAULT 'None';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS delivered_message_time TIMESTAMPTZ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'Unpaid';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS payment_order_id TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS payment_updated_at TIMESTAMPTZ;

-- Funnel simplification columns
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS concern TEXT DEFAULT 'Knee Pain';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS whatsapp_consent BOOLEAN DEFAULT false;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS booking_type TEXT DEFAULT 'in_clinic_consultation';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS amount NUMERIC DEFAULT 1000;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS discount_applied NUMERIC DEFAULT 0;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'pending';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS slot_date TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS slot_time TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS follow_up_required BOOLEAN DEFAULT false;

-- Marketing attribution & deduplication columns
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utm_medium TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utm_content TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utm_term TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS gclid TEXT;

-- Drop-off recovery & opt-out compliance
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS recovery_step TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS recovery_last_sent_at TIMESTAMPTZ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS opted_out BOOLEAN DEFAULT false;

-- 3. Historical preservation of 'webinar_event_logs' (read-only historical storage)
CREATE TABLE IF NOT EXISTS public.webinar_event_logs (
    id BIGSERIAL PRIMARY KEY,
    webinar_id TEXT NOT NULL,
    session_date TIMESTAMPTZ DEFAULT now(),
    email TEXT,
    event_type TEXT NOT NULL,
    event_data JSONB,
    duration_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webinar_event_logs ENABLE ROW LEVEL SECURITY;

-- 5. Safe RLS Policies
DROP POLICY IF EXISTS "Allow public insert to leads" ON public.leads;
CREATE POLICY "Allow public insert to leads" ON public.leads
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow select for all" ON public.leads;
CREATE POLICY "Allow select for all" ON public.leads
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow update for all" ON public.leads;
CREATE POLICY "Allow update for all" ON public.leads
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow all for webinar logs" ON public.webinar_event_logs;
CREATE POLICY "Allow all for webinar logs" ON public.webinar_event_logs
    FOR ALL USING (true);
