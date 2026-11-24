# KNEE & BACK PAIN CLINIC — WHATSAPP AUTOMATION MATRIX
## Communication Workflows, Template Registry & Drop-Off Recovery Engine

**Client:** Dr. Surabhi Sunil Vaidya · Charak Health Solutions, Thane West  
**Domain:** [https://kneeandbackpainrelief.com](https://kneeandbackpainrelief.com)  
**Messaging Provider:** AgentBandhu (Official Meta WhatsApp Business Cloud API Partner)  
**Base API Endpoint:** `https://agentbandhu.com/api/v1/public/messages`  
**API Key Environment Variable:** `AGENTBANDHU_API_KEY` (or `META_WHATSAPP_ACCESS_TOKEN`)

---

## 1. Compliance Architecture & Regulatory Rules

To adhere strictly to **Meta WhatsApp Business Messaging Policies** and **TRAI (Telecom Regulatory Authority of India)** guidelines, our communication architecture strictly divides messages into two categories:

### A. Transactional / Service Communications (No Marketing Consent Needed)
- Triggered exclusively by explicit patient requests (e.g., booking an appointment, requesting appointment details, 30-minute reminder of a booked appointment).
- Meta Template Category: **`UTILITY`**.
- Can be dispatched to any patient who voluntarily scheduled an appointment.

### B. Promotional / Drop-Off Follow-Up Communications (Opt-In Required)
- Sent to recover visitors who abandoned the booking funnel or to share clinic health guidance.
- Meta Template Category: **`MARKETING`** or approved informational Utility templates.
- **Strict Pre-Condition:** Handled only when the patient has `opted_out !== true` and has provided WhatsApp consent.
- **Mandatory Opt-Out Mechanism:** Every promotional or re-engagement message provides clear opt-out language ("Reply STOP to opt out").

---

## 2. Complete Workflow Automation Matrix

| Trigger Event | Timing | Template Name | Meta Category | Variables & Content | Deduplication & Persistence Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Lead Captured (Initial Contact)** | Instant (upon form submit on homepage) | `surabhi_v4_no_image` | `UTILITY` | **{{1}}** Patient Name<br>**{{2}}** Thank you for contacting Dr. Surabhi Vaidya at Charak Health Solutions.<br>**{{3}}** We have received your consultation enquiry regarding knee/back discomfort.<br>**{{4}}** You can select your preferred slot anytime at kneeandbackpainrelief.com or call +91 90822 80274. | Supabase `delivered_message`: `initial_lead_acknowledgement` |
| **2. Appointment Slot Reserved (Payment in Clinic)** | Instant (upon selecting slot & clicking Payment in Clinic) | `surabhi_v4_with_image` | `UTILITY` | **Attached Header:** Clinic UPI QR Code (`charak-upi-qr.jpg`)<br>**{{1}}** Patient Name<br>**{{2}}** Your consultation slot with Dr. Surabhi Vaidya is confirmed for {Slot}. Location: Cura 304, Raymond TenX Habitat, Pokharan Rd No. 2, Thane West.<br>**{{3}}** Standard Fee: ₹1,000 at clinic desk. Special 20% Discount: Prepay ₹800 via UPI VPA: `surabhivaidya7@okhdfcbank`<br>**{{4}}** Scan the QR code above or tap here to pay: kneeandbackpainrelief.com/pay-upi?am=800 | Supabase `delivered_message`: `consultation_booking_confirmation_qr` |
| **3. 30-Minute Consultation Reminder** | T minus 30 minutes (15 to 45 min window ahead of slot) | `surabhi_v4_no_image` | `UTILITY` | **{{1}}** Patient Name<br>**{{2}}** Reminder: Your in-clinic consultation begins in 30 minutes at {Time}.<br>**{{3}}** Location: Charak Health Solutions, Cura 304, Raymond TenX Habitat, Pokharan Rd No. 2, Thane West.<br>**{{4}}** Please arrive 10 minutes early. Bring relevant reports and current medicine list, if available. | Lead status updated to: `Consultation Scheduled (Reminded)`. Note added to `prior_treatments`. |
| **4. Incomplete Booking Recovery (Drop-off)** | 15 to 30 minutes after lead capture (No slot selected) | `surabhi_v4_no_image` | `UTILITY` | **{{1}}** Patient Name<br>**{{2}}** We noticed you started reserving a consultation with Dr. Surabhi Vaidya but haven't chosen your slot.<br>**{{3}}** Exclusive 20% Discount: Prepay ₹800 via UPI VPA: `surabhivaidya7@okhdfcbank` (Save ₹200 vs standard ₹1,000 at clinic).<br>**{{4}}** To select your preferred slot and pay ₹800 directly: kneeandbackpainrelief.com/pay-upi?am=800 | Supabase `recovery_step`: `incomplete_15m`. Skipped if `recovery_step` already set or `opted_out = true`. |
| **5. Abandoned Checkout Recovery** | 24 hours after slot chosen (Payment pending) | `surabhi_v4_with_image` | `UTILITY` | **Attached Header:** Clinic UPI QR Code (`charak-upi-qr.jpg`)<br>**{{1}}** Patient Name<br>**{{2}}** Your in-clinic consultation slot with Dr. Surabhi Vaidya is held for you at Charak Health Solutions, Thane West.<br>**{{3}}** Special 20% Savings: Prepay ₹800 via UPI VPA: `surabhivaidya7@okhdfcbank` (or pay standard ₹1,000 at clinic reception).<br>**{{4}}** Scan the QR code above or tap here to pay ₹800: kneeandbackpainrelief.com/pay-upi?am=800 | Supabase `recovery_step`: `abandoned_24h`. Skipped if already paid, `recovery_step` set, or `opted_out = true`. |
| **6. Visit Completed (Google Review Request)** | Instant (upon admin setting status to "Visit Completed" or clicking "⭐ Review") | `post_experience_google_review_v1` (Fallback: `surabhi_v4_no_image`) | `MARKETING` / `UTILITY` | **{{1}}** Patient Name<br>**Google Review Link:** `https://g.page/r/CWxrIXBs-xz7EAE/review`<br>Neutral review invitation asking for patient feedback. Dispatches marketing template with CTA button or guaranteed utility fallback with direct link. | Supabase `delivered_message`: `post_experience_google_review_v1` |
| **7. Payment Confirmed & Slot Booked** | Instant (upon admin selecting "Confirmed - Paid Online" or "Confirmed - Payment Received") | `surabhi_v4_no_image` | `UTILITY` | **{{1}}** Patient Name<br>**{{2}}** Your consultation payment has been received and your appointment is confirmed with Dr. Surabhi Vaidya.<br>**{{3}}** Slot & Location: {Slot}. Location: Cura 304, Raymond TenX Habitat, Pokharan Rd No. 2, Thane West.<br>**{{4}}** Please arrive 10 minutes early. Bring relevant reports and current medicine list. | Supabase `delivered_message`: `surabhi_v4_no_image`, `payment_status`: `Paid` |
| **8. Appointment Cancelled (Reschedule Notice)** | Instant (upon admin changing status to "Cancelled") | `surabhi_v4_no_image` | `UTILITY` | **{{1}}** Patient Name<br>**{{2}}** Your consultation appointment with Dr. Surabhi Vaidya at Charak Health Solutions has been cancelled as requested.<br>**{{3}}** If you would like to reschedule your consultation, you can choose a convenient slot anytime:<br>**{{4}}** https://kneeandbackpainrelief.com or call +91 90822 80274. | Supabase `delivered_message`: `surabhi_v4_no_image` |
| **9. Follow-Up Consultation Reminder** | Manual (when staff/doctor clicks "📅 Follow-up" and selects 2, 3, 4 months or custom) | `surabhi_v4_no_image` | `UTILITY` | **{{1}}** Patient Name<br>**{{2}}** It is time to book your recommended follow-up consultation with Dr. Surabhi Vaidya at Charak Health Solutions.<br>**{{3}}** As advised during your consultation, a follow-up assessment after {Interval} ensures your recovery and joint comfort remain on track.<br>**{{4}}** Book slot: https://kneeandbackpainrelief.com or call +91 90822 80274. | Supabase `delivered_message`: `followup_{interval}`, note appended to `notes` |

---

## 3. Approved Template Schemas & Payloads

### Template: `consultation_booking_confirmation_v1`
- **Category:** Utility
- **Language:** `en_US`
- **Number of Variables:** 3
- **Registered Body:**
```text
Hello {{1}}, your consultation with Dr. Surabhi Vaidya is confirmed.

Date: {{2}}
Time: {{3}}
Location: Charak Health Solutions, Cura 304, Raymond TenX Habitat, Pokharan Road No. 2, Thane West.

Please arrive 10 minutes early. Bring relevant reports and a current list of medicines, if available.
```
- **Example AgentBandhu JSON Payload:**
```json
{
  "to": "+919820145872",
  "template": "consultation_booking_confirmation_v1",
  "language": "en_US",
  "variables": [
    "Rajesh Sharma",
    "Wednesday, 18 November 2026",
    "11:30 AM IST"
  ],
  "reference": "booking_LEAD-8492"
}
```

---

### Template: `surabhi_v4_no_image`
- **Category:** Utility (High Deliverability, Universal Formatting)
- **Language:** `en_US`
- **Number of Variables:** 4
- **Registered Body:**
```text
Hello {{1}},

{{2}}

{{3}}

{{4}}

This information is being shared for reference purposes.

*Thank You.*
```
- **Example Payload (30-Minute Reminder):**
```json
{
  "to": "+919820145872",
  "template": "surabhi_v4_no_image",
  "language": "en_US",
  "variables": [
    "Rajesh Sharma",
    "Reminder: Your in-clinic consultation with Dr. Surabhi Vaidya begins in 30 minutes at 11:30 AM IST.",
    "Location: Charak Health Solutions, Cura 304, Raymond TenX Habitat, Pokharan Road No. 2, Thane West.",
    "Please arrive 10 minutes early. Bring relevant reports and a current list of medicines, if available."
  ],
  "reference": "rem30m_LEAD-8492"
}
```

---

### Template: `surabhi_v4_with_image` (Delivers UPI QR Code)
- **Category:** Utility
- **Language:** `en_US`
- **Header Media:** Image (`headerMediaUrl: "https://kneeandbackpainrelief.com/assets/charak-upi-qr.jpg"`)
- **Number of Variables:** 4
- **Example AgentBandhu JSON Payload (Delivering QR Code + VPA Link):**
```json
{
  "to": "+919820145872",
  "template": "surabhi_v4_with_image",
  "language": "en_US",
  "headerMediaUrl": "https://kneeandbackpainrelief.com/assets/charak-upi-qr.jpg",
  "variables": [
    "Rajesh Sharma",
    "Your consultation with Dr. Surabhi Vaidya is confirmed for Friday, 14 Nov at 11:30 AM IST. Location: Cura 304, Raymond TenX Habitat, Pokharan Rd No. 2, Thane West.",
    "Standard Fee: ₹1,000 at clinic desk. Special 20% Discount: Prepay ₹800 via UPI VPA: surabhivaidya7@okhdfcbank",
    "Scan the QR code above or tap here to pay ₹800: https://kneeandbackpainrelief.com/pay-upi?am=800"
  ],
  "reference": "lead_LEAD-8492"
}
```

---

## 4. Opt-Out & Unsubscribe Implementation

Patients who wish to opt out of WhatsApp communications can do so easily and automatically:

1. **Inbound Reply:** If a patient replies **"STOP"**, **"UNSUBSCRIBE"**, or **"CANCEL"** on WhatsApp.
2. **Opt-Out API Endpoint:**
   - **Endpoint:** `GET /api/send-reminders?action=opt_out&phone=91XXXXXXXXXX` (or `POST /api/send-reminders`)
   - **Database Action:** Immediately executes a `PATCH` on Supabase `public.leads` setting:
     - `opted_out = true`
     - `whatsapp_consent = false`
     - `notes = "Opted out from WhatsApp communications at [timestamp]"`
3. **Execution Guard in Automated Sweep:**
   Prior to dispatching any message, the sweep engine verifies:
   ```javascript
   if (lead.opted_out === true) {
     results.skipped++;
     continue; // Strictly prohibited from dispatching
   }
   ```

---

## 5. Automated Runner Execution & Testing

The autonomous sweep engine is hosted in [api/send-reminders.js](file:///Users/milandodhia/Library/CloudStorage/GoogleDrive-dodhia.milan@gmail.com/Other%20computers/My%20PC/Projects/Dr_Surabhi_Knee_and_back_pain_relief/api/send-reminders.js).

### Running Automated Sweeps via Cron
- **Recommended Vercel Cron Configuration (`vercel.json`):**
  - **30-Min Reminder Sweep:** Runs every 15 minutes (`*/15 * * * *`).
  - **Drop-Off Recovery Sweep:** Runs every hour (`0 * * * *`).

### Manual Testing & Diagnostics URL Examples
Clinic staff or developers can safely test each workflow on a specific phone number without waiting for crons:

1. **Test 30-Minute Consultation Reminder:**
   ```text
   GET /api/send-reminders?phone=919820145872&test=true&scenario=30min&slot=11:30+AM+IST
   ```

2. **Test Incomplete Booking Recovery (15m Drop-off):**
   ```text
   GET /api/send-reminders?phone=919820145872&test=true&scenario=incomplete
   ```

3. **Test Abandoned Checkout Recovery (24h Drop-off):**
   ```text
   GET /api/send-reminders?phone=919820145872&test=true&scenario=abandoned
   ```

4. **Trigger Unsubscribe / Opt-Out:**
   ```text
   GET /api/send-reminders?action=opt_out&phone=919820145872
   ```

Each call returns a full JSON report indicating HTTP status, template applied, AgentBandhu reference, and delivery outcome.
