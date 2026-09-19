# Patient Lead Message Delivery Tagging & CRM Automation Architecture
**Dr. Surabhi Vaidya Knee & Back Pain Clinic (Charak Health Solutions, Thane West)**

---

## 1. Overview & Tagging Taxonomy

Every patient who completes the 60-Second Pain Assessment or registers for a clinical session is automatically recorded into the clinic's database (Supabase `public.leads` and the local CRM engine). 

Clinic staff can tag and track exactly which clinical communication template has been delivered to each patient.

### Message Delivery Tags

| Tag Code | Clinical Message Template | Target Pathway | Trigger Moment |
| :--- | :--- | :--- | :--- |
| **`None`** | ⏳ Unsent / Intake Pending | All Pathways | Default upon initial quiz registration |
| **`T1`** | **₹4,000 1-Day Trial Booking Confirmation** | 1-Day Experience Session | Sent immediately after slot reservation on Cal.id |
| **`T2`** | **₹1,000 Consultation Schedule & MRI Request** | Diagnostic Consultation | Sent to request previous X-Rays / MRI scans for Naadi Pariksha |
| **`T3`** | **₹201 Webinar.gg Access Link & Diet Protocol** | Live Hindi Masterclass | Sent upon Cashfree PG confirmation with direct room credentials |
| **`R1`** | **24-Hour Webinar Reminder** | Masterclass Attendees | Sent 1 day prior to Sunday 11:00 AM IST session |
| **`R2`** | **1-Hour Webinar Urgent Reminder** | Masterclass Attendees | Sent 60 minutes prior with join button |
| **`F1`** | **Post-Session Relief Check-in** | Completed Patients | Sent next day to record mobility score (1–10) |

---

## 2. Lead Record Schema (`public.leads` in Supabase)

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `id` | `TEXT PRIMARY KEY` | Unique lead ID (e.g. `LEAD-101`) |
| `name` | `TEXT` | Patient full name |
| `phone` | `TEXT` | 10-digit mobile number |
| `city` | `TEXT` | Patient locality (e.g. Thane, Mulund, Mumbai) |
| `pain_area` | `TEXT` | Knee, Lower Back, Cervical Spine, Bilateral Joints |
| `severity` | `TEXT` | Severity descriptor from clinical assessment |
| `recommended_step` | `TEXT` | ₹4,000 Trial / ₹1,000 Consultation / ₹201 Masterclass |
| `slot_preference` | `TEXT` | Preferred date or intake window |
| `status` | `TEXT` | `New Lead`, `Trial Scheduled`, `Consultation Scheduled`, `Paid & Confirmed` |
| **`delivered_message`** | `TEXT` | Tag of delivered message (`T1`, `T2`, `T3`, `R1`, `R2`, `F1`, `None`) |
| **`delivered_message_time`**| `TIMESTAMPTZ` | Exact ISO timestamp when communication was delivered |
| **`payment_status`** | `TEXT` | `Unpaid`, `Paid (₹201)`, `Paid (₹1,000)`, `Paid (₹4,000)` |
| `payment_order_id` | `TEXT` | Cashfree PG Order ID (e.g. `ORD_17424...`) |
| `created_at` | `TIMESTAMPTZ` | Timestamp when patient completed assessment |

---

## 3. How Clinic Staff Operates Message Delivery Tagging

1. **Live CRM Leads Table (`/admin`)**:
   - The table displays real-time badges and an interactive dropdown for every lead under **"Delivered Message"**.
   - Staff can change the tag with 1 click (`T1`, `T2`, `T3`, `R1`, `R2`, `F1`).
   - The change automatically syncs to Supabase (`PATCH /api/leads`) and updates the staff dashboard instantly.

2. **Auto-Tagging via Staff WhatsApp Dispatcher (Tab 2)**:
   - When staff selects a patient and clicks **"Open WhatsApp & Send to Patient"**, the CRM automatically tags that lead with the selected template and timestamps the delivery.

3. **CSV Export & Audit Trail**:
   - Clicking **"📥 Export CSV"** produces an audit spreadsheet containing every lead with their `Payment Status`, `Delivered Message`, and `Delivered Timestamp`.

---

## 4. Cal.id Embedded Calendar Integration

Patients booking appointments never leave the website. The calendar from `https://cal.id/charakhealth` is embedded directly on the page:

- **Inline Assessment Embed**:
  When a patient finishes the 60-second assessment for the ₹4,000 Trial or ₹1,000 Consultation, the Cal.id calendar is rendered directly within the card, pre-populating their name and mobile number.
- **On-Page Modal (`#cal-modal`)**:
  All header, footer, and package booking buttons trigger a dedicated, full-featured on-page modal (`#cal-modal`) with `embed=true`.
- **Clinic Address & Coordinates**:
  `Charak Health Solutions, Cura 304, Raymond TenX Habitat, Pokharan Road No. 2, Vartak Nagar, Thane West, Maharashtra 400606`.

---

## 5. Cashfree Payment Gateway Integration

Cashfree PG has replaced Razorpay across all payment touchpoints:

- **Serverless Endpoint (`POST /api/create-cashfree-order`)**:
  Generates secure Cashfree PG orders with `order_amount`, `customer_details`, and redirect/webhook URLs.
- **Frontend SDK v3 (`https://sdk.cashfree.com/js/v3/cashfree.js`)**:
  Triggers a seamless modal popup checkout (`redirectTarget: "_modal"`).
- **Payment Verification & Webhook (`POST /api/cashfree-webhook`)**:
  Captures `PAYMENT_SUCCESS_WEBHOOK` events and marks the lead `Paid & Confirmed` in Supabase.

---

## 6. Webinar.gg Integration Architecture

Following the architecture from the reference project:

- **Token Generation (`POST /api/get-webinar-token`)**:
  Calls `https://webinar-api.webinar.gg/api/v1/webinar/join-token` using `WEBINAR_GG_API_KEY` to grant authenticated access to registered attendees.
- **Live Metrics Endpoint (`GET /api/get-webinar-metrics?id=charakhealth`)**:
  Calls `https://webinar-api.webinar.gg/api/v1/webinar/{id}/metrics` to fetch live attendees, peak users, and session duration directly into the admin portal.
- **Attendee Event Webhook (`POST /api/webinar-webhook`)**:
  Listens for `join`, `leave`, `poll`, and `chat` events and archives them to `webinar_event_logs`.
