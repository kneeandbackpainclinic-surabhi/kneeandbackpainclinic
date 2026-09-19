# Dr. Surabhi Vaidya — WhatsApp, Video Ads and YouTube Content Plan

Prepared for Charak Health Solutions. Clinic review is required before use.

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
**Button:** `View details`

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
**Button:** `Join live session` → `{{4}}`

> Hello {{1}}, here are the joining details for your registered live Hindi session with Dr. Surabhi Vaidya.
>
> Date: {{2}}  
> Time: {{3}}
>
> Please join a few minutes early. This educational session does not replace an individual medical consultation.

Examples: `{{1}} Meena`, `{{2}} Sunday, 18 October 2026`, `{{3}} 11:00 AM IST`, `{{4}} https://zoom.us/j/123456789`.

### 3. Webinar reminder — one day

**Name:** `webinar_reminder_1_day_v1`  
**Category:** Utility  
**Trigger:** About 24 hours before the registered session  
**Button:** `View session details`

> Reminder for {{1}}: the live Hindi session with Dr. Surabhi Vaidya is tomorrow at {{2}}.
>
> Topic: Understanding Knee Pain: What to Consider Before Choosing a Treatment Path
>
> Joining link: {{3}}

Examples: `{{1}} Meena`, `{{2}} 11:00 AM IST`, `{{3}} webinar URL`.

### 4. Webinar reminder — one hour

**Name:** `webinar_reminder_1_hour_v1`  
**Category:** Utility  
**Trigger:** About one hour before the registered session  
**Button:** `Join live session` → `{{2}}`

> Hello {{1}}, the live Hindi session with Dr. Surabhi Vaidya begins in one hour.
>
> Please join from a quiet place and keep a notebook nearby. The session is educational; personal recommendations require an individual assessment.

Examples: `{{1}} Meena`, `{{2}} webinar URL`.

### 5. Consultation confirmation

**Name:** `consultation_booking_confirmation_v1`  
**Category:** Utility  
**Trigger:** After booking through Cal.id  
**Buttons:** `View booking`, `Open clinic location`

> Hello {{1}}, your consultation with Dr. Surabhi Vaidya is confirmed.
>
> Date: {{2}}  
> Time: {{3}}  
> Location: Charak Health Solutions, Cura 304, Raymond TenX Habitat, Pokharan Road No. 2, Thane West.
>
> Please arrive 10 minutes early. Bring relevant reports and a current list of medicines, if available.

Examples: `{{1}} Meena`, `{{2}} Tuesday, 20 October 2026`, `{{3}} 4:30 PM IST`.

### 6. Webinar invitation

**Name:** `knee_pain_webinar_invitation_v1`  
**Category:** Marketing  
**Buttons:** `Register`, `Not interested`

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

### 7. Nurture — assessment first

**Name:** `knee_care_assessment_education_v1`  
**Category:** Marketing

> Knee pain can have different causes, so the same plan may not suit everyone. A useful assessment looks at symptoms, health history, daily movement, previous treatment and personal goals before options are discussed.
>
> Dr. Surabhi Vaidya explains this assessment-first approach here: {{1}}
>
> This is general education and not a diagnosis. Reply STOP to opt out.

Example: `{{1}} video or landing-page URL`.

### 8. Nurture — movement and exercise

**Name:** `knee_care_movement_education_v1`  
**Category:** Marketing

> With many common knee conditions, appropriately selected movement and strengthening can support function. The right starting point depends on the person and the cause of the symptoms.
>
> Watch Dr. Surabhi explain what to consider before beginning an exercise routine: {{1}}
>
> Seek medical advice for severe swelling, injury, inability to bear weight or rapidly worsening symptoms. Reply STOP to opt out.

Example: `{{1}} YouTube URL`.

### 9. Nurture — patient story

**Name:** `patient_experience_story_v1`  
**Category:** Marketing

> Every person’s condition and response to care can be different. In this video, a Charak Health Solutions patient shares their own experience of seeking help for knee pain.
>
> Watch the story: {{1}}
>
> Individual results vary. A consultation is needed to discuss suitable options. Reply STOP to opt out.

Example: `{{1}} patient-story page URL`.

### 10. Nurture — meet Dr. Surabhi

**Name:** `meet_dr_surabhi_v1`  
**Category:** Marketing

> Meet Dr. Surabhi Vaidya, BAMS and MBA in Clinical Research, at Charak Health Solutions in Thane.
>
> Her consultation process begins with health history, current difficulties and assessment before suitable next steps are discussed.
>
> Learn more or take the short questionnaire: {{1}}
>
> Reply STOP to opt out.

Example: `{{1}} landing-page URL`.

### 11. Final webinar invitation reminder

**Name:** `webinar_invitation_closing_v1`  
**Category:** Marketing  
**Buttons:** `Register`, `Not interested`

