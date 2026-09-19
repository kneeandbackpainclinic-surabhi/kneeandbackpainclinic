# Dr. Surabhi Vaidya: WhatsApp Message Templates

## WhatsApp template submission notes

- Send messages only to people who explicitly opted in to WhatsApp updates.
- Use **Utility** only for messages triggered by the person’s webinar registration or appointment activity.
- Submit invitations, education, testimonials and re-engagement as **Marketing**.
- Keep health information general; do not request reports, diagnoses or other sensitive medical details in a template.
- Avoid cure guarantees, fixed-result claims, fear, pressure and claims that surgery can always be avoided.
- Add `Reply STOP to opt out.` to Marketing templates.

## Meta-ready WhatsApp templates

### 1. Webinar registration confirmation

**Name:** `webinar_registration_confirmation_v1`  
**Category:** Utility  
**Trigger:** Immediately after registration  
**Button:** `Join webinar`

> Hello {{1}}, your registration request for the live Hindi session, “Understanding Knee Pain: What to Consider Before Choosing a Treatment Path”, has been received.
>
> Date: {{2}}  
> Time: {{3}}  
> Hosted by: Dr. Surabhi Vaidya, Charak Health Solutions
>
> The joining link will be shared on WhatsApp before the session. Reply here if you need help.

Examples: `{{1}} Meena`, `{{2}} Sunday, 18 October 2026`, `{{3}} 11:00 AM IST`.

### 2. Webinar joining details

**Name:** `webinar_joining_details_v1`  
**Category:** Utility  
**Trigger:** After registration, when the URL is ready  
**Button:** `Join webinar` → `{{4}}`

> Hello {{1}}, here are the joining details for your registered live Hindi session with Dr. Surabhi Vaidya.
>
> Date: {{2}}  
> Time: {{3}}
>
> Please join a few minutes early. This educational session does not replace an individual medical consultation.

Examples: `{{1}} Meena`, `{{2}} Sunday, 18 October 2026`, `{{3}} 11:00 AM IST`, `{{4}} https://webinar.gg/charakhealth`.

### 3. Webinar reminder : one day

**Name:** `webinar_reminder_1_day_v1`  
**Category:** Utility  
**Trigger:** About 24 hours before the registered session  
**Button:** `Join webinar`

> Reminder for {{1}}: the live Hindi session with Dr. Surabhi Vaidya is tomorrow at {{2}}.
>
> Topic: Understanding Knee Pain: What to Consider Before Choosing a Treatment Path
>
> Joining link: {{3}}

Examples: `{{1}} Meena`, `{{2}} 11:00 AM IST`, `{{3}} webinar URL`.

### 4. Webinar reminder : one hour

**Name:** `webinar_reminder_1_hour_v1`  
**Category:** Utility  
**Trigger:** About one hour before the registered session  
**Button:** `Join webinar` → `{{2}}`

> Hello {{1}}, the live Hindi session with Dr. Surabhi Vaidya begins in one hour.
>
> Please join from a quiet place and keep a notebook nearby. The session is educational; personal recommendations require an individual assessment.

Examples: `{{1}} Meena`, `{{2}} webinar URL`.

### 5. Consultation confirmation

**Name:** `consultation_booking_confirmation_v1`  
**Category:** Utility  
**Trigger:** After booking through Cal.id  
**Button:** `Book appointment`

> Hello {{1}}, your consultation with Dr. Surabhi Vaidya is confirmed.
>
> Date: {{2}}  
> Time: {{3}}  
> Location: Shop No 5, Panchsheel Shopping Centre, Gladys Alwares Road, Thane West 400610.
> Phone: +91 81085 00200 / +91 91374 44577
>
> Please arrive 10 minutes early. Bring relevant reports and a current list of medicines, if available.

Examples: `{{1}} Meena`, `{{2}} Tuesday, 20 October 2026`, `{{3}} 4:30 PM IST`.

### 6. Webinar invitation

**Name:** `knee_pain_webinar_invitation_v1`  
**Category:** Marketing  
**Button:** `Join webinar`

