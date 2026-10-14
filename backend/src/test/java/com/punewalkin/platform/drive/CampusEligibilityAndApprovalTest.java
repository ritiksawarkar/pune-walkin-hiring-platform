package com.punewalkin.platform.drive;

import com.punewalkin.platform.application.Application;
import com.punewalkin.platform.application.ApplicationRepository;
import com.punewalkin.platform.application.ApplicationService;
import com.punewalkin.platform.candidate.CandidateProfile;
import com.punewalkin.platform.candidate.CandidateProfileRepository;
import com.punewalkin.platform.common.exception.BadRequestException;
import com.punewalkin.platform.common.exception.ConflictException;
import com.punewalkin.platform.company.Company;
import com.punewalkin.platform.company.CompanyRepository;
import com.punewalkin.platform.company.CompanyVerificationStatus;
import com.punewalkin.platform.job.Job;
import com.punewalkin.platform.job.JobRepository;
import com.punewalkin.platform.job.JobStatus;
import com.punewalkin.platform.user.AccountStatus;
import com.punewalkin.platform.user.Role;
import com.punewalkin.platform.user.User;
import com.punewalkin.platform.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class CampusEligibilityAndApprovalTest {

    @Autowired
    private ApplicationService applicationService;

    @Autowired
    private DriveService driveService;

    @Autowired
    private DriveRepository driveRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private CandidateProfileRepository candidateProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private JobRepository jobRepository;

    private User employer;
    private Company company;
    private Job job;
    private User eligibleCandidateUser;
    private CandidateProfile eligibleProfile;
    private User ineligibleCandidateUser;
    private CandidateProfile ineligibleProfile;

    @BeforeEach
    void setUp() {
        applicationRepository.deleteAll();
        driveRepository.deleteAll();
        jobRepository.deleteAll();
        companyRepository.deleteAll();
        candidateProfileRepository.deleteAll();
        userRepository.deleteAll();

        // Employer & Company
        employer = new User(UUID.randomUUID().toString(), "Tech Employer", "emp@techsprint.io", "pwd", Role.EMPLOYER, AccountStatus.APPROVED);
        userRepository.save(employer);

        company = new Company();
        company.setId(UUID.randomUUID().toString());
        company.setEmployer(employer);
        company.setCompanyName("TechSprint Innovations");
        company.setCompanyEmail("contact@techsprint.io");
        company.setVerificationStatus(CompanyVerificationStatus.VERIFIED);
        companyRepository.save(company);

        job = new Job();
        job.setId(UUID.randomUUID().toString());
        job.setCompany(company);
        job.setCreatedBy(employer);
        job.setTitle("Graduate Software Engineer (Java & Cloud)");
        job.setStatus(JobStatus.ACTIVE);
        jobRepository.save(job);

        // Eligible Candidate (COEP Pune, B.Tech, Computer Engineering, 2025, 8.5 CGPA, 0 backlogs)
        eligibleCandidateUser = new User(UUID.randomUUID().toString(), "Amit Deshmukh", "amit.coep@example.com", "pwd", Role.CANDIDATE, AccountStatus.APPROVED);
        userRepository.save(eligibleCandidateUser);

        eligibleProfile = new CandidateProfile();
        eligibleProfile.setId(UUID.randomUUID().toString());
        eligibleProfile.setUser(eligibleCandidateUser);
        eligibleProfile.setCollegeName("COEP Technological University, Pune");
        eligibleProfile.setDegree("B.Tech");
        eligibleProfile.setBranch("Computer Engineering");
        eligibleProfile.setGraduationYear("2025");
        eligibleProfile.setCgpa(8.5);
        eligibleProfile.setBacklogs(0);
        candidateProfileRepository.save(eligibleProfile);

        // Ineligible Candidate (Different College, 2022 grad, lower CGPA)
        ineligibleCandidateUser = new User(UUID.randomUUID().toString(), "Suresh Patil", "suresh.other@example.com", "pwd", Role.CANDIDATE, AccountStatus.APPROVED);
        userRepository.save(ineligibleCandidateUser);

        ineligibleProfile = new CandidateProfile();
        ineligibleProfile.setId(UUID.randomUUID().toString());
        ineligibleProfile.setUser(ineligibleCandidateUser);
        ineligibleProfile.setCollegeName("Other Non-Participating Institute");
        ineligibleProfile.setDegree("B.Sc");
        ineligibleProfile.setBranch("Physics");
        ineligibleProfile.setGraduationYear("2022");
        ineligibleProfile.setCgpa(6.0);
        ineligibleProfile.setBacklogs(3);
        candidateProfileRepository.save(ineligibleProfile);
    }

    private WalkInDrive createOnCampusDrive(List<String> colleges, String degree, String branch, Integer gradYear, Double minCgpa, Integer maxBacklogs) {
        DriveRequest req = new DriveRequest();
        req.setJobId(job.getId());
        req.setTitle("COEP Campus Placement Walk-In Drive 2026");
        req.setDriveDate(LocalDate.now().plusDays(10));
        req.setStartTime("09:00");
        req.setEndTime("17:00");
        req.setRegistrationDeadline(LocalDate.now().plusDays(5));
        req.setVenueName("COEP Main Auditorium");
        req.setVenueAddress("Wellesley Rd, Shivajinagar, Pune");
        req.setCity("Pune");
        req.setVacancies(25);
        req.setMaxRegistrations(50);
        req.setCampusType(CampusType.ON_CAMPUS);
        req.setEligibleColleges(colleges);
        req.setEligibleDegree(degree);
        req.setEligibleBranch(branch);
        req.setEligibleGraduationYearMin(gradYear);
        req.setEligibleGraduationYearMax(gradYear);
        req.setMinCgpa(minCgpa);
        req.setMaxBacklogs(maxBacklogs);

        WalkInDrive drive = driveService.createDrive(req, company.getId(), employer.getId());
        drive.setApprovalStatus(DriveApprovalStatus.APPROVED);
        drive.setDriveStatus(DriveStatus.PUBLISHED);
        return driveRepository.save(drive);
    }

    @Test
    @DisplayName("Eligible candidate from matching college can apply to On-Campus drive")
    void eligibleCandidateCanApplyToOnCampusDrive() {
        WalkInDrive drive = createOnCampusDrive(
                List.of("COEP Technological University, Pune"),
                "B.Tech",
                "Computer Engineering",
                2025,
                7.5,
                1
        );

        Application app = applicationService.applyToDrive(drive.getId(), eligibleCandidateUser.getId());
        assertNotNull(app.getId());
        assertNotNull(app.getTokenNumber());
        assertEquals("REGISTERED", app.getStatus().name());

        WalkInDrive updatedDrive = driveRepository.findById(drive.getId()).orElseThrow();
        assertEquals(1, updatedDrive.getRegisteredCount());
    }

    @Test
    @DisplayName("Ineligible candidate from non-participating college is rejected on apply")
    void ineligibleCollegeCandidateRejected() {
        WalkInDrive drive = createOnCampusDrive(
                List.of("COEP Technological University, Pune"),
                "B.Tech",
                "Computer Engineering",
                2025,
                7.5,
                1
        );

        assertThrows(BadRequestException.class, () -> {
            applicationService.applyToDrive(drive.getId(), ineligibleCandidateUser.getId());
        });
    }

    @Test
    @DisplayName("Off-Campus drive allows candidates from any college satisfying general criteria")
    void offCampusDriveAcceptsAnyCollegeCandidate() {
        DriveRequest req = new DriveRequest();
        req.setJobId(job.getId());
        req.setTitle("Pune City Wide Walk-In Mega Drive 2026");
        req.setDriveDate(LocalDate.now().plusDays(10));
        req.setStartTime("10:00");
        req.setEndTime("18:00");
        req.setRegistrationDeadline(LocalDate.now().plusDays(5));
        req.setVenueName("Magarpatta Cybercity");
        req.setVenueAddress("Hadapsar, Pune");
        req.setCampusType(CampusType.OFF_CAMPUS);
        req.setMaxRegistrations(100);

        WalkInDrive drive = driveService.createDrive(req, company.getId(), employer.getId());
        drive.setApprovalStatus(DriveApprovalStatus.APPROVED);
        drive.setDriveStatus(DriveStatus.PUBLISHED);
        driveRepository.save(drive);

        // Both candidates can apply
        Application app1 = applicationService.applyToDrive(drive.getId(), eligibleCandidateUser.getId());
        Application app2 = applicationService.applyToDrive(drive.getId(), ineligibleCandidateUser.getId());

        assertNotNull(app1.getId());
        assertNotNull(app2.getId());
    }

    @Test
    @DisplayName("Duplicate applications to the same drive are rejected (Conflict 409)")
    void duplicateApplicationPrevented() {
        DriveRequest req = new DriveRequest();
        req.setJobId(job.getId());
        req.setTitle("Off-Campus Walk-In");
        req.setDriveDate(LocalDate.now().plusDays(10));
        req.setStartTime("10:00");
        req.setEndTime("18:00");
        req.setRegistrationDeadline(LocalDate.now().plusDays(5));
        req.setVenueName("Venue Pune");
        req.setVenueAddress("Address Pune");
        req.setCampusType(CampusType.OFF_CAMPUS);
        req.setMaxRegistrations(100);

        WalkInDrive drive = driveService.createDrive(req, company.getId(), employer.getId());
        drive.setApprovalStatus(DriveApprovalStatus.APPROVED);
        drive.setDriveStatus(DriveStatus.PUBLISHED);
        driveRepository.save(drive);

        applicationService.applyToDrive(drive.getId(), eligibleCandidateUser.getId());

        assertThrows(ConflictException.class, () -> {
            applicationService.applyToDrive(drive.getId(), eligibleCandidateUser.getId());
        });
    }

    @Test
    @DisplayName("Cannot apply to unapproved or draft drive")
    void unapprovedDriveCannotAcceptApplications() {
        DriveRequest req = new DriveRequest();
        req.setJobId(job.getId());
        req.setTitle("Pending Review Drive");
        req.setDriveDate(LocalDate.now().plusDays(10));
        req.setStartTime("10:00");
        req.setEndTime("18:00");
        req.setRegistrationDeadline(LocalDate.now().plusDays(5));
        req.setVenueName("Venue Pune");
        req.setVenueAddress("Address Pune");
        req.setCampusType(CampusType.OFF_CAMPUS);

        WalkInDrive drive = driveService.createDrive(req, company.getId(), employer.getId());
        drive.setApprovalStatus(DriveApprovalStatus.PENDING);
        drive.setDriveStatus(DriveStatus.DRAFT);
        driveRepository.save(drive);

        assertThrows(BadRequestException.class, () -> {
            applicationService.applyToDrive(drive.getId(), eligibleCandidateUser.getId());
        });
    }

    @Test
    @DisplayName("Enforce drive capacity limits when max registrations reached")
    void driveCapacityLimitEnforced() {
        DriveRequest req = new DriveRequest();
        req.setJobId(job.getId());
        req.setTitle("Capacity Constrained Drive");
        req.setDriveDate(LocalDate.now().plusDays(10));
        req.setStartTime("10:00");
        req.setEndTime("18:00");
        req.setRegistrationDeadline(LocalDate.now().plusDays(5));
        req.setVenueName("Venue Pune");
        req.setVenueAddress("Address Pune");
        req.setCampusType(CampusType.OFF_CAMPUS);
        req.setMaxRegistrations(1); // Capacity is only 1!

        WalkInDrive drive = driveService.createDrive(req, company.getId(), employer.getId());
        drive.setApprovalStatus(DriveApprovalStatus.APPROVED);
        drive.setDriveStatus(DriveStatus.PUBLISHED);
        driveRepository.save(drive);

        // First application fills the drive
        applicationService.applyToDrive(drive.getId(), eligibleCandidateUser.getId());

        // Second applicant is rejected due to capacity limit
        assertThrows(BadRequestException.class, () -> {
            applicationService.applyToDrive(drive.getId(), ineligibleCandidateUser.getId());
        });
    }
}
