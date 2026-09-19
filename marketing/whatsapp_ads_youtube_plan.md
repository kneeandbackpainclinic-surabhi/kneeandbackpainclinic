# Dr. Surabhi Vaidya : WhatsApp, Video Ads and YouTube Content Plan

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

Examples: `{{1}} Meena`, `{{2}} Sunday, 18 October 2026`, `{{3}} 11:00 AM IST`, `{{4}} https://zoom.us/j/123456789`.

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
> Location: Charak Health Solutions, Cura 304, Raymond TenX Habitat, Pokharan Road No. 2, Thane West.
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

## Recommended sequences

**Registered participant:** confirmation immediately; joining details when ready; reminders 24 hours and one hour before.

**Opted-in lead who has not registered:** invitation on day 0; assessment education on day 2; movement education on day 5; patient story on day 8; final invitation on day 10. Stop Marketing messages when the person registers or opts out.

## Video ad recording scripts

Record vertically in 9:16. Keep Dr. Surabhi at eye level, use soft front light, add large subtitles and keep the clinic name visible. Every recording must end with only one of these CTAs: **Book appointment** or **Join webinar**.

### Ad 1 : The chair moment (50 to 60 seconds)

**Visual:** A senior adult starts to stand from a garden chair, pauses and uses the armrest. Cut to Dr. Surabhi.

> “Sometimes knee discomfort first becomes noticeable during very ordinary moments. It may be while standing after sitting for a long time, climbing the stairs, getting out of a car, or joining the family for an evening walk. It is easy to ignore these changes or assume that they are simply part of getting older. However, knee discomfort can have different causes, and the same advice may not be suitable for every person. I am Dr. Surabhi Vaidya from Charak Health Solutions in Thane. During a consultation, I begin by understanding the person's history, daily difficulties, previous treatment and movement. I then assess the individual before discussing a suitable way forward. If knee discomfort is beginning to affect everyday movement, book an appointment for a personal assessment.”

**Text:** `Understand the cause before choosing the next step`  
**CTA:** `Book appointment`

### Ad 2 : Assessment comes first (50 to 60 seconds)

> “Knee pain is a symptom, not a complete diagnosis. Two people may describe similar pain while walking or climbing stairs, but the reason behind their discomfort and the support they need can be different. That is why I do not begin with a standard treatment package. I first understand the person's health history, daily routine, previous treatment, current limitations and personal goals. I also look at posture, movement and other relevant findings, along with my clinical and Ayurvedic assessment. Only after this do I discuss which options may be appropriate and what expectations are realistic. If you want a structured discussion about your individual situation, book an appointment with me at Charak Health Solutions in Thane.”

**Text:** `History · Assessment · Individual plan`  
**CTA:** `Book appointment`

### Ad 3 : Live Hindi webinar (50 to 60 seconds)

> “There is a great deal of confusing information about knee pain. One person recommends complete rest, another recommends exercise, and someone else may suggest medicines, injections, therapies or surgery. How does a person know what information is relevant? I am Dr. Surabhi Vaidya, and I am hosting a live Hindi webinar to make these decisions easier to understand. We will discuss common reasons for knee discomfort, why assessment matters, how movement and lifestyle fit into care, and when a personal consultation may be useful. This session is educational and will help you prepare better questions before choosing a treatment path. Join the webinar and receive the session details directly on WhatsApp.”

**Text:** `Live Hindi session · Educational · Ask questions`  
**CTA:** `Join webinar`

### Ad 4 : Three questions (50 to 60 seconds)

> “Before choosing any knee-pain treatment, begin with three questions. First, what may be causing the symptoms? Knee discomfort can arise for different reasons, so the name of a treatment alone is not enough. Second, how is movement and daily function affected? Walking, climbing stairs, standing from a chair and sleeping comfortably may each tell us something useful. Third, what result is realistic for this individual? A good plan should be based on assessment, personal goals and clear expectations. I will explain these three questions, along with other common doubts, in a live Hindi webinar. If you want to understand your options before making a decision, join the webinar.”

**Text:** `Cause? Function? Realistic goal?`  
**CTA:** `Join webinar`

### Ad 5 : Family and independence (50 to 60 seconds)

> “Mobility is closely connected to everyday independence. It can mean walking to the nearby shop, visiting friends, travelling with family, attending a function, or simply standing up without needing someone else's help. When knee discomfort begins to change these routines, the concern is often about more than pain. It is also about confidence and freedom. At Charak Health Solutions, the conversation begins by understanding the person, the activities that matter to them, and the changes they have noticed. An individual assessment can then help clarify which options are suitable and what goals are realistic. If everyday movement is becoming more difficult, book an appointment with Dr. Surabhi Vaidya in Thane.”

**Text:** `A clearer next step for knee care`  
**CTA:** `Book appointment`

### Ad 6 : Patient story introduction (45 to 55 seconds)

> “When people explore care for knee pain, they often want to understand what the experience is like from another patient's point of view. Clinical information is important, and a patient story can also show how the consultation, assessment and follow-up felt in everyday life. In this video, one patient shares their personal experience at Charak Health Solutions. Their story represents only their own journey. The cause of knee pain, the treatment selected and the response to care can differ for every individual. A testimonial cannot predict another person's result. If you would like to discuss your own situation and understand which next steps may be suitable, book an appointment with Dr. Surabhi Vaidya.”

Cut to an approved patient clip with written consent.  
**Text:** `Patient experience · Individual results vary`  
**CTA:** `Book appointment`

## Advertising copy guardrails

Use: “Knee pain can affect everyday movement”; “Learn what to consider before choosing a treatment path”; “Explore suitable next steps after an individual assessment”; “Individual results vary.”

Avoid: “Are you suffering from knee pain?”; “Your damaged knees can be cured”; “Avoid surgery in seven sessions”; “Regrow cartilage naturally”; “Guaranteed pain relief”; “Works for everyone.” Avoid dramatic before-and-after images, frightening surgical imagery and language that appears to know the viewer’s medical condition.

## YouTube research direction

Research on highly watched knee-osteoarthritis videos shows strong interest in treatment, exercise and rehabilitation, condition education and symptoms. Search language used in India includes English and Hindi versions of “knee pain relief,” “osteoarthritis cure” and “joint pain home remedy.” These phrases reveal the question; the videos should correct unrealistic cure expectations rather than use them as promises.

### Search-led foundation

1. Knee Pain While Climbing Stairs: What It Can Mean | Hindi
2. Knee Osteoarthritis Explained Simply: Symptoms, Stages and Assessment
3. Morning Knee Stiffness: When Is It More Than Normal Ageing?
4. Why the Knee Makes Cracking Sounds : and When to Get It Checked
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

Publish one 6–10 minute video and two Shorts each week for eight weeks. Record in natural Hindi or Hinglish, with English titles and subtitles where useful. Use only Join webinar or Book appointment. Use Join webinar for educational topics and Book appointment for high-intent decision topics.

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
