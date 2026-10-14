package com.punewalkin.platform.company;

import com.punewalkin.platform.user.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "companies")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Company {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employer_user_id", nullable = false)
    private User employer;

    @Column(name = "company_name", nullable = false, length = 200)
    private String companyName;

    private String tagline;

    @Column(name = "company_email", nullable = false, length = 150)
    private String companyEmail;

    private String phone;

    @Column(name = "alternate_contact")
    private String alternateContact;

    private String industry;
    private String website;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "headquarters_address")
    private String headquartersAddress;

    private String landmark;
    private String city = "Pune";
    private String state = "Maharashtra";
    private String pincode;

    @Column(name = "employee_size")
    private String employeeSize;

    @Column(name = "founded_year")
    private Integer foundedYear;

    @Column(name = "hr_contact_person")
    private String hrContactPerson;

    @Column(name = "hr_contact_role")
    private String hrContactRole;

    @Column(name = "active_locations", columnDefinition = "TEXT")
    private String activeLocations;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false, length = 30)
    private CompanyVerificationStatus verificationStatus = CompanyVerificationStatus.PENDING;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "verified_by", length = 36)
    private String verifiedBy;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Company() {
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

    public User getEmployer() {
        return employer;
    }

    public void setEmployer(User employer) {
        this.employer = employer;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getTagline() {
        return tagline;
    }

    public void setTagline(String tagline) {
        this.tagline = tagline;
    }

    public String getCompanyEmail() {
        return companyEmail;
    }

    public void setCompanyEmail(String companyEmail) {
        this.companyEmail = companyEmail;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAlternateContact() {
        return alternateContact;
    }

    public void setAlternateContact(String alternateContact) {
        this.alternateContact = alternateContact;
    }

    public String getIndustry() {
        return industry;
    }

    public void setIndustry(String industry) {
        this.industry = industry;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getHeadquartersAddress() {
        return headquartersAddress;
    }

    public void setHeadquartersAddress(String headquartersAddress) {
        this.headquartersAddress = headquartersAddress;
    }

    public String getLandmark() {
        return landmark;
    }

    public void setLandmark(String landmark) {
        this.landmark = landmark;
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

    public String getEmployeeSize() {
        return employeeSize;
    }

    public void setEmployeeSize(String employeeSize) {
        this.employeeSize = employeeSize;
    }

    public Integer getFoundedYear() {
        return foundedYear;
    }

    public void setFoundedYear(Integer foundedYear) {
        this.foundedYear = foundedYear;
    }

    public String getHrContactPerson() {
        return hrContactPerson;
    }

    public void setHrContactPerson(String hrContactPerson) {
        this.hrContactPerson = hrContactPerson;
    }

    public String getHrContactRole() {
        return hrContactRole;
    }

    public void setHrContactRole(String hrContactRole) {
        this.hrContactRole = hrContactRole;
    }

    public String getActiveLocations() {
        return activeLocations;
    }

    public void setActiveLocations(String activeLocations) {
        this.activeLocations = activeLocations;
    }

    public CompanyVerificationStatus getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(CompanyVerificationStatus verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
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
}
