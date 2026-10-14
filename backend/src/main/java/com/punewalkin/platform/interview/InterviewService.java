package com.punewalkin.platform.interview;

import com.punewalkin.platform.admin.ActivityLog;
import com.punewalkin.platform.admin.ActivityLogRepository;
import com.punewalkin.platform.application.Application;
import com.punewalkin.platform.application.ApplicationRepository;
import com.punewalkin.platform.application.ApplicationStatus;
import com.punewalkin.platform.candidate.CandidateProfile;
import com.punewalkin.platform.candidate.CandidateProfileRepository;
import com.punewalkin.platform.common.exception.BadRequestException;
import com.punewalkin.platform.common.exception.ResourceNotFoundException;
import com.punewalkin.platform.common.exception.UnauthorizedException;
import com.punewalkin.platform.company.Company;
import com.punewalkin.platform.company.CompanyRepository;
import com.punewalkin.platform.drive.WalkInDrive;
import com.punewalkin.platform.notification.NotificationService;
import com.punewalkin.platform.notification.NotificationType;
import com.punewalkin.platform.user.User;
import com.punewalkin.platform.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class InterviewService {

    private static final Logger log = LoggerFactory.getLogger(InterviewService.class);

    private final InterviewRepository interviewRepository;
    private final InterviewPassRepository interviewPassRepository;
    private final ApplicationRepository applicationRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;
    private final NotificationService notificationService;
    private final QrCodeService qrCodeService;
    private final EmailService emailService;

    public InterviewService(InterviewRepository interviewRepository,
                            InterviewPassRepository interviewPassRepository,
                            ApplicationRepository applicationRepository,
                            CandidateProfileRepository candidateProfileRepository,
                            CompanyRepository companyRepository,
                            UserRepository userRepository,
                            ActivityLogRepository activityLogRepository,
                            NotificationService notificationService,
                            QrCodeService qrCodeService,
                            EmailService emailService) {
        this.interviewRepository = interviewRepository;
        this.interviewPassRepository = interviewPassRepository;
        this.applicationRepository = applicationRepository;
        this.candidateProfileRepository = candidateProfileRepository;
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.activityLogRepository = activityLogRepository;
        this.notificationService = notificationService;
        this.qrCodeService = qrCodeService;
        this.emailService = emailService;
    }

    @Transactional
    public InterviewPassResponse scheduleOrConfirmInterview(InterviewRequest request, String currentUserId, boolean isAdmin) {
        Application application = applicationRepository.findById(request.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + request.getApplicationId()));

        Company company = application.getCompany();
        WalkInDrive drive = application.getDrive();
        CandidateProfile candidate = application.getCandidate();

        if (company == null || drive == null || candidate == null) {
            throw new BadRequestException("Application record is missing company, drive, or candidate linkage.");
        }

        // Authorization check
        if (!isAdmin) {
            if (company.getEmployer() == null || !company.getEmployer().getId().equals(currentUserId)) {
                throw new UnauthorizedException("You are not authorized to schedule interviews for this company's applications.");
            }
        }

        // Check for existing interview for this application to ensure idempotency
        Interview interview = interviewRepository.findFirstByApplicationIdAndStatusNot(
                application.getId(), InterviewStatus.CANCELLED).orElse(null);

        boolean isNew = false;
        if (interview == null) {
            interview = new Interview();
            interview.setId(UUID.randomUUID().toString());
            interview.setApplication(application);
            interview.setDrive(drive);
            interview.setCandidate(candidate);
            interview.setCompany(company);
            interview.setCreatedBy(currentUserId);
            interview.setCreatedAt(LocalDateTime.now());
            isNew = true;
        }

        interview.setScheduledAt(request.getScheduledAt());
        interview.setEndAt(request.getEndAt() != null ? request.getEndAt() : request.getScheduledAt().plusHours(1));
        interview.setVenueOrLocation(request.getVenueOrLocation() != null && !request.getVenueOrLocation().trim().isEmpty()
                ? request.getVenueOrLocation().trim()
                : drive.getVenueName() + ", " + drive.getVenueAddress());
        interview.setInterviewType(request.getInterviewType() != null ? request.getInterviewType() : "In-Person Walk-In");
        interview.setMeetingLink(request.getMeetingLink());
        interview.setInstructions(request.getInstructions() != null ? request.getInstructions() : drive.getCandidateInstructions());
        interview.setReportingInstructions(request.getReportingInstructions());
        interview.setStatus(InterviewStatus.SCHEDULED);
        interview = interviewRepository.save(interview);

        // Update application status to INTERVIEW_SCHEDULED
        application.setStatus(ApplicationStatus.INTERVIEW_SCHEDULED);
        applicationRepository.save(application);

        // Create or get unique InterviewPass
        InterviewPass pass = interviewPassRepository.findByInterviewId(interview.getId()).orElse(null);
        if (pass == null) {
            pass = new InterviewPass();
            pass.setId(UUID.randomUUID().toString());
            pass.setInterview(interview);
            pass.setApplication(application);
            pass.setCandidate(candidate);
            pass.setCompany(company);
            pass.setDrive(drive);

            // Generate unique, unguessable pass code
            String uniqueCode = "PASS-" + UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase();
            pass.setPassCode(uniqueCode);
            pass.setQrPayload("PUNE-WALKIN-PASS:" + uniqueCode);
            pass.setStatus(PassStatus.ACTIVE);
            pass.setCreatedAt(LocalDateTime.now());
        } else {
            pass.setStatus(PassStatus.ACTIVE);
        }
        pass = interviewPassRepository.save(pass);

        // Generate QR Code Base64
        String qrBase64 = qrCodeService.generateQrCodeBase64(pass.getQrPayload(), 240, 240);

        // Notify Candidate in-app
        String candidateUserId = candidate.getUser() != null ? candidate.getUser().getId() : null;
        if (candidateUserId != null) {
            notificationService.notifyUser(
                    candidateUserId,
                    "Interview Scheduled & Access Pass Ready",
                    "Your interview with " + company.getCompanyName() + " for " + drive.getTitle() +
                            " is scheduled for " + interview.getScheduledAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")) +
                            ". Access Pass: " + pass.getPassCode(),
                    NotificationType.INTERVIEW_SCHEDULED,
                    "INTERVIEW",
                    interview.getId(),
                    "/candidate/interviews"
            );
        }

        // Record audit activity
        recordActivity(currentUserId, isNew ? "INTERVIEW_SCHEDULED" : "INTERVIEW_RESCHEDULED",
                "INTERVIEW", interview.getId(),
                "Walk-In Interview " + (isNew ? "Scheduled" : "Updated"),
                "Interview confirmed for " + (candidate.getUser() != null ? candidate.getUser().getFullName() : "Candidate") +
                        " at " + company.getCompanyName() + ". Pass code: " + pass.getPassCode(),
                null, "SCHEDULED", null);

        // Dispatch Email Confirmation only if not already delivered to prevent duplicate emails
        if ("SENT".equalsIgnoreCase(interview.getEmailStatus())) {
            log.info("Interview confirmation email already sent at {} for interview ID: {}. Skipping duplicate dispatch.",
                    interview.getEmailSentAt(), interview.getId());
        } else {
            try {
                EmailService.EmailDeliveryResult emailResult = emailService.sendInterviewConfirmation(interview, pass, qrBase64);
                interview.setEmailStatus(emailResult.getStatus());
                if (emailResult.isSuccess()) {
                    interview.setEmailSentAt(LocalDateTime.now());
                    interview.setEmailError(null);
                } else {
                    interview.setEmailError(emailResult.getMessage());
                }
                interviewRepository.save(interview);
            } catch (Exception ex) {
                log.warn("Non-fatal email delivery attempt issue: {}", ex.getMessage());
                interview.setEmailStatus("FAILED");
                interview.setEmailError(ex.getMessage());
                interviewRepository.save(interview);
            }
        }

        return new InterviewPassResponse(pass, interview, qrBase64);
    }

    @Transactional(readOnly = true)
    public List<InterviewPassResponse> getInterviewsForCandidate(String candidateUserId) {
        CandidateProfile candidate = candidateProfileRepository.findByUserId(candidateUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found for user: " + candidateUserId));

        List<Interview> list = interviewRepository.findByCandidateId(candidate.getId());
        List<InterviewPassResponse> responses = new ArrayList<>();
        for (Interview interview : list) {
            InterviewPass pass = interviewPassRepository.findByInterviewId(interview.getId()).orElse(null);
            String qr = (pass != null) ? qrCodeService.generateQrCodeBase64(pass.getQrPayload(), 240, 240) : null;
            responses.add(new InterviewPassResponse(pass, interview, qr));
        }
        return responses;
    }

    @Transactional(readOnly = true)
    public List<InterviewPassResponse> getInterviewsForEmployer(String employerUserId) {
        Company company = companyRepository.findByEmployerId(employerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("No company linked to employer user: " + employerUserId));

        List<Interview> list = interviewRepository.findByCompanyId(company.getId());
        List<InterviewPassResponse> responses = new ArrayList<>();
        for (Interview interview : list) {
            InterviewPass pass = interviewPassRepository.findByInterviewId(interview.getId()).orElse(null);
            String qr = (pass != null) ? qrCodeService.generateQrCodeBase64(pass.getQrPayload(), 240, 240) : null;
            responses.add(new InterviewPassResponse(pass, interview, qr));
        }
        return responses;
    }

    @Transactional(readOnly = true)
    public InterviewPassResponse getPassByCode(String passCode) {
        InterviewPass pass = interviewPassRepository.findByPassCode(passCode)
                .orElseThrow(() -> new ResourceNotFoundException("Interview pass not found for code: " + passCode));

        String qr = qrCodeService.generateQrCodeBase64(pass.getQrPayload(), 240, 240);
        return new InterviewPassResponse(pass, pass.getInterview(), qr);
    }

    @Transactional(readOnly = true)
    public InterviewPassResponse getInterviewPass(String interviewId, String currentUserId, boolean isAdmin) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found: " + interviewId));

        // Check ownership
        if (!isAdmin) {
            boolean isCandidate = interview.getCandidate() != null &&
                    interview.getCandidate().getUser() != null &&
                    interview.getCandidate().getUser().getId().equals(currentUserId);
            boolean isEmployer = interview.getCompany() != null &&
                    interview.getCompany().getEmployer() != null &&
                    interview.getCompany().getEmployer().getId().equals(currentUserId);
            if (!isCandidate && !isEmployer) {
                throw new UnauthorizedException("You are not authorized to view this interview pass.");
            }
        }

        InterviewPass pass = interviewPassRepository.findByInterviewId(interviewId).orElse(null);
        String qr = (pass != null) ? qrCodeService.generateQrCodeBase64(pass.getQrPayload(), 240, 240) : null;
        return new InterviewPassResponse(pass, interview, qr);
    }

    @Transactional
    public PassVerificationResponse verifyAndAdmitPass(String passCode, String verifierUserId, boolean isAdmin) {
        InterviewPass pass = interviewPassRepository.findByPassCode(passCode)
                .orElseThrow(() -> new ResourceNotFoundException("Interview pass code not found: " + passCode));

        User verifier = userRepository.findById(verifierUserId).orElse(null);
        String verifierName = verifier != null ? verifier.getFullName() : "Authorized Evaluator";

        // Authorization check: Verifier must be admin or represent the company
        if (!isAdmin) {
            if (pass.getCompany() == null || pass.getCompany().getEmployer() == null ||
                    !pass.getCompany().getEmployer().getId().equals(verifierUserId)) {
                throw new UnauthorizedException("You are not authorized to verify or admit candidates for this company.");
            }
        }

        // Validate current pass status
        if (pass.getStatus() == PassStatus.USED) {
            return PassVerificationResponse.invalid(
                    "Access pass has already been admitted and scanned on " +
                            (pass.getUsedAt() != null ? pass.getUsedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")) : "earlier"),
                    passCode,
                    PassStatus.USED.name()
            );
        }

        if (pass.getStatus() == PassStatus.CANCELLED || pass.getStatus() == PassStatus.REVOKED || pass.getStatus() == PassStatus.EXPIRED) {
            return PassVerificationResponse.invalid(
                    "Access pass is not active. Current status: " + pass.getStatus(),
                    passCode,
                    pass.getStatus().name()
            );
        }

        // Admitting candidate
        pass.setStatus(PassStatus.USED);
        pass.setUsedAt(LocalDateTime.now());
        pass.setVerifiedBy(verifierUserId);
        pass.setVerifiedAt(LocalDateTime.now());
        interviewPassRepository.save(pass);

        // Update interview and application
        if (pass.getInterview() != null) {
            pass.getInterview().setStatus(InterviewStatus.COMPLETED);
            interviewRepository.save(pass.getInterview());
        }

        if (pass.getApplication() != null) {
            pass.getApplication().setStatus(ApplicationStatus.INTERVIEWED);
            applicationRepository.save(pass.getApplication());
        }

        // Record activity log
        recordActivity(verifierUserId, "PASS_VERIFIED", "PASS", pass.getId(),
                "Candidate Admitted via Access Pass",
                verifierName + " verified QR pass " + passCode + " and admitted candidate " +
                        (pass.getCandidate() != null && pass.getCandidate().getUser() != null ? pass.getCandidate().getUser().getFullName() : "Candidate"),
                "ACTIVE", "USED", null);

        return PassVerificationResponse.success(pass, verifierName);
    }

    @Transactional
    public EmailService.EmailDeliveryResult retryInterviewConfirmationEmail(String interviewId, String requestingUserId, boolean isAdmin) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found: " + interviewId));

        if (!isAdmin) {
            if (interview.getCompany() == null || interview.getCompany().getEmployer() == null
                    || !interview.getCompany().getEmployer().getId().equals(requestingUserId)) {
                throw new UnauthorizedException("Not authorized to retry email dispatch for this interview.");
            }
        }

        InterviewPass pass = interviewPassRepository.findByInterviewId(interview.getId()).orElse(null);
        String qrBase64 = (pass != null) ? qrCodeService.generateQrCodeBase64(pass.getQrPayload(), 240, 240) : null;

        EmailService.EmailDeliveryResult result = emailService.sendInterviewConfirmation(interview, pass, qrBase64);
        interview.setEmailStatus(result.getStatus());
        if (result.isSuccess()) {
            interview.setEmailSentAt(LocalDateTime.now());
            interview.setEmailError(null);
        } else {
            interview.setEmailError(result.getMessage());
        }
        interviewRepository.save(interview);
        return result;
    }

    private void recordActivity(String actorId, String action, String entityType, String entityId,
                                String title, String description, String prevStatus, String newStatus, String reason) {
        try {
            ActivityLog log = new ActivityLog();
            log.setActorUserId(actorId);
            log.setAction(action);
            log.setEntityType(entityType);
            log.setEntityId(entityId);
            log.setTitle(title);
            log.setDescription(description);
            log.setPreviousStatus(prevStatus);
            log.setNewStatus(newStatus);
            log.setReason(reason);
            activityLogRepository.save(log);
        } catch (Exception e) {
            log.warn("Failed to write activity log: {}", e.getMessage());
        }
    }
}