> Registrations for Dr. Surabhi Vaidya’s next live Hindi session close at {{1}} today.
>
> The session explains common knee-pain questions, how assessment guides treatment choices, and when to seek individual advice.
>
> Register here: {{2}}
>
> Reply STOP to opt out.

Examples: `{{1}} 8:00 PM IST`, `{{2}} registration URL`.

### 12. Webinar feedback

**Name:** `webinar_feedback_request_v1`  
**Category:** Utility if it only asks about the attended session; Marketing if consultation is promoted  
**Button:** `Share feedback`

> Thank you for attending today’s session with Dr. Surabhi Vaidya, {{1}}.
>
> Please share your feedback here: {{2}}
>
> Your response helps us improve future educational sessions.

Examples: `{{1}} Meena`, `{{2}} feedback form URL`.

## Recommended sequences

**Registered participant:** confirmation immediately; joining details when ready; reminders 24 hours and one hour before; feedback two to four hours afterward.

**Opted-in lead who has not registered:** invitation on day 0; assessment education on day 2; movement education on day 5; patient story on day 8; final invitation on day 10. Stop Marketing messages when the person registers or opts out.

## Video ad recording scripts

Record vertically in 9:16. Keep Dr. Surabhi at eye level, use soft front light, add large subtitles and keep the clinic name visible. Send the CTA to the two-minute questionnaire or webinar form.

### Ad 1 — The chair moment (30 seconds)

**Visual:** A senior adult starts to stand from a garden chair, pauses and uses the armrest. Cut to Dr. Surabhi.

> “Sometimes knee discomfort first shows up in ordinary moments — standing after sitting, taking the stairs, or joining the family for a walk. These changes deserve a closer look. I’m Dr. Surabhi Vaidya from Charak Health Solutions in Thane. My process begins with the person’s history, movement and goals before suitable next steps are discussed. Start with our short questionnaire to understand which conversation may be useful.”

**Text:** `Understand the next step · 2-minute questionnaire`  
**CTA:** `Learn More`

### Ad 2 — Assessment comes first (40 seconds)

> “Knee pain is a symptom, not a complete diagnosis. Two people can describe similar discomfort and still need different advice. In a consultation, I first understand the health history, daily difficulties, earlier treatments and movement. I then use my clinical and Ayurvedic assessment to discuss an individual plan. If you are comparing options and want a structured place to begin, take our short questionnaire.”

**Text:** `History · Assessment · Individual plan`  
**CTA:** `Find a Starting Point`

### Ad 3 — Live Hindi webinar (30 seconds)

> “There is a great deal of confusing information about knee pain — exercises, medicines, injections, therapies and surgery. I’m hosting a live Hindi session to explain the questions that matter before choosing a treatment path. We’ll discuss common causes, the role of movement and lifestyle, and when an individual assessment is important. Register to receive the joining details on WhatsApp.”

**Text:** `Live Hindi session · Educational · Ask questions`  
**CTA:** `Register on WhatsApp`

### Ad 4 — Three questions (35 seconds)

> “Before choosing any knee-pain treatment, ask three questions. First: what is likely causing the symptoms? Second: how is movement and daily function affected? Third: what result is realistic for this individual? Good decisions begin with assessment and clear expectations. In my live Hindi session, I explain these questions in simple language.”

**Text:** `Cause? Function? Realistic goal?`  
**CTA:** `Reserve a Place`

### Ad 5 — Family and independence (30 seconds)

> “Mobility is connected to everyday independence — visiting friends, travelling, shopping and spending time with family. When knee discomfort begins changing these routines, reliable information can make the next decision clearer. Charak Health Solutions offers a short questionnaire that guides people toward either an educational webinar or a personal consultation.”

**Text:** `A clearer next step for knee care`  
**CTA:** `Start Questionnaire`

### Ad 6 — Patient story introduction (20 seconds)

> “Clinical information matters, and lived experience can help people know what a care journey feels like. Here is one patient’s experience at Charak Health Solutions. Their story is personal, and results can differ for every individual.”

Cut to an approved patient clip with written consent.  
**Text:** `Patient experience · Individual results vary`  
**CTA:** `Watch Their Story`

## Advertising copy guardrails

Use: “Knee pain can affect everyday movement”; “Learn what to consider before choosing a treatment path”; “Explore suitable next steps after an individual assessment”; “Individual results vary.”

Avoid: “Are you suffering from knee pain?”; “Your damaged knees can be cured”; “Avoid surgery in seven sessions”; “Regrow cartilage naturally”; “Guaranteed pain relief”; “Works for everyone.” Avoid dramatic before-and-after images, frightening surgical imagery and language that appears to know the viewer’s medical condition.

## YouTube research direction

Research on highly watched knee-osteoarthritis videos shows strong interest in treatment, exercise and rehabilitation, condition education and symptoms. Search language used in India includes English and Hindi versions of “knee pain relief,” “osteoarthritis cure” and “joint pain home remedy.” These phrases reveal the question; the videos should correct unrealistic cure expectations rather than use them as promises.

