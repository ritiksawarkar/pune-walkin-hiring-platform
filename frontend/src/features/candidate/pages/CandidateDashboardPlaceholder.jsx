import { useState, useEffect } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import { recruitmentService } from "../../../services/recruitmentService";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import {
  UsersIcon,
  CalendarIcon,
  MapPinIcon,
  FileTextIcon,
  ClockIcon,
} from "../../../components/common/Icons";

export function CandidateDashboardPlaceholder() {
  const { user, logout } = useAuth();
  const [myApplications, setMyApplications] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const apps = await recruitmentService.getApplications();
        // Match applications by email or name
        const matched = apps.filter(
          (a) =>
            a.email.toLowerCase() === user?.email?.toLowerCase() ||
            a.candidateName.toLowerCase().includes(user?.name?.toLowerCase() || "")
        );
        setMyApplications(matched);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 antialiased">
      {/* Top Navbar */}
      <header className="border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">
            CD
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">
              Candidate Walk-In Portal
            </h1>
            <p className="text-2xs text-slate-500">
              Module Owner: Yadit (Candidate Profile, Discovery & Applications)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
            Candidate: <span className="font-bold text-slate-900">{user?.name}</span>
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
              <Badge variant="success" size="md">
                Candidate Account Active
              </Badge>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                Welcome, {user?.name || "Candidate"}
              </h2>
              <p className="mt-1 text-xs text-slate-500 max-w-xl">
                This screen serves as the integration-ready boundary for Yadit's upcoming Candidate Profile and Walk-In Drive Discovery module.
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
              <UsersIcon className="h-6 w-6" />
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-semibold uppercase text-2xs">Email</span>
              <p className="font-bold text-slate-800 mt-0.5">{user?.email}</p>
            </div>
            <div>
              <span className="text-slate-400 font-semibold uppercase text-2xs">Phone</span>
              <p className="font-bold text-slate-800 mt-0.5">{user?.phone || "+91 98901 23456"}</p>
            </div>
            <div>
              <span className="text-slate-400 font-semibold uppercase text-2xs">Account Role</span>
              <p className="font-bold text-blue-600 mt-0.5">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Registered Walk-In Applications */}
        <Card
          title="My Registered Walk-In Drives & Passes"
          subtitle="Tokens and interview slots booked on the platform"
          padding="p-6"
        >
          {myApplications.length > 0 ? (
            <div className="space-y-3">
              {myApplications.map((app) => (
                <div
                  key={app.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 font-mono text-xs font-bold text-slate-800">
                        Token: {app.tokenNumber}
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-sm">
                        {app.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{app.driveTitle}</h4>
                    <p className="text-xs text-slate-600">
                      Target Role: {app.jobTitle} • Slot: {app.registrationSlot}
                    </p>
                  </div>
                  <div className="text-left sm:text-right text-xs">
                    <span className="text-slate-400">Date</span>
                    <p className="font-bold text-slate-800">{app.registrationDate}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-slate-500 space-y-2">
              <CalendarIcon className="h-8 w-8 text-slate-300 mx-auto" />
              <p>No registered walk-in drives currently associated with this account.</p>
            </div>
          )}
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-4 text-center text-xs text-slate-500">
        Candidate Portal Placeholder • Pune Walk-In Drive Platform
      </footer>
    </div>
  );
}
