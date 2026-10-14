package com.punewalkin.platform.interview;

import java.time.LocalDateTime;

public class PassVerificationResponse {

    private boolean valid;
    private String message;
    private String passCode;
    private String status;
    private String candidateName;
    private String candidateEmail;
    private String companyName;
    private String driveTitle;
    private String tokenNumber;
    private LocalDateTime scheduledAt;
    private LocalDateTime admittedAt;
    private String admittedBy;

    public PassVerificationResponse() {}

    public static PassVerificationResponse success(InterviewPass pass, String verifierName) {
        PassVerificationResponse resp = new PassVerificationResponse();
        resp.setValid(true);
        resp.setMessage("Access pass verified and candidate admitted successfully.");
        resp.setPassCode(pass.getPassCode());
        resp.setStatus(pass.getStatus().name());
        resp.setAdmittedAt(pass.getUsedAt());
        resp.setAdmittedBy(verifierName);

        if (pass.getCandidate() != null && pass.getCandidate().getUser() != null) {
            resp.setCandidateName(pass.getCandidate().getUser().getFullName());
            resp.setCandidateEmail(pass.getCandidate().getUser().getEmail());
        }
        if (pass.getCompany() != null) {
            resp.setCompanyName(pass.getCompany().getCompanyName());
        }
        if (pass.getDrive() != null) {
            resp.setDriveTitle(pass.getDrive().getTitle());
        }
        if (pass.getApplication() != null) {
            resp.setTokenNumber(pass.getApplication().getTokenNumber());
        }
        if (pass.getInterview() != null) {
            resp.setScheduledAt(pass.getInterview().getScheduledAt());
        }
        return resp;
    }

    public static PassVerificationResponse invalid(String message, String passCode, String status) {
        PassVerificationResponse resp = new PassVerificationResponse();
        resp.setValid(false);
        resp.setMessage(message);
        resp.setPassCode(passCode);
        resp.setStatus(status);
        return resp;
    }

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
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

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getDriveTitle() {
        return driveTitle;
    }

    public void setDriveTitle(String driveTitle) {
        this.driveTitle = driveTitle;
    }

    public String getTokenNumber() {
        return tokenNumber;
    }

    public void setTokenNumber(String tokenNumber) {
        this.tokenNumber = tokenNumber;
    }

    public LocalDateTime getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(LocalDateTime scheduledAt) {
        this.scheduledAt = scheduledAt;
    }

    public LocalDateTime getAdmittedAt() {
        return admittedAt;
    }

    public void setAdmittedAt(LocalDateTime admittedAt) {
        this.admittedAt = admittedAt;
    }

    public String getAdmittedBy() {
        return admittedBy;
    }

    public void setAdmittedBy(String admittedBy) {
        this.admittedBy = admittedBy;
    }
}
