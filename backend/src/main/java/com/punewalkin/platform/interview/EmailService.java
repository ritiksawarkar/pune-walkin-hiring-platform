package com.punewalkin.platform.interview;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Base64;
import java.util.stream.Collectors;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final QrCodeService qrCodeService;

    @Value("${app.mail.enabled:${MAIL_ENABLED:false}}")
    private boolean mailEnabled;

    @Value("${app.mail.from:${MAIL_FROM:noreply@punewalkin.com}}")
    private String mailFrom;

    public EmailService(@Autowired(required = false) JavaMailSender mailSender) {
        this(mailSender, null);
    }

    @Autowired
    public EmailService(@Autowired(required = false) JavaMailSender mailSender,
            @Autowired(required = false) QrCodeService qrCodeService) {
        this.mailSender = mailSender;
        this.qrCodeService = qrCodeService != null ? qrCodeService : new QrCodeService();
    }

    public EmailDeliveryResult sendInterviewConfirmation(Interview interview, InterviewPass pass, String qrBase64) {
        String candidateEmail = null;
        String candidateName = "Candidate";

        if (interview.getCandidate() != null && interview.getCandidate().getUser() != null) {
            candidateEmail = interview.getCandidate().getUser().getEmail();
            if (interview.getCandidate().getUser().getFullName() != null) {
                candidateName = interview.getCandidate().getUser().getFullName();
            }
        } else if (interview.getApplication() != null && interview.getApplication().getCandidate() != null
                && interview.getApplication().getCandidate().getUser() != null) {
            candidateEmail = interview.getApplication().getCandidate().getUser().getEmail();
            if (interview.getApplication().getCandidate().getUser().getFullName() != null) {
                candidateName = interview.getApplication().getCandidate().getUser().getFullName();
            }
        }

        if (candidateEmail == null || candidateEmail.trim().isEmpty() || !candidateEmail.contains("@")) {
            return new EmailDeliveryResult(false, "FAILED", "Invalid recipient email address: " + candidateEmail);
        }

        String companyName = interview.getCompany() != null ? interview.getCompany().getCompanyName()
                : "Partner Employer";
        String driveTitle = interview.getDrive() != null ? interview.getDrive().getTitle() : "Walk-In Drive";

        String jobRole = "Software Engineer";
        if (interview.getDrive() != null && interview.getDrive().getJob() != null) {
            jobRole = interview.getDrive().getJob().getTitle();
        } else if (interview.getApplication() != null && interview.getApplication().getJob() != null) {
            jobRole = interview.getApplication().getJob().getTitle();
        } else if (interview.getDrive() != null && interview.getDrive().getTitle() != null) {
            jobRole = interview.getDrive().getTitle();
        }

        String scheduledTime = interview.getScheduledAt() != null
                ? interview.getScheduledAt().format(DateTimeFormatter.ofPattern("EEEE, MMMM dd, yyyy 'at' hh:mm a"))
                : "Scheduled Walk-In Window";
        String venue = interview.getVenueOrLocation() != null ? interview.getVenueOrLocation()
                : "Pune Walk-In Hub, Magarpatta City, Pune";
        String instructions = interview.getReportingInstructions() != null
                && !interview.getReportingInstructions().trim().isEmpty()
                        ? interview.getReportingInstructions().trim()
                        : (interview.getInstructions() != null ? interview.getInstructions()
                                : "Carry original photo ID and 2 printed resumes.");
        String tokenNumber = interview.getApplication() != null ? interview.getApplication().getTokenNumber()
                : "TKN-PENDING";
        String passCode = pass != null ? pass.getPassCode() : "N/A";

        String subject = "Interview Scheduled — " + jobRole + " at " + companyName + " (Token: " + tokenNumber
                + " | Pass: " + passCode + ")";

        byte[] qrBytes = null;
        if (qrBase64 != null && qrBase64.contains(",")) {
            try {
                String raw = qrBase64.substring(qrBase64.indexOf(',') + 1);
                qrBytes = Base64.getDecoder().decode(raw);
            } catch (Exception ignored) {
            }
        }
        if (qrBytes == null && pass != null && pass.getQrPayload() != null && qrCodeService != null) {
            try {
                qrBytes = qrCodeService.generateQrCodePng(pass.getQrPayload(), 200, 200);
            } catch (Exception ignored) {
            }
        }

        String passLink = "http://localhost:5173/candidate/interviews";
        String htmlContent = buildHtmlEmail(candidateName, companyName, driveTitle, jobRole, scheduledTime, venue,
                interview.getMeetingLink(), instructions, tokenNumber, passCode, qrBase64, passLink, null);
        String textContent = buildTextEmail(candidateName, companyName, driveTitle, jobRole, scheduledTime, venue,
                interview.getMeetingLink(), instructions, tokenNumber, passCode, passLink);

        if (!mailEnabled || mailSender == null) {
            log.info(
                    "[EMAIL-SIMULATION] Interview Confirmation Email ready for: {} | Subject: {} | Pass: {} | Role: {}",
                    candidateEmail, subject, passCode, jobRole);
            return new EmailDeliveryResult(false, "SIMULATED_LOCAL",
                    "SMTP delivery disabled in environment configuration (MAIL_ENABLED=false). Confirmation prepared successfully for "
                            + candidateEmail);
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(mailFrom);
            helper.setTo(candidateEmail);
            helper.setSubject(subject);
            helper.setText(textContent, htmlContent);

            if (qrBytes != null) {
                helper.addInline("passQrCode", new ByteArrayResource(qrBytes), "image/png");
            }

            mailSender.send(message);
            log.info("Interview confirmation email successfully delivered to: {}", candidateEmail);
            return new EmailDeliveryResult(true, "SENT", null);
        } catch (Exception e) {
            log.error("Failed to deliver interview confirmation email to {}: {}", candidateEmail, e.getMessage());
            return new EmailDeliveryResult(false, "FAILED", "SMTP dispatch error: " + e.getMessage());
        }
    }

    public EmailDeliveryResult sendDirectTestEmail(String recipientEmail, String customSubject, String customContent) {
        if (recipientEmail == null || recipientEmail.trim().isEmpty() || !recipientEmail.contains("@")) {
            return new EmailDeliveryResult(false, "FAILED", "Invalid recipient email address: " + recipientEmail);
        }

        String effectiveFrom = getMailFrom();
        String candidateEmail = recipientEmail.trim();

        // Derive user display name
        String candidateName = "Candidate";
        if (candidateEmail.toLowerCase().startsWith("ritik")) {
            candidateName = "Ritik Sawarkar";
        } else {
            int atIndex = candidateEmail.indexOf('@');
            if (atIndex > 0) {
                String prefix = candidateEmail.substring(0, atIndex).replace('.', ' ').replace('_', ' ');
                candidateName = Arrays.stream(prefix.split("\\s+"))
                        .filter(s -> !s.isEmpty())
                        .map(s -> Character.toUpperCase(s.charAt(0)) + s.substring(1).toLowerCase())
                        .collect(Collectors.joining(" "));
            }
        }

        String companyName = "TechSprint Innovations Pune Ltd.";
        String driveTitle = "Pune Mega IT Walk-In Hiring Drive 2026 (Magarpatta City)";
        String jobRole = "Full-Stack Software Engineer (Java & React)";
        String scheduledTime = "Friday, October 16, 2026 at 10:30 AM IST";
        String venue = "Pune Walk-In Hub, Tower 4, Level 3, Cybercity, Magarpatta City, Hadapsar, Pune - 411028";
        String instructions = "Please arrive 15 minutes before your time slot. Carry original Govt Photo ID (Aadhaar/PAN), 2 printed resumes, and present this digital QR pass at the security/reception desk.";
        String tokenNumber = "TKN-2026-8842";
        String passCode = "PASS-2026-INT9041";
        String passLink = "http://localhost:5173/candidate/interviews";

        String subject = (customSubject != null && !customSubject.trim().isEmpty())
                ? customSubject.trim()
                : "Interview Scheduled — " + jobRole + " at " + companyName + " (Token: " + tokenNumber + " | Pass: "
                        + passCode + ")";

        // QR Code Payload
        String qrPayload = "{\"type\":\"INTERVIEW_PASS\",\"passCode\":\"" + passCode + "\",\"token\":\"" + tokenNumber +
                "\",\"candidate\":\"" + candidateName + "\",\"email\":\"" + candidateEmail +
                "\",\"company\":\"" + companyName
                + "\",\"scheduledAt\":\"2026-10-16T10:30:00+05:30\",\"venue\":\"Magarpatta City Pune\"}";

        byte[] qrBytes = null;
        String qrBase64 = null;
        try {
            if (qrCodeService != null) {
                qrBytes = qrCodeService.generateQrCodePng(qrPayload, 200, 200);
                qrBase64 = "data:image/png;base64," + Base64.getEncoder().encodeToString(qrBytes);
            }
        } catch (Exception ex) {
            log.warn("Could not generate QR code for test email: {}", ex.getMessage());
        }

        String htmlContent = buildHtmlEmail(candidateName, companyName, driveTitle, jobRole, scheduledTime, venue,
                null, instructions, tokenNumber, passCode, qrBase64, passLink, customContent);
        String textContent = buildTextEmail(candidateName, companyName, driveTitle, jobRole, scheduledTime, venue,
                null, instructions, tokenNumber, passCode, passLink);

        if (!mailEnabled || mailSender == null) {
            log.info("[EMAIL-SIMULATION] Direct test email prepared for: {} | Subject: {}", candidateEmail, subject);
            return new EmailDeliveryResult(false, "SIMULATED_LOCAL",
                    "SMTP delivery is disabled (MAIL_ENABLED=false). Real email was not dispatched.");
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(effectiveFrom);
            helper.setTo(candidateEmail);
            helper.setSubject(subject);
            helper.setText(textContent, htmlContent);

            if (qrBytes != null) {
                helper.addInline("passQrCode", new ByteArrayResource(qrBytes), "image/png");
            }

            mailSender.send(message);
            log.info("Direct test interview confirmation email successfully delivered via SMTP to: {}", candidateEmail);
            return new EmailDeliveryResult(true, "SENT",
                    "Interview schedule & QR access pass email successfully delivered to " + candidateEmail);
        } catch (Exception e) {
            log.error("Failed to send direct test email to {}: {}", candidateEmail, e.getMessage());
            return new EmailDeliveryResult(false, "FAILED", "SMTP dispatch error: " + e.getMessage());
        }
    }

    private String buildHtmlEmail(String name, String company, String drive, String role, String time, String venue,
            String meetingLink, String instructions, String token, String passCode,
            String qrBase64, String passLink, String customNote) {
        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html><html><head><meta charset='UTF-8'>");
        sb.append("<style>");
        sb.append(
                "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }");
        sb.append(
                ".card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }");
        sb.append(".header { background: #1e3a8a; color: #ffffff; padding: 24px; text-align: center; }");
        sb.append(".content { padding: 24px; line-height: 1.6; font-size: 14px; }");
        sb.append(
                ".badge { display: inline-block; background: #dbeafe; color: #1e40af; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 4px; text-transform: uppercase; }");
        sb.append(
                ".status-badge { display: inline-block; background: #dcfce7; color: #166534; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 4px; text-transform: uppercase; }");
        sb.append(".details { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }");
        sb.append(".details td { padding: 9px 12px; border-bottom: 1px solid #f1f5f9; }");
        sb.append(".details td.label { font-weight: 600; color: #64748b; width: 34%; }");
        sb.append(
                ".qr-box { text-align: center; margin: 24px 0; padding: 20px; background: #f8fafc; border-radius: 10px; border: 2px dashed #94a3b8; }");
        sb.append(
                ".button { display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 10px 22px; border-radius: 6px; font-weight: 600; font-size: 13px; margin-top: 12px; }");
        sb.append(
                ".footer { background: #f1f5f9; padding: 18px; text-align: center; font-size: 12px; color: #64748b; }");
        sb.append("</style></head><body>");

        sb.append("<div class='card'>");
        sb.append("<div class='header'>");
        sb.append("<h2 style='margin:0 0 6px 0; font-size: 20px;'>Pune Walk-In Drive Platform</h2>");
        sb.append(
                "<p style='margin:0; opacity: 0.9; font-size: 13px;'>Official Walk-In Interview Confirmation &amp; Digital Access Pass</p>");
        sb.append("</div>");

        sb.append("<div class='content'>");
        sb.append(
                "<p style='margin-top:0;'><span class='status-badge'>✓ Interview Scheduled &amp; Confirmed</span></p>");
        sb.append("<p>Dear <strong>").append(escapeHtml(name)).append("</strong>,</p>");
        sb.append("<p>Your walk-in interview for the role of <strong>").append(escapeHtml(role))
                .append("</strong> with <strong>")
                .append(escapeHtml(company)).append("</strong> (Drive: <em>").append(escapeHtml(drive))
                .append("</em>) has been officially confirmed.</p>");

        if (customNote != null && !customNote.trim().isEmpty()) {
            sb.append(
                    "<div style='background:#f0f9ff; border-left:4px solid #0284c7; padding:12px; margin:16px 0; border-radius:4px;'>");
            sb.append("<strong style='color:#0369a1;'>Candidate Notice:</strong><br/>").append(escapeHtml(customNote));
            sb.append("</div>");
        }

        sb.append("<table class='details'>");
        sb.append("<tr><td class='label'>Walk-In Token</td><td><span class='badge'>").append(escapeHtml(token))
                .append("</span></td></tr>");
        sb.append(
                "<tr><td class='label'>Pass ID / Candidate ID</td><td><code style='background:#f1f5f9; padding:4px 8px; border-radius:4px; font-size:13px; font-weight:700; color:#0f172a;'>")
                .append(escapeHtml(passCode)).append("</code></td></tr>");
        sb.append("<tr><td class='label'>Company</td><td><strong>").append(escapeHtml(company))
                .append("</strong></td></tr>");
        sb.append("<tr><td class='label'>Job Role</td><td><strong>").append(escapeHtml(role))
                .append("</strong></td></tr>");
        sb.append("<tr><td class='label'>Interview Time</td><td><strong>").append(escapeHtml(time))
                .append("</strong></td></tr>");
        sb.append("<tr><td class='label'>Venue Address</td><td>").append(escapeHtml(venue)).append("</td></tr>");
        if (meetingLink != null && !meetingLink.trim().isEmpty()) {
            sb.append("<tr><td class='label'>Virtual Link</td><td><a href='").append(escapeHtml(meetingLink))
                    .append("'>").append(escapeHtml(meetingLink)).append("</a></td></tr>");
        }
        sb.append("<tr><td class='label'>Reporting Notes</td><td>").append(escapeHtml(instructions))
                .append("</td></tr>");
        sb.append("</table>");

        sb.append("<div class='qr-box'>");
        sb.append(
                "<div style='font-size:13px; font-weight:700; color:#1e3a8a; letter-spacing:0.5px;'>DIGITAL WALK-IN ENTRY PASS QR CODE</div>");
        sb.append("<div style='margin-top:4px; font-size:12px; color:#64748b;'>Token: <strong>")
                .append(escapeHtml(token))
                .append("</strong> &nbsp;|&nbsp; Pass ID: <strong>").append(escapeHtml(passCode))
                .append("</strong></div>");
        sb.append("<div style='margin:16px 0;'>");
        sb.append(
                "<img src='cid:passQrCode' alt='Entry Pass QR Code' width='180' height='180' style='display:inline-block; border-radius:8px; border:2px solid #e2e8f0; background:#ffffff; padding:8px;' />");
        sb.append("</div>");
        sb.append(
                "<p style='margin:4px 0 0 0; font-size:12px; color:#475569;'>Scan this QR Code at the registration desk for instant entry validation.</p>");
        if (passLink != null) {
            sb.append("<p style='margin:14px 0 0 0;'><a href='").append(escapeHtml(passLink))
                    .append("' class='button'>View &amp; Print Access Pass</a></p>");
        }
        sb.append("</div>");

        sb.append(
                "<p style='font-size: 12px; color: #64748b;'>Please present this pass on your phone or bring a printed copy along with your government photo ID and resume.</p>");
        sb.append("</div>");

        sb.append("<div class='footer'>");
        sb.append(
                "Pune Walk-In Drive &amp; Hiring Management Platform • Hinjawadi / Magarpatta / Kharadi / SPPU Campus<br/>");
        sb.append("This is an automated notification. Replies to this email are not monitored.");
        sb.append("</div>");
        sb.append("</div></body></html>");

        return sb.toString();
    }

    private String buildTextEmail(String name, String company, String drive, String role, String time, String venue,
            String meetingLink, String instructions, String token, String passCode, String passLink) {
        StringBuilder sb = new StringBuilder();
        sb.append("PUNE WALK-IN HIRING PLATFORM — INTERVIEW CONFIRMATION & ACCESS PASS\n\n");
        sb.append("Dear ").append(name).append(",\n\n");
        sb.append("Your walk-in interview for ").append(role).append(" at ").append(company)
                .append(" (Drive: ").append(drive).append(") has been scheduled and confirmed.\n\n");
        sb.append("INTERVIEW DETAILS:\n");
        sb.append("- Status: CONFIRMED & SCHEDULED\n");
        sb.append("- Walk-In Token: ").append(token).append("\n");
        sb.append("- Pass / Candidate ID: ").append(passCode).append("\n");
        sb.append("- Company: ").append(company).append("\n");
        sb.append("- Job Role: ").append(role).append("\n");
        sb.append("- Scheduled Time: ").append(time).append("\n");
        sb.append("- Venue Address: ").append(venue).append("\n");
        if (meetingLink != null && !meetingLink.trim().isEmpty()) {
            sb.append("- Virtual Link: ").append(meetingLink).append("\n");
        }
        sb.append("- Reporting Notes: ").append(instructions).append("\n");
        if (passLink != null) {
            sb.append("- View Pass Online: ").append(passLink).append("\n");
        }
        sb.append("\nPlease present your QR code pass and original photo ID when arriving at the venue.\n\n");
        sb.append("Pune Walk-In Drive Platform\n");
        return sb.toString();
    }

    public String getMailFrom() {
        if (mailFrom == null || !mailFrom.contains("@")) {
            return "noreply@punewalkin.com";
        }
        return mailFrom;
    }

    public boolean isMailEnabled() {
        return mailEnabled;
    }

    private String escapeHtml(String text) {
        if (text == null)
            return "";
        return text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }

    public static class EmailDeliveryResult {
        private final boolean success;
        private final String status;
        private final String message;

        public EmailDeliveryResult(boolean success, String status, String message) {
            this.success = success;
            this.status = status;
            this.message = message;
        }

        public boolean isSuccess() {
            return success;
        }

        public String getStatus() {
            return status;
        }

        public String getMessage() {
            return message;
        }
    }
}
