package com.punewalkin.platform.admin;

import com.punewalkin.platform.application.ApplicationRepository;
import com.punewalkin.platform.application.ApplicationStatus;
import com.punewalkin.platform.candidate.CandidateProfile;
import com.punewalkin.platform.candidate.CandidateProfileRepository;
import com.punewalkin.platform.common.dto.ApiResponse;
import com.punewalkin.platform.common.exception.BadRequestException;
import com.punewalkin.platform.common.exception.ResourceNotFoundException;
import com.punewalkin.platform.company.Company;
import com.punewalkin.platform.company.CompanyRepository;
import com.punewalkin.platform.company.CompanyVerificationStatus;
import com.punewalkin.platform.drive.*;
import com.punewalkin.platform.job.JobRepository;
import com.punewalkin.platform.job.JobStatus;
import com.punewalkin.platform.notification.NotificationService;
import com.punewalkin.platform.notification.NotificationType;
import com.punewalkin.platform.security.UserPrincipal;
import com.punewalkin.platform.user.AccountStatus;
import com.punewalkin.platform.user.Role;
import com.punewalkin.platform.user.User;
import com.punewalkin.platform.user.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import com.punewalkin.platform.interview.EmailService;
import com.punewalkin.platform.interview.MailConfig;
import com.punewalkin.platform.admin.dto.TestEmailRequest;
import com.punewalkin.platform.common.exception.BadRequestException;
import jakarta.validation.Valid;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Admin dashboard and platform management")
public class AdminController {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final DriveRepository driveRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final ActivityLogRepository activityLogRepository;
    private final NotificationService notificationService;
    private final DriveService driveService;
    private final EmailService emailService;
    private final MailConfig mailConfig;
    private final ConcurrentHashMap<String, Long> testEmailRateLimiter = new ConcurrentHashMap<>();

    public AdminController(UserRepository userRepository,
                           CompanyRepository companyRepository,
                           DriveRepository driveRepository,
                           JobRepository jobRepository,
                           ApplicationRepository applicationRepository,
                           CandidateProfileRepository candidateProfileRepository,
                           ActivityLogRepository activityLogRepository,
                           NotificationService notificationService,
                           DriveService driveService,
                           EmailService emailService,
                           @org.springframework.beans.factory.annotation.Autowired(required = false) MailConfig mailConfig) {
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.driveRepository = driveRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.candidateProfileRepository = candidateProfileRepository;
        this.activityLogRepository = activityLogRepository;
        this.notificationService = notificationService;
        this.driveService = driveService;
        this.emailService = emailService;
        this.mailConfig = mailConfig;
    }

