package com.punewalkin.platform.candidate;

import com.punewalkin.platform.user.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "candidate_profiles")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class CandidateProfile {

    @Id
    @Column(length = 36)
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private String phone;
    private String city = "Pune";
    private String state = "Maharashtra";
    private String address;
    private String headline;

    @Column(columnDefinition = "TEXT")
    private String about;

    @Column(name = "highest_qualification")
    private String highestQualification;

    @Column(name = "college_name", length = 200)
    private String collegeName;

    @Column(length = 100)
    private String degree;

    @Column(length = 100)
    private String branch;

    @Column(name = "graduation_year", length = 10)
    private String graduationYear;

    private Double cgpa;

    private int backlogs = 0;

    private String aggregate;

    @Column(name = "is_fresher")
    private boolean isFresher = false;

    @Column(name = "experience_years")
    private Double experienceYears = 0.0;

    @Column(name = "current_designation")
    private String currentDesignation;

    @Column(name = "previous_company")
    private String previousCompany;

    @Column(name = "resume_file_name")
    private String resumeFileName;

    @Column(name = "resume_file_size")
    private String resumeFileSize;

    @Column(name = "resume_file_type")
    private String resumeFileType;

    @Column(name = "resume_uploaded_at")
    private LocalDateTime resumeUploadedAt;

    @OneToMany(mappedBy = "candidate", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<CandidateEducation> education = new ArrayList<>();

    @OneToMany(mappedBy = "candidate", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<CandidateSkill> skills = new ArrayList<>();

    @OneToMany(mappedBy = "candidate", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<CandidateExperience> experience = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public CandidateProfile() {
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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
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

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getHeadline() {
        return headline;
    }

    public void setHeadline(String headline) {
        this.headline = headline;
    }

    public String getAbout() {
        return about;
    }

    public void setAbout(String about) {
        this.about = about;
    }

    public String getHighestQualification() {
        return highestQualification;
    }

    public void setHighestQualification(String highestQualification) {
        this.highestQualification = highestQualification;
    }

    public String getAggregate() {
        return aggregate;
    }

    public void setAggregate(String aggregate) {
        this.aggregate = aggregate;
    }

    public boolean isFresher() {
        return isFresher;
    }

    public void setFresher(boolean fresher) {
        isFresher = fresher;
    }

    public Double getExperienceYears() {
        return experienceYears;
    }

    public void setExperienceYears(Double experienceYears) {
        this.experienceYears = experienceYears;
    }

    public String getCurrentDesignation() {
        return currentDesignation;
    }

    public void setCurrentDesignation(String currentDesignation) {
        this.currentDesignation = currentDesignation;
    }

    public String getPreviousCompany() {
        return previousCompany;
    }

    public void setPreviousCompany(String previousCompany) {
        this.previousCompany = previousCompany;
    }

    public String getResumeFileName() {
        return resumeFileName;
    }

    public void setResumeFileName(String resumeFileName) {
        this.resumeFileName = resumeFileName;
    }

    public String getResumeFileSize() {
        return resumeFileSize;
    }

    public void setResumeFileSize(String resumeFileSize) {
        this.resumeFileSize = resumeFileSize;
    }

    public String getResumeFileType() {
        return resumeFileType;
    }

    public void setResumeFileType(String resumeFileType) {
        this.resumeFileType = resumeFileType;
    }

    public LocalDateTime getResumeUploadedAt() {
        return resumeUploadedAt;
    }

    public void setResumeUploadedAt(LocalDateTime resumeUploadedAt) {
        this.resumeUploadedAt = resumeUploadedAt;
    }

    public List<CandidateEducation> getEducation() {
        return education;
    }

    public void setEducation(List<CandidateEducation> education) {
        this.education = education;
    }

    public List<CandidateSkill> getSkills() {
        return skills;
    }

    public void setSkills(List<CandidateSkill> skills) {
        this.skills = skills;
    }

    public List<CandidateExperience> getExperience() {
        return experience;
    }

    public void setExperience(List<CandidateExperience> experience) {
        this.experience = experience;
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

    public String getCollegeName() {
        return collegeName;
    }

    public void setCollegeName(String collegeName) {
        this.collegeName = collegeName;
    }

    public String getDegree() {
        return degree;
    }

    public void setDegree(String degree) {
        this.degree = degree;
    }

    public String getBranch() {
        return branch;
    }

    public void setBranch(String branch) {
        this.branch = branch;
    }

    public String getGraduationYear() {
        return graduationYear;
    }

    public void setGraduationYear(String graduationYear) {
        this.graduationYear = graduationYear;
    }

    public Double getCgpa() {
        return cgpa;
    }

    public void setCgpa(Double cgpa) {
        this.cgpa = cgpa;
    }

    public int getBacklogs() {
        return backlogs;
    }

    public void setBacklogs(int backlogs) {
        this.backlogs = backlogs;
    }
}
