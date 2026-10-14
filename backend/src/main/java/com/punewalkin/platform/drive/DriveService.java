package com.punewalkin.platform.drive;

import com.punewalkin.platform.company.Company;
import com.punewalkin.platform.company.CompanyRepository;
import com.punewalkin.platform.common.exception.BadRequestException;
import com.punewalkin.platform.common.exception.ForbiddenException;
import com.punewalkin.platform.common.exception.ResourceNotFoundException;
import com.punewalkin.platform.job.Job;
import com.punewalkin.platform.job.JobRepository;
import com.punewalkin.platform.user.User;
import com.punewalkin.platform.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class DriveService {

    private final DriveRepository driveRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    public DriveService(DriveRepository driveRepository,
                        CompanyRepository companyRepository,
                        JobRepository jobRepository,
                        UserRepository userRepository) {
        this.driveRepository = driveRepository;
        this.companyRepository = companyRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public WalkInDrive createDrive(DriveRequest request, String companyId, String creatorUserId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + companyId));
        if (!company.getEmployer().getId().equals(creatorUserId)) {
            throw new ForbiddenException("You are not the owner of this company.");
        }

        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + request.getJobId()));

        User creator = userRepository.findById(creatorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        WalkInDrive drive = new WalkInDrive();
        drive.setId(UUID.randomUUID().toString());
        drive.setCompany(company);
        drive.setJob(job);
        drive.setCreatedBy(creator);
        drive.setApprovalStatus(DriveApprovalStatus.PENDING);
        drive.setDriveStatus(DriveStatus.DRAFT);
        applyRequest(drive, request);
        return driveRepository.save(drive);
    }

    @Transactional
    public WalkInDrive updateDrive(String driveId, DriveRequest request, String requestingUserId, boolean isAdmin) {
        WalkInDrive drive = driveRepository.findById(driveId)
                .orElseThrow(() -> new ResourceNotFoundException("Drive not found: " + driveId));
        if (!isAdmin && !drive.getCreatedBy().getId().equals(requestingUserId)) {
            throw new ForbiddenException("Not authorized to update this drive.");
        }
        // Only allow updates if not yet submitted/approved
        if (!isAdmin && drive.getApprovalStatus() == DriveApprovalStatus.APPROVED) {
            throw new BadRequestException("Cannot edit an already approved drive.");
        }
        // Update job if changed
        if (request.getJobId() != null && !request.getJobId().equals(drive.getJob().getId())) {
            Job job = jobRepository.findById(request.getJobId())
                    .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + request.getJobId()));
            drive.setJob(job);
        }
        applyRequest(drive, request);
        return driveRepository.save(drive);
    }

    private void applyRequest(WalkInDrive drive, DriveRequest req) {
        if (req.getTitle() != null) drive.setTitle(req.getTitle());
        if (req.getDescription() != null) drive.setDescription(req.getDescription());
        if (req.getDriveDate() != null) drive.setDriveDate(req.getDriveDate());
        if (req.getStartTime() != null) drive.setStartTime(req.getStartTime());
        if (req.getEndTime() != null) drive.setEndTime(req.getEndTime());
        if (req.getRegistrationDeadline() != null) drive.setRegistrationDeadline(req.getRegistrationDeadline());
        if (req.getVenueName() != null) drive.setVenueName(req.getVenueName());
        if (req.getVenueAddress() != null) drive.setVenueAddress(req.getVenueAddress());
        if (req.getCity() != null) drive.setCity(req.getCity());
        if (req.getState() != null) drive.setState(req.getState());
        if (req.getPincode() != null) drive.setPincode(req.getPincode());
        if (req.getVacancies() != null) drive.setVacancies(req.getVacancies());
        if (req.getMaxRegistrations() != null) drive.setMaxRegistrations(req.getMaxRegistrations());
        if (req.getSelectionRounds() != null) drive.setSelectionRounds(req.getSelectionRounds());
        if (req.getRequiredDocuments() != null) drive.setRequiredDocuments(req.getRequiredDocuments());
        if (req.getRecruiterName() != null) drive.setRecruiterName(req.getRecruiterName());
        if (req.getRecruiterEmail() != null) drive.setRecruiterEmail(req.getRecruiterEmail());
        if (req.getRecruiterPhone() != null) drive.setRecruiterPhone(req.getRecruiterPhone());
        if (req.getCandidateInstructions() != null) drive.setCandidateInstructions(req.getCandidateInstructions());

        if (req.getCampusType() != null) drive.setCampusType(req.getCampusType());
        if (req.getEligibleDegree() != null) drive.setEligibleDegree(req.getEligibleDegree());
        if (req.getEligibleBranch() != null) drive.setEligibleBranch(req.getEligibleBranch());
        if (req.getEligibleGraduationYearMin() != null) drive.setEligibleGraduationYearMin(req.getEligibleGraduationYearMin());
        if (req.getEligibleGraduationYearMax() != null) drive.setEligibleGraduationYearMax(req.getEligibleGraduationYearMax());
        if (req.getMinCgpa() != null) drive.setMinCgpa(req.getMinCgpa());
        if (req.getMaxBacklogs() != null) drive.setMaxBacklogs(req.getMaxBacklogs());

        if (req.getEligibleColleges() != null) {
            drive.getEligibleColleges().clear();
            for (String college : req.getEligibleColleges()) {
                if (college != null && !college.trim().isEmpty()) {
                    DriveEligibleCollege dec = new DriveEligibleCollege(
                            UUID.randomUUID().toString(), drive, college.trim());
                    drive.getEligibleColleges().add(dec);
                }
            }
        }
    }

    public WalkInDrive getDriveById(String driveId) {
        return driveRepository.findById(driveId)
                .orElseThrow(() -> new ResourceNotFoundException("Drive not found: " + driveId));
    }

    public Page<WalkInDrive> searchPublishedDrives(String search, Pageable pageable) {
        return driveRepository.searchPublishedDrives(search, pageable);
    }

    public Page<WalkInDrive> searchPublishedDrives(String search, CampusType campusType, Pageable pageable) {
        if (campusType != null) {
            return driveRepository.searchPublishedDrivesWithCampus(search, campusType, pageable);
        }
        return driveRepository.searchPublishedDrives(search, pageable);
    }

    public Page<WalkInDrive> getDrivesByCompany(String companyId, Pageable pageable) {
        return driveRepository.findByCompanyId(companyId, pageable);
    }

    public Page<WalkInDrive> getDrivesByCompanyAndCampusType(String companyId, CampusType campusType, Pageable pageable) {
        if (campusType != null) {
            return driveRepository.findByCompanyIdAndCampusType(companyId, campusType, pageable);
        }
        return driveRepository.findByCompanyId(companyId, pageable);
    }

    public Page<WalkInDrive> getDrivesByApprovalStatus(DriveApprovalStatus status, Pageable pageable) {
        return driveRepository.findByApprovalStatus(status, pageable);
    }

    public Page<WalkInDrive> getAllDrives(Pageable pageable) {
        return driveRepository.findAll(pageable);
    }

    @Transactional
    public WalkInDrive submitForApproval(String driveId, String requestingUserId) {
        WalkInDrive drive = driveRepository.findById(driveId)
                .orElseThrow(() -> new ResourceNotFoundException("Drive not found: " + driveId));
        if (!drive.getCreatedBy().getId().equals(requestingUserId)) {
            throw new ForbiddenException("Not authorized.");
        }
        if (drive.getApprovalStatus() == DriveApprovalStatus.PENDING ||
                drive.getApprovalStatus() == DriveApprovalStatus.APPROVED) {
            throw new BadRequestException("Drive is already submitted or approved.");
        }
        drive.setApprovalStatus(DriveApprovalStatus.PENDING);
        drive.setDriveStatus(DriveStatus.DRAFT);
        drive.setSubmittedAt(LocalDateTime.now());
        return driveRepository.save(drive);
    }

    @Transactional
    public WalkInDrive approveDrive(String driveId, boolean approve, String feedback, String adminUserId) {
        WalkInDrive drive = driveRepository.findById(driveId)
                .orElseThrow(() -> new ResourceNotFoundException("Drive not found: " + driveId));
        drive.setAdminFeedback(feedback);
        if (approve) {
            drive.setApprovalStatus(DriveApprovalStatus.APPROVED);
            drive.setDriveStatus(DriveStatus.PUBLISHED);
            drive.setApprovedAt(LocalDateTime.now());
        } else {
            drive.setApprovalStatus(DriveApprovalStatus.REJECTED);
            drive.setDriveStatus(DriveStatus.DRAFT);
        }
        return driveRepository.save(drive);
    }

    @Transactional
    public WalkInDrive requestChanges(String driveId, String feedback, String adminUserId) {
        WalkInDrive drive = driveRepository.findById(driveId)
                .orElseThrow(() -> new ResourceNotFoundException("Drive not found: " + driveId));
        drive.setAdminFeedback(feedback);
        drive.setApprovalStatus(DriveApprovalStatus.CHANGES_REQUESTED);
        drive.setDriveStatus(DriveStatus.DRAFT);
        return driveRepository.save(drive);
    }

    @Transactional
    public void deleteDrive(String driveId, String requestingUserId, boolean isAdmin) {
        WalkInDrive drive = driveRepository.findById(driveId)
                .orElseThrow(() -> new ResourceNotFoundException("Drive not found: " + driveId));
        if (!isAdmin && !drive.getCreatedBy().getId().equals(requestingUserId)) {
            throw new ForbiddenException("Not authorized.");
        }
        driveRepository.delete(drive);
    }
}
