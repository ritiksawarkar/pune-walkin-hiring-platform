package com.punewalkin.platform.application;

import com.punewalkin.platform.common.dto.ApiResponse;
import com.punewalkin.platform.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@Tag(name = "Applications", description = "Drive application management")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    // ---- CANDIDATE ENDPOINTS ----

    @PostMapping("/api/v1/candidate/drives/{driveId}/apply")
    @PreAuthorize("hasRole('CANDIDATE')")
    @org.springframework.transaction.annotation.Transactional
    @Operation(summary = "Apply to a walk-in drive (Candidate)")
    public ResponseEntity<ApiResponse<Application>> applyToDrive(
            @PathVariable String driveId,
            @AuthenticationPrincipal UserPrincipal principal) {
        Application app = applicationService.applyToDrive(driveId, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Application submitted successfully", app));
    }

    @GetMapping("/api/v1/candidate/applications")
    @PreAuthorize("hasRole('CANDIDATE')")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    @Operation(summary = "Get all applications for current candidate")
    public ResponseEntity<ApiResponse<Page<Application>>> getMyApplications(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<Application> apps = applicationService.getApplicationsByCandidate(
                principal.getId(), PageRequest.of(page, size, Sort.by("appliedAt").descending()));
        return ResponseEntity.ok(ApiResponse.success("Applications fetched", apps));
    }

    @PostMapping("/api/v1/candidate/applications/{applicationId}/withdraw")
    @PreAuthorize("hasRole('CANDIDATE')")
    @org.springframework.transaction.annotation.Transactional
    @Operation(summary = "Withdraw an application (Candidate)")
    public ResponseEntity<ApiResponse<Application>> withdrawApplication(
            @PathVariable String applicationId,
            @AuthenticationPrincipal UserPrincipal principal) {
        Application app = applicationService.withdrawApplication(applicationId, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Application withdrawn", app));
    }

    @GetMapping("/api/v1/candidate/applications/{applicationId}")
    @PreAuthorize("hasAnyRole('CANDIDATE', 'EMPLOYER', 'ADMIN')")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    @Operation(summary = "Get a specific application by ID")
    public ResponseEntity<ApiResponse<Application>> getApplication(@PathVariable String applicationId) {
        Application app = applicationService.getApplicationById(applicationId);
        return ResponseEntity.ok(ApiResponse.success("Application fetched", app));
    }

    // ---- EMPLOYER ENDPOINTS ----

    @GetMapping("/api/v1/employer/drives/{driveId}/applications")
    @PreAuthorize("hasAnyRole('EMPLOYER', 'ADMIN')")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    @Operation(summary = "List applications for a drive (Employer)")
    public ResponseEntity<ApiResponse<Page<Application>>> getApplicationsForDrive(
            @PathVariable String driveId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<Application> apps = applicationService.getApplicationsByDrive(
                driveId, PageRequest.of(page, size, Sort.by("appliedAt").descending()));
        return ResponseEntity.ok(ApiResponse.success("Applications fetched", apps));
    }

    @GetMapping("/api/v1/employer/companies/{companyId}/applications")
    @PreAuthorize("hasAnyRole('EMPLOYER', 'ADMIN')")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    @Operation(summary = "List all applications for a company (Employer)")
    public ResponseEntity<ApiResponse<Page<Application>>> getApplicationsForCompany(
            @PathVariable String companyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<Application> apps = applicationService.getApplicationsByCompany(
                companyId, PageRequest.of(page, size, Sort.by("appliedAt").descending()));
        return ResponseEntity.ok(ApiResponse.success("Applications fetched", apps));
    }

    @PatchMapping("/api/v1/employer/applications/{applicationId}/status")
    @PreAuthorize("hasAnyRole('EMPLOYER', 'ADMIN')")
    @org.springframework.transaction.annotation.Transactional
    @Operation(summary = "Update application status (Employer/Admin)")
    public ResponseEntity<ApiResponse<Application>> updateStatus(
            @PathVariable String applicationId,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        ApplicationStatus status = ApplicationStatus.valueOf((String) body.get("status"));
        String notes = (String) body.get("reviewerNotes");
        Double rating = body.get("rating") != null
                ? Double.parseDouble(body.get("rating").toString()) : null;
        Application app = applicationService.updateApplicationStatus(
                applicationId, status, notes, rating, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Application status updated", app));
    }

    // ---- ADMIN ENDPOINTS ----

    @GetMapping("/api/v1/admin/applications")
    @PreAuthorize("hasRole('ADMIN')")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    @Operation(summary = "List all applications (Admin)")
    public ResponseEntity<ApiResponse<Page<Application>>> getAllApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<Application> apps = applicationService.getAllApplications(
                PageRequest.of(page, size, Sort.by("appliedAt").descending()));
        return ResponseEntity.ok(ApiResponse.success("Applications fetched", apps));
    }
}
