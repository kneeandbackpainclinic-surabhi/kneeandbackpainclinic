# Client User Acceptance Testing (UAT) Guide
## Dr. Surabhi Vaidya Knee & Back Pain Clinic (Charak Health Solutions)

---

### Welcome to Your Website & Portal Testing Guide!

This document is created specially for **Dr. Surabhi Vaidya and the Charak Health Solutions clinic team**. 

You do **not** need any technical knowledge to follow this guide. It gives you simple, step-by-step instructions to test every page, button, form, calendar, and WhatsApp notification on your new digital platform before it goes live to the public.

---

## 📌 Master Directory of All Web Addresses (Slugs)

In web design, a **"Slug"** is simply the ending part of a website address that tells your browser which page to open. Below is the complete list of pages and sections available for testing:

| Web Address / Slug | Simple Page Name | What It Is For | Who Uses It |
| :--- | :--- | :--- | :--- |
| **`/`** (or `/index.html`) | **Main Clinic Homepage** | High-converting landing page explaining Dr. Surabhi’s non-surgical treatments, patient stories, clinic location, and pricing. | All new prospective patients |
| **`/#vsl`** | **Video & Assessment Section** | The top hero section with Dr. Surabhi's clinical introduction video and test buttons. | Patients arriving from Google or ads |
| **`/#flow`** | **Treatment Pathways** | Visual guide showing the 2 treatment pathways (Pathway 1: Masterclass, Pathway 2: Consultation). | Patients looking for treatment options |
| **`/#symptoms`** | **Symptom Check** | Common pain struggles (morning knee stiffness, stair difficulty, sciatica nerve pain). | Hesitant patients seeking validation |
| **`/#science`** | **4-Pillar Ayurvedic Science** | Explains Marma therapy, Panchakarma herbal oils, and internal joint regeneration. | Patients comparing with surgery |
| **`/#doctor`** | **Meet Dr. Surabhi Vaidya** | Doctor profile, degrees (BAMS, MD Clinical Ayurveda), and 15+ years experience. | Patients verifying doctor credentials |
| **`/#testimonials`** | **Patient Success Stories** | Video interviews with real patients who avoided knee and spine surgery. | Patients seeking proof & confidence |
| **`/#pricing`** | **Packages & Fees** | Transparent fees for Pathway 1: Masterclass (₹201) and Pathway 2: Diagnostic Consultation (₹1,000). | Patients evaluating costs |
| **`/#faq`** | **Frequently Asked Questions** | Clear answers regarding pain relief speed, safety with diabetes, and clinic reach. | Patients with common doubts |
| **`/?vsl=webinar`** | **Webinar Video Version** | Automatically switches the top video to preview the Sunday, 15th November Live Masterclass. | Visitors clicking Sunday Webinar ads |
| **`/webinar`** (or `/webinar.html`) | **Dedicated Webinar Page** | Clean ad landing page focused entirely on enrolling patients into the Live Masterclass. | Paid Ad campaigns (Facebook/Instagram) |
| **`/room`** (or `/room.html`) | **Live Masterclass Room** | The digital room where patients check in with their mobile number to watch the live webinar. | Registered webinar ticket holders |
| **`/confirmation`** (or `/thank-you`) | **Consultation Confirmation Page** | The official post-booking confirmation pass showing clinic directions, what to bring, and tracking Google Ads conversions. | Patients who complete consultation booking |
| **`/admin`** (or `/admin.html`) | **Staff & Doctor CRM Portal** | Password-protected clinic desk dashboard to view incoming patient leads, send WhatsApp messages, and adjust settings. | Dr. Surabhi & Clinic Staff only |

---

## 🧰 What You Need Before You Start Testing

To ensure testing is quick and painless:
1. **Devices to test on**:
   - A **Smartphone** (iPhone or Android) – 85% of your patients will visit on mobile!
   - A **Laptop or Desktop computer** – to see the wide-screen experience and staff portal.
2. **Browsers**: Google Chrome, Apple Safari, or Mozilla Firefox.
3. **Test Data to use**:
   - Patient Name: e.g., *"Test Patient"*
   - Mobile Number: Your personal or clinic mobile number (to see WhatsApp confirmations in real time).
   - Passcode for Staff Portal: **`surabhi2026`** (or simply click the *"Quick 1-Click Unlock"* button).

