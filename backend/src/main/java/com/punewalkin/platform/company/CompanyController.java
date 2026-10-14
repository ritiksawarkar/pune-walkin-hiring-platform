package com.punewalkin.platform.company;

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
@Tag(name = "Companies", description = "Company registration and management")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    // ---- EMPLOYER ENDPOINTS ----

    @PostMapping("/api/v1/employer/companies")
    @PreAuthorize("hasRole('EMPLOYER')")
    @Operation(summary = "Register a new company (Employer)")
    public ResponseEntity<ApiResponse<Company>> createCompany(
            @Valid @RequestBody CompanyRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        Company company = companyService.createCompany(request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Company registered successfully", company));
    }

    @GetMapping("/api/v1/employer/companies/mine")
    @PreAuthorize("hasAnyRole('EMPLOYER', 'ADMIN')")
    @Operation(summary = "Get my company (Employer)")
    public ResponseEntity<ApiResponse<Company>> getMyCompany(@AuthenticationPrincipal UserPrincipal principal) {
        Company company = companyService.getCompanyByEmployerId(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Company fetched", company));
    }

    @PutMapping("/api/v1/employer/companies/{companyId}")
    @PreAuthorize("hasAnyRole('EMPLOYER', 'ADMIN')")
    @Operation(summary = "Update company details")
    public ResponseEntity<ApiResponse<Company>> updateCompany(
            @PathVariable String companyId,
            @Valid @RequestBody CompanyRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isAdmin = principal.getRole().name().equals("ADMIN");
        Company company = companyService.updateCompany(companyId, request, principal.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Company updated", company));
    }

    // ---- PUBLIC ENDPOINTS ----

    @GetMapping("/api/v1/public/companies/{companyId}")
    @Operation(summary = "Get company by ID (public)")
    public ResponseEntity<ApiResponse<Company>> getCompanyPublic(@PathVariable String companyId) {
        Company company = companyService.getCompanyById(companyId);
        return ResponseEntity.ok(ApiResponse.success("Company fetched", company));
    }

    // ---- ADMIN ENDPOINTS ----

    @GetMapping("/api/v1/admin/companies")
    @PreAuthorize("hasRole('ADMIN')")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    @Operation(summary = "List all companies with optional status filter (Admin)")
    public ResponseEntity<ApiResponse<Page<Company>>> getAllCompanies(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Company> companies;
        if (status != null && !status.equalsIgnoreCase("ALL") && !status.trim().isEmpty()) {
            CompanyVerificationStatus vs = CompanyVerificationStatus.valueOf(status.toUpperCase());
            companies = companyService.getCompaniesByStatus(vs, pageable);
        } else {
            companies = companyService.getAllCompanies(pageable);
        }
        return ResponseEntity.ok(ApiResponse.success("Companies fetched", companies));
    }

    @PatchMapping("/api/v1/admin/companies/{companyId}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Verify or reject a company (Admin)")
    public ResponseEntity<ApiResponse<Company>> verifyCompany(
            @PathVariable String companyId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean approve = "APPROVED".equalsIgnoreCase(body.get("action")) || "VERIFIED".equalsIgnoreCase(body.get("action"));
        String reason = body.get("reason");
        Company company = companyService.verifyCompany(companyId, approve, reason, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Company verification updated", company));
    }

    @DeleteMapping("/api/v1/admin/companies/{companyId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a company (Admin)")
    public ResponseEntity<ApiResponse<Void>> deleteCompany(
            @PathVariable String companyId,
            @AuthenticationPrincipal UserPrincipal principal) {
        companyService.deleteCompany(companyId, principal.getId(), true);
        return ResponseEntity.ok(ApiResponse.success("Company deleted"));
    }
}
