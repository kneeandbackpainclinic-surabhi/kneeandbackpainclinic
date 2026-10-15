import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

def create_templates_doc():
    doc = docx.Document()

    # Set page margins
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # Color palette
    COLOR_PRIMARY = RGBColor(16, 78, 139)     # Deep Blue
    COLOR_SECONDARY = RGBColor(40, 116, 166)  # Medium Blue
    COLOR_TEXT = RGBColor(44, 62, 80)         # Charcoal
    COLOR_MUTED = RGBColor(100, 115, 130)     # Gray

    def style_run(run, font_name='Calibri', size_pt=11, color=COLOR_TEXT, bold=False, italic=False):
        run.font.name = font_name
        run.font.size = Pt(size_pt)
        run.font.color.rgb = color
        run.bold = bold
        run.italic = italic

    # Title
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(0)
    title_p.paragraph_format.space_after = Pt(3)
    r = title_p.add_run('Charak Health Solutions')
    style_run(r, 'Calibri', 22, COLOR_PRIMARY, bold=True)

    subtitle_p = doc.add_paragraph()
    subtitle_p.paragraph_format.space_before = Pt(0)
    subtitle_p.paragraph_format.space_after = Pt(14)
    r = subtitle_p.add_run('WhatsApp Message Templates Specification for Meta / BSP Setup')
    style_run(r, 'Calibri', 13, COLOR_SECONDARY, italic=True)

    # Submission notes
    note_p = doc.add_paragraph()
    note_p.paragraph_format.space_before = Pt(0)
    note_p.paragraph_format.space_after = Pt(4)
    r = note_p.add_run('Instructions for Business Solution Provider (BSP):')
    style_run(r, 'Calibri', 11, COLOR_PRIMARY, bold=True)

    notes = [
        ('Category Selection: ', 'Templates marked as UTILITY are for transactional, user-triggered events (confirmations, direct reminders). Templates marked as MARKETING are for invitations, educational nurture, and review requests.'),
        ('Language: ', 'Submit all templates in English (language code: en or en_US).'),
        ('Meta Health Compliance: ', 'Content is educational and general. All marketing templates strictly include \"Reply STOP to opt out.\".'),
        ('Sample Variables: ', 'Meta requires sample values for every variable placeholder ({{1}}, {{2}}, etc.). Use the exact sample values specified with each template below.')
    ]

    for prefix, body in notes:
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_before = Pt(1)
        p.paragraph_format.space_after = Pt(2)
        r_pre = p.add_run(prefix)
        style_run(r_pre, 'Calibri', 10, COLOR_TEXT, bold=True)
        r_body = p.add_run(body)
        style_run(r_body, 'Calibri', 10, COLOR_TEXT)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    templates = [
        {
            'num': '1',
            'title': 'Webinar Registration Confirmation',
            'name': 'webinar_registration_confirmation_v1',
            'category': 'UTILITY',
            'language': 'English (en)',
            'trigger': 'Immediately after a user registers for the live session',
            'body': 'Hello {{1}}, your registration request for the live Hindi session, \"Understanding Knee Pain: What to Consider Before Choosing a Treatment Path\", has been received.\n\nDate: {{2}}\nTime: {{3}}\nHosted by: Dr. Surabhi Vaidya, Charak Health Solutions\n\nThe joining link will be shared on WhatsApp before the session. Reply here if you need help.',
            'samples': [('{{1}}', 'Meena'), ('{{2}}', 'Sunday, 18 October 2026'), ('{{3}}', '11:00 AM IST')],
            'button_type': 'Quick Reply',
            'button_label': 'Join webinar',
            'button_value': 'N/A'
        },
        {
            'num': '2',
            'title': 'Webinar Joining Details',
            'name': 'webinar_joining_details_v1',
            'category': 'UTILITY',
            'language': 'English (en)',
            'trigger': 'Sent when the webinar room URL is generated',
            'body': 'Hello {{1}}, here are the joining details for your registered live Hindi session with Dr. Surabhi Vaidya.\n\nDate: {{2}}\nTime: {{3}}\n\nPlease join a few minutes early. This educational session does not replace an individual medical consultation.',
            'samples': [('{{1}}', 'Meena'), ('{{2}}', 'Sunday, 18 October 2026'), ('{{3}}', '11:00 AM IST'), ('{{4}}', 'charakhealth')],
            'button_type': 'Call to Action (Dynamic URL)',
            'button_label': 'Join webinar',
            'button_value': 'https://webinar.gg/{{1}} (Sample: charakhealth)'
        },
        {
            'num': '3',
            'title': 'Webinar Reminder – 24 Hours Prior',
            'name': 'webinar_reminder_1_day_v1',
            'category': 'UTILITY',
            'language': 'English (en)',
            'trigger': '24 hours before the registered live session',
            'body': 'Reminder for {{1}}: the live Hindi session with Dr. Surabhi Vaidya is tomorrow at {{2}}.\n\nTopic: Understanding Knee Pain: What to Consider Before Choosing a Treatment Path\n\nJoining link: {{3}}',
            'samples': [('{{1}}', 'Meena'), ('{{2}}', '11:00 AM IST'), ('{{3}}', 'https://kneeandbackpainclinic.vercel.app/webinar')],
            'button_type': 'Quick Reply',
            'button_label': 'Join webinar',
            'button_value': 'N/A'
        },
        {
            'num': '4',
            'title': 'Webinar Reminder – 1 Hour Prior',
            'name': 'webinar_reminder_1_hour_v1',
            'category': 'UTILITY',
            'language': 'English (en)',
            'trigger': '60 minutes before the session starts',
            'body': 'Hello {{1}}, the live Hindi session with Dr. Surabhi Vaidya begins in one hour.\n\nPlease join from a quiet place and keep a notebook nearby. The session is educational; personal recommendations require an individual assessment.',
            'samples': [('{{1}}', 'Meena'), ('{{2}}', 'charakhealth')],
            'button_type': 'Call to Action (Dynamic URL)',
            'button_label': 'Join webinar',
            'button_value': 'https://webinar.gg/{{1}} (Sample: charakhealth)'
        },
        {
            'num': '5',
            'title': 'Consultation Booking Confirmation',
            'name': 'consultation_booking_confirmation_v1',
            'category': 'UTILITY',
            'language': 'English (en)',
            'trigger': 'Immediately after a patient books an in-person clinic consultation',
            'body': 'Hello {{1}}, your consultation with Dr. Surabhi Vaidya is confirmed.\n\nDate: {{2}}\nTime: {{3}}\nLocation: Charak Health Solutions, Cura 304, Raymond TenX Habitat, Pokharan Road No. 2, Thane West.\n\nPlease arrive 10 minutes early. Bring relevant reports and a current list of medicines, if available.',
            'samples': [('{{1}}', 'Meena'), ('{{2}}', 'Tuesday, 20 October 2026'), ('{{3}}', '4:30 PM IST')],
            'button_type': 'Quick Reply',
            'button_label': 'Got it, thank you',
            'button_value': 'N/A'
        },
        {
            'num': '6',
            'title': 'Webinar Invitation (Opted-in Contacts)',
            'name': 'knee_pain_webinar_invitation_v1',
            'category': 'MARKETING',
            'language': 'English (en)',
            'trigger': 'Broadcast to opted-in leads (Day 0)',
            'body': 'Charak Health Solutions is hosting a live Hindi session with Dr. Surabhi Vaidya on understanding knee pain and the questions worth asking before choosing a treatment path.\n\nDate: {{1}}\nTime: {{2}}\n\nThe session covers common causes of knee discomfort, the role of assessment, movement and lifestyle, and when an in-person consultation may be useful.\n\nRegister here: {{3}}\n\nReply STOP to opt out.',
            'samples': [('{{1}}', 'Sunday, 18 October 2026'), ('{{2}}', '11:00 AM IST'), ('{{3}}', 'https://kneeandbackpainclinic.vercel.app')],
            'button_type': 'Call to Action (Static URL)',
            'button_label': 'Register Now',
            'button_value': 'https://kneeandbackpainclinic.vercel.app'
        },
        {
            'num': '7',
            'title': 'Educational Nurture – Assessment First',
            'name': 'knee_care_assessment_education_v1',
            'category': 'MARKETING',
            'language': 'English (en)',
            'trigger': 'Nurture sequence Day 2 for opted-in leads',
            'body': 'Knee pain can have different causes, so the same plan may not suit everyone. A useful assessment looks at symptoms, health history, daily movement, previous treatment and personal goals before options are discussed.\n\nDr. Surabhi Vaidya explains this assessment-first approach in her live Hindi session. Join the webinar: {{1}}\n\nThis is general education and not a diagnosis. Reply STOP to opt out.',
            'samples': [('{{1}}', 'https://kneeandbackpainclinic.vercel.app')],
            'button_type': 'None (Optional Quick Reply: Learn More)',
            'button_label': 'None',
            'button_value': 'N/A'
        },
        {
            'num': '8',
            'title': 'Educational Nurture – Movement & Exercise',
            'name': 'knee_care_movement_education_v1',
            'category': 'MARKETING',
            'language': 'English (en)',
            'trigger': 'Nurture sequence Day 5 for opted-in leads',
            'body': 'With many common knee conditions, appropriately selected movement and strengthening can support function. The right starting point depends on the person and the cause of the symptoms.\n\nJoin Dr. Surabhi\'s live Hindi webinar to understand what to consider before beginning an exercise routine: {{1}}\n\nSeek medical advice for severe swelling, injury, inability to bear weight or rapidly worsening symptoms. Reply STOP to opt out.',
            'samples': [('{{1}}', 'https://youtube.com/watch?v=sample')],
            'button_type': 'Call to Action (Static URL)',
            'button_label': 'Watch Video',
            'button_value': 'https://youtube.com/watch?v=sample'
        },
        {
            'num': '9',
            'title': 'Nurture – Patient Experience Story',
            'name': 'patient_experience_story_v1',
            'category': 'MARKETING',
            'language': 'English (en)',
            'trigger': 'Nurture sequence Day 8 for opted-in leads',
            'body': 'Every person\'s condition and response to care can be different. In this video, a Charak Health Solutions patient shares their own experience of seeking help for knee pain.\n\nTo discuss an individual starting point with Dr. Surabhi, book an appointment: {{1}}\n\nIndividual results vary. A consultation is needed to discuss suitable options. Reply STOP to opt out.',
            'samples': [('{{1}}', 'https://kneeandbackpainclinic.vercel.app/book')],
            'button_type': 'Call to Action (Static URL)',
            'button_label': 'Book Appointment',
            'button_value': 'https://kneeandbackpainclinic.vercel.app/book'
        },
        {
            'num': '10',
            'title': 'Nurture – Meet Dr. Surabhi Vaidya',
            'name': 'meet_dr_surabhi_v1',
            'category': 'MARKETING',
            'language': 'English (en)',
            'trigger': 'Nurture sequence for clinic introduction',
            'body': 'Meet Dr. Surabhi Vaidya, BAMS and MBA in Clinical Research, at Charak Health Solutions in Thane.\n\nHer consultation process begins with health history, current difficulties and assessment before suitable next steps are discussed.\n\nBook an appointment: {{1}}\n\nReply STOP to opt out.',
            'samples': [('{{1}}', 'https://kneeandbackpainclinic.vercel.app/book')],
            'button_type': 'Call to Action (Static URL)',
            'button_label': 'Book Appointment',
            'button_value': 'https://kneeandbackpainclinic.vercel.app/book'
        },
        {
            'num': '11',
            'title': 'Final Webinar Invitation Reminder',
            'name': 'webinar_invitation_closing_v1',
            'category': 'MARKETING',
            'language': 'English (en)',
            'trigger': 'Morning of webinar registration close',
            'body': 'Registrations for Dr. Surabhi Vaidya\'s next live Hindi session close at {{1}} today.\n\nThe session explains common knee-pain questions, how assessment guides treatment choices, and when to seek individual advice.\n\nRegister here: {{2}}\n\nReply STOP to opt out.',
            'samples': [('{{1}}', '8:00 PM IST'), ('{{2}}', 'https://kneeandbackpainclinic.vercel.app')],
            'button_type': 'Call to Action (Static URL)',
            'button_label': 'Register Now',
            'button_value': 'https://kneeandbackpainclinic.vercel.app'
        },
        {
            'num': '12',
            'title': 'Post-Experience Google Review Request',
            'name': 'post_experience_google_review_v1',
            'category': 'MARKETING',
            'language': 'English (en)',
            'trigger': '2 to 4 hours after completed consultation or clinic visit',
            'body': 'Hello {{1}}, thank you for spending time with Charak Health Solutions today.\n\nWe hope your experience was clear and helpful. If you would like to share feedback, please leave an honest Google review. Your review can help other people understand what to expect when they contact the clinic.\n\nPlease share only information that you are comfortable making public.\n\nReply STOP to opt out.',
            'samples': [('{{1}}', 'Meena')],
            'button_type': 'Call to Action (Static URL)',
            'button_label': 'Leave Google Review',
            'button_value': 'https://g.page/r/CWxrIXBs-xz7EAE/review'
        }
    ]

    for t in templates:
        # Heading
        h = doc.add_paragraph()
        h.paragraph_format.space_before = Pt(14)
        h.paragraph_format.space_after = Pt(5)
        r = h.add_run(f"{t['num']}. {t['title']}")
        style_run(r, 'Calibri', 13.5, COLOR_PRIMARY, bold=True)

        # Metadata Table
        table = doc.add_table(rows=4, cols=2)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.autofit = False

        col_widths = [Inches(1.8), Inches(4.8)]
        metadata_rows = [
            ('Template Name', t['name']),
            ('Category', t['category']),
            ('Language', t['language']),
            ('Trigger / Timing', t['trigger'])
        ]

        for idx, (label, val) in enumerate(metadata_rows):
            row = table.rows[idx]
            cell_lbl, cell_val = row.cells[0], row.cells[1]
            cell_lbl.width = col_widths[0]
            cell_val.width = col_widths[1]

            p_lbl = cell_lbl.paragraphs[0]
            p_lbl.paragraph_format.space_before = Pt(2)
            p_lbl.paragraph_format.space_after = Pt(2)
            r_lbl = p_lbl.add_run(label)
            style_run(r_lbl, 'Calibri', 9.5, COLOR_MUTED, bold=True)

            p_val = cell_val.paragraphs[0]
            p_val.paragraph_format.space_before = Pt(2)
            p_val.paragraph_format.space_after = Pt(2)
            r_val = p_val.add_run(val)
            is_name = (label == 'Template Name')
            is_cat = (label == 'Category')
            style_run(r_val, 'Consolas' if is_name else 'Calibri', 9.5, COLOR_PRIMARY if (is_name or is_cat) else COLOR_TEXT, bold=(is_name or is_cat))

            # Shading
            shd_lbl = parse_xml(r'<w:shd {} w:fill="F4F6F7"/>'.format(nsdecls('w')))
            cell_lbl._tc.get_or_add_tcPr().append(shd_lbl)
            shd_val = parse_xml(r'<w:shd {} w:fill="FAFAFA"/>'.format(nsdecls('w')))
            cell_val._tc.get_or_add_tcPr().append(shd_val)

        # Message Body Section
        p_body_lbl = doc.add_paragraph()
        p_body_lbl.paragraph_format.space_before = Pt(7)
        p_body_lbl.paragraph_format.space_after = Pt(2)
        r_body_lbl = p_body_lbl.add_run('Message Body:')
        style_run(r_body_lbl, 'Calibri', 10, COLOR_PRIMARY, bold=True)

        # Body Box
        body_table = doc.add_table(rows=1, cols=1)
        body_table.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = body_table.rows[0].cells[0]
        cell.width = Inches(6.6)
        shd = parse_xml(r'<w:shd {} w:fill="F8F9FA"/>'.format(nsdecls('w')))
        cell._tc.get_or_add_tcPr().append(shd)

        borders = parse_xml(r'''
            <w:tcBorders {} >
                <w:top w:val="none"/>
                <w:left w:val="single" w:sz="24" w:space="0" w:color="104E8B"/>
                <w:bottom w:val="none"/>
                <w:right w:val="none"/>
            </w:tcBorders>
        '''.format(nsdecls('w')))
        cell._tc.get_or_add_tcPr().append(borders)

        lines = t['body'].split('\n')
        for line_idx, line in enumerate(lines):
            if line_idx == 0:
                body_p = cell.paragraphs[0]
            else:
                body_p = cell.add_paragraph()
            body_p.paragraph_format.space_before = Pt(0)
            body_p.paragraph_format.space_after = Pt(3)
            body_p.paragraph_format.left_indent = Inches(0.12)
            body_p.paragraph_format.right_indent = Inches(0.12)
            r_b = body_p.add_run(line if line else ' ')
            style_run(r_b, 'Calibri', 10, COLOR_TEXT)

        # Sample values & Buttons
        p_extra = doc.add_paragraph()
        p_extra.paragraph_format.space_before = Pt(5)
        p_extra.paragraph_format.space_after = Pt(2)
        r_s_lbl = p_extra.add_run('Sample Values: ')
        style_run(r_s_lbl, 'Calibri', 9.5, COLOR_MUTED, bold=True)
        sample_str = ', '.join([f'{k} = "{v}"' for k, v in t['samples']])
        r_s_val = p_extra.add_run(sample_str)
        style_run(r_s_val, 'Consolas', 9, COLOR_TEXT)

        p_btn = doc.add_paragraph()
        p_btn.paragraph_format.space_before = Pt(2)
        p_btn.paragraph_format.space_after = Pt(12)
        r_btn_lbl = p_btn.add_run('Button: ')
        style_run(r_btn_lbl, 'Calibri', 9.5, COLOR_MUTED, bold=True)
        btn_str = f"{t['button_type']} — Label: \"{t['button_label']}\""
        if t['button_value'] != 'N/A':
            btn_str += f" | Action URL: {t['button_value']}"
        r_btn_val = p_btn.add_run(btn_str)
        style_run(r_btn_val, 'Calibri', 9.5, COLOR_TEXT)

    output_dir = 'marketing/shareable-documents'
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, 'whatsapp_message_templates.docx')
    doc.save(output_path)
    print(f"Successfully created: {output_path}")

if __name__ == '__main__':
    create_templates_doc()