---

## 🧪 Step-by-Step Testing Checklist

---

### Section 1: Main Clinic Website (`/`)

#### Test 1.1: Top Clinic Notice & Operating Hours
* **Where to go**: Visit the main homepage: `/`
* **What to do**: Look at the very top green bar above the navigation menu.
* **What you should see**:
  - A flashing green indicator showing: *"Next Clinical Intake: Only 4 Evaluation Slots Left for This Week"*.
  - Clinic operational timings: *"Mon – Sat: 9:00 AM – 8:00 PM | Sun: 10:00 AM – 2:00 PM"*.
* **Did it work properly?**: `[ ] YES   [ ] NO`

#### Test 1.2: Menu Links & Smooth Scrolling
* **Where to go**: Click through the menu links at the top of the page (*Overview, Treatment Pathways, Symptoms, 4-Pillar Science, Dr. Surabhi, Patient Results, Packages, FAQ*).
* **What should happen**: The page should smoothly glide straight down to that specific section without jumping abruptly or reloading.
* **Did it work properly?**: `[ ] YES   [ ] NO`

#### Test 1.3: Playing Patient Video Testimonials (`/#testimonials`)
* **Where to go**: Scroll to the **"Patient Results"** section or click the menu link.
* **What to do**: Click any of the patient video preview cards (e.g., knee recovery story).
* **What should happen**:
  - A clean, dark video window should pop up directly on the page.
  - The video plays smoothly with clear audio.
  - Clicking the **"✕"** button at the top right or clicking outside the video closes the player instantly.
* **Did it work properly?**: `[ ] YES   [ ] NO`

#### Test 1.4: Frequently Asked Questions (`/#faq`)
* **Where to go**: Scroll down to the **"Frequently Asked Questions"** section.
* **What to do**: Click on question headings such as *"How soon can I expect pain relief?"* or *"Can Ayurvedic treatment really prevent surgery?"*.
* **What should happen**: The question expands downward to reveal Dr. Surabhi's answer, and closes smoothly when clicked again.
* **Did it work properly?**: `[ ] YES   [ ] NO`

#### Test 1.5: Clinic Location & Direction Verification
* **Where to go**: Scroll down to the website footer.
* **What to check**:
  - Address reads: *"Cura 304, Raymond TenX Habitat, Pokharan Road No. 2, Vartak Nagar, Thane West, Maharashtra 400606"*.
  - Click on the link: *"Schedule Online on Cal.id ↗"*. It should open your clinic's booking calendar.
* **Did it work properly?**: `[ ] YES   [ ] NO`

#### Test 1.6: Mobile Experience & Sticky Action Bar (On Smartphone)
* **Where to go**: Open `/` on your mobile phone and scroll up and down.
* **What should happen**:
  - A sleek green button labeled **"Take 60-Second Pain Assessment ↗"** stays anchored comfortably at the bottom of your screen so patients never have to search for it.
  - Text, photos, and cards fit neatly on your phone screen without any sideways scrolling or overlapping text.
* **Did it work properly?**: `[ ] YES   [ ] NO`

---

### Section 2: The 60-Second Pain Diagnostic Assessment (Patient Journey)

This is the most important conversion tool on the website. It asks the patient 4 simple questions and automatically recommends the right medical next step.

#### Test 2.1: Opening the Diagnostic Assessment
* **Where to go**: Click any button on the website labeled **"Start Assessment ↗"** or **"Take 60-Second Pain Assessment ↗"**.
* **What should happen**: A friendly pop-up window opens with a green leaf emblem (`🌿`) and a progress bar showing question 1 of 4.
* **Did it work properly?**: `[ ] YES   [ ] NO`