> Charak Health Solutions is hosting a live Hindi session with Dr. Surabhi Vaidya on understanding knee pain and the questions worth asking before choosing a treatment path.
>
> Date: {{1}}  
> Time: {{2}}
>
> The session covers common causes of knee discomfort, the role of assessment, movement and lifestyle, and when an in-person consultation may be useful.
>
> Register here: {{3}}
>
> Reply STOP to opt out.

Examples: `{{1}} Sunday, 18 October 2026`, `{{2}} 11:00 AM IST`, `{{3}} registration URL`.

### 7. Nurture : assessment first

**Name:** `knee_care_assessment_education_v1`  
**Category:** Marketing

> Knee pain can have different causes, so the same plan may not suit everyone. A useful assessment looks at symptoms, health history, daily movement, previous treatment and personal goals before options are discussed.
>
> Dr. Surabhi Vaidya explains this assessment-first approach in her live Hindi session. Join the webinar: {{1}}
>
> This is general education and not a diagnosis. Reply STOP to opt out.

Example: `{{1}} video or landing-page URL`.

### 8. Nurture : movement and exercise

**Name:** `knee_care_movement_education_v1`  
**Category:** Marketing

> With many common knee conditions, appropriately selected movement and strengthening can support function. The right starting point depends on the person and the cause of the symptoms.
>
> Join Dr. Surabhi's live Hindi webinar to understand what to consider before beginning an exercise routine: {{1}}
>
> Seek medical advice for severe swelling, injury, inability to bear weight or rapidly worsening symptoms. Reply STOP to opt out.

Example: `{{1}} YouTube URL`.

### 9. Nurture : patient story

**Name:** `patient_experience_story_v1`  
**Category:** Marketing

> Every person’s condition and response to care can be different. In this video, a Charak Health Solutions patient shares their own experience of seeking help for knee pain.
>
> To discuss an individual starting point with Dr. Surabhi, book an appointment: {{1}}
>
> Individual results vary. A consultation is needed to discuss suitable options. Reply STOP to opt out.

Example: `{{1}} patient-story page URL`.

### 10. Nurture : meet Dr. Surabhi

**Name:** `meet_dr_surabhi_v1`  
**Category:** Marketing

> Meet Dr. Surabhi Vaidya, BAMS and MBA in Clinical Research, at Charak Health Solutions in Thane.
>
> Her consultation process begins with health history, current difficulties and assessment before suitable next steps are discussed.
>
> Book an appointment: {{1}}
>
> Reply STOP to opt out.

Example: `{{1}} landing-page URL`.

### 11. Final webinar invitation reminder

**Name:** `webinar_invitation_closing_v1`  
**Category:** Marketing  
**Button:** `Join webinar`

> Registrations for Dr. Surabhi Vaidya’s next live Hindi session close at {{1}} today.
>
> The session explains common knee-pain questions, how assessment guides treatment choices, and when to seek individual advice.
>
> Register here: {{2}}
>
> Reply STOP to opt out.

Examples: `{{1}} 8:00 PM IST`, `{{2}} registration URL`.

### 12. Google review request after an experience

**Name:** `post_experience_google_review_v1`
**Category:** Marketing
**Trigger:** Send shortly after a consultation, attended webinar or completed treatment visit
**Button:** `Leave Google review`
**Button URL:** `https://g.page/r/CWxrIXBs-xz7EAE/review`

> Hello {{1}}, thank you for spending time with Charak Health Solutions today.
>
> We hope your experience was clear and helpful. If you would like to share feedback, please leave an honest Google review. Your review can help other people understand what to expect when they contact the clinic.
>
> Please share only information that you are comfortable making public.
>
> Reply STOP to opt out.

Example: `{{1}} Meena`.

**Submission note:** Submit this as Marketing because it asks the recipient to take a public promotional action. Do not offer a reward, discount or treatment benefit in exchange for a review. Send it only to people who opted in to WhatsApp communication.

## Recommended sequences

**Registered participant:** confirmation immediately; joining details when ready; reminders 24 hours and one hour before.

**After consultation, webinar attendance or treatment visit:** send Template 12 shortly after the experience is complete. Do not send it after a cancelled or missed booking.

**Opted-in lead who has not registered:** invitation on day 0; assessment education on day 2; movement education on day 5; patient story on day 8; final invitation on day 10. Stop Marketing messages when the person registers or opts out.
