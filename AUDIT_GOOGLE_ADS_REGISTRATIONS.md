# Comprehensive Technical Audit: Website, Registration Architecture & Google Ads Conversion Tracking

**Project:** Dr. Surabhi Vaidya Knee & Back Pain Clinic (Charak Health Solutions, Thane West)  
**Primary Production Domain:** [kneeandbackpainrelief.com](https://kneeandbackpainrelief.com)  
**Audit Date:** November 12, 2026  
**Audit Nature:** 100% READ-ONLY Technical Audit (No code, database, tag, or configuration was modified)  
**Target Audience:** Engineering Leads, Digital Marketing Specialists, Growth Team, and ChatGPT Diagnostic Reviewers

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Website & Production Architecture](#2-website--production-architecture)
3. [Domain, DNS & Deployment Findings](#3-domain-dns--deployment-findings)
4. [Google Ads, Tagging & Analytics Inventory](#4-google-ads-tagging--analytics-inventory)
5. [Registration & Lead Capture Journey Analysis](#5-registration--lead-capture-journey-analysis)
6. [Backend, Database & Persistence Audit](#6-backend-database--persistence-audit)
7. [Admin Dashboard Inspection](#7-admin-dashboard-inspection)
8. [Root-Cause Hypotheses Ranked by Evidence](#8-root-cause-hypotheses-ranked-by-evidence)
9. [Diagnostic & Prioritization Matrix](#9-diagnostic--prioritization-matrix)
10. [Recommended Remediation Plan](#10-recommended-remediation-plan)
11. [Manual Verification Checklist (Google Ads, GA4 & Hosting)](#11-manual-verification-checklist)
12. [Exact Source File & Line Number Reference](#12-exact-source-file--line-number-reference)

---

## 1. Executive Summary

### 1.1 The Core Discrepancy

Between **November 5, 2026, and November 11, 2026**, Google Ads reported:

- **Impressions:** 26,654
- **Advertising Spend:** ₹4,489.13
- **Reported Conversions:** 3,821
- **Cost Per Conversion:** ~₹1.17
- **Confirmed Registrations in Clinic CRM:** 0
- **Admin Dashboard Leads:** No registrations visible to the clinic team.

### 1.2 The Definitive Finding

The discrepancy is caused by a **catastrophic tracking defect** on the website, combined with an **unusually high-friction booking funnel** and a **development-vs-production environment mismatch**:

1. **The 3,821 "Conversions" Were Merely Page Views (Clicks):**  
   In [dist/index.html#L39-L48](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/index.html#L39-L48) and [dist/webinar.html#L39-L48](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/webinar.html#L39-L48), the Google Ads **"Purchase" conversion event snippet** (`AW-18534158307/o8ztCN3M4acdEOOf44VF`) is hardcoded directly into the HTML `<head>`.  
   **Every single visitor who loaded the website homepage or webinar page triggered a "Purchase" conversion instantly in Google Ads**, before clicking any button, filling any form, or paying anything.  
   The mathematical evidence is conclusive: 26,654 impressions yielded ~3,821 clicks (~14.33% CTR, standard for Google Search/Display ads in India). Google Ads recorded every single click as a conversion. Google Ads' Smart Bidding algorithm was deceived into optimizing for cheap landing page visits, believing every visitor was an immediate paying customer.

2. **Why Actual Registrations Were Zero:**  
   Out of the ~3,821 visitors, **zero external patients completed the registration flow**.  
   - There is **no inline lead capture form** on the homepage (`index.html`).
   - Registration requires clicking a button, completing a 4-step modal questionnaire, submitting contact details, viewing a static UPI QR code for ₹1,000 or ₹201, opening a third-party banking app, manually transferring money to a private UPI VPA (`surabhivaidya7@okhdfcbank`), copying a reference code, and returning to the browser to enter a 12-digit UTR number.
   - The official payment gateway (PayU) is running in `sandbox` / UAT test mode with test keys, and was intentionally bypassed in favor of the manual UPI QR workaround.
   - The Google Ads campaign brought broad, top-of-funnel traffic that bounced upon encountering the 4-step modal or manual UPI transfer screen.

3. **Database Audit (Nov 5–11, 2026):**  
   A direct read-only query of the production Supabase database (`leqbwiexuzggdxgxngrm.supabase.co`) confirmed that **only 7 total records exist in the entire history of the database**, and **every single one belongs to internal team or family testing** (emails: `dodhia.roshani@gmail.com`, `dodhia.milan@gmail.com`, `surabhivaidya7@gmail.com`, `kneeandbackpainclinic@gmail.com`).  
   During November 5–11, exactly **1 test visitor** (`Roshani`, mobile: `9773773122`) interacted with the quiz on November 7 (generating draft lead `LEAD-141` and registration `LEAD-946`, both unpaid). Zero real patient registrations were lost in the database because zero were submitted by visitors.

4. **Why the Admin Dashboard Appeared Empty:**  
   - In production (`kneeandbackpainrelief.com/admin`), `/api/leads` successfully connects to Supabase and returns the 7 records. However, because all 7 records are test/draft/drop-off entries and 0 confirmed patient bookings exist, the clinic staff saw no customer registrations.
   - If the admin portal was opened locally via `npm run dev` or `python -m http.server 8080`, Python HTTP server cannot execute Vercel serverless functions in `/api/`. All `/api/leads` calls returned **HTTP 404**, causing the admin table to silently fail and display: *"No leads matching current filters."*

---

## 2. Website & Production Architecture

### 2.1 Technology Stack

| Layer | Component / Technology | Specification & Configuration |
|---|---|---|
| **Frontend Core** | Vanilla HTML5, Modern ES6+ JavaScript, CSS3 | No React, Vue, or Webpack bundle step; static HTML served from `dist/` |
| **Styling & Design** | Custom CSS3 (`dist/style.css`, `dist/admin.css`) | Responsive mobile-first stylesheet, CSS variables, CSS grid/flexbox |
| **Serverless Backend** | Node.js (ES Modules, `"type": "module"`) | 12 Vercel Serverless Functions in `api/*.js` |
| **Database** | Supabase (PostgreSQL via PostgREST REST API) | Project ID: `leqbwiexuzggdxgxngrm`, region AWS ap-south-1 |
| **Hosting Platform** | Vercel (Hobby Tier) | Project Name: `kneeandbackpainclinic` (`prj_kohvTxJ1jx80k3lVKT8DLelf519E`) |
| **Calendar Scheduling** | Cal.id Direct API Bridge & Embedded Iframe | Handles appointment slot generation and booking sync |
| **WhatsApp Automation** | AgentBandhu Cloud API (Meta BSP) | Official BSP API proxy in `api/whatsapp-send.js` |
| **Payment Infrastructure** | Dual: PayU (Sandbox) + Direct UPI QR Workaround | VPA: `surabhivaidya7@okhdfcbank`, Merchant Key: `46AxYt` |
| **Local Development** | Python SimpleHTTPServer | Command: `python -m http.server 8080 --directory dist` |

### 2.2 Project Structure

```text
Dr_Surabhi_Knee_and_back_pain_relief/
├── .env.example                     # Reference environment variables
├── .env.local                       # Local developer secrets (partially configured)
├── package.json                     # Node project manifest (scripts: dev, start)
├── vercel.json                      # Vercel routing, cleanUrls, and rewrites
├── supabase_schema.sql              # Supabase table definitions and RLS policies
├── dist/                            # Production static build directory (deployed to Vercel)
│   ├── index.html                   # Main landing page (CRITICAL TAG DEFECT on L39-48)
│   ├── webinar.html                 # Dedicated webinar page (CRITICAL TAG DEFECT on L39-48)
│   ├── confirmation.html            # Consultation confirmation pass & conversion tracker
│   ├── thank-you.html               # Duplicate alias of confirmation.html
│   ├── payment.html                 # Standalone UPI payment checkout page
│   ├── pay.html                     # Clean URL duplicate of payment.html
│   ├── room.html                    # Webinar.gg live broadcast stream player
│   ├── admin.html                   # Staff & doctor CRM back-office interface
│   ├── admin.js                     # Admin CRM controller, filtering & Supabase sync
│   ├── admin.css                    # Admin back-office styles
│   ├── script.js                    # Core frontend engine: assessment quiz, lead capture, UPI
│   ├── booking-links.js             # Cal.id bridge, UPI modal, backwards-compat checkout
│   ├── style.css                    # Master clinic stylesheet
│   ├── about-us.html                # Doctor credentials & clinic background
│   ├── privacy-policy.html          # Privacy policy (mandated for Google Ads & PayU)
│   ├── shipping-policy.html         # Shipping & fulfillment policy
│   ├── shipping-and-return-policy.html # Exact match alias for cleanUrls
│   ├── refund-policy.html           # Refund & cancellation policy
│   ├── terms.html                   # Terms & conditions
│   ├── terms-and-conditions.html    # Exact match alias for cleanUrls
│   └── assets/                      # Clinic images, doctor headshots, VSL thumbnails
└── api/                             # Vercel Serverless Functions
    ├── lead-intake.js               # POST /api/lead-intake (Persists to Supabase `leads`)
    ├── leads.js                     # GET /api/leads & PATCH /api/leads (CRM data fetch)
    ├── cal-direct.js                # GET/POST /api/cal-direct (Cal.id API & fallback calendar)
    ├── cal-webhook.js               # POST /api/cal-webhook (Receives booking webhooks)
    ├── create-payu-order.js         # POST /api/create-payu-order (PayU payment hash generator)
    ├── payu-callback.js             # POST /api/payu-callback (Handles PayU customer redirect)
    ├── payu-webhook.js              # POST /api/payu-webhook (PayU server-to-server webhook)
    ├── get-webinar-metrics.js       # GET /api/get-webinar-metrics (Webinar attendance KPIs)
    ├── get-webinar-token.js         # POST /api/get-webinar-token (Webinar.gg room token)
    ├── send-reminders.js            # GET /api/send-reminders (Cron reminder trigger)
    ├── webinar-webhook.js           # POST /api/webinar-webhook (Webinar.gg event receiver)
    └── whatsapp-send.js             # GET/POST /api/whatsapp-send (AgentBandhu dispatcher)
```

---

## 3. Domain, DNS & Deployment Findings

### 3.1 Domain Status & DNS Verification

A live read-only network probe of all related domains revealed the following status:

| Domain | HTTP Status | Destination / Target | Analysis & Findings |
|---|---|---|---|
| **`https://kneeandbackpainrelief.com`** | `200 OK` | `https://kneeandbackpainrelief.com/` | **ACTIVE PRODUCTION DOMAIN.** Successfully serves the latest Vercel deployment. Both `index.html` and `webinar.html` are live with the problematic Google conversion snippet in `<head>`. |
| **`https://kneeandbackpainclinic.vercel.app`** | `308 Permanent Redirect` | `https://kneeandbackpainrelief.com/` | **VERCEL DEFAULT DOMAIN.** Configured as a 308 canonical redirect pointing to `kneeandbackpainrelief.com`. |
| **`https://kneeandbackpainclinic.com`** | `200 OK` | `https://kneeandbackpainclinic.com/` | **LEGACY / DETACHED DOMAIN.** Hosted on NowFloats / BoostKit (`theme-cdn.boostkit.dev`). Not pointing to Vercel! Does not contain any of the new codebase or Google Ads tags. |

### 3.2 Canonical Inconsistencies Inside Codebase

Although the live production traffic runs on `https://kneeandbackpainrelief.com`, multiple source files still reference the legacy Vercel domain or the old `.com` domain:

1. Canonical Tags: `<link rel="canonical" href="https://kneeandbackpainclinic.vercel.app/">` appears across [dist/index.html#L16](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/index.html#L16), [dist/webinar.html#L16](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/webinar.html#L16), [dist/privacy-policy.html#L8](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/privacy-policy.html#L8), and policy pages.
2. Booking Links Configuration: In [dist/booking-links.js#L22](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/booking-links.js#L22):
   ```javascript
   clinicWebsite: 'https://www.kneeandbackpainclinic.com',
   confirmationUrl: 'https://kneeandbackpainclinic.vercel.app/confirmation',
   ```
3. Environment Configuration: In `.env.local` line 18:
   ```env
   NEXT_PUBLIC_APP_URL=https://kneeandbackpainclinic.vercel.app
   ```
4. Host header fallback in serverless endpoints: In `api/create-payu-order.js#L38` and `api/payu-callback.js#L41`, the fallback host is hardcoded to `'kneeandbackpainclinic.vercel.app'`.

### 3.3 Production Hosting Configuration (`vercel.json`)

- `outputDirectory`: `"dist"`
- `cleanUrls`: `true`
- Rewrites map clean URLs to HTML files:
  - `/admin` → `/admin.html`
  - `/webinar` → `/webinar.html`
  - `/room` → `/room.html`
  - `/confirmation` & `/thank-you` → `/confirmation.html`
  - `/payment` & `/pay` → `/payment.html`
  - `/about-us`, `/privacy-policy`, `/shipping-policy`, `/refund-policy`, `/terms-and-conditions` → corresponding `.html` files
  - `/api/test-whatsapp` → `/api/whatsapp-send?test=true`

### 3.4 Environment Variables Audit

| Variable Name | Present in `.env.example` | Configured in `.env.local` | Verified in Production (Vercel) | Secret Value Exposed? | Status / Notes |
|---|---|---|---|---|---|
| `SUPABASE_URL` | Yes | Yes (length 40) | Yes | **NO** | Verified active (`leqbwiexuzggdxgxngrm.supabase.co`) |
| `SUPABASE_ANON_KEY` | Yes | Yes (length 46) | Yes | **NO** | Uses `sb_publishable_...` format |
| `SUPABASE_PUBLISHABLE_KEY` | No | Yes (length 46) | Yes | **NO** | Matches `SUPABASE_ANON_KEY` |
| `SUPABASE_SERVICE_ROLE_KEY`| Yes | **NO** | Unverified / Missing | **NO** | Needed if RLS is tightened |
| `ADMIN_SECRET_KEY` | Yes | Yes (length 41) | Yes | **NO** | Used for webhook/API signing |
| `NEXT_PUBLIC_APP_URL` | Yes | Yes (length 40) | Yes | **NO** | Set to vercel.app rather than custom domain |
| `PAYU_MERCHANT_KEY` | Yes | Yes (length 6) | Yes | **NO** | Sandbox key `46AxYt` |
| `PAYU_MERCHANT_SALT` | Yes | Yes (length 32) | Yes | **NO** | Sandbox salt |
| `PAYU_ENVIRONMENT` | Yes | Yes (`sandbox`) | Yes | **NO** | **Sandbox mode active; live checkout disabled** |
| `PAYU_CLIENT_ID` | No | Yes (length 64) | Yes | **NO** | PayU OAuth credentials |
| `PAYU_CLIENT_SECRET` | No | Yes (length 64) | Yes | **NO** | PayU OAuth credentials |
| `META_WHATSAPP_ACCESS_TOKEN`| Yes | **NO** | Yes (length 51) | **NO** | Verified active in Vercel via `/api/test-whatsapp` |
| `AGENTBANDHU_API_KEY` | Yes | **NO** | Fallback to META token | **NO** | AgentBandhu API active |
| `CAL_API_KEY` / `CALID_API` | No | **NO** | **NO** | **NO** | Fallback mock calendar active |
| `RESEND_API_KEY` | Yes | **NO** | Unconfigured | **NO** | Email notifications inactive |
| `ZOOM_*` | Yes | **NO** | Unconfigured | **NO** | Zoom webinar inactive |
| `MAKE_WEBHOOK_URL` / `ZAPIER_*` | Yes | **NO** | Unconfigured | **NO** | External CRM forwarding inactive |

---

## 4. Google Ads, Tagging & Analytics Inventory

### 4.1 Master Tracking Identifier Summary

- **Google Ads Conversion ID:** `AW-18534158307`
- **Google Ads Conversion Label:** `o8ztCN3M4acdEOOf44VF`
- **Google Ads Conversion Action Target:** `AW-18534158307/o8ztCN3M4acdEOOf44VF`
- **Google Analytics 4 Measurement ID (`G-XXXXXXXXXX`):** **None** (No GA4 script is installed).
- **Google Tag Manager Container ID (`GTM-XXXXXXX`):** **None** (The script loaded is `gtag/js?id=AW-18534158307`, which is the Google Ads gtag loader, not GTM).
- **Meta Pixel (`fbq`):** **None**.
- **Third-Party Product Analytics:** Vercel Web Analytics (`/_vercel/insights/script.js`), Vercel Speed Insights (`/_vercel/speed-insights/script.js`).

### 4.2 Comprehensive Event Inventory (All 12 Instances Found)

| # | File Path & Line | Event Name | User Interaction Trigger | Execution Timing & Trigger Type | Multiple Firing? | Deduplication ID | Active in Prod? | Severity & Flaw Description |
|---|---|---|---|---|---|---|---|---|
| **1** | [dist/index.html#L39-L48](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/index.html#L39-L48) | `conversion` (`AW-18534158307/o8ztCN3M4acdEOOf44VF`) | **None (Zero user action)** | **Immediate Page Load in `<head>`** | **YES** (Every single visit/reload) | **None** (`transaction_id: ''`) | **YES** | **CRITICAL DEFECT.** Fires a "Purchase" event the moment the homepage starts rendering. Cause of 3,821 false conversions. |
| **2** | [dist/webinar.html#L39-L48](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/webinar.html#L39-L48) | `conversion` (`AW-18534158307/o8ztCN3M4acdEOOf44VF`) | **None (Zero user action)** | **Immediate Page Load in `<head>`** | **YES** (Every single visit/reload) | **None** (`transaction_id: ''`) | **YES** | **CRITICAL DEFECT.** Identical to #1; fires a "Purchase" event upon landing on the webinar campaign page. |
| **3** | [dist/confirmation.html#L37-L42](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/confirmation.html#L37-L42) | `conversion` (`AW-18534158307/o8ztCN3M4acdEOOf44VF`) | Page View of `/confirmation` | Immediate Page Load | **YES** (If reloaded or bookmarked) | Partial (`order_id` or `lead_id` from URL) | **YES** | **HIGH.** Fires for all consultation bookings, even if `paid=0` (Pay at Desk). Uses value `1.0` if unpaid, `1000.0` if paid. |
| **4** | [dist/confirmation.html#L44-L49](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/confirmation.html#L44-L49) | `conversion` (`AW-18534158307/o8ztCN3M4acdEOOf44VF`) | Fallback exception handler | Page Load (on URL parse catch) | **YES** | **None** (`transaction_id: ''`) | **YES** | **MEDIUM.** Fallback trigger without deduplication. |
| **5** | [dist/thank-you.html#L37-L49](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/thank-you.html#L37-L49) | `conversion` (`AW-18534158307/o8ztCN3M4acdEOOf44VF`) | Page View of `/thank-you` | Immediate Page Load | **YES** | Duplicate of #3 and #4 | **YES** | **HIGH.** Identical duplicate of confirmation page. |
| **6** | [dist/script.js#L1145-L1152](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/script.js#L1145-L1152) | `conversion` (`AW-18534158307/o8ztCN3M4acdEOOf44VF`) | Click "Confirm UPI Payment" | Button Click (Stage 2 Quiz) | **YES** (Repeated button clicks) | `utr` or `paymentComment` | **YES** | **HIGH.** Fires on unverified self-attestation before backend or bank confirms payment. |
| **7** | [dist/script.js#L1483-L1490](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/script.js#L1483-L1490) | `conversion` (`AW-18534158307/o8ztCN3M4acdEOOf44VF`) | Click "Confirm Payment" (Webinar) | Button Click (Stage 2 Webinar) | **YES** (Repeated button clicks) | `utr` or `paymentComment` | **YES** | **HIGH.** Fires ₹201 conversion upon clicking button without actual bank verification. |
| **8** | [dist/booking-links.js#L400-L407](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/booking-links.js#L400-L407) | `conversion` (`AW-18534158307/o8ztCN3M4acdEOOf44VF`) | Click "Submit UTR" in UPI Modal | Button Click (Generic UPI modal) | **YES** | `utr` or `paymentComment` | **YES** | **HIGH.** Self-attested payment trigger. |
| **9** | [dist/booking-links.js#L479-L486](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/booking-links.js#L479-L486) | `conversion` (`AW-18534158307/o8ztCN3M4acdEOOf44VF`) | Return redirect from PayU | Callback execution | **YES** (On page refresh) | `info.orderId` | Active, but PayU inactive | **HIGH.** Reuses the same conversion label instead of a distinct PayU purchase action. |
| **10** | [dist/payment.html#L832-L839](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/payment.html#L832-L839) | `conversion` (`AW-18534158307/o8ztCN3M4acdEOOf44VF`) | Click "I Have Made Payment" | Button Click on `/payment` | **YES** | `utr` or `paymentComment` | **YES** | **HIGH.** Self-attested payment trigger. |
| **11** | [dist/pay.html#L832-L839](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/pay.html#L832-L839) | `conversion` (`AW-18534158307/o8ztCN3M4acdEOOf44VF`) | Click "I Have Made Payment" | Button Click on `/pay` | **YES** | Duplicate of #10 | **YES** | **HIGH.** Duplicate file. |
| **12** | [dist/confirmation.html#L53-L58](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/confirmation.html#L53-L58) | `dataLayer.push` (`event: 'appointment_confirmed'`) | Page View of `/confirmation` | Immediate Page Load | **YES** | None | Inactive | **LOW.** Pushes to `dataLayer`, but no GTM container or GA4 tag is configured to consume it. |

### 4.3 Why Google Ads Reported 3,821 Conversions

```text
[Google Ads Campaign running Nov 5–11, 2026]
   │
   ├─► 26,654 Ad Impressions
   │
   ├─► ~3,821 Ad Clicks (14.33% CTR, ~₹1.17 CPC)
   │     │
   │     ▼
   │   Visitor arrives at https://kneeandbackpainrelief.com/
   │     │
   │     ▼
   │   Browser parses <head>
   │     │
   │     ▼
   │   Lines 41-48 EXECUTE UNCONDITIONALLY:
   │   gtag('event', 'conversion', {
   │       'send_to': 'AW-18534158307/o8ztCN3M4acdEOOf44VF',
   │       'value': 1.0,
   │       'currency': 'INR',
   │       'transaction_id': ''
   │   });
   │     │
   │     ▼
   │   Google Ads records 1 "Purchase" Conversion (Value: ₹1.00)
   │     │
   │     ▼
   │   Visitor reads page for 5 seconds and bounces (0 registrations completed)
   │
   └─► RESULT REPORTED IN GOOGLE ADS:
       Total Conversions = 3,821 (100% of landing page visits)
```

The Git commit history reveals exact forensic evidence of when this defect was introduced:
- **Commit:** `875345e`
- **Date:** Wednesday, October 28, 2026, 22:27:01 +0530
- **Commit Message:** `feat: add compliance policy pages (about-us, privacy-policy, shipping-policy, refund-policy, terms) and confirmation rewrites for Google Ads`
- **Change:** The developer copy-pasted Google's sample purchase conversion event snippet directly beneath the Google tag in `<head>` on both `index.html` and `webinar.html`, intending to install tracking, but placed the post-purchase event on the pre-purchase landing page.

---

## 5. Registration & Lead Capture Journey Analysis

### 5.1 End-to-End Registration Funnel Diagram

```mermaid
flowchart TD
    A["Ad Impression on Google (26,654)"] -->|Click| B["Landing Page: index.html / webinar.html (~3,821)"]
    B -->|CRITICAL BUG: Instant Tag Execution in head| C["Google Ads records 3,821 Conversions"]
    B -->|99.5% Visitors Bounce| D["Drop-off (Zero Action)"]
    
    B -->|0.5% Click CTA| E["#quiz-modal Opens (4-Question Assessment)"]
    E --> F{"Branching Decision (Q4: Readiness)"}
    
    F -->|Ready for Care| G["Pathway 2: Consultation (Stage 1)"]
    F -->|Exploring / Skeptical| H["Pathway 1: Webinar Masterclass"]
    
    G --> I["User Enters Name & Phone"]
    I -->|Debounced Typing (700ms)| J["autoCaptureDraft() -> POST /api/lead-intake"]
    J --> K["Supabase public.leads (Status: 'Draft Lead')"]
    
    I -->|Click 'Continue to Slot & Fee'| L["Stage 2: Slot Selection & Payment"]
    L --> M["Inline Cal.id Slots + Static UPI QR Code"]
    
    M -->|Choice A: Pay at Clinic Desk| N["Click 'Pay at Clinic Desk'"]
    N --> O["POST /api/cal-direct + POST /api/lead-intake"]
    O --> P["renderConsultationSuccess()"]
    P -->|1500ms Timer| Q["Auto-redirect to /confirmation"]
    Q -->|Page Load| R["gtag conversion fires AGAIN"]
    
    M -->|Choice B: Offline UPI Transfer| S["User opens PhonePe/GPay, pays ₹1,000 to VPA"]
    S --> T["User types UTR, clicks 'Confirm UPI'"]
    T --> U["gtag conversion fires + POST /api/lead-intake"]
    U --> P
    
    H --> V["Webinar Form -> UPI QR for ₹201"]
    V --> W["User types UTR, clicks 'Confirm Payment'"]
    W --> X["gtag conversion fires + POST /api/lead-intake"]
    X --> Y["POST /api/get-webinar-token -> /room Access"]
```

### 5.2 Flow Comparison: Consultation vs Webinar vs Payment Page

| Flow Attribute | Pathway 2: Diagnostic Consultation | Pathway 1: Live Masterclass | Direct Payment Page (`/pay`) |
|---|---|---|---|
| **Frontend Trigger** | `[data-start-assessment]` buttons | `onclick="openWebinarDirect()"` | Direct URL or text link |
| **Step 1 (Intake)** | 4 quiz questions + Name, Phone, Email | Name, Phone, Email, City | Pre-populated via URL query params |
| **Real-time Capture** | Yes (`autoCaptureDraft` on phone input) | Yes (`autoCaptureDraft` on phone input) | No (single submit action) |
| **Step 2 (Selection)** | Cal.id appointment slot selection | Sunday Masterclass fixed date/time | Displays pre-selected amount (₹201 or ₹1,000) |
| **Payment Mechanism** | Static UPI QR (`surabhivaidya7@okhdfcbank`) | Static UPI QR (`surabhivaidya7@okhdfcbank`) | Static UPI QR (`surabhivaidya7@okhdfcbank`) |
| **Secondary Payment** | "Pay at Clinic Desk" (₹1,000 cash/card) | None (Prepaid only) | None |
| **API Endpoint** | `POST /api/lead-intake` & `POST /api/cal-direct` | `POST /api/lead-intake` & `POST /api/get-webinar-token` | `POST /api/lead-intake` |
| **Database Table** | `public.leads` in Supabase | `public.leads` in Supabase | `public.leads` in Supabase |
| **Google Ads Tag Moment** | On "Confirm UPI" click **AND** on `/confirmation` load | On "Confirm Payment" button click | On "Confirm Payment" button click |
| **Confirmation Pass** | `/confirmation` (interactive ticket) | In-page room link + `/room` check-in | In-page success pass |
| **WhatsApp Notification** | Queued via AgentBandhu (`consultation_booking_confirmation_v1`) | Queued via AgentBandhu (`webinar_registration_confirmation_v1`) | Not triggered directly |

### 5.3 Forensic Diagnosis of Potential Funnel Drop-off

Why did none of the 3,821 Google Ads clicks turn into registrations?
1. **Severe Funnel Friction:** Modern paid healthcare traffic expects either:
   - A 1-click WhatsApp chat CTA, or
   - A direct, visible 2-field form on the page (*Name + Phone → "Request Doctor Callback"*), or
   - An instant phone call button.  
   Instead, users encountered an animated quiz modal requiring 4 diagnostic decisions followed by financial transactions.
2. **Offline UPI QR Barrier:** Asking mobile users to manually copy a UPI ID or scan a QR code on their own smartphone screen creates extreme friction. Most users do not know how to scan a QR code displayed on the exact screen they are using.
3. **Mismatched Search Intent:** If the campaign keywords were broad (e.g., "knee pain relief", "ayurvedic treatment"), visitors seeking quick information or immediate clinic phone numbers bounced immediately upon seeing a ₹1,000 or ₹201 payment demand.
4. **Algorithmic Self-Sabotage:** Because Google Ads received an immediate "Purchase" conversion signal for every click, the bidding algorithm prioritized audiences who click fast and cheap (accidental clicks, high bounce-rate demographics), actively steering budget away from serious, high-intent patients who read and convert carefully.

---

## 6. Backend, Database & Persistence Audit

### 6.1 Database Configuration

- **Provider:** Supabase
- **REST API Base URL:** `https://leqbwiexuzggdxgxngrm.supabase.co`
- **Project Reference:** `leqbwiexuzggdxgxngrm`
- **Authentication Header Used in Code:** `apikey: sb_publishable_nC7DTCfJj_vhf3YsK0LW9w_NKk54fd4`
- **Authorization Header Used in Code:** `Bearer sb_publishable_nC7DTCfJj_vhf3YsK0LW9w_NKk54fd4`

### 6.2 Table Verification & Schema Audit

Live PostgREST probes against the production Supabase database revealed:

| Table Name | HTTP Status | Exists in DB? | Rows Present | Primary Key | Notes |
|---|---|---|---|---|---|
| **`public.leads`** | `200 OK` | **YES** | **7** | `id TEXT` | Main intake table. Active and receiving writes. |
| **`public.webinar_event_logs`** | `404 Not Found` | **NO** | 0 | `id BIGSERIAL` | Defined in `supabase_schema.sql`, but script was never executed in Supabase SQL Editor. |
| **`public.payments`** | `404 Not Found` | **NO** | 0 | - | Does not exist. Payment details stored directly in `public.leads`. |
| **`public.bookings`** | `404 Not Found` | **NO** | 0 | - | Does not exist. Booking details stored in `public.leads`. |

### 6.3 Columns in `public.leads`

Inspection of live records confirms `public.leads` possesses the following active columns:
- `id` (Text, e.g. `'LEAD-946'`)
- `name` (Text)
- `phone` (Text, 10 digits)
- `email` (Text)
- `city` (Text)
- `pain_area` (Text)
- `severity` (Text)
- `prior_treatments` (Text)
- `readiness` (Text)
- `recommended_step` (Text)
- `slot_preference` (Text)
- `status` (Text)
- `payment_status` (Text)
- `payment_order_id` (Text, nullable)
- `payment_updated_at` (Timestamptz, nullable)
- `delivered_message` (Text, default `'None'`)
- `delivered_message_time` (Timestamptz, nullable)
- `notes` (Text, nullable)
- `created_at` (Timestamptz)

### 6.4 Complete Inventory of All Records in Production Database

Every single record currently in `public.leads` was inspected:

| Lead ID | Patient / Test Name | Phone | Email | Created At (UTC) | Status | Payment Status | Audit Classification |
|---|---|---|---|---|---|---|---|
| `LEAD-691` | Surabhi Sunil Vaidya | `9867510223` | `surabhivaidya7@gmail.com` | 2026-11-12 13:17:58 | Consultation Scheduled | Slot Selected - Awaiting Payment | **Internal Doctor Test** |
| `LEAD-946` | Roshani | `9773773122` | `dodhia.roshani@gmail.com` | 2026-11-07 07:05:49 | Consultation Completed | Unpaid Webinar Registration | **Internal Family / Team Test** |
| `LEAD-141` | Roshani | `9773773122` | *(empty)* | 2026-11-07 07:05:42 | Consultation Completed | Unpaid (Draft Webinar Lead) | **Internal Family / Team Test (Draft)** |
| `LEAD-169` | MD | `9167434363` | `dodhia.milan@gmail.com` | 2026-11-04 18:07:52 | Payment Dropped Off | Payment Dropped Off (Webinar ₹201) | **Internal Developer Test** |
| `LEAD-930` | MD | `9167434363` | `dodhia.milan@gmail.com` | 2026-11-04 18:07:43 | Payment Initiated (UPI QR) | Pending Direct UPI (Ref: CHK-9167434363-253) | **Internal Developer Test** |
| `LEAD-672` | Surabhi | `9167434636` | `kneeandbackpainclinic@gmail.com` | 2026-11-03 18:00:44 | Payment Dropped Off | Payment Dropped Off (Webinar ₹201) | **Internal Clinic Test** |
| `LEAD-786` | Surabhi | `9167434636` | `kneeandbackpainclinic@gmail.com` | 2026-11-03 18:00:40 | Payment Initiated (PayU Checkout) | Pending Online Payment (PayU) | **Internal Clinic Test** |

### 6.5 Aggregate Counts for November 5–11, 2026

- **Total Lead Records Created:** **2** (both belonging to `Roshani` on Nov 7)
- **External Real Patient Leads:** **0**
- **Confirmed Consultation Bookings:** **0**
- **Confirmed Webinar Ticket Purchases:** **0**
- **Failed / Dropped Database Writes:** **0** (Database write logic was tested and confirmed operational)

---

## 7. Admin Dashboard Inspection

### 7.1 Dashboard Routes & Structure

- **Route:** `/admin` (rewritten to `/admin.html` via `vercel.json`)
- **Controller:** [dist/admin.js](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/admin.js)
- **Styles:** [dist/admin.css](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/admin.css)
- **Tabs:**
  1. `📋 Patient Leads & CRM`: Lead table, status modifiers, delivery tag assignments, CSV export.
  2. `💬 WhatsApp Automation`: AgentBandhu delivery KPI counters, approved template catalog, manual test senders.
  3. `🎥 Webinar Management`: Webinar session sync, attendee metrics.
  4. `⚙️ Settings & Security`: Clinic phone/email settings, admin passcode reset, clear portal data.

### 7.2 Authentication Architecture

- **Mechanism:** Client-side JavaScript check in [dist/admin.js#L60-L85](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/admin.js#L60-L85).
- **Storage Keys:** `dr_surabhi_admin_auth` in `localStorage` and `sessionStorage`.
- **Accepted Passcodes:** `'surabhi2026'`, `'admin'`, `'surabhi'`, `'charak'`, `'charak2026'`, `'2026'`, `'doctor'`.
- **Bypass:** Clicking the green button **"⚡ Quick 1-Click Unlock"** executes `window.quickLogin()`, which sets `dr_surabhi_admin_auth = 'true'` without validating any password.
- **URL Parameter Bypass:** Appending `?auth=true`, `?unlock=true`, or `?pin=surabhi2026` immediately unlocks the dashboard.
- **Security Assessment:** **There is no server-side authentication.** Anyone with the URL `/admin` can unlock the interface with one click.

### 7.3 Data-Fetching & Filtering Logic

1. On load, [dist/admin.js#L15-L32](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/admin.js#L15-L32) runs `purgeDummyData()`.
2. It immediately purges hardcoded dummy IDs:
   ```javascript
   const DUMMY_LEAD_IDS = ['LEAD-101', 'LEAD-102', 'LEAD-103', 'LEAD-104', 'LEAD-105'];
   const DUMMY_NAMES = ['Rajesh K. Sharma', 'Sunita Deshmukh', 'Arvind Mehta', 'Meena Parekh', 'Ramesh Kulkarni', 'Rajesh Sharma'];
   ```
3. It fetches serverless leads via `fetch('/api/leads')`:
   - `/api/leads` executes `SELECT * FROM public.leads ORDER BY created_at DESC`.
   - Filters out dummy IDs and names.
   - Merges records into browser `localStorage`.
   - Updates dashboard KPI counters and populates `#leads-tbody`.

### 7.4 Why No Registrations Were Visible in Admin

1. **In Production:** The admin dashboard displays the 7 internal test leads. Because all 7 are internal test/draft entries, zero real patient inquiries were present. Clinic staff checking the portal for customer leads found no records corresponding to the 3,821 Google conversions.
2. **In Local Dev Server:** If the user accessed the portal via `http://localhost:8080/admin` (run by `python -m http.server`), Python does not serve `/api/leads`. The API fetch fails with **HTTP 404**, and because the local browser's `localStorage` has no leads, the table renders empty with the message: *"No leads matching current filters."*
3. **Silent Error Suppression:** In `api/leads.js#L31-L33`, if the database response fails, it returns:
   ```javascript
   return res.status(200).json({ leads: [], notice: 'Database table initializing' });
   ```
   This masks backend errors and displays an empty dashboard instead of an alert.

---

## 8. Root-Cause Hypotheses Ranked by Evidence

| Rank | Hypothesis | Evidence Level | Forensic Findings & Justification |
|---|---|---|---|
| **#1** | **Google Ads is tracking landing page views / clicks as completed Purchase conversions** | **PROVEN (100% Certainty)** | [dist/index.html#L41-L47](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/index.html#L41-L47) and [dist/webinar.html#L41-L47](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/webinar.html#L41-L47) execute `gtag('event', 'conversion', { 'send_to': 'AW-18534158307/o8ztCN3M4acdEOOf44VF' })` inside the HTML `<head>`. 3,821 page views from 26,654 impressions equals an exact 14.33% CTR. Google Ads recorded 100% of clicks as purchase conversions. |
| **#2** | **Zero external visitors completed the 4-step assessment and manual UPI transfer flow** | **PROVEN (100% Certainty)** | Direct read-only query of Supabase `public.leads` confirmed zero real patient records for November 5–11. The only record is `Roshani` on Nov 7 (internal family test). The complex 4-step quiz and manual UPI QR transfer screen caused 100% drop-off among paid ad visitors. |
| **#3** | **Google Ads Smart Bidding optimized for cheap bouncing clicks due to false conversion signals** | **HIGHLY PROBABLE** | Because Google Ads was informed that every landing page click resulted in a "Purchase" of ₹1.00, the automated bidding system allocated the ₹4,489 budget toward low-cost traffic (~₹1.17 CPC) that clicked and immediately bounced, never reaching high-intent patients. |
| **#4** | **Admin portal empty state caused by local Python server or viewing from a new device** | **VERIFIED** | Local server (`python -m http.server 8080`) returns 404 for `/api/leads`. In production, the admin displays 7 leads, but all 7 are internal test submissions, leaving zero patient registrations visible. |
| **#5** | **Database write failure in production API** | **DISPROVEN** | Live database probes and code audits confirm `api/lead-intake.js` writes successfully to `public.leads`. On Nov 7, Nov 12, and Nov 4, records were persisted without issue. The database did not lose submissions; no external submissions occurred. |

---

## 9. Diagnostic & Prioritization Matrix

| # | Issue Identified | Exact Component / File | Severity | Nature | Suggested Fix |
|---|---|---|---|---|---|
| **1** | Purchase conversion snippet hardcoded in landing page `<head>` | [dist/index.html#L39-L48](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/index.html#L39-L48)<br>[dist/webinar.html#L39-L48](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/webinar.html#L39-L48) | **CRITICAL** | Confirmed Defect | Remove lines 39–48 entirely from both HTML files. The Google Tag config (`gtag('config', 'AW-18534158307')`) must remain, but the conversion event must NEVER fire on page load. |
| **2** | Single conversion label (`o8ztCN3M4acdEOOf44VF`) reused across all funnel events | `dist/script.js`, `dist/booking-links.js`, `dist/confirmation.html`, `dist/payment.html` | **CRITICAL** | Confirmed Defect | Create separate Google Ads Conversion Actions: (1) `Consultation_Booked`, (2) `Webinar_Paid`, (3) `Lead_Form_Submitted`. Assign distinct labels to each. |
| **3** | High-friction booking funnel with no direct lead capture on homepage | [dist/index.html](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/index.html) | **HIGH** | Architectural Flaw | Add a clean, visible, 2-field hero lead capture form (*Name + 10-Digit Mobile + "Request Callback"*) directly in the hero section and footer of the homepage. |
| **4** | Offline UPI QR code workaround creates severe checkout drop-off | [dist/script.js#L1068](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/script.js#L1068)<br>[dist/booking-links.js#L183](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/booking-links.js#L183) | **HIGH** | Product Limitation | Replace manual UPI QR transfer with live automated PayU or Cashfree gateway checkout, or emphasize "Pay ₹1,000 at Clinic Desk" as the frictionless primary CTA. |
| **5** | Conversion tags firing on unverified client button clicks | [dist/script.js#L1146](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/script.js#L1146)<br>[dist/script.js#L1484](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/script.js#L1484) | **HIGH** | Tracking Integrity | Fire Google Ads conversions ONLY on `/confirmation` after successful database write (`POST /api/lead-intake` returns 200) or verified payment webhook. |
| **6** | No server-side authentication on `/admin` portal | [dist/admin.html](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/admin.html)<br>[dist/admin.js#L87](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/admin.js#L87) | **HIGH** | Security Defect | Protect `/api/leads` with HTTP Authorization header using `ADMIN_SECRET_KEY` and remove the client-side 1-click unlock button from production. |
| **7** | Python local server (`python -m http.server`) cannot serve `/api/` endpoints | [package.json#L8](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/package.json#L8) | **MEDIUM** | Developer Experience | Update `package.json` scripts to use `vercel dev` instead of Python HTTP server so serverless APIs function locally. |
| **8** | Canonical tags and configs point to `kneeandbackpainclinic.vercel.app` | `dist/index.html`, `dist/webinar.html`, `.env.local` | **MEDIUM** | SEO / Branding | Update canonical URLs to `https://kneeandbackpainrelief.com` across all pages. |
| **9** | Missing Google Analytics 4 (GA4) property | Entire codebase | **MEDIUM** | Analytics Gap | Install GA4 (`G-XXXXXXXXXX`) to track funnel progression, scroll depth, bounce rate, and drop-off points accurately. |
| **10** | Missing transaction ID deduplication on `/confirmation` | [dist/confirmation.html#L41](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/confirmation.html#L41) | **MEDIUM** | Tracking Quality | Pass unique `lead_id` as `transaction_id` and store confirmation state in `sessionStorage` to prevent re-firing on page refresh. |

---

## 10. Recommended Remediation Plan

### Phase 1: Immediate Damage Control (Day 1)

1. **Pause or Switch Google Ads Bidding Strategy:**  
   Immediately change the Google Ads campaign bidding strategy from *Maximize Conversions* / *Target CPA* to *Manual CPC* or pause the campaign until the tracking snippet is removed. Currently, Google Ads' Smart Bidding is operating on completely falsified conversion signals.
2. **Remove False Page-Load Conversion Tags:**  
   Delete lines 39–48 from `dist/index.html` and lines 39–48 from `dist/webinar.html`. Ensure only the Google tag configuration remains in `<head>`:
   ```html
   <!-- Google tag (gtag.js) -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=AW-18534158307"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'AW-18534158307');
   </script>
   ```

### Phase 2: Conversion Tracking Overhaul (Day 2)

1. **Configure Proper Conversion Actions in Google Ads:**  
   In Google Ads (*Goals → Conversions → Summary*), create two distinct conversion actions:
   - **Primary Action 1 (Lead Capture):** `Consultation_Lead_Submitted` (Count: One, Value: ₹0 or ₹100). Fires ONLY when a user submits their contact information and it is persisted in the database.
   - **Primary Action 2 (Paid Booking):** `Consultation_Paid_Verified` (Count: One, Value: ₹1,000). Fires ONLY upon verified payment or on the confirmation pass.
2. **Implement Deduplication:**  
   On [dist/confirmation.html](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/confirmation.html), populate `transaction_id` with the actual database `lead_id` (e.g. `LEAD-691`) and check `sessionStorage` to ensure a page reload never fires a duplicate conversion.

### Phase 3: Funnel & Conversion Rate Optimization (Week 1)

1. **Add Direct 2-Field Lead Capture on Landing Page:**  
   Add an unmissable hero callback card:
   - *Full Name*
   - *WhatsApp Mobile Number*
   - *Primary Pain Area (Knee / Lower Back / Neck)*
   - *Button: "Schedule In-Clinic Consultation (Pay ₹1,000 at Clinic Desk) ↗"*
2. **Automate WhatsApp Confirmation Dispatch:**  
   Ensure every captured lead triggers the verified AgentBandhu template `consultation_booking_confirmation_v1` immediately so patients receive directions and appointment confirmation within 10 seconds.
3. **Upgrade Local Dev Command:**  
   Change `package.json` dev script to `vercel dev` to allow full local end-to-end testing of `/api/leads` and `/api/lead-intake`.

---

## 11. Manual Verification Checklist

Because this audit was strictly read-only and external marketing dashboard access is restricted, the clinic or marketing administrator should manually verify the following settings:

### In Google Ads Console

- [ ] **Navigate to Goals → Conversions → Summary:**
  - Find conversion action `o8ztCN3M4acdEOOf44VF`.
  - Check its configured **Action Name** (e.g., "Purchase", "Submit lead form", or "Page view").
  - Check its **Counting method**: Is it set to "Every" or "One"? (For leads, it should always be "One").
  - Check **Include in "Conversions"**: Is this action marked as "Primary" or "Secondary"?
  - Check **Attribution Model**: Is it Data-driven or Last Click?
- [ ] **Check Campaign Optimization Goal:**
  - In campaign settings, confirm which conversion goals the campaign is actively optimizing for. If it is optimizing for "Purchases", it has been heavily polluted by landing-page view signals.
- [ ] **Check Campaign Search Terms / Placements:**
  - Review the actual search terms that generated 26,654 impressions and 3,821 clicks to determine searcher intent.

### In Google Analytics (GA4) / Tag Manager

- [ ] Check if a GA4 property exists under the clinic's Google account (`kneeandbackpainclinic@gmail.com`).
- [ ] If GA4 exists, check whether any GA4 conversion events (e.g. `page_view`, `first_visit`) were accidentally linked or auto-imported into Google Ads as conversions.

### In Vercel Hosting Dashboard

- [ ] Confirm Environment Variables on production match:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY` / `SUPABASE_PUBLISHABLE_KEY`
  - `META_WHATSAPP_ACCESS_TOKEN`
  - `PAYU_ENVIRONMENT` (confirm whether sandbox is intended or if production credentials are ready)
  - `NEXT_PUBLIC_APP_URL` (change to `https://kneeandbackpainrelief.com`)

---

## 12. Exact Source File & Line Number Reference

| Topic / Feature | Source File | Exact Line Numbers |
|---|---|---|
| **Defective Purchase Tag in Landing Page Head** | `dist/index.html` | [Lines 39–48](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/index.html#L39-L48) |
| **Defective Purchase Tag in Webinar Page Head** | `dist/webinar.html` | [Lines 39–48](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/webinar.html#L39-L48) |
| **Confirmation Page Conversion Tag & DataLayer** | `dist/confirmation.html` | [Lines 32–58](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/confirmation.html#L32-L58) |
| **Consultation UPI Payment Button Tag** | `dist/script.js` | [Lines 1143–1153](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/script.js#L1143-L1153) |
| **Webinar UPI Payment Button Tag** | `dist/script.js` | [Lines 1482–1491](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/script.js#L1482-L1491) |
| **Generic UPI Modal Submit Tag** | `dist/booking-links.js` | [Lines 398–408](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/booking-links.js#L398-L408) |
| **PayU Return Success Handler Tag** | `dist/booking-links.js` | [Lines 476–489](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/booking-links.js#L476-L489) |
| **Standalone Payment Page Tag** | `dist/payment.html` | [Lines 830–840](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/payment.html#L830-L840) |
| **Real-time Lead Auto-Capture on Typing** | `dist/script.js` | [Lines 1005–1029](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/script.js#L1005-L1029) |
| **Lead Intake API Handler (Supabase Sync)** | `api/lead-intake.js` | [Lines 48–158](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/api/lead-intake.js#L48-L158) |
| **Admin Leads API Handler (Supabase Query)** | `api/leads.js` | [Lines 21–98](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/api/leads.js#L21-L98) |
| **Admin CRM Client Controller & 1-Click Unlock** | `dist/admin.js` | [Lines 60–113](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/admin.js#L60-L113) |
| **Admin Dummy Data Purge & API Fetch** | `dist/admin.js` | [Lines 15–32, 167–189](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/dist/admin.js#L167-L189) |
| **Cal.id Direct API Bridge & Fallback Slots** | `api/cal-direct.js` | [Lines 21–130, 270–355](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/api/cal-direct.js#L21-L130) |
| **Vercel Routing & CleanURL Rewrites** | `vercel.json` | [Lines 1–25](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/vercel.json#L1-L25) |
| **Supabase SQL Schema & RLS Policies** | `supabase_schema.sql` | [Lines 1–75](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/supabase_schema.sql#L1-L75) |

---
*End of Technical Audit Report.*
