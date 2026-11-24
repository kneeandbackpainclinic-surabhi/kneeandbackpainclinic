// Template Registry for AgentBandhu WhatsApp Business Cloud API Integration
// Charak Health Solutions - Dr. Surabhi Vaidya Clinic

export const AGENTBANDHU_API_BASE_URL = 'https://agentbandhu.com/api/v1/public';
export const AGENTBANDHU_MESSAGES_ENDPOINT = `${AGENTBANDHU_API_BASE_URL}/messages`;

// Clinic UPI Payment Configuration
export const CLINIC_UPI_VPA = 'surabhivaidya7@okhdfcbank';
export const CLINIC_UPI_PAYEE = 'Charak Health Solutions';
export const CLINIC_UPI_QR_URL = 'https://kneeandbackpainrelief.com/assets/charak-upi-qr.jpg';
export const CLINIC_UPI_DEEPLINK_BASE = 'upi://pay?pa=surabhivaidya7%40okhdfcbank&pn=Charak%20Health%20Solutions&cu=INR';

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
    defaultMediaUrl: 'https://kneeandbackpainrelief.com/assets/garden-mobile-draft.png',
    body: '🫧 TIRED? STIFF? SLOW TO RECOVER?\n\nNow experience a personalised combination of Ozone Shots + Ayurveda at Charak Health Solutions 🌿\n\n✨ Support for recovery, circulation & overall wellness — with the holistic approach of Ayurveda.\n\n👩‍⚕️ Assessment before treatment\n📍 Vartak Nagar, Thane\n📞 9867510223\n\n👉 Book your Assessment today!'
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
    defaultVariables: ['Patient', 'Your appointment is confirmed at Charak Health Solutions.', 'Prepay online via UPI to save 20% on consultation fee.', 'Clinic address: Cura 304, Raymond TenX Habitat, Pokharan Road No. 2, Thane West.'],
    hasMedia: true,
    mediaType: 'image',
    defaultMediaUrl: CLINIC_UPI_QR_URL,
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
    defaultMediaUrl: 'https://kneeandbackpainrelief.com/assets/knee_pain_guide.pdf',
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
    defaultMediaUrl: 'https://kneeandbackpainrelief.com/assets/garden-mobile-draft.png',
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
    defaultMediaUrl: 'https://kneeandbackpainrelief.com/assets/knee_pain_guide.pdf',
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
    defaultMediaUrl: 'https://kneeandbackpainrelief.com/assets/dr_surabhi_intro.mp4',
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

// Verified Google Business Profile Review URL for Dr. Surabhi Vaidya / Charak Health Solutions
export const CLINIC_GOOGLE_REVIEW_URL = 'https://g.page/r/CWxrIXBs-xz7EAE/review';

/**
 * Dispatch a message directly to the AgentBandhu WhatsApp Public API
 */
