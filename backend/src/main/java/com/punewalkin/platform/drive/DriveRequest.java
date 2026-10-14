package com.punewalkin.platform.drive;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class DriveRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Drive date is required")
    private LocalDate driveDate;

    @NotBlank(message = "Start time is required")
    private String startTime;

    @NotBlank(message = "End time is required")
    private String endTime;

    @NotNull(message = "Registration deadline is required")
    private LocalDate registrationDeadline;

    @NotBlank(message = "Venue name is required")
    private String venueName;

    @NotBlank(message = "Venue address is required")
    private String venueAddress;

    private String city;
    private String state;
    private String pincode;

    @Min(value = 1)
    private Integer vacancies;

    @Min(value = 1)
    private Integer maxRegistrations;

    private String selectionRounds;
    private String requiredDocuments;
    private String recruiterName;
    private String recruiterEmail;
    private String recruiterPhone;
    private String candidateInstructions;

    // Campus classification and eligibility
    private CampusType campusType = CampusType.OFF_CAMPUS;
    private String eligibleDegree;
    private String eligibleBranch;
    private Integer eligibleGraduationYearMin;
    private Integer eligibleGraduationYearMax;
    private Double minCgpa;
    private Integer maxBacklogs;
    private java.util.List<String> eligibleColleges = new java.util.ArrayList<>();

    // Linked job ID
    @NotBlank(message = "Job ID is required")
    private String jobId;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getDriveDate() { return driveDate; }
    public void setDriveDate(LocalDate driveDate) { this.driveDate = driveDate; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public LocalDate getRegistrationDeadline() { return registrationDeadline; }
    public void setRegistrationDeadline(LocalDate registrationDeadline) { this.registrationDeadline = registrationDeadline; }

    public String getVenueName() { return venueName; }
    public void setVenueName(String venueName) { this.venueName = venueName; }

    public String getVenueAddress() { return venueAddress; }
    public void setVenueAddress(String venueAddress) { this.venueAddress = venueAddress; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public Integer getVacancies() { return vacancies; }
    public void setVacancies(Integer vacancies) { this.vacancies = vacancies; }

    public Integer getMaxRegistrations() { return maxRegistrations; }
    public void setMaxRegistrations(Integer maxRegistrations) { this.maxRegistrations = maxRegistrations; }

    public String getSelectionRounds() { return selectionRounds; }
    public void setSelectionRounds(String selectionRounds) { this.selectionRounds = selectionRounds; }

    public String getRequiredDocuments() { return requiredDocuments; }
    public void setRequiredDocuments(String requiredDocuments) { this.requiredDocuments = requiredDocuments; }

    public String getRecruiterName() { return recruiterName; }
    public void setRecruiterName(String recruiterName) { this.recruiterName = recruiterName; }

    public String getRecruiterEmail() { return recruiterEmail; }
    public void setRecruiterEmail(String recruiterEmail) { this.recruiterEmail = recruiterEmail; }

    public String getRecruiterPhone() { return recruiterPhone; }
    public void setRecruiterPhone(String recruiterPhone) { this.recruiterPhone = recruiterPhone; }

    public String getCandidateInstructions() { return candidateInstructions; }
    public void setCandidateInstructions(String candidateInstructions) { this.candidateInstructions = candidateInstructions; }

    public String getJobId() { return jobId; }
    public void setJobId(String jobId) { this.jobId = jobId; }

    public CampusType getCampusType() { return campusType; }
    public void setCampusType(CampusType campusType) { this.campusType = campusType; }

    public String getEligibleDegree() { return eligibleDegree; }
    public void setEligibleDegree(String eligibleDegree) { this.eligibleDegree = eligibleDegree; }

    public String getEligibleBranch() { return eligibleBranch; }
    public void setEligibleBranch(String eligibleBranch) { this.eligibleBranch = eligibleBranch; }

    public Integer getEligibleGraduationYearMin() { return eligibleGraduationYearMin; }
    public void setEligibleGraduationYearMin(Integer eligibleGraduationYearMin) { this.eligibleGraduationYearMin = eligibleGraduationYearMin; }

    public Integer getEligibleGraduationYearMax() { return eligibleGraduationYearMax; }
    public void setEligibleGraduationYearMax(Integer eligibleGraduationYearMax) { this.eligibleGraduationYearMax = eligibleGraduationYearMax; }

    public Double getMinCgpa() { return minCgpa; }
    public void setMinCgpa(Double minCgpa) { this.minCgpa = minCgpa; }

    public Integer getMaxBacklogs() { return maxBacklogs; }
    public void setMaxBacklogs(Integer maxBacklogs) { this.maxBacklogs = maxBacklogs; }

    public java.util.List<String> getEligibleColleges() { return eligibleColleges; }
    public void setEligibleColleges(java.util.List<String> eligibleColleges) { this.eligibleColleges = eligibleColleges; }
}
