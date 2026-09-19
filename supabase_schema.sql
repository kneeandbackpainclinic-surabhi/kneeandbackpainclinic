-- ==============================================================================
-- CHARAK HEALTH SOLUTIONS - SUPABASE DATABASE INITIALIZATION SCRIPT
-- Paste this script into your Supabase Dashboard -> SQL Editor and click "Run".
-- ==============================================================================

-- 1. Create the 'leads' table
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
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 3. Create policies to allow website intake and admin portal access
DROP POLICY IF EXISTS "Allow public insert to leads" ON public.leads;
CREATE POLICY "Allow public insert to leads" ON public.leads
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow select for all" ON public.leads;
CREATE POLICY "Allow select for all" ON public.leads
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow update for all" ON public.leads;
CREATE POLICY "Allow update for all" ON public.leads
    FOR UPDATE USING (true);

-- 4. Insert initial seed clinic leads (optional)
INSERT INTO public.leads (id, name, phone, city, pain_area, severity, prior_treatments, readiness, recommended_step, slot_preference, status)
VALUES 
  ('LEAD-101', 'Rajesh K. Sharma', '9820145872', 'Vartak Nagar, Thane', 'Knee Joint (Osteoarthritis / Advised TKR)', 'Severe distress: Walking or stairs are agonizing', 'Total Knee Replacement advised by Orthopaedic', 'Ready to begin treatment to avoid surgery', '₹4,000 1-Day Experience Session', 'Tomorrow Morning (10:00 AM - 1:00 PM)', 'Trial Scheduled'),
  ('LEAD-102', 'Sunita Deshmukh', '9819234567', 'Mulund West', 'Lower Back & Spine (L4-L5 / Sciatica)', 'Advanced restriction: Getting up takes 2 minutes', 'Daily painkillers with only temporary relief', 'Fairly ready and wants in-clinic consultation first', '₹1,000 Diagnostic Consultation', 'This Weekend (Saturday)', 'Consultation Scheduled'),
  ('LEAD-103', 'Arvind Mehta', '9833451290', 'Navi Mumbai', 'Bilateral Knee Stiffness & Grinding', 'Severe distress: Cannot climb stairs', 'Physiotherapy & steroid injections', 'Ready to begin treatment', '₹4,000 1-Day Experience Session', 'Next Week', 'New Lead')
ON CONFLICT (id) DO NOTHING;