export async function sendAgentBandhuMessage({
  to,
  templateName,
  variables,
  language,
  headerMediaUrl,
  reference,
  apiKey
}) {
  const finalApiKey = (
    apiKey ||
    process.env.AGENTBANDHU_API_KEY ||
    process.env.META_WHATSAPP_ACCESS_TOKEN ||
    ''
  ).trim();

  if (!finalApiKey) {
    return {
      ok: false,
      status: 400,
      error: 'Missing AgentBandhu API key (AGENTBANDHU_API_KEY or META_WHATSAPP_ACCESS_TOKEN not configured)'
    };
  }

  const payload = buildAgentBandhuPayload({
    to,
    templateName,
    variables,
    language,
    headerMediaUrl,
    reference
  });

  try {
    const response = await fetch(AGENTBANDHU_MESSAGES_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${finalApiKey}`,
        'x-api-key': finalApiKey,
        'api-key': finalApiKey
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    return {
      ok: response.ok,
      status: response.status,
      payload,
      data
    };
  } catch (netErr) {
    return {
      ok: false,
      status: 500,
      error: 'Network exception during AgentBandhu dispatch: ' + netErr.message
    };
  }
}

/**
 * High-Level Automated Dispatcher for Clinic CRM Status Transitions:
 *  1. Visit Completed -> Post-Experience Google Review Request
 *  2. Payment Confirmed / Received -> Payment Receipt + Slot Confirmation
 *  3. Cancelled -> Cancellation notice + Reschedule booking link
 */
export async function dispatchStatusWhatsAppNotification({ lead, newStatus, action, apiKey }) {
  if (!lead || !lead.phone) {
    return { sent: false, skipped: true, reason: 'Missing lead or phone number' };
  }

  const cleanPhone = formatPhoneNumber(lead.phone);
  if (!cleanPhone || cleanPhone.length < 12) {
    return { sent: false, skipped: true, reason: 'Invalid recipient phone number: ' + lead.phone };
  }

  const patientName = lead.name || 'Patient';
  const effectiveStatus = (newStatus || '').toLowerCase();
  const effectiveAction = (action || '').toLowerCase();
  const leadId = lead.id || 'lead';

  // ---------------------------------------------------------------------------
  // 1. VISIT COMPLETED -> Google Review Request
  // ---------------------------------------------------------------------------
  if (effectiveAction === 'send_review' || effectiveStatus.includes('completed')) {
    // 1a. Try marketing template with registered CTA button first
    let marketingResult = await sendAgentBandhuMessage({
      to: cleanPhone,
      templateName: 'post_experience_google_review_v1',
      variables: [patientName],
      reference: `rev_mkt_${leadId}_${Date.now()}`,
      apiKey
    });

    if (marketingResult.ok) {
      return {
        sent: true,
        template: 'post_experience_google_review_v1',
        templateCategory: 'marketing',
        recipient: cleanPhone,
        status: marketingResult.status,
        details: marketingResult.data
      };
    }

    // 1b. Fallback to Utility template (surabhi_v4_no_image) containing the review link in body
    const fallbackResult = await sendAgentBandhuMessage({
      to: cleanPhone,
      templateName: 'surabhi_v4_no_image',
      variables: [
        patientName,
        'Thank you for consulting with Dr. Surabhi Vaidya at Charak Health Solutions today.',
        'We hope your consultation was helpful. We would truly appreciate your feedback with an honest Google review:',
        `${CLINIC_GOOGLE_REVIEW_URL} (Tap the link to share your review. Thank you!)`
      ],
      reference: `rev_utl_${leadId}_${Date.now()}`,
      apiKey
    });

    return {
      sent: fallbackResult.ok,
      template: 'surabhi_v4_no_image',
      templateCategory: 'utility_fallback',
      recipient: cleanPhone,
      status: fallbackResult.status,
      details: fallbackResult.data,
      note: marketingResult.error || 'Dispatched via guaranteed utility fallback'
    };
  }

  // ---------------------------------------------------------------------------
  // 2. PAYMENT CONFIRMATION / RECEIVED & SLOT CONFIRMED
  // ---------------------------------------------------------------------------
  if (
    effectiveAction === 'send_payment_confirmation' ||
    effectiveStatus.includes('confirmed') ||
    effectiveStatus.includes('payment received') ||
    effectiveStatus.includes('paid online')
  ) {
    let slotText = (lead.slotPreference || lead.slot_preference || '').replace(/\[ISO:[^\]]+\]/g, '').trim();
    if (!slotText || slotText === 'Flexible' || slotText.toLowerCase().includes('pending')) {
      const parts = [lead.slotDate || lead.slot_date, lead.slotTime || lead.slot_time].filter(Boolean);
      slotText = parts.length > 0 ? parts.join(' at ') : 'Upcoming Clinic Hours';
    }

    const payResult = await sendAgentBandhuMessage({
      to: cleanPhone,
      templateName: 'surabhi_v4_no_image',
      variables: [
        patientName,
        'Your consultation payment has been received and your appointment is confirmed with Dr. Surabhi Vaidya.',
        `Slot: ${slotText}. Location: Charak Health Solutions, Cura 304, Raymond TenX Habitat, Pokharan Rd No. 2, Thane West.`,
        'Please arrive 10 minutes early. Bring relevant X-rays, MRI reports, and prescriptions if available.'
      ],
      reference: `pay_conf_${leadId}_${Date.now()}`,
      apiKey
    });

    return {
      sent: payResult.ok,
      template: 'surabhi_v4_no_image',
      templateCategory: 'utility',
      recipient: cleanPhone,
      status: payResult.status,
      details: payResult.data
    };
  }

  // ---------------------------------------------------------------------------
  // 3. CANCELLED -> Reschedule Link & Notice
  // ---------------------------------------------------------------------------
  if (effectiveAction === 'send_cancellation' || effectiveStatus.includes('cancel')) {
    const cancelResult = await sendAgentBandhuMessage({
      to: cleanPhone,
      templateName: 'surabhi_v4_no_image',
      variables: [
        patientName,
        'Your consultation appointment with Dr. Surabhi Vaidya at Charak Health Solutions has been cancelled as requested.',
        'If you would like to reschedule your consultation, you can choose a convenient slot anytime:',
        'https://kneeandbackpainrelief.com or call +91 90822 80274.'
      ],
      reference: `cancel_${leadId}_${Date.now()}`,
      apiKey
    });

    return {
      sent: cancelResult.ok,
      template: 'surabhi_v4_no_image',
      templateCategory: 'utility',
      recipient: cleanPhone,
      status: cancelResult.status,
      details: cancelResult.data
    };
  }

  // ---------------------------------------------------------------------------
  // 4. MANUAL FOLLOW-UP REMINDER (e.g. 2 months, 3 months, 4 months)
  // ---------------------------------------------------------------------------
  if (effectiveAction === 'send_followup' || effectiveStatus.includes('followup') || effectiveStatus.includes('follow-up')) {
    const rawInterval = (lead.followupInterval || lead.interval || '2 months').trim();
    const intervalText = rawInterval.toLowerCase().startsWith('after ') ? rawInterval : `after ${rawInterval}`;

    const followupResult = await sendAgentBandhuMessage({
      to: cleanPhone,
      templateName: 'surabhi_v4_no_image',
      variables: [
        patientName,
        'It is time to book your recommended follow-up consultation with Dr. Surabhi Vaidya at Charak Health Solutions.',
        `As advised during your consultation, a follow-up assessment ${intervalText} ensures your knee/back recovery and joint mobility remain on track.`,
        'To choose your preferred follow-up slot, tap here: https://kneeandbackpainrelief.com or call our clinic at +91 90822 80274.'
      ],
      reference: `folup_${leadId}_${Date.now()}`,
      apiKey
    });

    return {
      sent: followupResult.ok,
      template: 'surabhi_v4_no_image',
      templateCategory: 'utility',
      recipient: cleanPhone,
      interval: rawInterval,
      status: followupResult.status,
      details: followupResult.data
    };
  }

  return {
    sent: false,
    skipped: true,
    reason: `Status "${newStatus}" does not require an automated WhatsApp notification`
  };
}

/**
 * Dedicated Helper to Dispatch Manual Follow-Up Consultation Reminders
 */
export async function dispatchFollowupWhatsAppReminder({ lead, interval = '2 months', apiKey }) {
  return dispatchStatusWhatsAppNotification({
    lead: { ...lead, followupInterval: interval },
    action: 'send_followup',
    apiKey
  });
}
