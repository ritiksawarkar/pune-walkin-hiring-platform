package com.punewalkin.platform.interview;

import java.time.LocalDateTime;

public class InterviewPassResponse {

    private String passId;
    private String passCode;
    private String status;
    private String qrPayload;
    private String qrBase64;
    private String interviewId;
    private String applicationId;
    private String tokenNumber;
    private String candidateId;
    private String candidateName;
    private String candidateEmail;
    private String candidatePhone;
    private String companyId;
    private String companyName;
    private String driveId;
    private String driveTitle;
    private String jobTitle;
    private LocalDateTime scheduledAt;
    private LocalDateTime endAt;
    private String venue;
    private String interviewType;
    private String meetingLink;
    private String reportingInstructions;
    private LocalDateTime usedAt;
    private String verifiedBy;
    private LocalDateTime verifiedAt;

    public InterviewPassResponse() {}

    public InterviewPassResponse(InterviewPass pass, Interview interview, String qrBase64) {
        if (pass != null) {
            this.passId = pass.getId();
            this.passCode = pass.getPassCode();
            this.status = pass.getStatus().name();
            this.qrPayload = pass.getQrPayload();
            this.usedAt = pass.getUsedAt();
            this.verifiedBy = pass.getVerifiedBy();
            this.verifiedAt = pass.getVerifiedAt();
        }
        this.qrBase64 = qrBase64;
        if (interview != null) {
            this.interviewId = interview.getId();
            this.scheduledAt = interview.getScheduledAt();
            this.endAt = interview.getEndAt();
            this.venue = interview.getVenueOrLocation();
            this.interviewType = interview.getInterviewType();
            this.meetingLink = interview.getMeetingLink();
            this.reportingInstructions = interview.getReportingInstructions() != null
                    ? interview.getReportingInstructions()
                    : interview.getInstructions();

            if (interview.getApplication() != null) {
                this.applicationId = interview.getApplication().getId();
                this.tokenNumber = interview.getApplication().getTokenNumber();
                if (interview.getApplication().getJob() != null) {
                    this.jobTitle = interview.getApplication().getJob().getTitle();
                }
            }
            if (interview.getCandidate() != null) {
                this.candidateId = interview.getCandidate().getId();
                if (interview.getCandidate().getUser() != null) {
                    this.candidateName = interview.getCandidate().getUser().getFullName();
                    this.candidateEmail = interview.getCandidate().getUser().getEmail();
                }
                this.candidatePhone = interview.getCandidate().getPhone();
            }
            if (interview.getCompany() != null) {
                this.companyId = interview.getCompany().getId();
                this.companyName = interview.getCompany().getCompanyName();
            }
            if (interview.getDrive() != null) {
                this.driveId = interview.getDrive().getId();
                this.driveTitle = interview.getDrive().getTitle();
                if (this.venue == null || this.venue.trim().isEmpty()) {
                    this.venue = interview.getDrive().getVenueName() + ", " + interview.getDrive().getVenueAddress();
                }
            }
        }
    }

    public String getPassId() {
        return passId;
    }

    public void setPassId(String passId) {
        this.passId = passId;
    }

    public String getPassCode() {
        return passCode;
    }

    public void setPassCode(String passCode) {
        this.passCode = passCode;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getQrPayload() {
        return qrPayload;
    }

    public void setQrPayload(String qrPayload) {
        this.qrPayload = qrPayload;
    }

    public String getQrBase64() {
        return qrBase64;
    }

    public void setQrBase64(String qrBase64) {
        this.qrBase64 = qrBase64;
    }

    public String getInterviewId() {
        return interviewId;
    }

    public void setInterviewId(String interviewId) {
        this.interviewId = interviewId;
    }

    public String getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(String applicationId) {
        this.applicationId = applicationId;
    }

    public String getTokenNumber() {
        return tokenNumber;
    }

    public void setTokenNumber(String tokenNumber) {
        this.tokenNumber = tokenNumber;
    }

    public String getCandidateId() {
        return candidateId;
    }

    public void setCandidateId(String candidateId) {
        this.candidateId = candidateId;
    }

    public String getCandidateName() {
        return candidateName;
    }

    public void setCandidateName(String candidateName) {
        this.candidateName = candidateName;
    }

    public String getCandidateEmail() {
        return candidateEmail;
    }

    public void setCandidateEmail(String candidateEmail) {
        this.candidateEmail = candidateEmail;
    }

    public String getCandidatePhone() {
        return candidatePhone;
    }

    public void setCandidatePhone(String candidatePhone) {
        this.candidatePhone = candidatePhone;
    }

    public String getCompanyId() {
        return companyId;
    }

    public void setCompanyId(String companyId) {
        this.companyId = companyId;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getDriveId() {
        return driveId;
    }

    public void setDriveId(String driveId) {
        this.driveId = driveId;
    }

    public String getDriveTitle() {
        return driveTitle;
    }

    public void setDriveTitle(String driveTitle) {
        this.driveTitle = driveTitle;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public LocalDateTime getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(LocalDateTime scheduledAt) {
        this.scheduledAt = scheduledAt;
    }

    public LocalDateTime getEndAt() {
        return endAt;
    }

    public void setEndAt(LocalDateTime endAt) {
        this.endAt = endAt;
    }

    public String getVenue() {
        return venue;
    }

    public void setVenue(String venue) {
        this.venue = venue;
    }

    public String getInterviewType() {
        return interviewType;
    }

    public void setInterviewType(String interviewType) {
        this.interviewType = interviewType;
    }

    public String getMeetingLink() {
        return meetingLink;
    }

    public void setMeetingLink(String meetingLink) {
        this.meetingLink = meetingLink;
    }

    public String getReportingInstructions() {
        return reportingInstructions;
    }

    public void setReportingInstructions(String reportingInstructions) {
        this.reportingInstructions = reportingInstructions;
    }

    public LocalDateTime getUsedAt() {
        return usedAt;
    }

    public void setUsedAt(LocalDateTime usedAt) {
        this.usedAt = usedAt;
    }

    public String getVerifiedBy() {
        return verifiedBy;
    }

    public void setVerifiedBy(String verifiedBy) {
        this.verifiedBy = verifiedBy;
    }

    public LocalDateTime getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(LocalDateTime verifiedAt) {
        this.verifiedAt = verifiedAt;
    }
}
