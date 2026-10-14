package com.punewalkin.platform.drive;

import com.punewalkin.platform.common.dto.ApiResponse;
import com.punewalkin.platform.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
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
@Tag(name = "Walk-In Drives", description = "Walk-in drive management")
public class DriveController {

    private final DriveService driveService;

    public DriveController(DriveService driveService) {
        this.driveService = driveService;
    }

    // ---- PUBLIC ENDPOINTS ----

    @GetMapping("/api/v1/drives")
    @Operation(summary = "List/search published drives with optional campusType filter (public)")
    public ResponseEntity<ApiResponse<Page<WalkInDrive>>> listDrives(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) CampusType campusType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<WalkInDrive> drives = driveService.searchPublishedDrives(
                search, campusType, PageRequest.of(page, size, Sort.by("driveDate").ascending()));
        return ResponseEntity.ok(ApiResponse.success("Drives fetched", drives));
    }

    @GetMapping("/api/v1/drives/on-campus")
    @Operation(summary = "List published on-campus drives (public)")
    public ResponseEntity<ApiResponse<Page<WalkInDrive>>> listOnCampusDrives(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<WalkInDrive> drives = driveService.searchPublishedDrives(
                search, CampusType.ON_CAMPUS, PageRequest.of(page, size, Sort.by("driveDate").ascending()));
        return ResponseEntity.ok(ApiResponse.success("On-Campus drives fetched", drives));
    }

    @GetMapping("/api/v1/drives/off-campus")
    @Operation(summary = "List published off-campus drives (public)")
    public ResponseEntity<ApiResponse<Page<WalkInDrive>>> listOffCampusDrives(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<WalkInDrive> drives = driveService.searchPublishedDrives(
                search, CampusType.OFF_CAMPUS, PageRequest.of(page, size, Sort.by("driveDate").ascending()));
        return ResponseEntity.ok(ApiResponse.success("Off-Campus drives fetched", drives));
    }

    @GetMapping("/api/v1/drives/{driveId}")
    @Operation(summary = "Get drive details (public)")
    public ResponseEntity<ApiResponse<WalkInDrive>> getDrive(@PathVariable String driveId) {
        WalkInDrive drive = driveService.getDriveById(driveId);
        return ResponseEntity.ok(ApiResponse.success("Drive fetched", drive));
    }

    // ---- EMPLOYER ENDPOINTS ----

    @PostMapping("/api/v1/employer/companies/{companyId}/drives")
    @PreAuthorize("hasAnyRole('EMPLOYER', 'ADMIN')")
    @Operation(summary = "Create a walk-in drive (Employer)")
    public ResponseEntity<ApiResponse<WalkInDrive>> createDrive(
            @PathVariable String companyId,
            @Valid @RequestBody DriveRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        WalkInDrive drive = driveService.createDrive(request, companyId, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Drive created", drive));
    }

    @PutMapping("/api/v1/employer/drives/{driveId}")
    @PreAuthorize("hasAnyRole('EMPLOYER', 'ADMIN')")
    @Operation(summary = "Update drive details (Employer)")
    public ResponseEntity<ApiResponse<WalkInDrive>> updateDrive(
            @PathVariable String driveId,
            @Valid @RequestBody DriveRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isAdmin = principal.getRole().name().equals("ADMIN");
        WalkInDrive drive = driveService.updateDrive(driveId, request, principal.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Drive updated", drive));
    }

    @GetMapping("/api/v1/employer/companies/{companyId}/drives")
    @PreAuthorize("hasAnyRole('EMPLOYER', 'ADMIN')")
    @Operation(summary = "Get drives for a company with optional campusType filter (Employer)")
    public ResponseEntity<ApiResponse<Page<WalkInDrive>>> getDrivesForCompany(
            @PathVariable String companyId,
            @RequestParam(required = false) CampusType campusType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<WalkInDrive> drives = driveService.getDrivesByCompanyAndCampusType(
                companyId, campusType, PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success("Drives fetched", drives));
    }

    @PostMapping("/api/v1/employer/drives/{driveId}/submit")
    @PreAuthorize("hasRole('EMPLOYER')")
    @Operation(summary = "Submit drive for admin approval (Employer)")
    public ResponseEntity<ApiResponse<WalkInDrive>> submitDrive(
            @PathVariable String driveId,
            @AuthenticationPrincipal UserPrincipal principal) {
        WalkInDrive drive = driveService.submitForApproval(driveId, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Drive submitted for approval", drive));
    }

    @DeleteMapping("/api/v1/employer/drives/{driveId}")
    @PreAuthorize("hasAnyRole('EMPLOYER', 'ADMIN')")
    @Operation(summary = "Delete a drive (Employer/Admin)")
    public ResponseEntity<ApiResponse<Void>> deleteDrive(
            @PathVariable String driveId,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isAdmin = principal.getRole().name().equals("ADMIN");
        driveService.deleteDrive(driveId, principal.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Drive deleted"));
    }
}
