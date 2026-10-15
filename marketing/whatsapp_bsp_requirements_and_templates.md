# WhatsApp Business API Requirements & Message Templates Specification
**Document for WhatsApp Business Solution Provider (BSP) / Technical Support Partner**

---

## 1. Project Overview & Business Details

| Parameter | Details |
| :--- | :--- |
| **Business / Brand Name** | Charak Health Solutions (Dr. Surabhi Vaidya) |
| **Industry / Category** | Health & Wellness / Specialized Medical Clinic |
| **Official Website** | `https://dr-surabhi-knee-and-back-pain-relie-azure.vercel.app` (or custom clinic domain) |
| **Primary Business Email** | `kneeandbackpainclinic@gmail.com` |
| **Clinic Support Phone** | `+91 81085 00200` |
| **Clinic Physical Address** | Charak Health Solutions, Cura 304, Raymond TenX Habitat, Pokharan Road No. 2, Thane West, Maharashtra, India |
| **Meta Business Manager (BM) ID** | `[INSERT META BM ID HERE]` |
| **WhatsApp Business Account (WABA) ID** | `[INSERT WABA ID HERE]` |
| **WhatsApp Phone Number ID** | `[INSERT PHONE NUMBER ID HERE]` (Associated with `+91 81085 00200`) |

---

## 2. Access & Permissions Required for BSP / Support Partner

To enable the BSP to configure the account, verify the phone number, and submit/manage templates, please grant the following permissions:

### Option A: Meta Business Manager Partner Access (Recommended)
1. Go to **Meta Business Settings** (`https://business.facebook.com/settings/partners`).
2. Click **Partners** → **Share assets with a partner**.
3. Enter the BSP's Partner Business ID.
4. Under **WhatsApp Business Accounts (WABA)**, select Charak Health Solutions WABA and grant:
   - **Manage WhatsApp Business Account** (Full control)
   - **Manage Message Templates**
   - **Manage Phone Numbers**

### Option B: Direct WhatsApp Template Manager URL
Once access is granted, the BSP can access and create the templates directly using:
> `https://business.facebook.com/wa/manage/message-templates/?waba_id=[INSERT_WABA_ID_HERE]`

### Option C: System User & Permanent Token Generation (For API Integration)
To link the clinic backend engine to WhatsApp:
1. In Meta Business Settings → **System Users** → Add System User (Admin role).
2. Click **Generate New Token** → Select Charak Health Solutions WABA.
3. Grant scopes:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
4. Set token expiration to **Never / Permanent**.
5. Provide this token securely to the clinic development team.

---

## 3. Webhook Configuration (For Inbound Responses & Delivery Status)

| Setting | Value |
| :--- | :--- |
| **Webhook Callback URL** | `https://dr-surabhi-knee-and-back-pain-relie-azure.vercel.app/api/whatsapp-webhook` |
| **Verify Token** | `surabhi_webhook_verify_token_2026` |
| **Webhook Fields Subscribed** | `messages`, `message_template_status_update`, `message_deliveries` |

---

## 4. Meta Health Compliance Guidelines (Strictly Followed)

All templates below have been drafted in compliance with Meta's **Health and Medical Policy** and Indian regulatory standards:
1. **Explicit Opt-in**: Messages are triggered only after a user explicitly registers for a webinar or requests a consultation.
2. **Category Accuracy**: Transactional, date-specific alerts are submitted as **Utility**. Educational nurture, invitations, and review requests are submitted as **Marketing**.
3. **No Unsubstantiated Medical Claims**: No claims of 100% cure, guaranteed pain elimination, or absolute surgery avoidance.
4. **Mandatory Opt-Out**: All Marketing templates include the compliant `Reply STOP to opt out.` footer.
5. **No Sensitive Medical Data**: Templates never ask for diagnostic reports, blood tests, or sensitive patient records over plain WhatsApp chat.

---

## 5. WhatsApp Message Templates Specification

