package com.punewalkin.platform.user;

import com.punewalkin.platform.admin.ActivityLog;
import com.punewalkin.platform.admin.ActivityLogRepository;
import com.punewalkin.platform.candidate.CandidateProfile;
import com.punewalkin.platform.candidate.CandidateProfileRepository;
import com.punewalkin.platform.candidate.CandidateSkill;
import com.punewalkin.platform.common.exception.*;
import com.punewalkin.platform.company.Company;
import com.punewalkin.platform.company.CompanyRepository;
import com.punewalkin.platform.company.CompanyVerificationStatus;
import com.punewalkin.platform.notification.NotificationService;
import com.punewalkin.platform.notification.NotificationType;
import com.punewalkin.platform.security.JwtTokenProvider;
import com.punewalkin.platform.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final CompanyRepository companyRepository;
    private final NotificationService notificationService;
    private final ActivityLogRepository activityLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserRepository userRepository,
                       CandidateProfileRepository candidateProfileRepository,
                       CompanyRepository companyRepository,
                       NotificationService notificationService,
                       ActivityLogRepository activityLogRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.candidateProfileRepository = candidateProfileRepository;
        this.companyRepository = companyRepository;
        this.notificationService = notificationService;
        this.activityLogRepository = activityLogRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public AuthResponse registerCandidate(CandidateRegisterRequest request) {
        handleDuplicateEmailCheck(request.getEmail());

        String userId = UUID.randomUUID().toString();
        User user = new User(
                userId,
                request.getFullName().trim(),
                request.getEmail().trim().toLowerCase(),
                passwordEncoder.encode(request.getPassword()),
                Role.CANDIDATE,
                AccountStatus.PENDING
        );
        userRepository.save(user);

        // Associated candidate profile
        CandidateProfile profile = new CandidateProfile();
        profile.setId(UUID.randomUUID().toString());
        profile.setUser(user);
        profile.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        profile.setCollegeName(request.getCollegeName() != null ? request.getCollegeName().trim() : null);
        profile.setDegree(request.getDegree() != null ? request.getDegree().trim() : null);
        profile.setBranch(request.getBranch() != null ? request.getBranch().trim() : null);
        profile.setGraduationYear(request.getGraduationYear() != null ? request.getGraduationYear().trim() : null);
        profile.setCgpa(request.getCgpa());
        profile.setBacklogs(request.getBacklogs() != null ? request.getBacklogs() : 0);
        if (request.getDegree() != null) {
            profile.setHighestQualification(request.getDegree());
        }

        // Skills
        if (request.getSkills() != null) {
            for (String skillName : request.getSkills()) {
                if (skillName != null && !skillName.trim().isEmpty()) {
                    CandidateSkill skill = new CandidateSkill();
                    skill.setId(UUID.randomUUID().toString());
                    skill.setCandidate(profile);
                    skill.setSkillName(skillName.trim());
                    profile.getSkills().add(skill);
                }
            }
        }

        candidateProfileRepository.save(profile);

        // Notify Admins
        notificationService.notifyAdmins(
                "New Candidate Registration Awaiting Review",
                request.getFullName() + " registered and is awaiting admin approval.",
                NotificationType.INFO,
                "USER",
                userId,
                "/admin/users"
        );

        // Audit Log
        recordActivity(userId, "CANDIDATE_REGISTRATION", "USER", userId,
                "Candidate Registered",
                request.getFullName() + " submitted candidate registration awaiting review.",
                null, "PENDING", null);

        // Registration MUST NOT establish an authenticated session
        return new AuthResponse(
                null,
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name(),
                user.getAccountStatus().name(),
                "Your registration is awaiting admin verification. You can log in after your account is approved."
        );
    }

    @Transactional
    public AuthResponse registerEmployer(EmployerRegisterRequest request) {
        handleDuplicateEmailCheck(request.getEmail());

        String userId = UUID.randomUUID().toString();
        User user = new User(
                userId,
                request.getRecruiterName().trim(),
                request.getEmail().trim().toLowerCase(),
                passwordEncoder.encode(request.getPassword()),
                Role.EMPLOYER,
                AccountStatus.PENDING
        );
        userRepository.save(user);

        // Associated Company entity
        Company company = new Company();
        company.setId(UUID.randomUUID().toString());
        company.setEmployer(user);
        company.setCompanyName(request.getCompanyName().trim());
        company.setCompanyEmail(request.getEmail().trim().toLowerCase());
        company.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        company.setWebsite(request.getWebsite() != null ? request.getWebsite().trim() : null);
        company.setDescription(request.getDescription());
        company.setHrContactPerson(request.getRecruiterName().trim());
        company.setHrContactRole(request.getDesignation() != null ? request.getDesignation().trim() : "Recruiter");
        company.setCity(request.getLocation() != null ? request.getLocation().trim() : "Pune");
        company.setVerificationStatus(CompanyVerificationStatus.PENDING);
        companyRepository.save(company);

        // Notify Admins
        notificationService.notifyAdmins(
                "New Employer Registration Awaiting Review",
                request.getCompanyName() + " (" + request.getRecruiterName() + ") submitted corporate registration for verification.",
                NotificationType.INFO,
                "COMPANY",
                company.getId(),
                "/admin/companies"
        );

        // Audit Log
        recordActivity(userId, "EMPLOYER_REGISTRATION", "COMPANY", company.getId(),
                "Employer Registered",
                "Company " + request.getCompanyName() + " submitted by " + request.getRecruiterName() + " awaiting verification.",
                null, "PENDING", null);

        return new AuthResponse(
                null,
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name(),
                user.getAccountStatus().name(),
                "Your employer registration has been submitted and is awaiting administrator verification."
        );
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        handleDuplicateEmailCheck(request.getEmail());

        Role role;
        try {
            role = Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role. Must be CANDIDATE or EMPLOYER.");
        }

        if (role == Role.ADMIN) {
            throw new BadRequestException("Cannot self-register as ADMIN.");
        }

        if (role == Role.CANDIDATE) {
            CandidateRegisterRequest candReq = new CandidateRegisterRequest();
            candReq.setFullName(request.getFullName());
            candReq.setEmail(request.getEmail());
            candReq.setPassword(request.getPassword());
            return registerCandidate(candReq);
        } else {
            EmployerRegisterRequest empReq = new EmployerRegisterRequest();
            empReq.setRecruiterName(request.getFullName());
            empReq.setEmail(request.getEmail());
            empReq.setPassword(request.getPassword());
            empReq.setCompanyName(request.getFullName() + "'s Organization");
            return registerEmployer(empReq);
        }
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String cleanEmail = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmailIgnoreCase(cleanEmail)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password. Please verify credentials."));

        // Generic invalid credentials if password does not match
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password. Please verify credentials.");
        }

        // Account status enforcement
        AccountStatus status = user.getAccountStatus();
        if (status.isPending()) {
            throw new AccountPendingApprovalException(
                    "Your registration is awaiting admin verification. You can log in after your account is approved."
            );
        }

        if (status.isRejected()) {
            String reason = user.getRejectionReason() != null && !user.getRejectionReason().isBlank()
                    ? ": " + user.getRejectionReason()
                    : ". Please contact administrator.";
            throw new AccountRejectedException(
                    "Your registration was not approved" + reason
            );
        }

        if (status.isSuspended()) {
            throw new AccountSuspendedException(
                    "Your account has been suspended by the platform administrator. Please contact support."
            );
        }

        // Only approved users reach here
        UserPrincipal principal = UserPrincipal.create(user);
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                principal, null, principal.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = jwtTokenProvider.generateToken(authentication);

        // Update last login timestamp
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        return new AuthResponse(
                token,
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name(),
                user.getAccountStatus().name(),
                "Login successful"
        );
    }

    private void handleDuplicateEmailCheck(String email) {
        if (email == null) return;
        userRepository.findByEmailIgnoreCase(email.trim()).ifPresent(existing -> {
            if (existing.getAccountStatus().isPending()) {
                throw new ConflictException(
                        "An account with this email address is already registered and is awaiting admin approval. Please wait for verification."
                );
            } else if (existing.getAccountStatus().isRejected()) {
                throw new ConflictException(
                        "An account with this email address was previously reviewed and not approved. Please contact support."
                );
            } else {
                throw new ConflictException("Email address is already registered: " + email);
            }
        });
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

    public UserProfileResponse getProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return new UserProfileResponse(user);
    }
}