### Search-led foundation

1. Knee Pain While Climbing Stairs: What It Can Mean | Hindi
2. Knee Osteoarthritis Explained Simply: Symptoms, Stages and Assessment
3. Morning Knee Stiffness: When Is It More Than Normal Ageing?
4. Why the Knee Makes Cracking Sounds — and When to Get It Checked
5. Knee Swelling: Common Causes and Warning Signs
6. When Is an X-ray or MRI Actually Needed for Knee Pain?
7. Five Questions to Ask Before Starting Any Knee-Pain Treatment
8. Can Exercise Make Knee Pain Worse? How to Start Safely

### High-intent decisions

9. Medicines, Physiotherapy, Injections or Surgery: How Are Options Chosen?
10. When Should Knee Replacement Be Discussed?
11. Can Knee Surgery Always Be Avoided? An Honest Answer
12. What to Expect in a First Knee-Pain Consultation
13. Why the Same Knee Treatment Does Not Suit Everyone
14. How to Set a Realistic Goal: Pain, Walking, Stairs or Independence?
15. What to Bring to a Knee-Pain Consultation

### Dr. Surabhi’s expertise

16. How Health History and Posture Inform a Knee Assessment
17. What Is Naadi Pariksha, and How Does Dr. Surabhi Use It?
18. Marma Chikitsa for Pain Management: What It Is and What It Is Not
19. Pottali Sekam, Lepam and Medicated Steam: How Therapies Are Selected
20. How Ayurveda, Movement, Diet and Follow-up Can Form One Individual Plan
21. A Day at Charak Health Solutions: From Assessment to Follow-up
22. Dr. Surabhi Answers Five Common Knee-Pain Questions

### Lifestyle and family

23. Sitting Cross-Legged, Squatting and Indian Toilets: What to Consider
24. Walking With Knee Pain: How Much Is Appropriate?
25. Knee-Friendly Ways to Stand Up From a Chair
26. Travel With Knee Pain: Trains, Flights and Long Car Journeys
27. Sleep and Knee Pain: Positions and Questions for a Clinician
28. Body Weight and Knee Load: A Respectful, Practical Explanation
29. How Families Can Support an Older Adult Without Taking Away Independence
30. Shoes, Canes and Knee Braces: Who May Find Them Useful?

### Trust-building formats

31. Patient Journey: What Changed in Daily Life?
32. Doctor Reacts to Five Viral Knee-Pain Claims
33. Myth or Fact: “Knee Pain Means Bone-on-Bone Damage”
34. Myth or Fact: “Rest Is Always Best for Knee Pain”
35. Monthly Live Q&A: Knee Pain Questions in Hindi

## Publishing plan

Publish one 6–10 minute video and two Shorts each week for eight weeks. Record in natural Hindi or Hinglish, with English titles and subtitles where useful. Use the webinar as the main CTA; offer a personal consultation for high-intent decision topics.

Record these first: knee pain on stairs; what happens during the first consultation; whether exercise can make knee pain worse; when knee replacement should be discussed.

## Medical and platform guardrails

- Educate without remotely diagnosing viewers.
- Mention that severe injury, inability to bear weight, major swelling or rapidly worsening symptoms need prompt medical evaluation.
- Separate established clinical evidence from the clinic’s Ayurvedic approach.
- Do not claim that a therapy cures osteoarthritis, regrows cartilage, guarantees relief or removes the need for surgery.
- Explain that surgery remains appropriate for some people after clinical assessment.
- Cite reliable sources and dates in descriptions.
- Obtain written patient consent for testimonials and avoid disclosing unrelated health information.

## Research basis

- [WhatsApp Business Messaging Policy](https://business.whatsapp.com/policy/): opt-in, approved templates, the 24-hour service window and healthcare-data responsibilities.
- [WHO osteoarthritis guidance](https://www.who.int/news-room/fact-sheets/detail/osteoarthritis): symptoms, risk factors, exercise, healthy weight, rehabilitation and joint replacement for severe disease.
- [NICE NG226 recommendations](https://www.nice.org.uk/guidance/NG226/chapter/recommendations): tailored exercise, education, weight management where relevant, follow-up and referral criteria.
- [AAOS patient guidance](https://orthoinfo.aaos.org/globalassets/pdfs/the-management-of-osteoarthritis-of-the-knee-pls_final.pdf): exercise, weight management, medicines, assistive devices and evidence limitations.
- [YouTube medical misinformation policy](https://support.google.com/youtube/answer/13813322) and [advertiser-friendly guidelines](https://support.google.com/youtube/answer/6162278).
- [Analysis of 100 highly viewed knee-OA videos](https://pmc.ncbi.nlm.nih.gov/articles/PMC12956219/) and a [2026 India-focused search study](https://www.sciencedirect.com/science/article/pii/S0976566226001141).
