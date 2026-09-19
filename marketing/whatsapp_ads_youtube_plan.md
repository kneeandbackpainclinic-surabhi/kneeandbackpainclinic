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

## Landing page VSL script

**Recommended length:** 6 to 8 minutes  
**Primary CTA:** `Book appointment`  
**Secondary CTA:** `Join webinar`  
**Format:** Dr. Surabhi speaking to camera, supported by clinic footage, simple diagrams, patient activity shots and short consented testimonial excerpts.  
**Placement:** Near the top of the landing page, after the main headline and before detailed treatment or pricing sections.

### Scene 1: The everyday moment

**Visuals:** A group of senior adults in a garden. One person places a hand on the knee and rises carefully from a chair. Show natural family and walking moments rather than dramatic pain acting.

**Dr. Surabhi:**

> “Knee and back discomfort often becomes noticeable through small changes in everyday life. Standing after sitting may take longer. Stairs may require more thought. A morning walk may become shorter. Travel, social visits, prayer, work and time with family may begin to feel more difficult.
>
> These changes can affect much more than movement. They can affect confidence, independence and the freedom to plan the day without constantly thinking about pain.
>
> If this sounds familiar, the most useful first step is not to assume that one treatment will suit every person. It is to understand what may be contributing to the problem and how it is affecting daily function.”

**On-screen text:** `Understand the person. Assess the condition. Choose the next step.`

### Scene 2: Meet Dr. Surabhi

**Visuals:** Dr. Surabhi entering the clinic, speaking with a patient, reviewing notes and demonstrating an assessment. Show credentials on screen.

**Dr. Surabhi:**

> “I am Dr. Surabhi Vaidya, an Ayurvedic physician with a BAMS and an MBA in Clinical Research. At Charak Health Solutions in Thane, I work with people who are seeking help for knee pain, back pain, stiffness, sciatica and difficulty with everyday movement.
>
> Many people reach the clinic after trying several approaches. Some have used pain medicines for months. Some have tried exercise, physiotherapy, injections or different therapies. Others have been advised to consider surgery and want to understand whether any appropriate non-surgical options should be explored first.
>
> My role is to assess the individual carefully, explain what I find in understandable language and discuss realistic options. If a case requires another specialist or surgical opinion, that should also be explained honestly.”

**On-screen text:** `Dr. Surabhi Vaidya | BAMS | MBA Clinical Research | Thane`

### Scene 3: Why the same plan does not suit everyone

**Visuals:** Split screen showing two different people with similar knee discomfort but different routines and movement patterns.

**Dr. Surabhi:**

> “Knee pain is a symptom. Back pain is a symptom. A symptom alone does not tell us the complete cause or the right treatment.
>
> Two people may both experience discomfort on the stairs, but their health history, posture, muscle strength, joint condition, activity level and personal goals may be very different. One person may want to return to a daily walk. Another may want to travel comfortably, sit for prayer or manage stairs independently.
>
> This is why treatment should begin with assessment rather than a fixed package. The aim is to understand the condition, identify the difficulties that matter most to the person and decide what type of care may be suitable.”

**On-screen text:** `Similar symptoms can require different advice.`

### Scene 4: What happens in the first consultation

**Visuals:** Consultation desk, health-history discussion, posture observation, safe movement assessment and Naadi Pariksha. Avoid presenting any single assessment as a guaranteed diagnostic test.

**Dr. Surabhi:**

> “The first consultation begins with a detailed conversation. I ask about the current symptoms, how long they have been present, earlier injuries, medical conditions, medicines, reports and treatments already tried.
>
> We then discuss how movement is affected. This may include walking, standing from a chair, climbing stairs, bending, sleeping or travelling. I observe posture, alignment and relevant movements. I also use Naadi Pariksha as part of my Ayurvedic assessment.
>
> This process helps me understand whether care at our clinic may be appropriate, what the initial priorities should be and what expectations are realistic. It also gives the patient an opportunity to ask questions before making a decision.”

**On-screen text:** `History | Movement | Posture | Ayurvedic assessment | Clear expectations`

### Scene 5: How an individual plan may be built

