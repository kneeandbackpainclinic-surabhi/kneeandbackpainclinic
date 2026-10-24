// Template Registry for AgentBandhu WhatsApp Business Cloud API Integration
// Charak Health Solutions - Dr. Surabhi Vaidya Clinic

export const AGENTBANDHU_API_BASE_URL = 'https://agentbandhu.com/api/v1/public';
export const AGENTBANDHU_MESSAGES_ENDPOINT = `${AGENTBANDHU_API_BASE_URL}/messages`;

export const WHATSAPP_TEMPLATES = {
  consultation_booking_confirmation_v1: {
    name: 'consultation_booking_confirmation_v1',
    title: 'Consultation Booking Confirmation',
    language: 'en_US',
    category: 'utility',
    variableCount: 3,
    variableLabels: ['Patient Name', 'Date', 'Time'],
    defaultVariables: ['Patient', 'Tuesday, 20 October 2026', '4:30 PM IST'],
    hasMedia: false,
    body: 'Hello {{1}}, your consultation with Dr. Surabhi Vaidya is confirmed.\n\nDate: {{2}}\nTime: {{3}}\nLocation: Charak Health Solutions, Cura 304, Raymond TenX Habitat, Pokharan Road No. 2, Thane West.\n\nPlease arrive 10 minutes early. Bring relevant reports and a current list of medicines, if available.'
  },

  webinar_registration_confirmation_v1: {
    name: 'webinar_registration_confirmation_v1',
    title: 'Webinar Registration Confirmation',
    language: 'en', // Verified exact language from AgentBandhu
    category: 'utility',
    variableCount: 3,
    variableLabels: ['Patient Name', 'Date', 'Time'],
    defaultVariables: ['Patient', 'Sunday, 15 November 2026', '11:00 AM IST'],
    hasMedia: false,
    body: 'Hello {{1}}, your registration request for the live Hindi session, Understanding Knee Pain: What to Consider Before Choosing a Treatment Path", has been received.\n\nDate: {{2}}\nTime: {{3}}\nHosted by: Dr. Surabhi Vaidya, Charak Health Solutions\n\nThe joining link will be shared on WhatsApp before the session. Reply here if you need help.'
  },

  webinar_joining_details_v1: {
    name: 'webinar_joining_details_v1',
    title: 'Webinar Joining Details',
    language: 'en_US',
    category: 'utility',
    variableCount: 3,
    variableLabels: ['Patient Name', 'Date', 'Time'],
    defaultVariables: ['Patient', 'Sunday, 15 November 2026', '11:00 AM IST'],
    hasMedia: false,
    body: 'Hello {{1}}, here are the joining details for your registered live Hindi session with Dr. Surabhi Vaidya.\n\nDate: {{2}}\nTime: {{3}}\n\nPlease join a few minutes early. This educational session does not replace an individual medical consultation.'
  },

  webinar_reminder_1_day_v1: {
    name: 'webinar_reminder_1_day_v1',
    title: 'Webinar Reminder (24 Hours Prior)',
    language: 'en_US',
    category: 'marketing',
    variableCount: 3,
    variableLabels: ['Patient Name', 'Time', 'Joining Link'],
    defaultVariables: ['Patient', '11:00 AM IST', 'https://webinar.gg/charakhealth'],
    hasMedia: false,
    body: 'Reminder for {{1}}: the live Hindi session with Dr. Surabhi Vaidya is tomorrow at {{2}}.\n\nTopic: Understanding Knee Pain: What to Consider Before Choosing a Treatment Path\n\nJoining link: {{3}}\n\nThankyou'
  },

  webinar_reminder_1_hour_v1: {
    name: 'webinar_reminder_1_hour_v1',
    title: 'Webinar Reminder (1 Hour Prior)',
    language: 'en_US',
    category: 'marketing',
    variableCount: 1,
    variableLabels: ['Patient Name'],
    defaultVariables: ['Patient'],
    hasMedia: false,
    body: 'Hello {{1}}, the live Hindi session with Dr. Surabhi Vaidya begins in one hour.\n\nPlease join from a quiet place and keep a notebook nearby. The session is educational; personal recommendations require an individual assessment.'
  },

  webinar_invitation_closing_v1: {
    name: 'webinar_invitation_closing_v1',
    title: 'Webinar Registrations Closing Today',
    language: 'en_US',
    category: 'marketing',
    variableCount: 2,
    variableLabels: ['Closing Time', 'Registration Link'],
    defaultVariables: ['8:00 PM IST', 'https://dr-surabhi.com/webinar'],
    hasMedia: false,
    body: 'Registrations for Dr. Surabhi Vaidya next live Hindi session close at {{1}} today.\n\nThe session explains common knee-pain questions, how assessment guides treatment choices, and when to seek individual advice.\n\nRegister here: {{2}}\n\nReply STOP to opt out.'
  },

  knee_pain_webinar_invitation_v1: {
    name: 'knee_pain_webinar_invitation_v1',
    title: 'Knee Pain Webinar Invitation',
    language: 'en_US',
    category: 'marketing',
    variableCount: 3,
    variableLabels: ['Date', 'Time', 'Registration Link'],
    defaultVariables: ['Sunday, 15 November 2026', '11:00 AM IST', 'https://dr-surabhi.com/webinar'],
    hasMedia: false,
    body: 'Charak Health Solutions is hosting a live Hindi session with Dr. Surabhi Vaidya on understanding knee pain and the questions worth asking before choosing a treatment path.\n\nDate: {{1}}\nTime: {{2}}\n\nThe session covers common causes of knee discomfort, the role of assessment, movement and lifestyle, and when an in-person consultation may be useful.\n\nRegister here: {{3}}\n\nReply STOP to opt out.'
  },

  meet_dr_surabhi_v1: {
    name: 'meet_dr_surabhi_v1',
    title: 'Meet Dr. Surabhi Vaidya',
    language: 'en_US',
    category: 'marketing',
    variableCount: 1,
    variableLabels: ['Appointment Link'],
    defaultVariables: ['https://cal.id/charakhealth/consultation'],
    hasMedia: false,
    body: 'Meet Dr. Surabhi Vaidya, BAMS and MBA in Clinical Research, at Charak Health Solutions in Thane.\n\nHer consultation process begins with health history, current difficulties and assessment before suitable next steps are discussed.\n\nBook an appointment: {{1}}\n\nReply STOP to opt out.'
  },

  ozone_therapy: {
    name: 'ozone_therapy',
    title: 'Ozone Therapy + Ayurveda Assessment',
    language: 'en', // Verified exact language from AgentBandhu
    category: 'marketing',
    variableCount: 0,
    variableLabels: [],
    defaultVariables: [],
    hasMedia: true,
    mediaType: 'image',
    defaultMediaUrl: 'https://kneeandbackpainclinic.vercel.app/assets/garden-mobile-draft.png',
    body: '🫧 TIRED? STIFF? SLOW TO RECOVER?\n\nNow experience a personalised combination of Ozone Shots + Ayurveda at Charak Health Solutions 🌿\n\n✨ Support for recovery, circulation & overall wellness — with the holistic approach of Ayurveda.\n\n👩‍⚕️ Assessment before treatment\n📍 Vartak Nagar, Thane\n📞 9082280274\n\n👉 Book your Assessment today!'
  },

  knee_care_assessment_education_v1: {
    name: 'knee_care_assessment_education_v1',
    title: 'Knee Care Assessment Education',
    language: 'en_US',
    category: 'marketing',
    variableCount: 1,
    variableLabels: ['Webinar Link'],
    defaultVariables: ['https://dr-surabhi.com/webinar'],
    hasMedia: false,
    body: 'Knee pain can have different causes, so the same plan may not suit everyone. A useful assessment looks at symptoms, health history, daily movement, previous treatment and personal goals before options are discussed.\n\nDr. Surabhi Vaidya explains this assessment-first approach in her live Hindi session. Join the webinar: {{1}}\n\nThis is general education and not a diagnosis. Reply STOP to opt out.'
  },

  knee_care_movement_education_v1: {
    name: 'knee_care_movement_education_v1',
    title: 'Knee Care Movement & Exercise Education',
    language: 'en_US',
    category: 'marketing',
    variableCount: 1,
    variableLabels: ['Webinar Link'],
    defaultVariables: ['https://dr-surabhi.com/webinar'],
    hasMedia: false,
    body: 'With many common knee conditions, appropriately selected movement and strengthening can support function. The right starting point depends on the person and the cause of the symptoms.\n\nJoin Dr. Surabhi live Hindi webinar to understand what to consider before beginning an exercise routine: {{1}}\n\nSeek medical advice for severe swelling, injury, inability to bear weight or rapidly worsening symptoms. Reply STOP to opt out.'
  },

  patient_experience_story_v1: {
    name: 'patient_experience_story_v1',
    title: 'Patient Experience Story',
    language: 'en_US',
    category: 'marketing',
    variableCount: 1,
    variableLabels: ['Appointment Link'],
    defaultVariables: ['https://cal.id/charakhealth/consultation'],
    hasMedia: false,
    body: 'Every person condition and response to care can be different. In this video, a Charak Health Solutions patient shares their own experience of seeking help for knee pain.\n\nTo discuss an individual starting point with Dr. Surabhi, book an appointment: {{1}}\n\nIndividual results vary. A consultation is needed to discuss suitable options. Reply STOP to opt out.'
  },

  post_experience_google_review_v1: {
    name: 'post_experience_google_review_v1',
    title: 'Post-Experience Google Review Request',
    language: 'en_US',
    category: 'marketing',
    variableCount: 1,
    variableLabels: ['Patient Name'],
    defaultVariables: ['Patient'],
    hasMedia: false,
    body: 'Hello {{1}}, thank you for spending time with Charak Health Solutions today.\n\nWe hope your experience was clear and helpful. If you would like to share feedback, please leave an honest Google review. Your review can help other people understand what to expect when they contact the clinic.\n\nPlease share only information that you are comfortable making public.\n\nReply STOP to opt out.'
  },

  surabhi_v4_no_image: {
    name: 'surabhi_v4_no_image',
    title: 'Surabhi V4 Utility (4 Variables, No Image)',
    language: 'en_US',
    category: 'utility',
    variableCount: 4,
    variableLabels: ['Recipient Name', 'Body Line 1', 'Body Line 2', 'Body Line 3'],
    defaultVariables: ['Patient', 'Your consultation details have been updated.', 'Please arrive 10 minutes early.', 'Location: Charak Health Solutions, Thane West.'],
    hasMedia: false,
    body: 'Hello {{1}},\n\n{{2}}\n\n{{3}}\n\n{{4}}\n\nThis information is being shared for reference purposes.\n\n*Thank You.*'
  },

  surabhi_v4_with_image: {
    name: 'surabhi_v4_with_image',
    title: 'Surabhi V4 Utility (4 Variables, With Image)',
    language: 'en_US',
    category: 'utility',
    variableCount: 4,
    variableLabels: ['Recipient Name', 'Body Line 1', 'Body Line 2', 'Body Line 3'],
    defaultVariables: ['Patient', 'Your appointment is confirmed at Charak Health Solutions.', 'Dr. Surabhi Vaidya will conduct your clinical assessment.', 'Clinic address: Cura 304, Raymond TenX Habitat, Pokharan Road No. 2, Thane West.'],
    hasMedia: true,
    mediaType: 'image',
    defaultMediaUrl: 'https://kneeandbackpainclinic.vercel.app/assets/garden-mobile-draft.png',
    body: 'Hello {{1}},\n\n{{2}}\n\n{{3}}\n\n{{4}}\n\nThis information is being shared for reference purposes.\n\n*Thank You.*'
  },

  surabhi_v4_docs: {
    name: 'surabhi_v4_docs',
    title: 'Surabhi V4 Utility (4 Variables, With Document)',
    language: 'en_US',
    category: 'utility',
    variableCount: 4,
    variableLabels: ['Recipient Name', 'Line 1', 'Line 2', 'Line 3'],
    defaultVariables: ['Patient', 'Please find your clinic protocol attached.', 'Kindly review the instructions before your visit.', 'Feel free to reply if you have questions.'],
    hasMedia: true,
    mediaType: 'document',
    defaultMediaUrl: 'https://kneeandbackpainclinic.vercel.app/assets/knee_pain_guide.pdf',
    body: 'Hello {{1}},\n\n{{2}}\n\n{{3}}\n\n{{4}}\n\n*Thank You.*\n\n_This information is being shared for reference purposes._'
  },

  surabhi_v5_no_image: {
    name: 'surabhi_v5_no_image',
    title: 'Surabhi V5 Utility (5 Variables, No Image)',
    language: 'en_US',
    category: 'utility',
    variableCount: 5,
    variableLabels: ['Recipient Name', 'Line 1', 'Line 2', 'Line 3', 'Line 4'],
    defaultVariables: ['Patient', 'Line 1', 'Line 2', 'Line 3', 'Line 4'],
    hasMedia: false,
    body: 'Hello {{1}},\n\n{{2}}\n\n{{3}}\n\n{{4}}\n\n{{5}}\n\nThis information is being shared for reference purposes.\n\n*Thank You.*'
  },

  surabhi_v5_with_image: {
    name: 'surabhi_v5_with_image',
    title: 'Surabhi V5 Utility (5 Variables, With Image)',
    language: 'en_US',
    category: 'utility',
    variableCount: 5,
    variableLabels: ['Recipient Name', 'Line 1', 'Line 2', 'Line 3', 'Line 4'],
    defaultVariables: ['Patient', 'Line 1', 'Line 2', 'Line 3', 'Line 4'],
    hasMedia: true,
    mediaType: 'image',
    defaultMediaUrl: 'https://kneeandbackpainclinic.vercel.app/assets/garden-mobile-draft.png',
    body: 'Hello {{1}},\n\n{{2}}\n\n{{3}}\n\n{{4}}\n\n{{5}}\n\nThis information is being shared for reference purposes.\n\n*Thank You.*'
  },

  surabhi_v5_docs: {
    name: 'surabhi_v5_docs',
    title: 'Surabhi V5 Utility (5 Variables, With Document)',
    language: 'en_US',
    category: 'utility',
    variableCount: 5,
    variableLabels: ['Recipient Name', 'Line 1', 'Line 2', 'Line 3', 'Line 4'],
    defaultVariables: ['Patient', 'Line 1', 'Line 2', 'Line 3', 'Line 4'],
    hasMedia: true,
    mediaType: 'document',
    defaultMediaUrl: 'https://kneeandbackpainclinic.vercel.app/assets/knee_pain_guide.pdf',
    body: 'Hello {{1}},\n\n{{2}}\n\n{{3}}\n\n{{4}}\n\n{{5}}\n\nThis information is being shared for reference purposes.\n\n*Thank You.*'
  },

  surabhi_v5_video: {
    name: 'surabhi_v5_video',
    title: 'Surabhi V5 Utility (5 Variables, With Video)',
    language: 'en_US',
    category: 'utility',
    variableCount: 5,
    variableLabels: ['Recipient Name', 'Line 1', 'Line 2', 'Line 3', 'Line 4'],
    defaultVariables: ['Patient', 'Line 1', 'Line 2', 'Line 3', 'Line 4'],
    hasMedia: true,
    mediaType: 'video',
    defaultMediaUrl: 'https://kneeandbackpainclinic.vercel.app/assets/dr_surabhi_intro.mp4',
    body: 'Hello {{1}},\n\n{{2}}\n\n{{3}}\n\n{{4}}\n\n{{5}}\n\nThis information is being shared for reference purposes.\n\n*Thank You.*'
  }
};

