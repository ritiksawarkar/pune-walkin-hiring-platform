package com.punewalkin.platform.interview;

import com.punewalkin.platform.common.dto.ApiResponse;
import com.punewalkin.platform.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/interviews")
@Tag(name = "Interviews & Passes", description = "Interview scheduling, confirmation, QR passes, and gate verification")
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    @PostMapping("/schedule")
    @PreAuthorize("hasAnyRole('EMPLOYER', 'ADMIN')")
    @Operation(summary = "Schedule or confirm an interview and generate secure QR access pass")
    public ResponseEntity<ApiResponse<InterviewPassResponse>> scheduleInterview(
            @Valid @RequestBody InterviewRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isAdmin = principal.getRole().name().equals("ADMIN");
        InterviewPassResponse response = interviewService.scheduleOrConfirmInterview(request, principal.getId(), isAdmin);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Interview confirmed and access pass generated successfully", response));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Get current candidate's confirmed interviews and entry passes")
    public ResponseEntity<ApiResponse<List<InterviewPassResponse>>> getMyInterviews(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<InterviewPassResponse> list = interviewService.getInterviewsForCandidate(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Candidate interviews fetched", list));
    }

    @GetMapping("/employer")
    @PreAuthorize("hasAnyRole('EMPLOYER', 'ADMIN')")
    @Operation(summary = "Get company's scheduled interviews")
    public ResponseEntity<ApiResponse<List<InterviewPassResponse>>> getEmployerInterviews(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<InterviewPassResponse> list = interviewService.getInterviewsForEmployer(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Employer interviews fetched", list));
    }

    @GetMapping("/{interviewId}/pass")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get access pass details and QR code for an interview")
    public ResponseEntity<ApiResponse<InterviewPassResponse>> getInterviewPass(
            @PathVariable String interviewId,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isAdmin = principal.getRole().name().equals("ADMIN");
        InterviewPassResponse pass = interviewService.getInterviewPass(interviewId, principal.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Interview pass fetched", pass));
    }

    @GetMapping("/passes/{passCode}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get pass details by unique pass code")
    public ResponseEntity<ApiResponse<InterviewPassResponse>> getPassByCode(@PathVariable String passCode) {
        InterviewPassResponse pass = interviewService.getPassByCode(passCode);
        return ResponseEntity.ok(ApiResponse.success("Pass details fetched", pass));
    }

    @PostMapping("/passes/{passCode}/verify")
    @PreAuthorize("hasAnyRole('EMPLOYER', 'ADMIN')")
    @Operation(summary = "Verify QR pass code and admit candidate at venue desk")
    public ResponseEntity<ApiResponse<PassVerificationResponse>> verifyAndAdmit(
            @PathVariable String passCode,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isAdmin = principal.getRole().name().equals("ADMIN");
        PassVerificationResponse response = interviewService.verifyAndAdmitPass(passCode, principal.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
    }

    @PostMapping("/{interviewId}/resend-email")
    @PreAuthorize("hasAnyRole('EMPLOYER', 'ADMIN')")
    @Operation(summary = "Resend or retry interview confirmation email")
    public ResponseEntity<ApiResponse<EmailService.EmailDeliveryResult>> resendConfirmationEmail(
            @PathVariable String interviewId,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isAdmin = principal.getRole().name().equals("ADMIN");
        EmailService.EmailDeliveryResult result = interviewService.retryInterviewConfirmationEmail(interviewId, principal.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success(result.getMessage() != null ? result.getMessage() : "Email dispatch attempted", result));
    }
}
