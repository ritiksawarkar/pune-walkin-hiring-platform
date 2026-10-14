import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/common/ProtectedRoute";
import { RequireRole } from "../components/common/RequireRole";
import { PublicOnly } from "../components/common/PublicOnly";
import { EmployerLayout } from "../layouts/EmployerLayout";
import { AdminLayout } from "../features/admin/AdminLayout";

// Authentication Pages
import { PublicLandingPage } from "../features/auth/pages/PublicLandingPage";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { CandidateRegisterPage } from "../features/auth/pages/CandidateRegisterPage";
import { EmployerRegisterPage } from "../features/auth/pages/EmployerRegisterPage";
import { ForgotPasswordPage } from "../features/auth/pages/ForgotPasswordPage";
import { UnauthorizedPage } from "../features/auth/pages/UnauthorizedPage";

// Candidate Layout & Pages (Sagar's Candidate Module)
import { CandidateLayout } from "../layouts/CandidateLayout";
import { CandidateDashboardPage } from "../features/candidate/pages/CandidateDashboardPage";
import { CandidateProfilePage } from "../features/candidate/pages/CandidateProfilePage";
import { CandidateProfileEditPage } from "../features/candidate/pages/CandidateProfileEditPage";
import { CandidateResumePage } from "../features/candidate/pages/CandidateResumePage";
import { CandidateDrivesPage } from "../features/candidate/pages/CandidateDrivesPage";
import { CandidateDriveDetailsPage } from "../features/candidate/pages/CandidateDriveDetailsPage";
import { CandidateApplicationsPage } from "../features/candidate/pages/CandidateApplicationsPage";
import { CandidateApplicationDetailsPage } from "../features/candidate/pages/CandidateApplicationDetailsPage";
import { CandidateInterviewsPage } from "../features/candidate/pages/CandidateInterviewsPage";
import { CandidateNotificationsPage } from "../features/candidate/pages/CandidateNotificationsPage";
import { CandidateSettingsPage } from "../features/candidate/pages/CandidateSettingsPage";

// Admin pages
import { AdminDashboardPage } from "../features/admin/pages/AdminDashboardPage";
import { CompaniesPage } from "../features/admin/pages/CompaniesPage";
import { DriveApprovalsPage } from "../features/admin/pages/DriveApprovalsPage";
import { UserManagementPage } from "../features/admin/pages/UserManagementPage";
import { JobsAndDrivesPage } from "../features/admin/pages/JobsAndDrivesPage";
import { ApplicationsPage } from "../features/admin/pages/ApplicationsPage";
import { ReportsPage } from "../features/admin/pages/ReportsPage";
import { ActivityLogsPage } from "../features/admin/pages/ActivityLogsPage";
import { NotificationsPage } from "../features/admin/pages/NotificationsPage";
import { AdminSettingsPage } from "../features/admin/pages/AdminSettingsPage";

// Employer & Recruitment Pages (Ritik's Module)
import { EmployerDashboardPage } from "../features/recruiter/pages/EmployerDashboardPage";
import { RecruiterApplicationsPage } from "../features/recruiter/pages/RecruiterApplicationsPage";
import { RecruitmentPipelinePage } from "../features/recruiter/pages/RecruitmentPipelinePage";

// Company Profile Pages
import { CompanyProfilePage } from "../features/companies/pages/CompanyProfilePage";
import { CompanyEditPage } from "../features/companies/pages/CompanyEditPage";

// Job Management Pages
import { JobsPage } from "../features/jobs/pages/JobsPage";
import { JobCreatePage } from "../features/jobs/pages/JobCreatePage";
import { JobEditPage } from "../features/jobs/pages/JobEditPage";
import { JobDetailsPage } from "../features/jobs/pages/JobDetailsPage";