Below are the **12 approved templates** to be created in WhatsApp Template Manager.

---

### Template 1: Webinar Registration Confirmation

- **Template Name:** `webinar_registration_confirmation_v1`
- **Category:** `UTILITY`
- **Language:** English (`en` or `en_US`)
- **Trigger:** Immediately upon user submitting webinar registration form
- **Header:** None
- **Body Text:**
```text
Hello {{1}}, your registration request for the live Hindi session, “Understanding Knee Pain: What to Consider Before Choosing a Treatment Path”, has been received.

Date: {{2}}
Time: {{3}}
Hosted by: Dr. Surabhi Vaidya, Charak Health Solutions

The joining link will be shared on WhatsApp before the session. Reply here if you need help.
```
- **Sample Values (Variables):**
  - `{{1}}`: `Meena`
  - `{{2}}`: `Sunday, 18 October 2026`
  - `{{3}}`: `11:00 AM IST`
- **Buttons:**
  - Button Type: `Quick Reply`
  - Button Text: `Join webinar`

---

### Template 2: Webinar Joining Details

- **Template Name:** `webinar_joining_details_v1`
- **Category:** `UTILITY`
- **Language:** English (`en` or `en_US`)
- **Trigger:** Sent when the webinar room URL is ready
- **Header:** None
- **Body Text:**
```text
Hello {{1}}, here are the joining details for your registered live Hindi session with Dr. Surabhi Vaidya.

Date: {{2}}
Time: {{3}}

Please join a few minutes early. This educational session does not replace an individual medical consultation.
```
- **Sample Values (Variables):**
  - `{{1}}`: `Meena`
  - `{{2}}`: `Sunday, 18 October 2026`
  - `{{3}}`: `11:00 AM IST`
- **Buttons:**
  - Button Type: `Call To Action (URL)`
  - Button Text: `Join webinar`
  - URL Type: `Dynamic`
  - Base URL / Sample: `https://webinar.gg/{{1}}` (Sample: `charakhealth`)

---

### Template 3: Webinar Reminder (24 Hours Prior)

- **Template Name:** `webinar_reminder_1_day_v1`
- **Category:** `UTILITY`
- **Language:** English (`en` or `en_US`)
- **Trigger:** 24 hours before scheduled live session
- **Header:** None
- **Body Text:**
```text
Reminder for {{1}}: the live Hindi session with Dr. Surabhi Vaidya is tomorrow at {{2}}.

Topic: Understanding Knee Pain: What to Consider Before Choosing a Treatment Path

Joining link: {{3}}
```
- **Sample Values (Variables):**
  - `{{1}}`: `Meena`
  - `{{2}}`: `11:00 AM IST`
  - `{{3}}`: `https://webinar.gg/charakhealth`
- **Buttons:**
  - Button Type: `Quick Reply`
  - Button Text: `Join webinar`

---

### Template 4: Webinar Reminder (1 Hour Prior)

- **Template Name:** `webinar_reminder_1_hour_v1`
- **Category:** `UTILITY`
- **Language:** English (`en` or `en_US`)
- **Trigger:** 60 minutes before scheduled live session
- **Header:** None
- **Body Text:**
```text
Hello {{1}}, the live Hindi session with Dr. Surabhi Vaidya begins in one hour.

Please join from a quiet place and keep a notebook nearby. The session is educational; personal recommendations require an individual assessment.
```
- **Sample Values (Variables):**
  - `{{1}}`: `Meena`
- **Buttons:**
  - Button Type: `Call To Action (URL)`
  - Button Text: `Join webinar`
  - URL Type: `Dynamic`
  - Base URL / Sample: `https://webinar.gg/{{1}}` (Sample: `charakhealth`)

---

### Template 5: Consultation Booking Confirmation