#### Test 2.2: Testing the "In-Clinic Consultation" Pathway (Patients Ready for Treatment)
* **Step 1**: Choose: *"Knee Joint (One or both knees / Osteoarthritis)"*.
* **Step 2**: Choose: *"Severe distress: Walking or stairs are agonizing, night sleep is disturbed"*.
* **Step 3**: Choose: *"Total Knee Replacement or Spine Surgery has been advised by a doctor"*.
* **Step 4**: Choose: *"I am fairly ready and want an in-clinic consultation first to understand my condition"*.
* **What should appear**:
  - The assessment recognizes high severity and recommends **Pathway 2: In-Clinic Diagnostic Consultation (₹1,000)** with Dr. Surabhi Vaidya.
  - It asks for your **Name**, **WhatsApp Mobile Number**, and **City (Thane West)**.
* **Did it work properly?**: `[ ] YES   [ ] NO`

#### Test 2.3: Booking with "Pay at Clinic Desk"
* **What to do**: In the consultation recommendation screen, enter your test name and mobile number, select your preferred time slot (e.g. *Morning 10 AM - 1 PM*), and click **"Book Now & Pay ₹1,000 at Clinic Desk"**.
* **What should happen**:
  - A celebration screen appears: *"🎉 Consultation Confirmed for [Your Name]!"*.
  - You see your clinic address in Raymond TenX Habitat, Thane West, and a button to open Google Maps directions.
  - Within a few seconds, an automated booking confirmation WhatsApp notification is queued for delivery.
* **Did it work properly?**: `[ ] YES   [ ] NO`

#### Test 2.4: Booking with "Pay ₹1,000 Online via PayU"
* **What to do**: In the consultation screen, click **"Pay ₹1,000 Online via PayU"**.
* **What should happen**:
  - The official PayU payment gateway opens securely.
  - It shows payment options: Google Pay, PhonePe, Paytm, UPI QR Code, Debit/Credit Cards, and NetBanking.
  - *(Note: You do not need to make an actual payment during test mode unless you are testing with real ₹1,000 UPI; you can simply close the payment window to confirm it opened properly).*
* **Did it work properly?**: `[ ] YES   [ ] NO`

#### Test 2.5: Booking via Cal.id Interactive Calendar
* **What to do**: Click the button **"Select Exact Time Slot on Calendar (Cal.id)"**.
* **What should happen**:
  - A calendar window opens directly inside your website without taking you to another website.
  - It shows available dates and 30-minute appointment slots for Dr. Surabhi Vaidya at Charak Health Solutions.
* **Did it work properly?**: `[ ] YES   [ ] NO`

#### Test 2.6: Testing the "Webinar Masterclass" Pathway (Hesitant / Exploring Patients)
* **Where to go**: Open the assessment again and test this combination:
  - **Step 1**: Choose: *"Lower Back & Spine (Slip disc / Sciatica)"*.
  - **Step 2**: Choose: *"Moderate restriction"*.
  - **Step 3**: Choose: *"Just beginning to explore specialized non-surgical care"*.
  - **Step 4**: Choose: *"I am hesitant or skeptical: I want to learn more about how Ayurveda works before visiting"*.
* **What should appear**:
  - The smart system understands this patient is not yet ready to travel to the clinic and wisely recommends **Pathway 1: Live Hindi Masterclass (₹201)** on Webinar.gg.
  - It provides a button: **"Pay ₹201 via PayU (UPI / Cards) ↗"**.
* **Did it work properly?**: `[ ] YES   [ ] NO`

---

### Section 3: Dedicated Webinar Campaign Page (`/webinar`)

#### Test 3.1: Visiting the Dedicated Campaign Page
* **Where to go**: Open `/webinar` (or `/webinar.html`).
* **What to check**:
  - The page loads cleanly with the same professional design.
  - The headline clearly invites the patient to prevent knee/spine surgery.
  - Clicking any assessment button opens the quiz with zero delay.
* **Did it work properly?**: `[ ] YES   [ ] NO`

---

### Section 4: Live Masterclass Broadcast Room (`/room`)

#### Test 4.1: Accessing the Live Room
* **Where to go**: Visit `/room` (or `/room.html`).
* **What you should see**:
  - A stylish, dark-themed digital reception room.
  - A green indicator at the top: *"● WEBINAR.GG BROADCAST"*.
  - A card welcoming the patient to Dr. Surabhi Vaidya's live session.
* **Did it work properly?**: `[ ] YES   [ ] NO`

