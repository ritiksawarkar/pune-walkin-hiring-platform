import { useMemo, useState, useEffect } from "react";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { adminService } from "../../../services/adminService";

const statusOptions = ["All", "REGISTERED", "UNDER_REVIEW", "SHORTLISTED", "INTERVIEW_SCHEDULED", "SELECTED", "ON_HOLD", "REJECTED"];

export function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    let mounted = true;
    const fetchApps = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await adminService.getApplications(0, 100);
        const list = data?.content || (Array.isArray(data) ? data : []);
        if (mounted) setApplications(list);
      } catch (err) {
        if (mounted) setError(err.message || "Failed to load applications");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchApps();
    return () => { mounted = false; };
  }, []);

  const filteredApplications = useMemo(() => {
    if (filter === "All") return applications;
    return applications.filter((app) => app.status?.toUpperCase() === filter.toUpperCase());
  }, [applications, filter]);

  const shortlistedCount = applications.filter((app) => app.status === "SHORTLISTED").length;
  const interviewCount = applications.filter((app) => app.status === "INTERVIEW_SCHEDULED").length;
  const selectedCount = applications.filter((app) => app.status === "SELECTED").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Total applicants</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{applications.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Shortlisted</p>
          <p className="mt-2 text-2xl font-bold text-blue-600">{shortlistedCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Interview scheduled</p>
          <p className="mt-2 text-2xl font-bold text-amber-600">{interviewCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Selected</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{selectedCount}</p>
        </div>
      </div>

      <Card title="Candidate Pipeline" subtitle="Real-time application lifecycle from registration to final selection" padding="p-0">
        <div className="border-b border-slate-200 p-4">
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilter(status)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium border transition ${
                  filter === status ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {status.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mb-2" />
            <p>Loading candidate applications from database...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-sm text-rose-600 bg-rose-50">
            {error}
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No applications found for the selected status.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Candidate</th>
                  <th className="px-4 py-3 font-medium">Drive</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Token</th>
                  <th className="px-4 py-3 font-medium">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredApplications.map((application) => {
                  const candName = application.candidate?.collegeName
                    ? `${application.candidate.degree || "Candidate"} (${application.candidate.collegeName})`
                    : application.candidateName || "Registered Candidate";
                  const driveTitle = application.drive?.title || application.driveTitle || "Walk-In Drive";
                  return (
                    <tr key={application.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{candName}</div>
                        <div className="text-[11px] text-slate-500">{application.candidate?.phone || application.email || ""}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        <div className="font-medium text-slate-900">{driveTitle}</div>
                        <div className="text-[11px] text-slate-500">{application.company?.companyName || application.companyName || ""}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            application.status === "SELECTED" ? "success" :
                            application.status === "REJECTED" ? "danger" :
                            application.status === "INTERVIEW_SCHEDULED" ? "warning" :
                            application.status === "SHORTLISTED" ? "primary" : "neutral"
                          }
                          size="sm"
                        >
                          {application.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-mono font-medium text-blue-700">{application.tokenNumber || "—"}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {application.rating && application.rating > 0 ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                            ★ {application.rating}
                          </span>
                        ) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
