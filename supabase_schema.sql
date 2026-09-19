-- ==============================================================================
-- CHARAK HEALTH SOLUTIONS - SUPABASE DATABASE INITIALIZATION SCRIPT
-- Paste this script into your Supabase Dashboard -> SQL Editor and click "Run".
-- ==============================================================================

-- 1. Create the 'leads' table with message delivery and payment tracking
CREATE TABLE IF NOT EXISTS public.leads (
    id TEXT PRIMARY KEY DEFAULT ('LEAD-' || floor(random() * 900 + 100)::text),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    city TEXT,
    pain_area TEXT,
    severity TEXT,
    prior_treatments TEXT,
    readiness TEXT,
    recommended_step TEXT,
    slot_preference TEXT,
    status TEXT DEFAULT 'New Lead',
    delivered_message TEXT DEFAULT 'None',
    delivered_message_time TIMESTAMPTZ,
    payment_status TEXT DEFAULT 'Unpaid',
    payment_order_id TEXT,
    payment_updated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Migration support: add columns if table already exists
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS delivered_message TEXT DEFAULT 'None';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS delivered_message_time TIMESTAMPTZ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'Unpaid';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS payment_order_id TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS payment_updated_at TIMESTAMPTZ;

-- 2. Create 'webinar_event_logs' table (Webinar.gg Integration)
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

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webinar_event_logs ENABLE ROW LEVEL SECURITY;

-- 4. Create policies to allow website intake, payment updates, and admin access
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

-- 5. Insert initial seed clinic leads (optional)
INSERT INTO public.leads (id, name, phone, city, pain_area, severity, prior_treatments, readiness, recommended_step, slot_preference, status, delivered_message, payment_status)
VALUES 
  ('LEAD-101', 'Rajesh K. Sharma', '9820145872', 'Vartak Nagar, Thane', 'Knee Joint (Osteoarthritis / Advised TKR)', 'Severe distress: Walking or stairs are agonizing', 'Total Knee Replacement advised by Orthopaedic', 'Ready to begin treatment to avoid surgery', '₹4,000 1-Day Experience Session', 'Tomorrow Morning (10:00 AM - 1:00 PM)', 'Trial Scheduled', 'T1: Trial Confirmed', 'Unpaid'),
  ('LEAD-102', 'Sunita Deshmukh', '9819234567', 'Mulund West', 'Lower Back & Spine (L4-L5 / Sciatica)', 'Advanced restriction: Getting up takes 2 minutes', 'Daily painkillers with only temporary relief', 'Fairly ready and wants in-clinic consultation first', '₹1,000 Diagnostic Consultation', 'This Weekend (Saturday)', 'Consultation Scheduled', 'T2: Consultation Confirmed', 'Unpaid'),
  ('LEAD-103', 'Arvind Mehta', '9833451290', 'Navi Mumbai', 'Bilateral Knee Stiffness & Grinding', 'Severe distress: Cannot climb stairs', 'Physiotherapy & steroid injections', 'Ready to begin treatment', '₹4,000 1-Day Experience Session', 'Next Week', 'New Lead', 'None', 'Unpaid')
ON CONFLICT (id) DO NOTHING;
