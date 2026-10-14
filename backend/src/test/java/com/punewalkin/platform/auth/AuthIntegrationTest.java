package com.punewalkin.platform.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.punewalkin.platform.candidate.CandidateProfileRepository;
import com.punewalkin.platform.company.CompanyRepository;
import com.punewalkin.platform.user.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AuthIntegrationTest {

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
    private com.punewalkin.platform.application.ApplicationRepository applicationRepository;

    @Autowired
    private com.punewalkin.platform.drive.DriveRepository driveRepository;

    @Autowired
    private com.punewalkin.platform.job.JobRepository jobRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        applicationRepository.deleteAll();
        driveRepository.deleteAll();
        jobRepository.deleteAll();
        candidateProfileRepository.deleteAll();
        companyRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Candidate registration creates a pending account without token")
    void registerCandidateCreatesPendingAccount() throws Exception {
        CandidateRegisterRequest request = new CandidateRegisterRequest();
        request.setFullName("Pooja Deshmukh");
        request.setEmail("pooja.test@example.com");
        request.setPassword("Password@123");
        request.setPhone("+91 98901 12345");
        request.setCollegeName("COEP Technological University, Pune");
        request.setDegree("B.Tech");
        request.setBranch("Computer Engineering");
        request.setGraduationYear("2025");
        request.setCgpa(8.8);
        request.setSkills(List.of("Java", "Spring Boot", "React"));

        mockMvc.perform(post("/api/v1/auth/register/candidate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").value(nullValue()))
                .andExpect(jsonPath("$.data.email").value("pooja.test@example.com"))
                .andExpect(jsonPath("$.data.role").value("CANDIDATE"))
                .andExpect(jsonPath("$.data.accountStatus").value("PENDING"));

        assertTrue(userRepository.existsByEmailIgnoreCase("pooja.test@example.com"));
        User user = userRepository.findByEmailIgnoreCase("pooja.test@example.com").orElseThrow();
        assertEquals(AccountStatus.PENDING, user.getAccountStatus());

        var profileOpt = candidateProfileRepository.findByUserId(user.getId());
        assertTrue(profileOpt.isPresent());
        var profile = profileOpt.get();
        assertEquals("COEP Technological University, Pune", profile.getCollegeName());
        assertEquals("Computer Engineering", profile.getBranch());
        assertEquals("2025", profile.getGraduationYear());
        assertEquals(8.8, profile.getCgpa());
    }

    @Test
    @DisplayName("Pending candidate cannot log in (403 Forbidden with clear message)")
    void pendingCandidateCannotLogin() throws Exception {
        CandidateRegisterRequest request = new CandidateRegisterRequest();
        request.setFullName("Pending User");
        request.setEmail("pending.cand@example.com");
        request.setPassword("Secret@123");
        request.setCollegeName("SPPU Pune");

        mockMvc.perform(post("/api/v1/auth/register/candidate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        LoginRequest login = new LoginRequest();
        login.setEmail("pending.cand@example.com");
        login.setPassword("Secret@123");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("ACCOUNT_PENDING_APPROVAL"))
                .andExpect(jsonPath("$.message", containsString("awaiting admin verification")));
    }

    @Test
    @DisplayName("Approved candidate can log in successfully with valid JWT")
    void approvedCandidateCanLogin() throws Exception {
        CandidateRegisterRequest request = new CandidateRegisterRequest();
        request.setFullName("Approved Candidate");
        request.setEmail("approved.cand@example.com");
        request.setPassword("Secret@123");

        mockMvc.perform(post("/api/v1/auth/register/candidate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Approve user
        User user = userRepository.findByEmailIgnoreCase("approved.cand@example.com").orElseThrow();
        user.setAccountStatus(AccountStatus.APPROVED);
        userRepository.save(user);

        LoginRequest login = new LoginRequest();
        login.setEmail("approved.cand@example.com");
        login.setPassword("Secret@123");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.email").value("approved.cand@example.com"))
                .andExpect(jsonPath("$.data.accountStatus").value("APPROVED"));
    }

    @Test
    @DisplayName("Rejected candidate cannot log in (403 Forbidden with rejection reason)")
    void rejectedCandidateCannotLogin() throws Exception {
        CandidateRegisterRequest request = new CandidateRegisterRequest();
        request.setFullName("Rejected User");
        request.setEmail("rejected.cand@example.com");
        request.setPassword("Secret@123");

        mockMvc.perform(post("/api/v1/auth/register/candidate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        User user = userRepository.findByEmailIgnoreCase("rejected.cand@example.com").orElseThrow();
        user.setAccountStatus(AccountStatus.REJECTED);
        user.setRejectionReason("Incomplete academic documents submitted");
        userRepository.save(user);

        LoginRequest login = new LoginRequest();
        login.setEmail("rejected.cand@example.com");
        login.setPassword("Secret@123");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("ACCOUNT_REJECTED"))
                .andExpect(jsonPath("$.message", containsString("Incomplete academic documents submitted")));
    }

    @Test
    @DisplayName("Suspended candidate cannot log in (403 Forbidden)")
    void suspendedCandidateCannotLogin() throws Exception {
        CandidateRegisterRequest request = new CandidateRegisterRequest();
        request.setFullName("Suspended User");
        request.setEmail("suspended.cand@example.com");
        request.setPassword("Secret@123");

        mockMvc.perform(post("/api/v1/auth/register/candidate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        User user = userRepository.findByEmailIgnoreCase("suspended.cand@example.com").orElseThrow();
        user.setAccountStatus(AccountStatus.SUSPENDED);
        userRepository.save(user);

        LoginRequest login = new LoginRequest();
        login.setEmail("suspended.cand@example.com");
        login.setPassword("Secret@123");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("ACCOUNT_SUSPENDED"))
                .andExpect(jsonPath("$.message", containsString("suspended by the platform administrator")));
    }

    @Test
    @DisplayName("Reject duplicate email registration with helpful message (409 Conflict)")
    void duplicateEmailRejected() throws Exception {
        CandidateRegisterRequest first = new CandidateRegisterRequest();
        first.setFullName("First User");
        first.setEmail("duplicate@example.com");
        first.setPassword("Pass@123");

        mockMvc.perform(post("/api/v1/auth/register/candidate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(first)))
                .andExpect(status().isCreated());

        CandidateRegisterRequest second = new CandidateRegisterRequest();
        second.setFullName("Second User");
        second.setEmail("duplicate@example.com");
        second.setPassword("Pass@456");

        mockMvc.perform(post("/api/v1/auth/register/candidate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(second)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("already registered")));
    }

    @Test
    @DisplayName("Public registration cannot assign ADMIN role (400 Bad Request)")
    void publicRegistrationCannotAssignAdmin() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Malicious Admin");
        request.setEmail("fakeadmin@example.com");
        request.setPassword("Admin@123");
        request.setRole("ADMIN");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("BAD_REQUEST"));
    }

    @Test
    @DisplayName("Employer registration creates pending account and company record")
    void employerRegistrationCreatesPendingAccount() throws Exception {
        EmployerRegisterRequest request = new EmployerRegisterRequest();
        request.setRecruiterName("Ritik Recruiter");
        request.setEmail("ritik@techsprint.io");
        request.setPassword("Employer@123");
        request.setCompanyName("TechSprint Solutions");
        request.setPhone("+91 98230 45678");
        request.setWebsite("https://techsprint.io");

        mockMvc.perform(post("/api/v1/auth/register/employer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.token").value(nullValue()))
                .andExpect(jsonPath("$.data.role").value("EMPLOYER"))
                .andExpect(jsonPath("$.data.accountStatus").value("PENDING"));

        User emp = userRepository.findByEmailIgnoreCase("ritik@techsprint.io").orElseThrow();
        assertEquals(AccountStatus.PENDING, emp.getAccountStatus());
        assertTrue(companyRepository.existsByEmployerId(emp.getId()));
    }

    @Test
    @DisplayName("Login with wrong password returns Unauthorized (401)")
    void loginWrongPasswordReturnsUnauthorized() throws Exception {
        CandidateRegisterRequest request = new CandidateRegisterRequest();
        request.setFullName("Test User");
        request.setEmail("test.pwd@example.com");
        request.setPassword("CorrectPassword123");

        mockMvc.perform(post("/api/v1/auth/register/candidate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        LoginRequest login = new LoginRequest();
        login.setEmail("test.pwd@example.com");
        login.setPassword("WrongPassword");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message", containsString("Invalid email or password")));
    }
}