    @GetMapping("/stats")
    @Operation(summary = "Get platform-wide statistics (Admin)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        Map<String, Object> stats = new HashMap<>();

        // Users & Candidates
        stats.put("totalUsers", userRepository.count());
        stats.put("totalCandidates", candidateProfileRepository.count());
        long pendingCandidates = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.CANDIDATE && u.getAccountStatus().isPending())
                .count();
        long approvedCandidates = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.CANDIDATE && u.getAccountStatus().isApproved())
                .count();
        long rejectedCandidates = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.CANDIDATE && u.getAccountStatus().isRejected())
                .count();

        stats.put("pendingCandidates", pendingCandidates);
        stats.put("approvedCandidates", approvedCandidates);
        stats.put("rejectedCandidates", rejectedCandidates);

        // Companies & Employers
        stats.put("totalCompanies", companyRepository.count());
        stats.put("pendingCompanies", companyRepository.countByVerificationStatus(CompanyVerificationStatus.PENDING));
        stats.put("verifiedCompanies", companyRepository.countByVerificationStatus(CompanyVerificationStatus.VERIFIED));
        stats.put("rejectedCompanies", companyRepository.countByVerificationStatus(CompanyVerificationStatus.REJECTED));

        // Drives (Total, Pending, Approved, On-Campus, Off-Campus)
        stats.put("totalDrives", driveRepository.count());
        stats.put("pendingDrives", driveRepository.countByApprovalStatus(DriveApprovalStatus.PENDING));
        stats.put("approvedDrives", driveRepository.countByApprovalStatus(DriveApprovalStatus.APPROVED));
        stats.put("publishedDrives", driveRepository.countByDriveStatus(DriveStatus.PUBLISHED));
        stats.put("onCampusDrives", driveRepository.countByCampusType(CampusType.ON_CAMPUS));
        stats.put("offCampusDrives", driveRepository.countByCampusType(CampusType.OFF_CAMPUS));

        // Jobs
        stats.put("totalJobs", jobRepository.count());
        stats.put("activeJobs", jobRepository.countByStatus(JobStatus.ACTIVE));

        // Applications
        stats.put("totalApplications", applicationRepository.count());
        stats.put("registeredApplications", applicationRepository.countByStatus(ApplicationStatus.REGISTERED));
        stats.put("selectedApplications", applicationRepository.countByStatus(ApplicationStatus.SELECTED));

        return ResponseEntity.ok(ApiResponse.success("Stats fetched", stats));
    }

    @GetMapping("/candidates")
    @Transactional(readOnly = true)
    @Operation(summary = "List candidate registration requests with filtering and search")
    public ResponseEntity<ApiResponse<Page<CandidateAdminResponse>>> listCandidates(
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        List<User> candidateUsers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.CANDIDATE)
                .toList();

        // Filter by status
        if (status != null && !status.equalsIgnoreCase("ALL")) {
            candidateUsers = candidateUsers.stream()
                    .filter(u -> {
                        if (status.equalsIgnoreCase("PENDING")) return u.getAccountStatus().isPending();
                        if (status.equalsIgnoreCase("APPROVED")) return u.getAccountStatus().isApproved();
                        if (status.equalsIgnoreCase("REJECTED")) return u.getAccountStatus().isRejected();
                        if (status.equalsIgnoreCase("SUSPENDED")) return u.getAccountStatus().isSuspended();
                        return u.getAccountStatus().name().equalsIgnoreCase(status);
                    })
                    .toList();
        }

        // Search by name or email
        if (search != null && !search.trim().isEmpty()) {
            String q = search.trim().toLowerCase();
            candidateUsers = candidateUsers.stream()
                    .filter(u -> u.getFullName().toLowerCase().contains(q) || u.getEmail().toLowerCase().contains(q))
                    .toList();
        }

        // Sort descending by created date
        candidateUsers = new ArrayList<>(candidateUsers);
        candidateUsers.sort(Comparator.comparing(User::getCreatedAt).reversed());

        // Map to CandidateAdminResponse
        List<CandidateAdminResponse> responseList = candidateUsers.stream()
                .map(u -> {
                    CandidateProfile profile = candidateProfileRepository.findByUserId(u.getId()).orElse(null);
                    return new CandidateAdminResponse(u, profile);
                })
                .toList();

        int start = Math.min(page * size, responseList.size());
        int end = Math.min((page + 1) * size, responseList.size());
        Page<CandidateAdminResponse> pagedResult = new PageImpl<>(
                responseList.subList(start, end),
                PageRequest.of(page, size),
                responseList.size()
        );

        return ResponseEntity.ok(ApiResponse.success("Candidates fetched", pagedResult));
    }

    @PostMapping("/candidates/{userId}/approve")
    @Transactional
    @Operation(summary = "Approve candidate registration")
    public ResponseEntity<ApiResponse<CandidateAdminResponse>> approveCandidate(
            @PathVariable String userId,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found: " + userId));

        if (user.getRole() != Role.CANDIDATE) {
            throw new BadRequestException("Target account is not a candidate.");
        }

        String prevStatus = user.getAccountStatus().name();
        user.setAccountStatus(AccountStatus.APPROVED);
        user.setApprovedBy(adminPrincipal.getId());
        user.setApprovedAt(LocalDateTime.now());
        user.setRejectionReason(null);
        userRepository.save(user);

        // Candidate notification
        notificationService.notifyUser(
                user.getId(),
                "Registration Approved!",
                "Congratulations! Your candidate registration has been approved. You can now log in and attend walk-in drives.",
                NotificationType.SUCCESS,
                "USER",
                user.getId(),
                "/login"
        );

        // Audit Log
        recordActivity(adminPrincipal.getId(), "CANDIDATE_APPROVED", "USER", user.getId(),
                "Candidate Registration Approved",
                "Admin " + adminPrincipal.getFullName() + " approved candidate " + user.getFullName() + " (" + user.getEmail() + ")",
                prevStatus, "APPROVED", null);

        CandidateProfile profile = candidateProfileRepository.findByUserId(user.getId()).orElse(null);
        return ResponseEntity.ok(ApiResponse.success("Candidate registration approved successfully",
                new CandidateAdminResponse(user, profile)));
    }

    @PostMapping("/candidates/{userId}/reject")
    @Transactional
    @Operation(summary = "Reject candidate registration with reason")
    public ResponseEntity<ApiResponse<CandidateAdminResponse>> rejectCandidate(
            @PathVariable String userId,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found: " + userId));

        if (user.getRole() != Role.CANDIDATE) {
            throw new BadRequestException("Target account is not a candidate.");
        }

        String reason = body != null && body.get("reason") != null && !body.get("reason").trim().isEmpty()
                ? body.get("reason").trim()
                : "Candidate profile details do not meet platform verification guidelines.";

        String prevStatus = user.getAccountStatus().name();
        user.setAccountStatus(AccountStatus.REJECTED);
        user.setRejectionReason(reason);
        user.setRejectedAt(LocalDateTime.now());
        userRepository.save(user);

        // Candidate notification
        notificationService.notifyUser(
                user.getId(),
                "Registration Status Update",
                "Your registration request was not approved: " + reason,
                NotificationType.WARNING,
                "USER",
                user.getId(),
                "/login"
        );

        // Audit Log
        recordActivity(adminPrincipal.getId(), "CANDIDATE_REJECTED", "USER", user.getId(),
                "Candidate Registration Rejected",
                "Admin " + adminPrincipal.getFullName() + " rejected candidate " + user.getFullName() + ". Reason: " + reason,
                prevStatus, "REJECTED", reason);

        CandidateProfile profile = candidateProfileRepository.findByUserId(user.getId()).orElse(null);
        return ResponseEntity.ok(ApiResponse.success("Candidate registration rejected",
                new CandidateAdminResponse(user, profile)));
    }

    @GetMapping("/candidates/{userId}")
    @Transactional(readOnly = true)
    @Operation(summary = "Get candidate registration details by user ID (Admin)")
    public ResponseEntity<ApiResponse<CandidateAdminResponse>> getCandidateById(@PathVariable String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found: " + userId));
        if (user.getRole() != Role.CANDIDATE) {
            throw new BadRequestException("Target account is not a candidate.");
        }
        CandidateProfile profile = candidateProfileRepository.findByUserId(user.getId()).orElse(null);
        return ResponseEntity.ok(ApiResponse.success("Candidate details fetched", new CandidateAdminResponse(user, profile)));
    }

    @PostMapping("/companies/{companyId}/verify")
    @Transactional
    @Operation(summary = "Approve employer company registration")
    public ResponseEntity<ApiResponse<Company>> approveCompany(
            @PathVariable String companyId,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + companyId));

        company.setVerificationStatus(CompanyVerificationStatus.VERIFIED);
        company.setVerifiedBy(adminPrincipal.getId());
        company.setVerifiedAt(LocalDateTime.now());
        company.setRejectionReason(null);
        companyRepository.save(company);

        // Update employer user account status to APPROVED
        User employer = company.getEmployer();
        if (employer != null) {
            employer.setAccountStatus(AccountStatus.APPROVED);
            employer.setApprovedBy(adminPrincipal.getId());
            employer.setApprovedAt(LocalDateTime.now());
            employer.setRejectionReason(null);
            userRepository.save(employer);

            notificationService.notifyUser(
                    employer.getId(),
                    "Company Verification Approved",
                    "Your corporate registration for " + company.getCompanyName() + " has been approved! You can now publish jobs and walk-in drives.",
                    NotificationType.SUCCESS,
                    "COMPANY",
                    company.getId(),
                    "/employer/dashboard"
            );
        }

        // Audit Log
        recordActivity(adminPrincipal.getId(), "COMPANY_APPROVED", "COMPANY", company.getId(),
                "Company Registration Approved",
                "Admin " + adminPrincipal.getFullName() + " approved company " + company.getCompanyName(),
                "PENDING", "VERIFIED", null);

        return ResponseEntity.ok(ApiResponse.success("Company verified and approved successfully", company));
    }

    @PostMapping("/companies/{companyId}/reject")
    @Transactional
    @Operation(summary = "Reject employer company registration with reason")
    public ResponseEntity<ApiResponse<Company>> rejectCompany(
            @PathVariable String companyId,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + companyId));

        String reason = body != null && body.get("reason") != null && !body.get("reason").trim().isEmpty()
                ? body.get("reason").trim()
                : "Submitted corporate credentials did not pass verification.";

        company.setVerificationStatus(CompanyVerificationStatus.REJECTED);
        company.setRejectionReason(reason);
        companyRepository.save(company);

        // Update employer user account status to REJECTED
        User employer = company.getEmployer();
        if (employer != null) {
            employer.setAccountStatus(AccountStatus.REJECTED);
            employer.setRejectionReason(reason);
            employer.setRejectedAt(LocalDateTime.now());
            userRepository.save(employer);

            notificationService.notifyUser(
                    employer.getId(),
                    "Company Verification Update",
                    "Your corporate registration for " + company.getCompanyName() + " was not approved: " + reason,
                    NotificationType.WARNING,
                    "COMPANY",
                    company.getId(),
                    "/login"
            );
        }

        // Audit Log
        recordActivity(adminPrincipal.getId(), "COMPANY_REJECTED", "COMPANY", company.getId(),
                "Company Registration Rejected",
                "Admin " + adminPrincipal.getFullName() + " rejected company " + company.getCompanyName() + ". Reason: " + reason,
                "PENDING", "REJECTED", reason);

        return ResponseEntity.ok(ApiResponse.success("Company verification rejected", company));
    }

    @GetMapping("/drives")
    @Operation(summary = "List drives for admin review with optional campusType and status filters")
    public ResponseEntity<ApiResponse<Page<WalkInDrive>>> listDrives(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) CampusType campusType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<WalkInDrive> result;

        if (status != null && !status.equalsIgnoreCase("ALL")) {
            DriveApprovalStatus appStatus = DriveApprovalStatus.valueOf(status.toUpperCase());
            result = driveRepository.findByApprovalStatus(appStatus, pageable);
        } else if (campusType != null) {
            result = driveRepository.findByCampusType(campusType, pageable);
        } else {
            result = driveRepository.findAll(pageable);
        }

        return ResponseEntity.ok(ApiResponse.success("Drives fetched", result));
    }

    @PostMapping("/drives/{driveId}/approve")
    @Transactional
    @Operation(summary = "Approve submitted walk-in drive")
    public ResponseEntity<ApiResponse<WalkInDrive>> approveDrive(
            @PathVariable String driveId,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {

        String feedback = body != null ? body.get("feedback") : null;
        WalkInDrive drive = driveService.approveDrive(driveId, true, feedback, adminPrincipal.getId());

        if (drive.getCreatedBy() != null) {
            notificationService.notifyUser(
                    drive.getCreatedBy().getId(),
                    "Walk-In Drive Approved!",
                    "Your drive '" + drive.getTitle() + "' has been approved by admin and is now published.",
                    NotificationType.SUCCESS,
                    "DRIVE",
                    drive.getId(),
                    "/employer/drives/" + drive.getId()
            );
        }

        recordActivity(adminPrincipal.getId(), "DRIVE_APPROVED", "DRIVE", drive.getId(),
                "Walk-In Drive Approved",
                "Admin approved drive: " + drive.getTitle() + " (" + drive.getCampusType() + ")",
                "PENDING", "APPROVED", feedback);

        return ResponseEntity.ok(ApiResponse.success("Drive approved successfully", drive));
    }

    @PostMapping("/drives/{driveId}/reject")
    @Transactional
    @Operation(summary = "Reject submitted walk-in drive")
    public ResponseEntity<ApiResponse<WalkInDrive>> rejectDrive(
            @PathVariable String driveId,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {

        String reason = body != null && body.get("reason") != null ? body.get("reason") : "Drive details do not meet criteria.";
        WalkInDrive drive = driveService.approveDrive(driveId, false, reason, adminPrincipal.getId());

        if (drive.getCreatedBy() != null) {
            notificationService.notifyUser(
                    drive.getCreatedBy().getId(),
                    "Walk-In Drive Review Update",
                    "Your drive '" + drive.getTitle() + "' was not approved: " + reason,
                    NotificationType.WARNING,
                    "DRIVE",
                    drive.getId(),
                    "/employer/drives/" + drive.getId()
            );
        }

        recordActivity(adminPrincipal.getId(), "DRIVE_REJECTED", "DRIVE", drive.getId(),
                "Walk-In Drive Rejected",
                "Admin rejected drive: " + drive.getTitle() + ". Reason: " + reason,
                "PENDING", "REJECTED", reason);

        return ResponseEntity.ok(ApiResponse.success("Drive rejected", drive));
    }

    @GetMapping("/activity-logs")
    @Operation(summary = "List audit activity logs")
    public ResponseEntity<ApiResponse<Page<ActivityLog>>> listActivityLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<ActivityLog> logs = activityLogRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success("Activity logs fetched", logs));
    }

    @GetMapping("/users")
    @Operation(summary = "List all users (Admin)")
    public ResponseEntity<ApiResponse<Object>> listUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success("Users fetched", userRepository.findAll(pageable)));
    }

    @PatchMapping("/users/{userId}/status")
    @Operation(summary = "Update user account status (Admin)")
    public ResponseEntity<ApiResponse<Object>> updateUserStatus(
            @PathVariable String userId,
            @RequestBody Map<String, String> body) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        AccountStatus status = AccountStatus.valueOf(body.get("status").toUpperCase());
        user.setAccountStatus(status);
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("User status updated", user));
    }

    @PostMapping("/email/send-test")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Send real SMTP verification test email (Admin only)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sendTestEmail(
            @Valid @RequestBody TestEmailRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        // Rate limiting: 5-second cooldown per administrator to protect against mail floods/spam
        String adminId = principal != null ? principal.getId() : "admin";
        long now = System.currentTimeMillis();
        Long lastSent = testEmailRateLimiter.get(adminId);
        if (lastSent != null && (now - lastSent) < 5000) {
            long remaining = 5 - ((now - lastSent) / 1000);
            throw new BadRequestException("Please wait " + remaining + " seconds before sending another test email to prevent SMTP rate limits.");
        }
        testEmailRateLimiter.put(adminId, now);

        // Send test email
        EmailService.EmailDeliveryResult result = emailService.sendDirectTestEmail(
                request.getRecipientEmail(),
                request.getSubject(),
                request.getContent()
        );

        Map<String, Object> details = new LinkedHashMap<>();
        details.put("recipientEmail", request.getRecipientEmail().trim());
        details.put("senderEmail", emailService.getMailFrom());
        details.put("mailHost", mailConfig != null ? mailConfig.getHost() : "localhost");
        details.put("mailPort", mailConfig != null ? mailConfig.getPort() : 587);
        details.put("smtpEnabled", emailService.isMailEnabled());
        details.put("status", result.getStatus());
        details.put("success", result.isSuccess());
        details.put("message", result.getMessage());
        details.put("timestamp", LocalDateTime.now().toString());

        recordActivity(adminId, "TEST_EMAIL_SENT", "EMAIL", request.getRecipientEmail().trim(),
                "Administrator Test Email Dispatched",
                "Delivered test email to " + request.getRecipientEmail().trim() + " with status: " + result.getStatus(),
                null, result.getStatus(), result.getMessage());

        if (result.isSuccess()) {
            return ResponseEntity.ok(ApiResponse.success(
                    "Test email successfully delivered to " + request.getRecipientEmail().trim(),
                    details
            ));
        } else {
            return ResponseEntity.ok(ApiResponse.error(
                    "Email dispatch was not successful: " + (result.getMessage() != null ? result.getMessage() : "Unknown error"),
                    details
            ));
        }
    }

    private void recordActivity(String actorId, String action, String entityType,
                                String entityId, String title, String description,
                                String prevStatus, String newStatus, String reason) {
        ActivityLog log = new ActivityLog(
                UUID.randomUUID().toString(),
                actorId,
                action,
                entityType,
                entityId,
                title,
                description,
                prevStatus,
                newStatus,
                reason
        );
        activityLogRepository.save(log);
    }
}