/**
 * Clean and format Indian phone number to AgentBandhu E.164 requirement: +919876543210
 */
export function formatPhoneNumber(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/[^0-9]/g, '');
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }
  if (String(phone).trim().startsWith('+')) {
    return `+${digits}`;
  }
  return `+${digits}`;
}

/**
 * Render template text with replaced {{1}}, {{2}} variables for preview
 */
export function renderTemplatePreview(templateName, variables = []) {
  const tmpl = WHATSAPP_TEMPLATES[templateName];
  if (!tmpl) return '';
  let text = tmpl.body;
  variables.forEach((val, idx) => {
    const placeholder = new RegExp(`\\{\\{${idx + 1}\\}\\}`, 'g');
    text = text.replace(placeholder, val || '');
  });
  return text;
}

/**
 * Build the exact JSON payload expected by AgentBandhu API
 */
export function buildAgentBandhuPayload({ to, templateName, variables, language, headerMediaUrl, reference }) {
  const tmpl = WHATSAPP_TEMPLATES[templateName];
  if (!tmpl) {
    throw new Error(`Unknown template name: ${templateName}`);
  }

  const finalLanguage = language || tmpl.language;
  const finalVariables = Array.isArray(variables) ? variables : (tmpl.defaultVariables || []);
  const finalReference = reference || `charak_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  const payload = {
    to: formatPhoneNumber(to),
    template: templateName,
    language: finalLanguage,
    variables: finalVariables.slice(0, tmpl.variableCount),
    reference: finalReference
  };

  if (tmpl.hasMedia || headerMediaUrl) {
    payload.headerMediaUrl = headerMediaUrl || tmpl.defaultMediaUrl;
  }

  return payload;
}