#### Test 4.2: Entering the Live Broadcast Stream
* **What to do**:
  - Type a test attendee name (e.g. *"Ramesh Kumar"*).
  - Type a mobile number (e.g. *"9820145872"*).
  - Click the green button: **"Join Live Broadcast Stream ↗"**.
* **What should happen**:
  - A green loading spinner appears: *"Connecting to secure live Webinar.gg broadcast..."*.
  - The live broadcast screen smoothly fills the window so attendees can watch Dr. Surabhi present without needing to download Zoom or external apps.
* **Did it work properly?**: `[ ] YES   [ ] NO`

---

### Section 5: Staff & Doctor Administration CRM Portal (`/admin`)

This is the clinic’s private command center where Dr. Surabhi and clinic staff manage patients.

#### Test 5.1: Unlocking the Portal
* **Where to go**: Visit `/admin` (or `/admin.html`).
* **What to do**:
  - You will see a security screen: *"Charak Health Solutions · Doctor & Staff Administration Portal"*.
  - The passcode `surabhi2026` is already pre-filled.
  - You can either click **"Unlock Admin Portal ↗"** or the one-click green button **"⚡ Quick 1-Click Unlock"**.
* **What should happen**: The security overlay slides away and reveals the complete clinic dashboard.
* **Did it work properly?**: `[ ] YES   [ ] NO`

#### Test 5.2: Tab 1 – Patient Leads & CRM Intake
* **What to check in Tab 1 (`📋 Patient Leads & CRM`)**:
  - **4 Top Summary Boxes**: Total Intake Leads, ₹4,000 Trial Requests, ₹1,000 Consultations, and ₹201 Masterclass Leads.
  - **Incoming Patients Table**: Look at the table of patient inquiries. You should see the test patient entry you created in Section 2!
  - It shows the patient’s Name, Mobile Number, Pain Area, Severity, and Recommended Pathway.
* **Did it work properly?**: `[ ] YES   [ ] NO`

#### Test 5.3: Tab 1 – Searching, Filtering & Updating Patient Status
* **What to do**:
  - Type your test name in the search box. Notice how the table instantly filters to show only matching patients.
  - Use the status dropdown next to the patient's record to change their status (e.g. from *"New Lead"* to *"Consultation Scheduled"* or *"Contacted"*).
* **What should happen**: The status updates immediately and saves automatically.
* **Did it work properly?**: `[ ] YES   [ ] NO`

#### Test 5.4: Tab 1 – Exporting Patient List to Excel / CSV
* **What to do**: Click the **"📥 Export CSV"** button above the table.
* **What should happen**: Your computer or phone immediately downloads a clean `.csv` spreadsheet file that opens in Microsoft Excel or Google Sheets with all patient names, phones, and dates.
* **Did it work properly?**: `[ ] YES   [ ] NO`

#### Test 5.5: Tab 2 – WhatsApp Automation (`💬 WhatsApp Automation`)
* **Where to go**: Click the **"💬 WhatsApp Automation"** tab at the top.
* **What you should see**:
  - Top green badge confirming: *"● Ready (Official BSP - AgentBandhu Cloud API)"*.
  - 4 KPI delivery counters: Total Dispatches, Delivered (green check), Read Receipts (blue double check), and Failed.
* **Did it work properly?**: `[ ] YES   [ ] NO`

#### Test 5.6: Tab 2 – Official Approved WhatsApp Templates
* **What to check**:
  - Scroll through the 10 Meta-approved message cards:
    1. `consultation_booking_confirmation_v1` (Appointment time & clinic directions)
    2. `webinar_registration_confirmation_v1` (Masterclass confirmation)
    3. `webinar_joining_details_v1` (Direct room access link)
    4. `knee_pain_webinar_invitation_v1` (Invitation to upcoming session)
    5. `meet_dr_surabhi_v1` (Introduction to Dr. Surabhi)
    6. `ozone_therapy` (Includes clinic header photo)
    7. `webinar_reminder_1_day_v1` (24-hour reminder)
    8. `webinar_reminder_1_hour_v1` (60-minute urgent reminder)
    9. `surabhi_v4_with_image` (Photo update)
    10. `post_experience_google_review_v1` (Post-visit Google 5-star review request)
  - Click **"⚡ Test Send"** on any template. A window opens allowing you to type any mobile number and test the message or open it directly in WhatsApp Web.
