import { useState } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { EmployerSidebar } from "../components/layout/EmployerSidebar";
import { EmployerHeader } from "../components/layout/EmployerHeader";
import { ChevronRightIcon } from "../components/common/Icons";

const ROUTE_CONFIG = {
  "/employer/dashboard": {
    title: "Employer Dashboard",
    subtitle: "Overview of jobs, walk-in drives, and recruitment metrics",
    breadcrumbs: ["Dashboard"],
  },
  "/employer/company": {
    title: "Company Profile",
    subtitle: "Corporate information, office address, and HR credentials",
    breadcrumbs: ["Company Profile"],
  },
  "/employer/company/edit": {
    title: "Edit Company Profile",
    subtitle: "Update company profile and contact details",
    breadcrumbs: ["Company Profile", "Edit"],
  },
  "/employer/jobs": {
    title: "Job Openings",
    subtitle: "Manage positions, skills requirements, and vacancy criteria",
    breadcrumbs: ["Jobs"],
  },
  "/employer/jobs/new": {
    title: "Create Job Opening",
    subtitle: "Post a new vacancy with walk-in interview eligibility",
    breadcrumbs: ["Jobs", "New Job"],
  },
  "/employer/drives": {
    title: "Walk-In Drives",
    subtitle: "Manage Pune walk-in schedules, venues, and administrative approvals",
    breadcrumbs: ["Walk-In Drives"],
  },
  "/employer/drives/new": {
    title: "Schedule Walk-In Drive",
    subtitle: "Plan interview rounds, Pune venue, and submit for verification",
    breadcrumbs: ["Walk-In Drives", "New Drive"],
  },
  "/employer/candidates": {
    title: "Candidate Pool",
    subtitle: "Review candidates registered across your walk-in drives",
    breadcrumbs: ["Candidates"],
  },
  "/employer/applications": {
    title: "Applications Management",
    subtitle: "Screen candidate profiles, check resumes, and update recruitment status",
    breadcrumbs: ["Applications"],
  },
  "/employer/pipeline": {
    title: "Recruitment Pipeline",
    subtitle: "Visual breakdown of candidate stages from registration to selection",
    breadcrumbs: ["Recruitment Pipeline"],
  },
};

export function EmployerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Find matching route config or fallback
  const config =
    ROUTE_CONFIG[location.pathname] ||
    (location.pathname.includes("/employer/jobs/") && location.pathname.includes("/edit")
      ? { title: "Edit Job Opening", subtitle: "Update role details and qualifications", breadcrumbs: ["Jobs", "Edit"] }
      : location.pathname.includes("/employer/jobs/")
      ? { title: "Job Details", subtitle: "View role specifications and associated walk-in drives", breadcrumbs: ["Jobs", "Details"] }
      : location.pathname.includes("/employer/drives/") && location.pathname.includes("/candidates")
      ? { title: "Drive Registrations", subtitle: "Candidates registered for this specific walk-in drive", breadcrumbs: ["Walk-In Drives", "Candidates"] }
      : location.pathname.includes("/employer/drives/") && location.pathname.includes("/edit")
      ? { title: "Edit Walk-In Drive", subtitle: "Update drive venue, schedule, or revisions", breadcrumbs: ["Walk-In Drives", "Edit"] }
      : location.pathname.includes("/employer/drives/")
      ? { title: "Walk-In Drive Details", subtitle: "Inspect schedule, approval status, and candidate turnout", breadcrumbs: ["Walk-In Drives", "Details"] }
      : { title: "Employer Portal", subtitle: "Recruitment & Walk-In Management", breadcrumbs: [] });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      <EmployerSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <EmployerHeader
          onMenuClick={() => setSidebarOpen(true)}
          title={config.title}
          subtitle={config.subtitle}
        />

        {/* Breadcrumb Bar */}
        {config.breadcrumbs && config.breadcrumbs.length > 0 && (
          <div className="border-b border-slate-200/60 bg-white px-4 py-2 sm:px-6">
            <nav className="flex items-center gap-1.5 text-xs text-slate-500">
              <Link
                to="/employer/dashboard"
                className="hover:text-blue-600 transition-colors"
              >
                Employer Portal
              </Link>
              {config.breadcrumbs.map((crumb, idx) => (
                <span key={idx} className="flex items-center gap-1.5">
                  <ChevronRightIcon className="h-3 w-3 text-slate-400" />
                  <span
                    className={
                      idx === config.breadcrumbs.length - 1
                        ? "font-semibold text-slate-800"
                        : "hover:text-blue-600"
                    }
                  >
                    {crumb}
                  </span>
                </span>
              ))}
            </nav>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Standard Employer Footer */}
        <footer className="border-t border-slate-200 bg-white px-6 py-4 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            Pune Walk-In Drive & Hiring Management Platform — Employer & Recruitment Module
          </p>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 font-medium text-slate-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> System Online (Pune IT Cluster)
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