- **Template Name:** `consultation_booking_confirmation_v1`
- **Category:** `UTILITY`
- **Language:** English (`en` or `en_US`)
- **Trigger:** Immediately upon confirming clinic in-person consultation
- **Header:** None
- **Body Text:**
```text
Hello {{1}}, your consultation with Dr. Surabhi Vaidya is confirmed.

Date: {{2}}
Time: {{3}}
Location: Charak Health Solutions, Cura 304, Raymond TenX Habitat, Pokharan Road No. 2, Thane West.

Please arrive 10 minutes early. Bring relevant reports and a current list of medicines, if available.
```
- **Sample Values (Variables):**
  - `{{1}}`: `Meena`
  - `{{2}}`: `Tuesday, 20 October 2026`
  - `{{3}}`: `4:30 PM IST`
- **Buttons:**
  - Button Type: `Quick Reply`
  - Button Text: `Got it, thank you`

---

### Template 6: Webinar Invitation (For Opted-in Contacts)

- **Template Name:** `knee_pain_webinar_invitation_v1`
- **Category:** `MARKETING`
- **Language:** English (`en` or `en_US`)
- **Trigger:** Broadcast / Lead nurture day 0
- **Header:** None
- **Body Text:**
```text
Charak Health Solutions is hosting a live Hindi session with Dr. Surabhi Vaidya on understanding knee pain and the questions worth asking before choosing a treatment path.

Date: {{1}}
Time: {{2}}

The session covers common causes of knee discomfort, the role of assessment, movement and lifestyle, and when an in-person consultation may be useful.

Register here: {{3}}

Reply STOP to opt out.
```
- **Sample Values (Variables):**
  - `{{1}}`: `Sunday, 18 October 2026`
  - `{{2}}`: `11:00 AM IST`
  - `{{3}}`: `https://dr-surabhi.com/webinar`
- **Buttons:**
  - Button Type: `Call To Action (URL)`
  - Button Text: `Register Now`
  - URL Type: `Static`
  - URL: `https://dr-surabhi.com/webinar`

---

### Template 7: Educational Nurture – Assessment First

- **Template Name:** `knee_care_assessment_education_v1`
- **Category:** `MARKETING`
- **Language:** English (`en` or `en_US`)
- **Trigger:** Nurture sequence day 2
- **Header:** None
- **Body Text:**
```text
Knee pain can have different causes, so the same plan may not suit everyone. A useful assessment looks at symptoms, health history, daily movement, previous treatment and personal goals before options are discussed.

Dr. Surabhi Vaidya explains this assessment-first approach in her live Hindi session. Join the webinar: {{1}}

This is general education and not a diagnosis. Reply STOP to opt out.
```
- **Sample Values (Variables):**
  - `{{1}}`: `https://dr-surabhi.com/webinar`
- **Buttons:** None / Optional Quick Reply (`Learn More`)

---

### Template 8: Educational Nurture – Movement & Exercise

- **Template Name:** `knee_care_movement_education_v1`
- **Category:** `MARKETING`
- **Language:** English (`en` or `en_US`)
- **Trigger:** Nurture sequence day 5
- **Header:** None
- **Body Text:**
```text
With many common knee conditions, appropriately selected movement and strengthening can support function. The right starting point depends on the person and the cause of the symptoms.

Join Dr. Surabhi's live Hindi webinar to understand what to consider before beginning an exercise routine: {{1}}

Seek medical advice for severe swelling, injury, inability to bear weight or rapidly worsening symptoms. Reply STOP to opt out.
```
- **Sample Values (Variables):**
  - `{{1}}`: `https://youtube.com/watch?v=sample`
- **Buttons:** None / Optional URL Button (`Watch Video`)

---

### Template 9: Nurture – Patient Experience Story

- **Template Name:** `patient_experience_story_v1`
- **Category:** `MARKETING`
- **Language:** English (`en` or `en_US`)
- **Trigger:** Nurture sequence day 8
- **Header:** None
- **Body Text:**
```text
Every person’s condition and response to care can be different. In this video, a Charak Health Solutions patient shares their own experience of seeking help for knee pain.

To discuss an individual starting point with Dr. Surabhi, book an appointment: {{1}}

Individual results vary. A consultation is needed to discuss suitable options. Reply STOP to opt out.
```
- **Sample Values (Variables):**
  - `{{1}}`: `https://dr-surabhi.com/consultation`
