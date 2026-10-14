import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import {
  CalendarIcon,
  BuildingIcon,
  UsersIcon,
  ClockIcon,
  BriefcaseIcon,
  ClipboardListIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  AlertCircleIcon,
} from "../../../components/common/Icons";
import { adminService } from "../../../services/adminService";

export function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalCandidates: 0,
    pendingCandidates: 0,
    approvedCandidates: 0,
    totalCompanies: 0,
    pendingCompanies: 0,
    verifiedCompanies: 0,
    totalDrives: 0,
    pendingDrives: 0,
    onCampusDrives: 0,
    offCampusDrives: 0,
    totalJobs: 0,
    totalApplications: 0,
  });
  const [pendingCandidates, setPendingCandidates] = useState([]);
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [pendingDrives, setPendingDrives] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [statsRes, candRes, compRes, driveRes, logsRes] = await Promise.allSettled([
          adminService.getStats(),
          adminService.getCandidates({ status: "PENDING", size: 5 }),
          adminService.getCompanies({ status: "PENDING", size: 5 }),
          adminService.getDrives({ status: "PENDING", size: 5 }),
          adminService.getActivityLogs(0, 8),
        ]);

        if (statsRes.status === "fulfilled" && statsRes.value) {
          setStats(statsRes.value.data || statsRes.value);
        }

        if (candRes.status === "fulfilled" && candRes.value) {
          const cData = candRes.value.data || candRes.value;
          setPendingCandidates(cData.content || (Array.isArray(cData) ? cData : []));
        }

        if (compRes.status === "fulfilled" && compRes.value) {
          const compData = compRes.value.data || compRes.value;
          setPendingCompanies(compData.content || (Array.isArray(compData) ? compData : []));
        }

        if (driveRes.status === "fulfilled" && driveRes.value) {
          const dData = driveRes.value.data || driveRes.value;
          setPendingDrives(dData.content || (Array.isArray(dData) ? dData : []));
        }

        if (logsRes.status === "fulfilled" && logsRes.value) {
          const lData = logsRes.value.data || logsRes.value;
          setActivities(lData.content || (Array.isArray(lData) ? lData : []));
        }
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const statCards = [
    {
      label: "Pending Candidate Approvals",
      value: stats.pendingCandidates ?? 0,
      icon: UsersIcon,
      color: "text-amber-600 bg-amber-50 border-amber-200",
      link: "/admin/users",
    },
    {
      label: "Pending Employer Verifications",
      value: stats.pendingCompanies ?? 0,
      icon: BuildingIcon,
      color: "text-amber-600 bg-amber-50 border-amber-200",
      link: "/admin/companies",
    },
    {
      label: "Pending Walk-In Drive Approvals",
      value: stats.pendingDrives ?? 0,
      icon: CalendarIcon,
      color: "text-amber-600 bg-amber-50 border-amber-200",
      link: "/admin/drive-approvals",
    },
    {
      label: "On-Campus Drives",
      value: stats.onCampusDrives ?? 0,
      icon: CalendarIcon,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
      link: "/admin/drive-approvals",
    },
    {
      label: "Off-Campus Drives",
      value: stats.offCampusDrives ?? 0,
      icon: CalendarIcon,
      color: "text-purple-600 bg-purple-50 border-purple-200",
      link: "/admin/drive-approvals",
    },
    {
      label: "Approved & Verified Employers",
      value: stats.verifiedCompanies ?? 0,
      icon: BuildingIcon,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      link: "/admin/companies",
    },
    {
      label: "Approved Candidates",
      value: stats.approvedCandidates ?? 0,
      icon: UsersIcon,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      link: "/admin/users",
    },
    {
      label: "Total Applications & Walk-In Seats",
      value: stats.totalApplications ?? 0,
      icon: ClipboardListIcon,
      color: "text-blue-600 bg-blue-50 border-blue-200",
      link: "/admin/applications",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Platform Live Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              to={card.link}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-500">{card.label}</span>
                <div className={`rounded-lg p-2 border ${card.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{card.value}</div>
            </Link>
          );
        })}
      </div>

      {/* Action Queues Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Pending Candidates Queue */}
        <Card
          title="Pending Candidate Registrations"
          subtitle="Verification required before candidates can log in"
          padding="p-0"
        >
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {pendingCandidates.length > 0 ? (
              pendingCandidates.map((cand) => (
                <div key={cand.userId} className="p-3.5 flex items-center justify-between gap-2 hover:bg-slate-50">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{cand.fullName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{cand.collegeName || cand.email}</p>
                    <p className="text-[10px] text-slate-400">{cand.degree} • {cand.branch || "General"}</p>
                  </div>
                  <Link to="/admin/users">
                    <Button variant="outline" size="sm">Review</Button>
                  </Link>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">
                <CheckCircleIcon className="h-6 w-6 text-emerald-500 mx-auto mb-1" />
                No pending candidate registrations.
              </div>
            )}
          </div>
          <div className="border-t border-slate-100 p-2.5 text-center">
            <Link to="/admin/users" className="text-xs font-semibold text-blue-600 hover:underline">
              View all candidate requests &rarr;
            </Link>
          </div>
        </Card>

        {/* Pending Companies Queue */}
        <Card
          title="Pending Employer Verifications"
          subtitle="Companies awaiting review to post walk-ins"
          padding="p-0"
        >
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {pendingCompanies.length > 0 ? (
              pendingCompanies.map((comp) => (
                <div key={comp.id} className="p-3.5 flex items-center justify-between gap-2 hover:bg-slate-50">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{comp.companyName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{comp.companyEmail}</p>
                    <p className="text-[10px] text-slate-400">{comp.city || "Pune"} • {comp.employer?.fullName || "Recruiter"}</p>
                  </div>
                  <Link to="/admin/companies">
                    <Button variant="outline" size="sm">Review</Button>
                  </Link>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">
                <CheckCircleIcon className="h-6 w-6 text-emerald-500 mx-auto mb-1" />
                No pending company verifications.
              </div>
            )}
          </div>
          <div className="border-t border-slate-100 p-2.5 text-center">
            <Link to="/admin/companies" className="text-xs font-semibold text-blue-600 hover:underline">
              View all company requests &rarr;
            </Link>
          </div>
        </Card>

        {/* Pending Walk-In Drives Queue */}
        <Card
          title="Pending Walk-In Drive Approvals"
          subtitle="Drives submitted by employers for publishing"
          padding="p-0"
        >
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {pendingDrives.length > 0 ? (
              pendingDrives.map((drive) => (
                <div key={drive.id} className="p-3.5 flex items-center justify-between gap-2 hover:bg-slate-50">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-900 truncate">{drive.title}</p>
                      <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {drive.campusType === "ON_CAMPUS" ? "CAMPUS" : "OFF-CAMPUS"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{drive.company?.companyName || "Employer"}</p>
                    <p className="text-[10px] text-slate-400">Date: {drive.interviewDate} • Seats: {drive.capacity || 200}</p>
                  </div>
                  <Link to="/admin/drive-approvals">
                    <Button variant="outline" size="sm">Review</Button>
                  </Link>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">
                <CheckCircleIcon className="h-6 w-6 text-emerald-500 mx-auto mb-1" />
                No pending drive approvals.
              </div>
            )}
          </div>
          <div className="border-t border-slate-100 p-2.5 text-center">
            <Link to="/admin/drive-approvals" className="text-xs font-semibold text-blue-600 hover:underline">
              View all drive approvals &rarr;
            </Link>
          </div>
        </Card>
      </div>

      {/* Audit Activity & Platform Logs */}
      <Card title="Live Administrative Audit Trail" subtitle="Recent actions performed on the platform" padding="p-0">
        <div className="divide-y divide-slate-200">
          {activities.length > 0 ? (
            activities.map((act) => (
              <div key={act.id} className="p-4 flex items-start justify-between gap-3 text-xs">
                <div>
                  <p className="font-semibold text-slate-900">{act.title}</p>
                  <p className="text-slate-600 mt-0.5">{act.description}</p>
                  {act.reason && (
                    <p className="text-rose-600 mt-1 italic">Feedback/Reason: {act.reason}</p>
                  )}
                </div>
                <div className="text-right shrink-0 text-[10px] text-slate-400">
                  <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{act.action}</span>
                  <div className="mt-1">{act.createdAt ? new Date(act.createdAt).toLocaleString() : "Recently"}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-xs text-slate-500">
              No recent audit events logged.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
