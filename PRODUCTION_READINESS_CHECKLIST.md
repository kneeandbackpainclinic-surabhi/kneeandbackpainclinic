# KNEE & BACK PAIN CLINIC — PRODUCTION READINESS CHECKLIST
## Pre-Deployment Verification, Environment Variables & Quality Assurance

**Client:** Dr. Surabhi Sunil Vaidya · Charak Health Solutions, Thane West  
**Production Domain:** [https://kneeandbackpainrelief.com](https://kneeandbackpainrelief.com)  
**Hosting Provider:** Vercel  
**Database:** Supabase (Project Reference: `leqbwiexuzggdxgxngrm`)  
**Git Branch:** `simplified-funnel`  
**Date:** November 12, 2026

---

## 1. Codebase & Deployment Artifacts Status

All modifications have been completed and verified on git branch `simplified-funnel`:

```
Branch: simplified-funnel
Working Tree Status: Clean, verified, ready for pull request or production merge
```

### Modified File Inventory:
- **Core Frontend:**
  - `dist/index.html` — Redesigned into 6 focused sections; compact hero form; zero webinar CTAs; zero false conversion tags.
  - `dist/style.css` — Responsive, accessible styling for hero form, cards, fee comparison table, sticky mobile booking bar.
  - `dist/script.js` — Lead submission handling, slot selection modal, payment routing, and deduplication logic.
  - `dist/confirmation.html` — Deduplicated tracking, dynamic pricing breakdown (₹800 online vs ₹1,000 at desk), clinic directions.
  - `dist/thank-you.html` — Synced deduplication and appointment review pass.
  - `dist/webinar.html` & `dist/room.html` — Clean 0-second meta-refresh redirects to `/`.
  - `dist/booking-links.js`, `dist/payment.html`, `dist/pay.html` — Purged legacy false conversion tags.
- **Admin Dashboard:**
  - `dist/admin.html`, `dist/admin.js`, `dist/admin.css` — Rebuilt with server-side authentication (`ADMIN_SECRET_KEY`), 4 clean tabs, actionable error alert banner, staff notes modal, CSV export.
- **Legal & Compliance Policies:**
  - `dist/refund-policy.html` — Updated for in-clinic consultations (₹1,000 standard / ₹800 online prepaid); archived webinars.
  - `dist/shipping-policy.html` & `dist/shipping-and-return-policy.html` — Updated service fulfillment and pricing.
  - `dist/terms.html` & `dist/terms-and-conditions.html` — Updated doctor credentials (MD, MCIM Reg. No. `I-54602-A`), clinic hours, phone numbers.
  - `dist/about-us.html` & `dist/privacy-policy.html` — Updated scope, contact details, and data policies.
- **Serverless API Backends (`api/`):**
  - `api/lead-intake.js` — 10-digit Indian mobile validation, name validation, Supabase idempotent deduplication by phone, fallback column resilience.
  - `api/leads.js` — Strict server-side authentication (`Authorization: Bearer <key>`); actionable 500/502 errors on DB failure.
  - `api/cal-direct.js` — Verified clinic hours (Mon–Sat 10–1 & 4:30–7:30, Sun 10–1); double-booking collision prevention.
  - `api/send-reminders.js` — Autonomous runner for 30m reminders, 15m incomplete booking recovery, 24h abandoned checkout recovery, and opt-out compliance.
- **Database Schema:**
  - `supabase_schema.sql` — Idempotent migration script (`ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS ...`).

---

## 2. Vercel Environment Variables Verification

Ensure the following environment variables are configured in the **Vercel Project Dashboard** (**Settings** > **Environment Variables**):

| Variable Name | Required Environment | Description / Recommended Value | Status |
| :--- | :--- | :--- | :--- |
| `ADMIN_SECRET_KEY` | Production, Preview | Strong secret token required to unlock `/admin.html` and authenticate `/api/leads` (e.g., `surabhi2026` or a secure clinic password). | **CRITICAL** |
| `SUPABASE_URL` | Production, Preview | Supabase API URL: `https://leqbwiexuzggdxgxngrm.supabase.co` | Configured |
| `SUPABASE_SECRET_KEY` (or `SUPABASE_SERVICE_ROLE_KEY`) | Production, Preview | Supabase service-role / secret key for server-side read/write. | Configured |
| `SUPABASE_PUBLISHABLE_KEY` (or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) | Production, Preview | Supabase public API key. | Configured |
| `AGENTBANDHU_API_KEY` (or `META_WHATSAPP_ACCESS_TOKEN`) | Production, Preview | Official AgentBandhu / Meta WhatsApp Cloud API access token. | Configured |
| `PAYU_KEY` | Production, Preview | PayU Merchant Key (Switch from test `46AxYt` to Live Production Key when ready). | Required for live payments |
| `PAYU_SALT` | Production, Preview | PayU Merchant Salt for SHA-512 payment hash generation. | Required for live payments |
| `PAYU_ENV` | Production, Preview | `sandbox` (for test transactions) or `production` (for live patient payments). | Configured |

---

## 3. Pre-Deployment Quality Assurance Checklist

### A. Landing Page & Visual Presentation
- [x] Homepage loads rapidly without layout shifts.
- [x] Headline reads: *"Knee or Back Pain Affecting Your Daily Life?"*
- [x] No upfront fee is mentioned on the landing page hero, cards, or initial form view.
- [x] Exactly six logical sections present (Hero, Common Concerns, Meet Dr. Surabhi, What Happens During Consultation, Consultation Details, FAQs).
- [x] Zero webinar buttons, CTAs, prices, or registration boxes visible on the public page.
- [x] Sticky mobile booking CTA bar appears on mobile viewports below the hero fold.
- [x] Doctor's verified qualifications displayed: BAMS, MD (Ayurveda), MCIM Reg. No. `I-54602-A`, 15+ years experience.
- [x] Medical copy contains zero claims of guaranteed relief, percentages, or absolute surgery avoidance.

### B. Lead Capture & Appointment Journey
- [x] Hero form strictly rejects non-Indian or invalid mobile numbers (must be 10 digits starting with 6, 7, 8, or 9).
- [x] Hero form rejects empty or single-character names.
- [x] Submitting the hero form saves the lead to Supabase under status `Lead Captured` within 1 second.
- [x] Submitting an existing phone number updates the existing record via `PATCH` rather than creating duplicate rows.
- [x] Slot selection modal presents verified clinic operating hours (Mon–Sat 10am–1pm & 4:30pm–7:30pm; Sun 10am–1pm).
- [x] Slots already booked in Supabase are disabled to prevent double bookings.
- [x] Clicking "Confirm Appointment (Payment in Clinic)" immediately reserves the slot in Supabase and unlocks the exclusive 20% prepayment discount (₹800 online vs standard ₹1,000 at clinic desk).
- [x] Choosing to prepay online routes to ₹800 checkout; choosing "Payment in Clinic" generates confirmation pass with ₹1,000 due at reception.
- [x] Confirmation pass allows patients to claim the ₹800 prepayment discount anytime prior to their visit.
- [x] Incomplete drop-offs (15m) and abandoned checkouts (24h) receive automated WhatsApp recovery messages offering the 20% discount.

### C. Google Ads & Conversion Tracking
- [x] Defective `<head>` conversion snippet (`AW-18534158307/o8ztCN3M4acdEOOf44VF`) is 100% removed from all HTML files.
- [x] No conversion tag fires upon initial page load of `index.html`.
- [x] `consultation_lead_submitted` fires only after backend confirms database persistence.
- [x] `consultation_booking_confirmed` fires on `/confirmation.html`.
- [x] `consultation_payment_verified` fires **only** when payment is confirmed online (`paid=1`). Unpaid bookings do not trigger this event.
- [x] Refreshing `/confirmation.html` does not fire duplicate conversion events (enforced by `sessionStorage`).

### D. Security & Admin Dashboard
- [x] Client-side "Emergency One-Click Unlock" button is removed.
- [x] Unauthenticated calls to `/api/leads` return HTTP 401 Unauthorized.
- [x] Entering valid `ADMIN_SECRET_KEY` unlocks the dashboard and fetches real-time lead records.
- [x] If Supabase is unreachable, the dashboard displays an explicit actionable error banner instead of showing 0 leads.
- [x] Status updates, staff notes modal, and CSV export function properly.

### E. WhatsApp Automation & Compliance
- [x] Instant acknowledgement template payload properly configured.
- [x] Booking confirmation template payload formatted for `consultation_booking_confirmation_v1`.
- [x] 30-minute reminder sweep scans appointments starting in 15–45 minutes and avoids duplicate dispatches.
- [x] 15-minute incomplete booking recovery targets leads captured without a slot.
- [x] 24-hour abandoned checkout recovery targets unpaid appointments.
- [x] Opt-out flag (`opted_out = true`) blocks all automated messages.

---

## 4. Deployment Procedure

Once approved for production release:

### Step 1: Execute Database Schema Migration (Supabase)
Log in to the [Supabase Dashboard](https://supabase.com/dashboard/project/leqbwiexuzggdxgxngrm) > **SQL Editor** and run `supabase_schema.sql` to verify all optional columns (`concern`, `slot_date`, `slot_time`, `amount`, `discount_applied`, `payment_method`, `recovery_step`, `opted_out`) are active. *(Note: The backend code includes an automatic column fallback, so the application will function normally even before migration).*

### Step 2: Merge Git Branch & Push to Production
```bash
# Switch to main branch
git checkout main

# Merge the simplified-funnel branch
git merge simplified-funnel

# Push to GitHub / remote to trigger Vercel production deployment
git push origin main
```

### Step 3: Post-Deployment Smoke Test (Live Domain)
1. Visit [https://kneeandbackpainrelief.com](https://kneeandbackpainrelief.com).
2. Open Browser DevTools > Console & Network tabs.
3. Submit a test lead using your phone number with note `[Smoke Test]`.
4. Verify lead appears in Supabase `public.leads` and on the Admin Dashboard (`/admin.html`).
5. Verify Google Tag Assistant shows zero page-load conversion triggers.

### Step 4: Instant Rollback Strategy
If any unforeseen production issue occurs:
1. **Instant Vercel Rollback:** In the Vercel Dashboard, go to **Deployments**, locate the previous stable deployment, click the three dots (`...`), and select **Promote to Production** (takes ~5 seconds with zero rebuild time).
2. **Git Rollback:**
   ```bash
   git revert -m 1 HEAD
   git push origin main
   ```
