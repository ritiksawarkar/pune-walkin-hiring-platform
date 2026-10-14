package com.punewalkin.platform.interview;

import com.punewalkin.platform.application.Application;
import com.punewalkin.platform.candidate.CandidateProfile;
import com.punewalkin.platform.company.Company;
import com.punewalkin.platform.drive.WalkInDrive;
import com.punewalkin.platform.job.Job;
import com.punewalkin.platform.user.User;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class EmailServiceTest {

    private JavaMailSender mockMailSender;
    private EmailService emailService;

    @BeforeEach
    void setUp() {
        mockMailSender = mock(JavaMailSender.class);
        MimeMessage mimeMessage = new MimeMessage(Session.getInstance(new Properties()));
        when(mockMailSender.createMimeMessage()).thenReturn(mimeMessage);

        emailService = new EmailService(mockMailSender);
        ReflectionTestUtils.setField(emailService, "mailFrom", "noreply@punewalkin.com");
    }

    private Interview createSampleInterview() {
        User user = new User();
        user.setId("user-cand-01");
        user.setEmail("amit.deshmukh@example.com");
        user.setFullName("Amit Deshmukh");

        CandidateProfile candidate = new CandidateProfile();
        candidate.setId("cand-101");
        candidate.setUser(user);

        Company company = new Company();
        company.setId("comp-001");
        company.setCompanyName("TechSprint Innovations Pune");

        Job job = new Job();
        job.setId("job-001");
        job.setTitle("Junior Full Stack Engineer");

        WalkInDrive drive = new WalkInDrive();
        drive.setId("drive-001");
        drive.setTitle("Hinjawadi Weekend Walk-In Hiring Drive");
        drive.setJob(job);
        drive.setCompany(company);

        Application application = new Application();
        application.setId("app-001");
        application.setTokenNumber("TS-W26-101");
        application.setCandidate(candidate);
        application.setDrive(drive);
        application.setJob(job);
        application.setCompany(company);

        Interview interview = new Interview();
        interview.setId("int-001");
        interview.setApplication(application);
        interview.setCandidate(candidate);
        interview.setCompany(company);
        interview.setDrive(drive);
        interview.setScheduledAt(LocalDateTime.of(2026, 10, 24, 10, 30));
        interview.setVenueOrLocation("TechSprint Corporate Auditorium, Phase 1, Hinjawadi, Pune - 411057");
        interview.setMeetingLink("https://meet.google.com/pune-walkin-demo");
        interview.setReportingInstructions("Report at Reception Desk with Government Photo ID (Aadhaar/PAN) and 2 printed resumes.");
        interview.setStatus(InterviewStatus.SCHEDULED);

        return interview;
    }

    private InterviewPass createSamplePass(Interview interview) {
        InterviewPass pass = new InterviewPass();
        pass.setId("pass-001");
        pass.setInterview(interview);
        pass.setPassCode("PASS-2026-INT001");
        pass.setQrPayload("PUNE-WALKIN-PASS:PASS-2026-INT001");
        pass.setStatus(PassStatus.ACTIVE);
        return pass;
    }

    @Test
    @DisplayName("Email simulation when MAIL_ENABLED=false does not send email and returns SIMULATED_LOCAL")
    void testEmailSimulationWhenMailDisabled() {
        ReflectionTestUtils.setField(emailService, "mailEnabled", false);

        Interview interview = createSampleInterview();
        InterviewPass pass = createSamplePass(interview);
        String qrBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA";

        EmailService.EmailDeliveryResult result = emailService.sendInterviewConfirmation(interview, pass, qrBase64);

        assertNotNull(result);
        assertFalse(result.isSuccess(), "Simulated email should report success=false to indicate SMTP was bypassed");
        assertEquals("SIMULATED_LOCAL", result.getStatus());
        assertTrue(result.getMessage().contains("SMTP delivery disabled"));
        verify(mockMailSender, never()).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("Email validation rejects null or invalid candidate email safely")
    void testEmailValidationFailsOnInvalidEmail() {
        ReflectionTestUtils.setField(emailService, "mailEnabled", true);

        Interview interview = createSampleInterview();
        interview.getCandidate().getUser().setEmail("invalid-email-address");

        InterviewPass pass = createSamplePass(interview);

        EmailService.EmailDeliveryResult result = emailService.sendInterviewConfirmation(interview, pass, null);

        assertNotNull(result);
        assertFalse(result.isSuccess());
        assertEquals("FAILED", result.getStatus());
        assertTrue(result.getMessage().contains("Invalid recipient email"));
        verify(mockMailSender, never()).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("Email dispatch succeeds via JavaMailSender when MAIL_ENABLED=true")
    void testEmailDispatchSuccessWhenMailEnabled() throws Exception {
        ReflectionTestUtils.setField(emailService, "mailEnabled", true);

        Interview interview = createSampleInterview();
        InterviewPass pass = createSamplePass(interview);
        String qrBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA";

        EmailService.EmailDeliveryResult result = emailService.sendInterviewConfirmation(interview, pass, qrBase64);

        assertNotNull(result);
        assertTrue(result.isSuccess(), "Email delivery should report success=true when SMTP sends");
        assertEquals("SENT", result.getStatus());
        assertNull(result.getMessage());

        ArgumentCaptor<MimeMessage> captor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mockMailSender, times(1)).send(captor.capture());

        MimeMessage sentMessage = captor.getValue();
        assertNotNull(sentMessage);
        assertEquals("Interview Confirmed — Junior Full Stack Engineer at TechSprint Innovations Pune (Pass: PASS-2026-INT001)",
                sentMessage.getSubject());
    }

    @Test
    @DisplayName("SMTP exceptions are handled safely without propagating or leaking credentials")
    void testEmailErrorHandlingWhenSmtpThrows() {
        ReflectionTestUtils.setField(emailService, "mailEnabled", true);
        doThrow(new MailSendException("SMTP connection timed out to smtp.gmail.com:587"))
                .when(mockMailSender).send(any(MimeMessage.class));

        Interview interview = createSampleInterview();
        InterviewPass pass = createSamplePass(interview);

        EmailService.EmailDeliveryResult result = emailService.sendInterviewConfirmation(interview, pass, "data:image/png;base64,sample");

        assertNotNull(result);
        assertFalse(result.isSuccess());
        assertEquals("FAILED", result.getStatus());
        assertTrue(result.getMessage().contains("SMTP dispatch error"));
        assertTrue(result.getMessage().contains("timed out"));
    }
}