- **Buttons:**
  - Button Type: `Call To Action (URL)`
  - Button Text: `Book Appointment`
  - URL Type: `Static`
  - URL: `https://dr-surabhi.com/consultation`

---

### Template 10: Nurture – Meet Dr. Surabhi Vaidya

- **Template Name:** `meet_dr_surabhi_v1`
- **Category:** `MARKETING`
- **Language:** English (`en` or `en_US`)
- **Trigger:** Nurture sequence
- **Header:** None
- **Body Text:**
```text
Meet Dr. Surabhi Vaidya, BAMS and MBA in Clinical Research, at Charak Health Solutions in Thane.

Her consultation process begins with health history, current difficulties and assessment before suitable next steps are discussed.

Book an appointment: {{1}}

Reply STOP to opt out.
```
- **Sample Values (Variables):**
  - `{{1}}`: `https://dr-surabhi.com/book`
- **Buttons:**
  - Button Type: `Call To Action (URL)`
  - Button Text: `Book Appointment`
  - URL Type: `Static`
  - URL: `https://dr-surabhi.com/book`

---

### Template 11: Final Webinar Invitation Reminder

- **Template Name:** `webinar_invitation_closing_v1`
- **Category:** `MARKETING`
- **Language:** English (`en` or `en_US`)
- **Trigger:** Sent on the morning of webinar closing
- **Header:** None
- **Body Text:**
```text
Registrations for Dr. Surabhi Vaidya’s next live Hindi session close at {{1}} today.

The session explains common knee-pain questions, how assessment guides treatment choices, and when to seek individual advice.

Register here: {{2}}

Reply STOP to opt out.
```
- **Sample Values (Variables):**
  - `{{1}}`: `8:00 PM IST`
  - `{{2}}`: `https://dr-surabhi.com/webinar`
- **Buttons:**
  - Button Type: `Call To Action (URL)`
  - Button Text: `Register Now`
  - URL Type: `Static`
  - URL: `https://dr-surabhi.com/webinar`

---

### Template 12: Post-Experience Google Review Request

- **Template Name:** `post_experience_google_review_v1`
- **Category:** `MARKETING`
- **Language:** English (`en` or `en_US`)
- **Trigger:** Sent 2 to 4 hours after an attended consultation or clinic visit
- **Header:** None
- **Body Text:**
```text
Hello {{1}}, thank you for spending time with Charak Health Solutions today.

We hope your experience was clear and helpful. If you would like to share feedback, please leave an honest Google review. Your review can help other people understand what to expect when they contact the clinic.

Please share only information that you are comfortable making public.

Reply STOP to opt out.
```
- **Sample Values (Variables):**
  - `{{1}}`: `Meena`
- **Buttons:**
  - Button Type: `Call To Action (URL)`
  - Button Text: `Leave Google Review`
  - URL Type: `Static`
  - URL: `https://g.page/r/CWxrIXBs-xz7EAE/review`

---

## 6. Deliverables Expected from BSP / Support Partner

Once this document is processed, the BSP must return the following details to the development team:

1. **Meta WhatsApp Phone Number ID** (e.g. `109876543210987`)
2. **Meta WhatsApp Business Account (WABA) ID** (e.g. `987654321098765`)
3. **Permanent System User Access Token** (with `whatsapp_business_messaging` and `whatsapp_business_management`)
4. **Confirmation of Template Approvals** (Verify that all 12 templates above are in `APPROVED` status with exact names matching the snake_case strings above)
5. **Webhook Confirmation**: Verification that the callback URL `https://dr-surabhi-knee-and-back-pain-relie-azure.vercel.app/api/whatsapp-webhook` is subscribed to `messages` and `message_template_status_update`.
