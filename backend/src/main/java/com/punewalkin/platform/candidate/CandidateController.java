package com.punewalkin.platform.candidate;

import com.punewalkin.platform.common.dto.ApiResponse;
import com.punewalkin.platform.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@Tag(name = "Candidates", description = "Candidate profile management")
public class CandidateController {

    private final CandidateService candidateService;

    public CandidateController(CandidateService candidateService) {
        this.candidateService = candidateService;
    }

    // ---- CANDIDATE ENDPOINTS ----

    @GetMapping("/api/v1/candidate/profile")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Get current candidate's profile")
    public ResponseEntity<ApiResponse<CandidateProfile>> getMyProfile(
            @AuthenticationPrincipal UserPrincipal principal) {
        CandidateProfile profile = candidateService.getProfileByUserId(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Profile fetched", profile));
    }

    @PutMapping("/api/v1/candidate/profile")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Update candidate profile (full or partial)")
    public ResponseEntity<ApiResponse<CandidateProfile>> updateMyProfile(
            @RequestBody CandidateProfileRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        CandidateProfile profile = candidateService.updateProfile(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", profile));
    }

    // ---- ADMIN ENDPOINTS ----

    @GetMapping("/api/v1/admin/candidate-profiles")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all candidate profiles (Admin)")
    public ResponseEntity<ApiResponse<Page<CandidateProfile>>> getAllCandidates(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<CandidateProfile> profiles = candidateService.getAllProfiles(
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success("Candidates fetched", profiles));
    }

    @GetMapping("/api/v1/admin/candidate-profiles/{profileId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get a candidate profile by ID (Admin)")
    public ResponseEntity<ApiResponse<CandidateProfile>> getCandidateById(@PathVariable String profileId) {
        CandidateProfile profile = candidateService.getProfileById(profileId);
        return ResponseEntity.ok(ApiResponse.success("Candidate fetched", profile));
    }
}
