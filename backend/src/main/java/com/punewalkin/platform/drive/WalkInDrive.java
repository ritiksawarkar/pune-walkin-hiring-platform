package com.punewalkin.platform.drive;

import com.punewalkin.platform.company.Company;
import com.punewalkin.platform.job.Job;
import com.punewalkin.platform.user.User;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "walk_in_drives")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class WalkInDrive {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "company_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "employer"})
    private Company company;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "job_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "company"})
    private Job job;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "created_by", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "passwordHash", "notifications"})
    private User createdBy;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "drive_date", nullable = false)
    private LocalDate driveDate;

    @Column(name = "start_time", nullable = false, length = 10)
    private String startTime;

    @Column(name = "end_time", nullable = false, length = 10)
    private String endTime;

    @Column(name = "registration_deadline", nullable = false)
    private LocalDate registrationDeadline;

    @Column(name = "venue_name", nullable = false, length = 200)
    private String venueName;

    @Column(name = "venue_address", nullable = false)
    private String venueAddress;

    private String city = "Pune";
    private String state = "Maharashtra";
    private String pincode;

    private int vacancies = 1;

    @Column(name = "max_registrations")
    private int maxRegistrations = 100;

    @Column(name = "registered_count")
    private int registeredCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "campus_type", nullable = false, length = 30)
    private CampusType campusType = CampusType.OFF_CAMPUS;

    @Column(name = "eligible_degree", length = 150)
    private String eligibleDegree;

    @Column(name = "eligible_branch", length = 150)
    private String eligibleBranch;

    @Column(name = "eligible_graduation_year_min")
    private Integer eligibleGraduationYearMin;

    @Column(name = "eligible_graduation_year_max")
    private Integer eligibleGraduationYearMax;

    @Column(name = "min_cgpa")
    private Double minCgpa;

    @Column(name = "max_backlogs")
    private Integer maxBacklogs;

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "drive"})
    @OneToMany(mappedBy = "drive", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private java.util.List<DriveEligibleCollege> eligibleColleges = new java.util.ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", nullable = false, length = 30)
    private DriveApprovalStatus approvalStatus = DriveApprovalStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "drive_status", nullable = false, length = 30)
    private DriveStatus driveStatus = DriveStatus.DRAFT;

    @Column(name = "admin_feedback", columnDefinition = "TEXT")
    private String adminFeedback;

    @Column(name = "selection_rounds", columnDefinition = "TEXT")
    private String selectionRounds;

    @Column(name = "required_documents", columnDefinition = "TEXT")
    private String requiredDocuments;

    @Column(name = "recruiter_name")
    private String recruiterName;

    @Column(name = "recruiter_email")
    private String recruiterEmail;

    @Column(name = "recruiter_phone")
    private String recruiterPhone;

    @Column(name = "candidate_instructions", columnDefinition = "TEXT")
    private String candidateInstructions;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public WalkInDrive() {
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Company getCompany() {
        return company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }

    public Job getJob() {
        return job;
    }

    public void setJob(Job job) {
        this.job = job;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getDriveDate() {
        return driveDate;
    }

    public void setDriveDate(LocalDate driveDate) {
        this.driveDate = driveDate;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }

    public LocalDate getRegistrationDeadline() {
        return registrationDeadline;
    }

    public void setRegistrationDeadline(LocalDate registrationDeadline) {
        this.registrationDeadline = registrationDeadline;
    }

    public String getVenueName() {
        return venueName;
    }

    public void setVenueName(String venueName) {
        this.venueName = venueName;
    }

    public String getVenueAddress() {
        return venueAddress;
    }

    public void setVenueAddress(String venueAddress) {
        this.venueAddress = venueAddress;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public int getVacancies() {
        return vacancies;
    }

    public void setVacancies(int vacancies) {
        this.vacancies = vacancies;
    }

    public int getMaxRegistrations() {
        return maxRegistrations;
    }

    public void setMaxRegistrations(int maxRegistrations) {
        this.maxRegistrations = maxRegistrations;
    }

    public int getRegisteredCount() {
        return registeredCount;
    }

    public void setRegisteredCount(int registeredCount) {
        this.registeredCount = registeredCount;
    }

    public DriveApprovalStatus getApprovalStatus() {
        return approvalStatus;
    }

    public void setApprovalStatus(DriveApprovalStatus approvalStatus) {
        this.approvalStatus = approvalStatus;
    }

    public DriveStatus getDriveStatus() {
        return driveStatus;
    }

    public void setDriveStatus(DriveStatus driveStatus) {
        this.driveStatus = driveStatus;
    }

    public String getAdminFeedback() {
        return adminFeedback;
    }

    public void setAdminFeedback(String adminFeedback) {
        this.adminFeedback = adminFeedback;
    }

    public String getSelectionRounds() {
        return selectionRounds;
    }

    public void setSelectionRounds(String selectionRounds) {
        this.selectionRounds = selectionRounds;
    }

    public String getRequiredDocuments() {
        return requiredDocuments;
    }

    public void setRequiredDocuments(String requiredDocuments) {
        this.requiredDocuments = requiredDocuments;
    }

    public String getRecruiterName() {
        return recruiterName;
    }

    public void setRecruiterName(String recruiterName) {
        this.recruiterName = recruiterName;
    }

    public String getRecruiterEmail() {
        return recruiterEmail;
    }

    public void setRecruiterEmail(String recruiterEmail) {
        this.recruiterEmail = recruiterEmail;
    }

    public String getRecruiterPhone() {
        return recruiterPhone;
    }

    public void setRecruiterPhone(String recruiterPhone) {
        this.recruiterPhone = recruiterPhone;
    }

    public String getCandidateInstructions() {
        return candidateInstructions;
    }

    public void setCandidateInstructions(String candidateInstructions) {
        this.candidateInstructions = candidateInstructions;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public LocalDateTime getApprovedAt() {
        return approvedAt;
    }

    public void setApprovedAt(LocalDateTime approvedAt) {
        this.approvedAt = approvedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public CampusType getCampusType() {
        return campusType;
    }

    public void setCampusType(CampusType campusType) {
        this.campusType = campusType;
    }

    public String getEligibleDegree() {
        return eligibleDegree;
    }

    public void setEligibleDegree(String eligibleDegree) {
        this.eligibleDegree = eligibleDegree;
    }

    public String getEligibleBranch() {
        return eligibleBranch;
    }

    public void setEligibleBranch(String eligibleBranch) {
        this.eligibleBranch = eligibleBranch;
    }

    public Integer getEligibleGraduationYearMin() {
        return eligibleGraduationYearMin;
    }

    public void setEligibleGraduationYearMin(Integer eligibleGraduationYearMin) {
        this.eligibleGraduationYearMin = eligibleGraduationYearMin;
    }

    public Integer getEligibleGraduationYearMax() {
        return eligibleGraduationYearMax;
    }

    public void setEligibleGraduationYearMax(Integer eligibleGraduationYearMax) {
        this.eligibleGraduationYearMax = eligibleGraduationYearMax;
    }

    public Double getMinCgpa() {
        return minCgpa;
    }

    public void setMinCgpa(Double minCgpa) {
        this.minCgpa = minCgpa;
    }

    public Integer getMaxBacklogs() {
        return maxBacklogs;
    }

    public void setMaxBacklogs(Integer maxBacklogs) {
        this.maxBacklogs = maxBacklogs;
    }

    public java.util.List<DriveEligibleCollege> getEligibleColleges() {
        try {
            if (eligibleColleges != null) {
                eligibleColleges.size();
                return eligibleColleges;
            }
        } catch (Exception ignored) {
            return java.util.Collections.emptyList();
        }
        return eligibleColleges != null ? eligibleColleges : java.util.Collections.emptyList();
    }

    public void setEligibleColleges(java.util.List<DriveEligibleCollege> eligibleColleges) {
        this.eligibleColleges = eligibleColleges;
    }
}
