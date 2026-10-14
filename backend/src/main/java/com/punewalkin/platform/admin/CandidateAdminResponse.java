package com.punewalkin.platform.admin;

import com.punewalkin.platform.candidate.CandidateProfile;
import com.punewalkin.platform.candidate.CandidateSkill;
import com.punewalkin.platform.user.User;

import java.time.LocalDateTime;
import java.util.List;

public class CandidateAdminResponse {

    private String userId;
    private String candidateProfileId;
    private String fullName;
    private String email;
    private String phone;
    private String collegeName;
    private String degree;
    private String branch;
    private String graduationYear;
    private Double cgpa;
    private Integer backlogs;
    private String accountStatus;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
    private LocalDateTime rejectedAt;
    private List<String> skills;

    public CandidateAdminResponse() {
    }

    public CandidateAdminResponse(User user, CandidateProfile profile) {
        this.userId = user.getId();
        this.fullName = user.getFullName();
        this.email = user.getEmail();
        this.accountStatus = user.getAccountStatus().name();
        this.rejectionReason = user.getRejectionReason();
        this.createdAt = user.getCreatedAt();
        this.approvedAt = user.getApprovedAt();
        this.rejectedAt = user.getRejectedAt();

        if (profile != null) {
            this.candidateProfileId = profile.getId();
            this.phone = profile.getPhone();
            this.collegeName = profile.getCollegeName();
            this.degree = profile.getDegree() != null ? profile.getDegree() : profile.getHighestQualification();
            this.branch = profile.getBranch();
            this.graduationYear = profile.getGraduationYear();
            this.cgpa = profile.getCgpa();
            this.backlogs = profile.getBacklogs();
            if (profile.getSkills() != null) {
                this.skills = profile.getSkills().stream().map(CandidateSkill::getSkillName).toList();
            }
        }
    }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getCandidateProfileId() { return candidateProfileId; }
    public void setCandidateProfileId(String candidateProfileId) { this.candidateProfileId = candidateProfileId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getCollegeName() { return collegeName; }
    public void setCollegeName(String collegeName) { this.collegeName = collegeName; }

    public String getDegree() { return degree; }
    public void setDegree(String degree) { this.degree = degree; }

    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }

    public String getGraduationYear() { return graduationYear; }
    public void setGraduationYear(String graduationYear) { this.graduationYear = graduationYear; }

    public Double getCgpa() { return cgpa; }
    public void setCgpa(Double cgpa) { this.cgpa = cgpa; }

    public Integer getBacklogs() { return backlogs; }
    public void setBacklogs(Integer backlogs) { this.backlogs = backlogs; }

    public String getAccountStatus() { return accountStatus; }
    public void setAccountStatus(String accountStatus) { this.accountStatus = accountStatus; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }

    public LocalDateTime getRejectedAt() { return rejectedAt; }
    public void setRejectedAt(LocalDateTime rejectedAt) { this.rejectedAt = rejectedAt; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }
}