**Visuals:** Short, calm clips of Marma Chikitsa, Pottali Sekam, medicated steam, Lepam application, guided movement and diet discussion. Add labels for each technique.

**Dr. Surabhi:**

> “When treatment at the clinic is suitable, the plan may combine several elements. These can include Marma Chikitsa, selected Ayurvedic therapies such as Pottali Sekam, medicated steam or Lepam, and guidance on movement, diet, posture and home practices.
>
> These techniques are selected according to the assessment. Not every person requires every therapy, and the duration of care can differ. Progress should be reviewed through changes that matter in daily life, such as walking tolerance, stiffness, confidence on stairs or the ability to stand more comfortably.
>
> No responsible clinician can guarantee the same outcome for every patient. The condition, its stage, overall health, consistency with the plan and many other factors can influence the response.”

**On-screen text:** `Individual selection. Monitored progress. Results can vary.`

### Scene 6: Addressing the surgery question honestly

**Visuals:** Dr. Surabhi speaking directly to camera. Use a simple decision-path graphic. Do not show frightening surgical images.

**Dr. Surabhi:**

> “A common question is whether surgery can be avoided. The honest answer is that this cannot be decided through an advertisement, a video or a questionnaire.
>
> Some people may have non-surgical options that are appropriate to explore. Some may be able to improve function or delay a procedure. Others may have advanced damage, urgent warning signs or another condition that requires orthopaedic or specialist care.
>
> The purpose of an assessment is to understand which situation applies to the individual. Surgery should not be used to frighten people, and non-surgical care should not be presented as a guarantee. The right decision is the one made after proper evaluation, clear information and realistic expectations.”

**On-screen text:** `Assessment before decisions. Honest referral when required.`

### Scene 7: Patient experience and trust

**Visuals:** Brief approved patient clips, Google review screen, clinic reception and patient interaction. Show the text “Individual experience. Results vary.” throughout testimonials.

**Dr. Surabhi:**

> “Patient stories can help people understand what a care journey feels like. On this page, you can hear directly from people who have visited Charak Health Solutions and read reviews shared on Google.
>
> Each story belongs to that individual. It should not be treated as a promise of the same result for someone else. What it can show is the importance of being heard, receiving a structured assessment and having a plan connected to meaningful daily goals.”

**On-screen text:** `Real experiences. Individual results vary.`

### Scene 8: Choose one of two next steps

**Visuals:** Two simple cards matching the landing page. Card one says Join webinar. Card two says Book appointment.

**Dr. Surabhi:**

> “There are two ways to take the next step.
>
> If you are still exploring and want to understand knee and back pain, common treatment questions and how different options are considered, join my free live Hindi webinar. It is an educational session designed to help you ask better questions before choosing a treatment path.
>
> If discomfort is significantly affecting daily movement, several treatments have already been tried, or a personal assessment is now needed, book an appointment at Charak Health Solutions in Thane. The consultation allows us to review the history, movement and suitable next steps in detail.
>
> Choose the option that matches where you are today. Join the webinar to learn, or book an appointment for an individual assessment.”

**Final on-screen CTAs:** `Join webinar` and `Book appointment`

### Suggested VSL chapter timings

1. Everyday problem and emotional relevance: 0:00 to 0:45
2. Doctor introduction and credibility: 0:45 to 1:35
3. Why assessment matters: 1:35 to 2:20
4. First consultation: 2:20 to 3:15
5. Individual treatment approach: 3:15 to 4:25
6. Honest surgery discussion: 4:25 to 5:20
7. Patient trust signals: 5:20 to 6:00
8. Webinar and appointment CTAs: 6:00 to 7:00

### VSL production notes

- Record one clean master take in horizontal 16:9 for the landing page.
- Capture close-up and medium-angle B-roll vertically as well so sections can become Reels and Shorts.
- Keep subtitles on screen and limit each subtitle block to two lines.
- Use the clinic environment and real team rather than stock medical footage where possible.
- Keep background music quiet under speech.
- Display qualifications, clinic location and Google rating only when the exact facts are verified.
- Obtain written permission before showing any identifiable patient, treatment footage or testimonial.
- Do not include fixed pain-relief percentages, guaranteed outcomes, cartilage-regrowth promises or universal surgery-avoidance claims.

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
