import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";
import { driveService } from "../../../services/driveService";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import {
  ShieldCheckIcon,
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  BuildingIcon,
} from "../../../components/common/Icons";

export function AdminDashboardPlaceholder() {
  const { user, logout } = useAuth();
  const [pendingDrives, setPendingDrives] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const drives = await driveService.getDrives();
        setPendingDrives(drives.filter((d) => d.approvalStatus === "Pending Approval"));
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 antialiased">
      {/* Top Navbar */}
      <header className="border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-sm">
            ADM
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">
              Platform Administration Portal
            </h1>
            <p className="text-2xs text-slate-500">
              Module Owner: Sahil (Admin, Approvals, Queue & Reports)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
            Logged in as: <span className="font-bold text-slate-900">{user?.name}</span>
          </span>
          <Button variant="outline" size="sm" onClick={logout}>
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Badge variant="indigo" size="md">
                Admin Role Clearance Confirmed
              </Badge>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                Welcome, {user?.name || "Administrator"}
              </h2>
              <p className="mt-1 text-xs text-slate-500 max-w-xl">
                This screen serves as the integration-ready boundary for Sahil's upcoming Admin Dashboard. Authentication, role guards, and session state are active and verified.
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
              <ShieldCheckIcon className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Pending Approval Drives Preview (Sahil's integration queue) */}
        <Card
          title="Walk-In Drives Awaiting Admin Approval"
          subtitle="Drives submitted by employers (Ritik) requiring Sahil's review"
          padding="p-6"
        >
          {pendingDrives.length > 0 ? (
            <div className="space-y-3">
              {pendingDrives.map((d) => (
                <div
                  key={d.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50/50"
                >
                  <div className="space-y-1">
                    <span className="text-2xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-sm">
                      {d.approvalStatus}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{d.title}</h4>
                    <p className="text-xs text-slate-600">
                      Date: {d.interviewDate} • Venue: {d.venueName}, {d.city}
                    </p>
                  </div>
                  <div className="text-2xs font-semibold text-slate-500">
                    Ready for Sahil's Admin Approval Interface
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-4 text-center">
              No walk-in drives currently pending approval.
            </p>
          )}
        </Card>

        {/* Operational Modules Notice */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <BuildingIcon className="h-5 w-5 text-blue-600 mb-2" />
            <h4 className="font-bold text-slate-900">Employer Verification</h4>
            <p className="text-slate-500 mt-1">
              Verify corporate credentials and GST/registration proofs.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <ClockIcon className="h-5 w-5 text-indigo-600 mb-2" />
            <h4 className="font-bold text-slate-900">Interview Room Queue</h4>
            <p className="text-slate-500 mt-1">
              Token caller system and interviewer scoring panels.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <UsersIcon className="h-5 w-5 text-emerald-600 mb-2" />
            <h4 className="font-bold text-slate-900">Platform Analytics</h4>
            <p className="text-slate-500 mt-1">
              Track attendance, candidate turnout, and offers across Pune hubs.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-4 text-center text-xs text-slate-500">
        Admin Portal Placeholder • Pune Walk-In Drive Platform
      </footer>
    </div>
  );
}
