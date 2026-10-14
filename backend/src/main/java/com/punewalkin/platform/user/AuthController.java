package com.punewalkin.platform.user;

import com.punewalkin.platform.common.dto.ApiResponse;
import com.punewalkin.platform.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "User registration and login endpoints")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user (CANDIDATE or EMPLOYER)")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response.getMessage() != null ? response.getMessage() : "Registration successful", response));
    }

    @PostMapping("/register/candidate")
    @Operation(summary = "Register a new Candidate with profile and college information")
    public ResponseEntity<ApiResponse<AuthResponse>> registerCandidate(@Valid @RequestBody CandidateRegisterRequest request) {
        AuthResponse response = authService.registerCandidate(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Candidate registration submitted for administrator approval.", response));
    }

    @PostMapping("/register/employer")
    @Operation(summary = "Register a new Employer with company details")
    public ResponseEntity<ApiResponse<AuthResponse>> registerEmployer(@Valid @RequestBody EmployerRegisterRequest request) {
        AuthResponse response = authService.registerEmployer(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Employer registration submitted for administrator verification.", response));
    }

    @PostMapping("/login")
    @Operation(summary = "Login and receive a JWT token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> me(@AuthenticationPrincipal UserPrincipal principal) {
        UserProfileResponse profile = authService.getProfile(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Profile fetched", profile));
    }
}
