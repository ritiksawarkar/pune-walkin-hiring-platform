package com.punewalkin.platform.interview;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class InterviewRequest {

    @NotBlank(message = "Application ID is required")
    private String applicationId;

    @NotNull(message = "Scheduled interview time is required")
    private LocalDateTime scheduledAt;

    private LocalDateTime endAt;

    private String venueOrLocation;

    private String interviewType = "In-Person Walk-In";

    private String meetingLink;

    private String instructions;

    private String reportingInstructions;

    public InterviewRequest() {}

    public String getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(String applicationId) {
        this.applicationId = applicationId;
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

    public String getVenueOrLocation() {
        return venueOrLocation;
    }

    public void setVenueOrLocation(String venueOrLocation) {
        this.venueOrLocation = venueOrLocation;
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

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public String getReportingInstructions() {
        return reportingInstructions;
    }

    public void setReportingInstructions(String reportingInstructions) {
        this.reportingInstructions = reportingInstructions;
    }
}