* **Did it work properly?**: `[ ] YES   [ ] NO`

#### Test 5.7: Tab 3 – Live Webinar Management (`🎥 Webinar Management`)
* **Where to go**: Click the **"🎥 Webinar Management"** tab.
* **What you can do**:
  - Change the **Next Webinar Date & Time** picker (e.g., set to upcoming Sunday at 11:00 AM).
  - Verify the Webinar.gg room link (`https://webinar.gg/charakhealth`).
  - View live attendance metrics: Registered Attendees, Peak Live Users, and Attendance Rate.
* **Did it work properly?**: `[ ] YES   [ ] NO`

#### Test 5.8: Tab 4 – Clinic Settings (`⚙️ Clinic Settings`)
* **Where to go**: Click the **"⚙️ Clinic Settings"** tab.
* **What to check**:
  - Clinic Name: *"Charak Health Solutions"*
  - Doctor Name: *"Dr. Surabhi Vaidya, BAMS, MD (Ayurveda)"*
  - Clinic Address: *"Cura 304, Raymond TenX Habitat, Pokharan Road No. 2, Vartak Nagar, Thane West, Maharashtra 400606"*
  - Clinic Notification Email: *"kneeandbackpainclinic@gmail.com"*
  - Cal.id Calendar Link: *"https://cal.id/charakhealth/consultation"*
  - Admin Passcode: *"surabhi2026"*
  - Click **"Save Clinic Configuration"** and ensure a success notice appears.
* **Did it work properly?**: `[ ] YES   [ ] NO`

---

## 📋 Client Feedback & Sign-Off Sheet

Please use this simple table to jot down your observations, any wording adjustments you would like, or any questions:

| Item Tested | Slug / Page | Status (Pass / Needs Adjustment) | Client Comments / Desired Changes |
| :--- | :--- | :--- | :--- |
| **Clinic Information & Timings** | `/` (Header) | `[ ] PASS   [ ] REVIEW` | |
| **Doctor Profile & Credentials** | `/#doctor` | `[ ] PASS   [ ] REVIEW` | |
| **Patient Video Testimonials** | `/#testimonials`| `[ ] PASS   [ ] REVIEW` | |
| **Treatment Packages & Fees** | `/#pricing` | `[ ] PASS   [ ] REVIEW` | |
| **Clinic Address & Maps Link** | `/` (Footer) | `[ ] PASS   [ ] REVIEW` | |
| **60-Second Pain Assessment** | Assessment Modal | `[ ] PASS   [ ] REVIEW` | |
| **Consultation Booking Flow** | Assessment Modal | `[ ] PASS   [ ] REVIEW` | |
| **Cal.id Calendar Embed** | Cal.id Modal | `[ ] PASS   [ ] REVIEW` | |
| **Webinar Landing Page** | `/webinar` | `[ ] PASS   [ ] REVIEW` | |
| **Live Broadcast Room** | `/room` | `[ ] PASS   [ ] REVIEW` | |
| **Staff Portal Access (Login)** | `/admin` | `[ ] PASS   [ ] REVIEW` | |
| **Patient Leads Table & Export**| `/admin` (Tab 1) | `[ ] PASS   [ ] REVIEW` | |
| **WhatsApp Automation & Templates**| `/admin` (Tab 2) | `[ ] PASS   [ ] REVIEW` | |
| **Webinar Scheduler & Metrics**| `/admin` (Tab 3) | `[ ] PASS   [ ] REVIEW` | |
| **Clinic Settings** | `/admin` (Tab 4) | `[ ] PASS   [ ] REVIEW` | |

---

### Sign-Off & Next Steps

* **Tested By**: ___________________________
* **Date**: _______________________________
* **Overall Assessment**: `[ ] Approved to Launch   [ ] Minor Text Updates Needed`

> **Note for Clinic Team**: If you would like to adjust any doctor bio details, clinic phone numbers, or session timings, simply note them in the table above and our development team will update them immediately!
