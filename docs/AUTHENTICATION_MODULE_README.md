# Pune Walk-In Drive & Hiring Management Platform
## Authentication & Authorization Module Documentation

**Module Owner:** Authentication & Security Architecture  
**Supported Roles:** Strictly THREE roles: `ADMIN`, `EMPLOYER`, and `CANDIDATE`.  
**Architecture:** Frontend React 19, Vite, Tailwind CSS v4, React Router DOM v7 with decoupled Development-Only Mock Auth Adapter. Zero server-side secrets or tokens stored.

---

## 1. Overview & Role Permissions Matrix

The Authentication Module provides complete role-based entry, account registration, credentials verification, route protection, and sign-out capabilities for the platform.

| Role Identifier | Assigned Responsibilities | Post-Login Destination | Public Registration Allowed? |
|---|---|---|---|
| **`ADMIN`** | Platform oversight, drive moderation, company verification (Sahil) | `/admin/dashboard` | **No** (Admin accounts are strictly pre-provisioned) |
| **`EMPLOYER`** | Job openings, walk-in drives, candidate screening & shortlisting (Ritik) | `/employer/dashboard` | **Yes** (Requires review $\rightarrow$ `PENDING_VERIFICATION`) |
| **`CANDIDATE`** | Discover Pune walk-in drives, register for slots, track status (Yadit) | `/candidate/dashboard` | **Yes** (Direct activation $\rightarrow$ `ACTIVE`) |

---

## 2. Pre-Seeded Development Demo Accounts

For immediate testing, pair-programming, and review, the mock authentication service is pre-seeded with 3 verifiable demo accounts:

| Role | Email Address | Password | Name / Entity | Initial Status |
|---|---|---|---|---|
| **Admin** | `admin@punewalkin.gov.in` | `Admin@123` | Sahil (System Admin) | `ACTIVE` |
| **Employer** | `careers@techsprint.io` | `Employer@123` | Ritik Sawarkar (TechSprint) | `VERIFIED` |
| **Candidate** | `candidate@example.com` | `Candidate@123` | Amit Deshmukh (Pune Fresher) | `ACTIVE` |

*Tip: On the `/login` screen, a "Quick Demo Credentials (Mock Mode)" bar is provided to 1-click populate and test each of these three roles.*

---

## 3. Route Map & Route Guards

### Public Routes
- `/`: Public Landing & Role Selection Gateway (`PublicLandingPage`)
- `/login`: Professional sign-in with show/hide password toggle, remember me, quick filler (`LoginPage`)
- `/register/candidate`: Candidate account signup with 10-digit mobile and password checks (`CandidateRegisterPage`)
- `/register/employer`: Corporate recruiter signup resulting in `PENDING_VERIFICATION` state (`EmployerRegisterPage`)
- `/forgot-password`: Neutral simulated password recovery (`ForgotPasswordPage`)
- `/unauthorized`: 403 Forbidden Access screen with role clearance explanation (`UnauthorizedPage`)

### Route Guards
- `<PublicOnly>`: Redirects already authenticated users away from `/login` and `/register/*` to their assigned dashboard.
- `<ProtectedRoute>`: Intercepts unauthenticated navigation to any protected area, preserving `location.pathname` in `state.from` and redirecting to `/login`.
- `<RequireRole allowedRoles={[...]}>`: Enforces strict RBAC. If an authenticated `CANDIDATE` or `EMPLOYER` tries to open `/admin/dashboard`, or a `CANDIDATE` tries to open `/employer/dashboard`, they are redirected to `/unauthorized`.

---

## 4. Component & File Structure

```
frontend/src/
├── features/
│   ├── auth/
│   │   ├── pages/
│   │   │   ├── PublicLandingPage.jsx      # Role entry cards & Pune IT clusters hero
│   │   │   ├── LoginPage.jsx              # Validated login with role-based destination
│   │   │   ├── CandidateRegisterPage.jsx  # Candidate signup
│   │   │   ├── EmployerRegisterPage.jsx   # Corporate signup with pending review
│   │   │   ├── ForgotPasswordPage.jsx     # Password recovery simulation
│   │   │   └── UnauthorizedPage.jsx       # 403 Forbidden access handling
│   │   ├── components/
│   │   │   ├── AuthLayout.jsx             # Shared clean light-theme auth layout
│   │   │   └── PasswordField.jsx          # Accessible password input with show/hide toggle
│   │   ├── services/
│   │   │   └── authService.js             # Mock authentication adapter & demo store
│   │   ├── context/
│   │   │   └── AuthContext.jsx            # Shared session state & login/logout actions
│   │   ├── hooks/
│   │   │   └── useAuth.js                 # useAuth convenience export
│   │   └── utils/
│   │       └── authValidation.js          # Email regex, 10-digit mobile, password checks
│   ├── admin/pages/
│   │   └── AdminDashboardPlaceholder.jsx  # Sahil's integration-ready admin placeholder
│   └── candidate/pages/
│       └── CandidateDashboardPlaceholder.jsx # Yadit's integration-ready candidate placeholder
├── components/common/
│   ├── ProtectedRoute.jsx                 # Authentication check guard
│   ├── RequireRole.jsx                    # Role authorization check guard
│   └── PublicOnly.jsx                     # Guest-only guard
└── routes/
    └── AppRoutes.jsx                      # Central router with public, auth & employer routes
```

---

## 5. Employer & Recruitment Module Integrity

The existing Employer & Recruitment Module built by Ritik remains **100% intact and functional**:
- Employer routes are nested under `/employer/*` and protected by `<RequireRole allowedRoles={["EMPLOYER", "ADMIN"]}>`.
- The `EmployerHeader` and `EmployerSidebar` are integrated with `useAuth()` to display the active recruiter name (`Ritik Sawarkar`) and provide a functional **Sign Out** button that clears the session and returns to `/login`.
- All sub-pages remain accessible when logged in as an Employer:
  - Dashboard: `/employer/dashboard`
  - Company Profile: `/employer/company`
  - Jobs: `/employer/jobs`
  - Walk-In Drives: `/employer/drives`
  - Candidates: `/employer/candidates`
  - Applications: `/employer/applications`
  - Pipeline: `/employer/pipeline`

---

## 6. Future Spring Boot Security Backend Contract

When transitioning from the mock adapter to the real Java 21 / Spring Boot backend:

1. **REST Endpoints**:
   - `POST /api/v1/auth/login` $\longrightarrow$ Request: `{ "email", "password" }`, Response: `{ "token": "JWT...", "user": { "id", "name", "email", "role": "ADMIN"|"EMPLOYER"|"CANDIDATE", "status" } }`
   - `POST /api/v1/auth/register/candidate` $\longrightarrow$ Creates Candidate record in MySQL, returns JWT token.
   - `POST /api/v1/auth/register/employer` $\longrightarrow$ Creates Employer & Company record with `PENDING_VERIFICATION`.
   - `POST /api/v1/auth/logout` $\longrightarrow$ Invalidates refresh token / blacklists JWT.
2. **Frontend Switch**:
   - Simply replace `src/features/auth/services/authService.js` implementation with `fetch` or `axios` calls to the Spring Boot REST API. All pages, forms, hooks, and route guards will continue working without modification.
