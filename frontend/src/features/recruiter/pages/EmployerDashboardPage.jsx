import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { companyService } from "../../../services/companyService";
import { recruitmentService } from "../../../services/recruitmentService";
import { RecruitmentStats } from "../components/RecruitmentStats";
import { ApplicationStatusBadge } from "../components/ApplicationStatusBadge";
import { DriveApprovalBadge } from "../../drives/components/DriveApprovalBadge";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { EmptyState } from "../../../components/common/EmptyState";
import {
  BriefcaseIcon,
  CalendarIcon,
  UsersIcon,
  PlusIcon,
  MapPinIcon,
  ClockIcon,
  ShieldCheckIcon,
  AlertCircleIcon,
  ArrowRightIcon,
} from "../../../components/common/Icons";

export function EmployerDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [compData, statsData] = await Promise.all([
          companyService.getCompanyProfile(),
          recruitmentService.getDashboardStats(),
        ]);
        setCompany(compData);
        setStats(statsData);
      } catch (err) {
        console.error("Dashboard data load error", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
          <p className="text-sm font-medium">Loading recruitment dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Actions Hero */}
      <div className="rounded-2xl border border-slate-200/90 bg-linear-to-r from-slate-900 to-slate-800 p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300 border border-blue-400/30">
                <ShieldCheckIcon className="h-3.5 w-3.5 text-blue-300" />
                {company?.verificationStatus || "Verified Employer"}
              </span>
              <span className="text-xs text-slate-400">
                Pune IT Recruitment Hub
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {company?.name || "TechSprint Innovations"}
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl">
              Welcome back, <span className="font-semibold text-white">Ritik Sawarkar</span>. Manage walk-in hiring drives, screen applicant resumes, and prepare shortlisted candidates for technical interview rounds.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link to="/employer/jobs/new">
              <Button
                variant="outline"
                size="md"
                icon={BriefcaseIcon}
                className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700 hover:text-white"
              >
                Post New Job
              </Button>
            </Link>
            <Link to="/employer/drives/new">
              <Button
                variant="primary"
                size="md"
                icon={PlusIcon}
                className="bg-blue-600 hover:bg-blue-500"
              >
                Schedule Walk-In Drive
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Admin Action Alert (if pending or changes requested) */}
      {stats?.pendingDrives > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-amber-900 shadow-2xs">
          <AlertCircleIcon className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs sm:text-sm">
            <p className="font-semibold">
              {stats.pendingDrives} Walk-In Drive(s) Pending Admin Approval
            </p>
            <p className="mt-0.5 text-amber-800">
              Your drive submission is in the queue for administrative verification by Sahil. Candidates will be able to register once the drive is marked Approved.
            </p>
          </div>
          <Link
            to="/employer/drives"
            className="text-xs font-semibold text-amber-900 underline hover:text-amber-700 shrink-0"
          >
            Review Drives
          </Link>
        </div>
      )}

      {/* Dynamic Statistics Cards */}
      {stats && <RecruitmentStats stats={stats} />}

      {/* Upcoming Walk-In Drives & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Walk-In Drives (2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Upcoming Approved Walk-In Drives
              </h3>
              <p className="text-xs text-slate-500">
                Scheduled recruitment sessions ready for on-site walk-in turnout
              </p>
            </div>
            <Link
              to="/employer/drives"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All Drives <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>

          {stats?.upcomingDrives && stats.upcomingDrives.length > 0 ? (
            <div className="space-y-3">
              {stats.upcomingDrives.map((drive) => {
                const fillPercent = Math.min(
                  100,
                  Math.round(
                    ((drive.registeredCount || 0) / (drive.maxRegistrations || 100)) * 100
                  )
                );
                return (
                  <Card key={drive.id} padding="p-5" className="hover:border-slate-300">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <DriveApprovalBadge status={drive.approvalStatus} />
                          <span className="text-xs font-semibold text-blue-600">
                            {drive.jobTitle}
                          </span>
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                          {drive.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                          <span className="flex items-center gap-1 font-medium">
                            <CalendarIcon className="h-4 w-4 text-slate-400" />
                            {drive.interviewDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <ClockIcon className="h-4 w-4 text-slate-400" />
                            {drive.startTime} - {drive.endTime}
                          </span>
                          <span className="flex items-center gap-1 truncate max-w-xs">
                            <MapPinIcon className="h-4 w-4 text-slate-400 shrink-0" />
                            {drive.venueName}, {drive.city}
                          </span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                        <div className="text-left sm:text-right">
                          <p className="text-xs text-slate-500">Registrations</p>
                          <p className="text-sm font-bold text-slate-900">
                            {drive.registeredCount} / {drive.maxRegistrations}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link to={`/employer/drives/${drive.id}/candidates`}>
                            <Button variant="outline" size="sm">
                              Candidates ({drive.registeredCount})
                            </Button>
                          </Link>
                          <Link to={`/employer/drives/${drive.id}`}>
                            <Button variant="ghost" size="sm">
                              Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Registration Capacity Progress Bar */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="flex justify-between text-2xs text-slate-500 mb-1">
                        <span>Registration Capacity Filled: {fillPercent}%</span>
                        <span>{drive.vacancies} Positions Available</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all"
                          style={{ width: `${fillPercent}%` }}
                        />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={CalendarIcon}
              title="No upcoming approved walk-in drives"
              description="Schedule a new walk-in drive in Pune and submit it for administrative approval."
              actionLabel="Schedule Walk-In Drive"
              onAction={() => {}}
            />
          )}
        </div>

        {/* Recent Activity Log (1 column) */}
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Recent Recruitment Activity
            </h3>
            <p className="text-xs text-slate-500">
              Live updates across candidate screening & walk-ins
            </p>
          </div>

          <Card padding="p-4" className="divide-y divide-slate-100">
            {stats?.recentActivities && stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((act) => (
                <div key={act.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                  <div className="flex items-center justify-between text-2xs">
                    <span className="font-semibold uppercase tracking-wider text-blue-600">
                      {act.title}
                    </span>
                    <span className="text-slate-400">{act.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">
                    {act.description}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-4 text-center">
                No recent activity logged yet.
              </p>
            )}
          </Card>
        </div>
      </div>

      {/* Recent Candidate Registrations Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Recent Walk-In Registrations
            </h3>
            <p className="text-xs text-slate-500">
              Candidates who recently signed up for upcoming Pune drives
            </p>
          </div>
          <Link
            to="/employer/applications"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Manage All Applications <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>

        <Card padding="p-0" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-2xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Candidate</th>
                  <th className="px-6 py-3.5 font-semibold">Drive / Position</th>
                  <th className="px-6 py-3.5 font-semibold">Academic Profile</th>
                  <th className="px-6 py-3.5 font-semibold">Registration Date</th>
                  <th className="px-6 py-3.5 font-semibold">Status</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats?.recentApplications && stats.recentApplications.length > 0 ? (
                  stats.recentApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">
                          {app.candidateName}
                        </div>
                        <div className="text-xs text-slate-500">{app.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-medium text-slate-800 line-clamp-1 max-w-xs">
                          {app.jobTitle}
                        </div>
                        <div className="text-2xs text-slate-500 line-clamp-1 max-w-xs">
                          {app.driveTitle}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div className="text-slate-800 font-medium truncate max-w-xs">
                          {app.qualification}
                        </div>
                        <div className="text-2xs text-slate-500">
                          {app.experienceYears > 0
                            ? `${app.experienceYears} Years Exp`
                            : "Fresher"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        {app.registrationDate}
                      </td>
                      <td className="px-6 py-4">
                        <ApplicationStatusBadge status={app.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link to={`/employer/applications?search=${encodeURIComponent(app.candidateName)}`}>
                          <Button variant="outline" size="sm">
                            Review
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-xs text-slate-500">
                      No candidate registrations recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
