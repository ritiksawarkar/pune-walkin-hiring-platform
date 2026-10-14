package com.punewalkin.platform.admin.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Request body for administrator test email verification")
public class TestEmailRequest {

    @NotBlank(message = "Recipient email is required")
    @Email(message = "Invalid recipient email address format")
    @Schema(description = "Recipient email address to deliver verification message", example = "your.email@example.com")
    private String recipientEmail;

    @Schema(description = "Optional custom subject line", example = "Test Email from Pune Walk-In Platform")
    private String subject;

    @Schema(description = "Optional custom message note", example = "Testing live Google SMTP delivery")
    private String content;

    public TestEmailRequest() {}

    public TestEmailRequest(String recipientEmail, String subject, String content) {
        this.recipientEmail = recipientEmail;
        this.subject = subject;
        this.content = content;
    }

    public String getRecipientEmail() {
        return recipientEmail;
    }

    public void setRecipientEmail(String recipientEmail) {
        this.recipientEmail = recipientEmail;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
