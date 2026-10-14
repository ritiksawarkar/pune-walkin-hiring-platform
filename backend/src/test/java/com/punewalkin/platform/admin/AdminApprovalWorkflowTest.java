package com.punewalkin.platform.admin;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.punewalkin.platform.candidate.CandidateProfile;
import com.punewalkin.platform.candidate.CandidateProfileRepository;
import com.punewalkin.platform.company.Company;
import com.punewalkin.platform.company.CompanyRepository;
import com.punewalkin.platform.company.CompanyVerificationStatus;
import com.punewalkin.platform.security.JwtTokenProvider;
import com.punewalkin.platform.security.UserPrincipal;
import com.punewalkin.platform.user.AccountStatus;
import com.punewalkin.platform.user.Role;
import com.punewalkin.platform.user.User;
import com.punewalkin.platform.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AdminApprovalWorkflowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CandidateProfileRepository candidateProfileRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private User admin;
    private String adminToken;
    private User candidateUser;
    private String candidateToken;
    private User pendingEmployer;
    private Company pendingCompany;

    @BeforeEach
    void setUp() {
        companyRepository.deleteAll();
        candidateProfileRepository.deleteAll();
        userRepository.deleteAll();

        // Admin
        admin = new User(UUID.randomUUID().toString(), "Platform Admin", "admin@platform.gov.in",
                passwordEncoder.encode("Admin@123"), Role.ADMIN, AccountStatus.APPROVED);
        userRepository.save(admin);
        UserPrincipal adminPrinc = UserPrincipal.create(admin);
        adminToken = "Bearer " + jwtTokenProvider.generateToken(
                new UsernamePasswordAuthenticationToken(adminPrinc, null, adminPrinc.getAuthorities()));

        // Pending Candidate
        candidateUser = new User(UUID.randomUUID().toString(), "Snehal Candidate", "snehal@candidate.com",
                passwordEncoder.encode("Pass@123"), Role.CANDIDATE, AccountStatus.PENDING);
        userRepository.save(candidateUser);
        CandidateProfile candProf = new CandidateProfile();
        candProf.setId(UUID.randomUUID().toString());
        candProf.setUser(candidateUser);
        candProf.setCollegeName("SPPU Pune");
        candidateProfileRepository.save(candProf);

        UserPrincipal candPrinc = UserPrincipal.create(candidateUser);
        candidateToken = "Bearer " + jwtTokenProvider.generateToken(
                new UsernamePasswordAuthenticationToken(candPrinc, null, candPrinc.getAuthorities()));

        // Pending Employer & Company
        pendingEmployer = new User(UUID.randomUUID().toString(), "Ananya HR", "ananya@cloudcorp.in",
                passwordEncoder.encode("Pass@123"), Role.EMPLOYER, AccountStatus.PENDING);
        userRepository.save(pendingEmployer);

        pendingCompany = new Company();
        pendingCompany.setId(UUID.randomUUID().toString());
        pendingCompany.setEmployer(pendingEmployer);
        pendingCompany.setCompanyName("CloudCorp Systems");
        pendingCompany.setCompanyEmail("contact@cloudcorp.in");
        pendingCompany.setCity("Pune");
        pendingCompany.setVerificationStatus(CompanyVerificationStatus.PENDING);
        companyRepository.save(pendingCompany);
    }

    @Test
    @DisplayName("Admin can approve pending candidate registration")
    void adminCanApproveCandidate() throws Exception {
        mockMvc.perform(post("/api/v1/admin/candidates/" + candidateUser.getId() + "/approve")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accountStatus").value("APPROVED"));

        User updated = userRepository.findById(candidateUser.getId()).orElseThrow();
        assertEquals(AccountStatus.APPROVED, updated.getAccountStatus());
        assertEquals(admin.getId(), updated.getApprovedBy());
        assertNotNull(updated.getApprovedAt());
    }

    @Test
    @DisplayName("Admin can reject pending candidate with reason")
    void adminCanRejectCandidateWithReason() throws Exception {
        Map<String, String> body = Map.of("reason", "Graduation percentage is below required minimum cutoff.");

        mockMvc.perform(post("/api/v1/admin/candidates/" + candidateUser.getId() + "/reject")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accountStatus").value("REJECTED"))
                .andExpect(jsonPath("$.data.rejectionReason").value("Graduation percentage is below required minimum cutoff."));

        User updated = userRepository.findById(candidateUser.getId()).orElseThrow();
        assertEquals(AccountStatus.REJECTED, updated.getAccountStatus());
        assertEquals("Graduation percentage is below required minimum cutoff.", updated.getRejectionReason());
        assertNotNull(updated.getRejectedAt());
    }

    @Test
    @DisplayName("Admin can approve pending employer company")
    void adminCanApproveEmployer() throws Exception {
        mockMvc.perform(post("/api/v1/admin/companies/" + pendingCompany.getId() + "/verify")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.verificationStatus").value("VERIFIED"));

        Company updatedCompany = companyRepository.findById(pendingCompany.getId()).orElseThrow();
        assertEquals(CompanyVerificationStatus.VERIFIED, updatedCompany.getVerificationStatus());

        User updatedEmployer = userRepository.findById(pendingEmployer.getId()).orElseThrow();
        assertEquals(AccountStatus.APPROVED, updatedEmployer.getAccountStatus());
    }

    @Test
    @DisplayName("Admin can reject pending employer company with reason")
    void adminCanRejectEmployerWithReason() throws Exception {
        Map<String, String> body = Map.of("reason", "Unable to verify business registration and CIN.");

        mockMvc.perform(post("/api/v1/admin/companies/" + pendingCompany.getId() + "/reject")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.verificationStatus").value("REJECTED"));

        Company updatedCompany = companyRepository.findById(pendingCompany.getId()).orElseThrow();
        assertEquals(CompanyVerificationStatus.REJECTED, updatedCompany.getVerificationStatus());
        assertEquals("Unable to verify business registration and CIN.", updatedCompany.getRejectionReason());

        User updatedEmployer = userRepository.findById(pendingEmployer.getId()).orElseThrow();
        assertEquals(AccountStatus.REJECTED, updatedEmployer.getAccountStatus());
        assertEquals("Unable to verify business registration and CIN.", updatedEmployer.getRejectionReason());
    }

    @Test
    @DisplayName("Non-admin (Candidate) cannot access admin approval endpoints (403 Forbidden)")
    void nonAdminCannotAccessApprovalEndpoints() throws Exception {
        mockMvc.perform(post("/api/v1/admin/candidates/" + candidateUser.getId() + "/approve")
                        .header("Authorization", candidateToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/v1/admin/companies/" + pendingCompany.getId() + "/verify")
                        .header("Authorization", candidateToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Admin stats endpoint returns real statistics from database")
    void adminStatsReturnsPersistedCounts() throws Exception {
        mockMvc.perform(get("/api/v1/admin/stats")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalUsers").value(3))
                .andExpect(jsonPath("$.data.totalCandidates").value(1))
                .andExpect(jsonPath("$.data.pendingCandidates").value(1))
                .andExpect(jsonPath("$.data.totalCompanies").value(1))
                .andExpect(jsonPath("$.data.pendingCompanies").value(1));
    }
}
