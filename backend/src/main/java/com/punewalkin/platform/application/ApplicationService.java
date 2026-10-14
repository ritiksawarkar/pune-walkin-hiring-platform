package com.punewalkin.platform.application;

import com.punewalkin.platform.candidate.CandidateProfile;
import com.punewalkin.platform.candidate.CandidateProfileRepository;
import com.punewalkin.platform.common.exception.BadRequestException;
import com.punewalkin.platform.common.exception.ConflictException;
import com.punewalkin.platform.common.exception.ForbiddenException;
import com.punewalkin.platform.common.exception.ResourceNotFoundException;
import com.punewalkin.platform.drive.DriveApprovalStatus;
import com.punewalkin.platform.drive.WalkInDrive;
import com.punewalkin.platform.drive.DriveRepository;
import com.punewalkin.platform.user.User;
import com.punewalkin.platform.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.punewalkin.platform.notification.NotificationService;
import com.punewalkin.platform.notification.NotificationType;

import java.time.LocalDate;
import java.util.UUID;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final DriveRepository driveRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public ApplicationService(ApplicationRepository applicationRepository,
                               CandidateProfileRepository candidateProfileRepository,
                               DriveRepository driveRepository,
                               UserRepository userRepository,
                               NotificationService notificationService) {
        this.applicationRepository = applicationRepository;
        this.candidateProfileRepository = candidateProfileRepository;
        this.driveRepository = driveRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public Application applyToDrive(String driveId, String candidateUserId) {
        // Find candidate profile
        CandidateProfile candidateProfile = candidateProfileRepository.findByUserId(candidateUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found for user: " + candidateUserId));

        // Find drive
        WalkInDrive drive = driveRepository.findById(driveId)
                .orElseThrow(() -> new ResourceNotFoundException("Drive not found: " + driveId));

        // Validate account approval and campus eligibility
        validateCandidateEligibility(candidateProfile, drive);

        // Validation checks
        if (drive.getApprovalStatus() != DriveApprovalStatus.APPROVED) {
            throw new BadRequestException("This drive is not open for applications.");
        }
        if (drive.getRegistrationDeadline().isBefore(LocalDate.now())) {
            throw new BadRequestException("Registration deadline has passed.");
        }
        if (drive.getRegisteredCount() >= drive.getMaxRegistrations()) {
            throw new BadRequestException("Drive has reached maximum registrations.");
        }
        if (applicationRepository.existsByCandidateIdAndDriveId(candidateProfile.getId(), driveId)) {
            throw new ConflictException("You have already applied to this drive.");
        }

        // Create application
        Application app = new Application();
        app.setId(UUID.randomUUID().toString());
        app.setCandidate(candidateProfile);
        app.setDrive(drive);
        app.setJob(drive.getJob());
        app.setCompany(drive.getCompany());
        app.setStatus(ApplicationStatus.REGISTERED);

        // Increment registered count
        int newCount = drive.getRegisteredCount() + 1;
        drive.setRegisteredCount(newCount);
        driveRepository.save(drive);

        // Generate token
        String token = "TKN-" + driveId.substring(0, Math.min(4, driveId.length())).toUpperCase() + "-" + newCount;
        app.setTokenNumber(token);

        // Set resume filename from candidate profile if available
        if (candidateProfile.getResumeFileName() != null) {
            app.setResumeFileName(candidateProfile.getResumeFileName());
        }

        Application savedApp = applicationRepository.save(app);

        // Notify candidate of registration confirmation
        notificationService.notifyUser(
                candidateUserId,
                "Drive Registration Confirmed",
                "You have successfully registered for " + drive.getTitle() + ". Walk-in Token: " + token,
                NotificationType.SUCCESS,
                "DRIVE_APPLICATION",
                savedApp.getId(),
                "/candidate/applications/" + savedApp.getId()
        );

        // Notify employer of new registration
        if (drive.getCreatedBy() != null) {
            String candName = candidateProfile.getUser() != null ? candidateProfile.getUser().getFullName() : "A candidate";
            notificationService.notifyUser(
                    drive.getCreatedBy().getId(),
                    "New Drive Registration",
                    candName + " registered for " + drive.getTitle(),
                    NotificationType.INFO,
                    "DRIVE_APPLICATION",
                    savedApp.getId(),
                    "/employer/drives/" + drive.getId() + "/candidates"
            );
        }

        return savedApp;
    }

    @Transactional
    public Application updateApplicationStatus(String applicationId, ApplicationStatus newStatus,
                                                String reviewerNotes, Double rating,
                                                String updatingUserId) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));

        User updatedBy = userRepository.findById(updatingUserId).orElse(null);
        app.setStatus(newStatus);
        if (reviewerNotes != null) app.setReviewerNotes(reviewerNotes);
        if (rating != null) app.setRating(rating);
        app.setLastUpdatedBy(updatedBy);

        return applicationRepository.save(app);
    }

    @Transactional
    public Application withdrawApplication(String applicationId, String candidateUserId) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));

        CandidateProfile profile = candidateProfileRepository.findByUserId(candidateUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found"));

        if (!app.getCandidate().getId().equals(profile.getId())) {
            throw new ForbiddenException("You are not authorized to withdraw this application.");
        }
        if (app.getStatus() == ApplicationStatus.WITHDRAWN) {
            throw new BadRequestException("Application is already withdrawn.");
        }

        app.setStatus(ApplicationStatus.WITHDRAWN);

        // Decrement drive count
        WalkInDrive drive = app.getDrive();
        if (drive.getRegisteredCount() > 0) {
            drive.setRegisteredCount(drive.getRegisteredCount() - 1);
            driveRepository.save(drive);
        }

        return applicationRepository.save(app);
    }

    public Application getApplicationById(String applicationId) {
        return applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));
    }

    public Page<Application> getApplicationsByCandidate(String candidateUserId, Pageable pageable) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(candidateUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found"));
        return applicationRepository.findByCandidateId(profile.getId(), pageable);
    }

    public Page<Application> getApplicationsByDrive(String driveId, Pageable pageable) {
        return applicationRepository.findByDriveId(driveId, pageable);
    }

    public Page<Application> getApplicationsByCompany(String companyId, Pageable pageable) {
        return applicationRepository.findByCompanyId(companyId, pageable);
    }

    public Page<Application> getAllApplications(Pageable pageable) {
        return applicationRepository.findAll(pageable);
    }

    private void validateCandidateEligibility(CandidateProfile candidate, WalkInDrive drive) {
        // Account approval status check
        if (candidate.getUser() != null && !candidate.getUser().getAccountStatus().isApproved()) {
            throw new ForbiddenException("Account verification required. Your candidate profile is currently awaiting admin verification.");
        }

        // On-Campus Eligibility Enforcement
        if (drive.getCampusType() == com.punewalkin.platform.drive.CampusType.ON_CAMPUS) {
            // 1. Eligible Colleges Check
            if (drive.getEligibleColleges() != null && !drive.getEligibleColleges().isEmpty()) {
                String candidateCollege = candidate.getCollegeName();
                boolean collegeMatched = false;
                if (candidateCollege != null && !candidateCollege.isBlank()) {
                    for (com.punewalkin.platform.drive.DriveEligibleCollege dec : drive.getEligibleColleges()) {
                        if (candidateCollege.toLowerCase().contains(dec.getCollegeName().toLowerCase()) ||
                            dec.getCollegeName().toLowerCase().contains(candidateCollege.toLowerCase())) {
                            collegeMatched = true;
                            break;
                        }
                    }
                }
                // Also check candidate education institutions
                if (!collegeMatched && candidate.getEducation() != null) {
                    for (com.punewalkin.platform.candidate.CandidateEducation edu : candidate.getEducation()) {
                        if (edu.getInstitution() != null) {
                            for (com.punewalkin.platform.drive.DriveEligibleCollege dec : drive.getEligibleColleges()) {
                                if (edu.getInstitution().toLowerCase().contains(dec.getCollegeName().toLowerCase()) ||
                                    dec.getCollegeName().toLowerCase().contains(edu.getInstitution().toLowerCase())) {
                                    collegeMatched = true;
                                    break;
                                }
                            }
                        }
                        if (collegeMatched) break;
                    }
                }
                if (!collegeMatched) {
                    throw new BadRequestException("You are not eligible for this On-Campus drive. Only students/graduates from participating eligible colleges may register.");
                }
            }

            // 2. Degree Check
            if (drive.getEligibleDegree() != null && !drive.getEligibleDegree().isBlank()) {
                String reqDegree = drive.getEligibleDegree().trim().toLowerCase();
                boolean degreeMatched = false;
                if (candidate.getDegree() != null && candidate.getDegree().toLowerCase().contains(reqDegree)) {
                    degreeMatched = true;
                }
                if (!degreeMatched && candidate.getHighestQualification() != null &&
                        candidate.getHighestQualification().toLowerCase().contains(reqDegree)) {
                    degreeMatched = true;
                }
                if (!degreeMatched && candidate.getEducation() != null) {
                    for (var edu : candidate.getEducation()) {
                        if (edu.getQualification() != null && edu.getQualification().toLowerCase().contains(reqDegree)) {
                            degreeMatched = true;
                            break;
                        }
                    }
                }
                if (!degreeMatched) {
                    throw new BadRequestException("Degree criteria mismatch: " + drive.getEligibleDegree() + " required.");
                }
            }

            // 3. Branch / Department Check
            if (drive.getEligibleBranch() != null && !drive.getEligibleBranch().isBlank()) {
                String reqBranch = drive.getEligibleBranch().trim().toLowerCase();
                boolean branchMatched = false;
                if (candidate.getBranch() != null && candidate.getBranch().toLowerCase().contains(reqBranch)) {
                    branchMatched = true;
                }
                if (!branchMatched && candidate.getEducation() != null) {
                    for (var edu : candidate.getEducation()) {
                        if (edu.getCourse() != null && edu.getCourse().toLowerCase().contains(reqBranch)) {
                            branchMatched = true;
                            break;
                        }
                    }
                }
                if (!branchMatched) {
                    throw new BadRequestException("Branch/Course criteria mismatch: " + drive.getEligibleBranch() + " required.");
                }
            }

            // 4. Graduation Year Range Check
            Integer candGradYear = extractGraduationYear(candidate);
            if (candGradYear != null) {
                if (drive.getEligibleGraduationYearMin() != null && candGradYear < drive.getEligibleGraduationYearMin()) {
                    throw new BadRequestException("Graduation year " + candGradYear + " is earlier than eligible minimum year " + drive.getEligibleGraduationYearMin());
                }
                if (drive.getEligibleGraduationYearMax() != null && candGradYear > drive.getEligibleGraduationYearMax()) {
                    throw new BadRequestException("Graduation year " + candGradYear + " exceeds eligible maximum year " + drive.getEligibleGraduationYearMax());
                }
            }

            // 5. Minimum CGPA Check
            if (drive.getMinCgpa() != null) {
                Double candCgpa = candidate.getCgpa();
                if (candCgpa != null && candCgpa < drive.getMinCgpa()) {
                    throw new BadRequestException("Minimum CGPA requirement not met. Required: " + drive.getMinCgpa() + ", Candidate: " + candCgpa);
                }
            }

            // 6. Max Backlogs Check
            if (drive.getMaxBacklogs() != null) {
                if (candidate.getBacklogs() > drive.getMaxBacklogs()) {
                    throw new BadRequestException("Maximum backlogs limit exceeded. Allowed: " + drive.getMaxBacklogs() + ", Candidate: " + candidate.getBacklogs());
                }
            }
        }
    }

    private Integer extractGraduationYear(CandidateProfile candidate) {
        if (candidate.getGraduationYear() != null && !candidate.getGraduationYear().isBlank()) {
            try {
                return Integer.parseInt(candidate.getGraduationYear().trim());
            } catch (NumberFormatException ignored) {}
        }
        if (candidate.getEducation() != null) {
            for (var edu : candidate.getEducation()) {
                if (edu.getGraduationYear() != null && !edu.getGraduationYear().isBlank()) {
                    try {
                        return Integer.parseInt(edu.getGraduationYear().trim());
                    } catch (NumberFormatException ignored) {}
                }
            }
        }
        return null;
    }
}