// Walk-In Drive Pages
import { DrivesPage } from "../features/drives/pages/DrivesPage";
import { EmployerOnCampusDrivesPage } from "../features/drives/pages/EmployerOnCampusDrivesPage";
import { EmployerOffCampusDrivesPage } from "../features/drives/pages/EmployerOffCampusDrivesPage";
import { DriveCreatePage } from "../features/drives/pages/DriveCreatePage";
import { DriveEditPage } from "../features/drives/pages/DriveEditPage";
import { DriveDetailsPage } from "../features/drives/pages/DriveDetailsPage";
import { DriveCandidatesPage } from "../features/drives/pages/DriveCandidatesPage";

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
      <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
        404 Error
      </span>
      <h2 className="mt-3 text-3xl font-extrabold text-slate-900">Page Not Found</h2>
      <p className="mt-2 text-sm text-slate-500 max-w-md">
        The requested URL does not match any valid platform route.
      </p>
      <div className="mt-6">
        <Navigate to="/" replace />
      </div>
    </div>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Entry Point / Role Selection */}
      <Route path="/" element={<PublicLandingPage />} />

      {/* Public-Only Auth Routes (Redirects already authenticated users to their role dashboard) */}
      <Route
        path="/login"
        element={
          <PublicOnly>
            <LoginPage />
          </PublicOnly>
        }
      />
      <Route
        path="/register/candidate"
        element={
          <PublicOnly>
            <CandidateRegisterPage />
          </PublicOnly>
        }
      />
      <Route
        path="/register/employer"
        element={
          <PublicOnly>
            <EmployerRegisterPage />
          </PublicOnly>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicOnly>
            <ForgotPasswordPage />
          </PublicOnly>
        }
      />

      {/* 403 Forbidden Access Page */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* ADMIN PROTECTED ROUTES (Sahil's Domain) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RequireRole allowedRoles={["ADMIN"]}>
              <AdminLayout />
            </RequireRole>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="companies" element={<CompaniesPage />} />
        <Route path="drive-approvals" element={<DriveApprovalsPage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="jobs" element={<JobsAndDrivesPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="activity-logs" element={<ActivityLogsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>

      {/* CANDIDATE PROTECTED ROUTES (Sagar's Candidate Module) */}
      <Route
        path="/candidate"
        element={
          <ProtectedRoute>
            <RequireRole allowedRoles={["CANDIDATE"]}>
              <CandidateLayout />
            </RequireRole>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/candidate/dashboard" replace />} />
        <Route path="dashboard" element={<CandidateDashboardPage />} />
        <Route path="profile" element={<CandidateProfilePage />} />
        <Route path="profile/edit" element={<CandidateProfileEditPage />} />
        <Route path="resume" element={<CandidateResumePage />} />
        <Route path="drives" element={<CandidateDrivesPage />} />
        <Route path="drives/:driveId" element={<CandidateDriveDetailsPage />} />
        <Route path="applications" element={<CandidateApplicationsPage />} />
        <Route path="applications/:applicationId" element={<CandidateApplicationDetailsPage />} />
        <Route path="interviews" element={<CandidateInterviewsPage />} />
        <Route path="notifications" element={<CandidateNotificationsPage />} />
        <Route path="settings" element={<CandidateSettingsPage />} />
        <Route path="*" element={<Navigate to="/candidate/dashboard" replace />} />
      </Route>

      {/* EMPLOYER & RECRUITER PROTECTED ROUTES (Ritik's Module) */}
      <Route
        path="/employer"
        element={
          <ProtectedRoute>
            <RequireRole allowedRoles={["EMPLOYER"]}>
              <EmployerLayout />
            </RequireRole>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/employer/dashboard" replace />} />
        <Route path="dashboard" element={<EmployerDashboardPage />} />

        {/* Company Profile */}
        <Route path="company" element={<CompanyProfilePage />} />
        <Route path="company/edit" element={<CompanyEditPage />} />

        {/* Jobs Management */}
        <Route path="jobs" element={<JobsPage />} />
        <Route path="jobs/new" element={<JobCreatePage />} />
        <Route path="jobs/:jobId" element={<JobDetailsPage />} />
        <Route path="jobs/:jobId/edit" element={<JobEditPage />} />

        {/* Walk-In Drives Management */}
        <Route path="drives" element={<DrivesPage />} />
        <Route path="drives/on-campus" element={<EmployerOnCampusDrivesPage />} />
        <Route path="drives/off-campus" element={<EmployerOffCampusDrivesPage />} />
        <Route path="drives/new" element={<DriveCreatePage />} />
        <Route path="drives/:driveId" element={<DriveDetailsPage />} />
        <Route path="drives/:driveId/edit" element={<DriveEditPage />} />
        <Route path="drives/:driveId/candidates" element={<DriveCandidatesPage />} />

        {/* Candidates & Applications */}
        <Route path="candidates" element={<RecruiterApplicationsPage />} />
        <Route path="applications" element={<RecruiterApplicationsPage />} />

        {/* Recruitment Pipeline */}
        <Route path="pipeline" element={<RecruitmentPipelinePage />} />

        {/* Nested 404 inside employer */}
        <Route path="*" element={<Navigate to="/employer/dashboard" replace />} />
      </Route>

      {/* Global Fallback Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
