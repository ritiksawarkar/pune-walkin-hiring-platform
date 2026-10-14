import { useMemo, useState, useEffect } from "react";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { adminService } from "../../../services/adminService";

const statusOptions = ["All", "Active", "Draft", "Approved", "Pending", "Published"];

export function JobsAndDrivesPage() {
  const [jobs, setJobs] = useState([]);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [jobsRes, drivesRes] = await Promise.all([
          adminService.getJobs(0, 100).catch(() => ({ content: [] })),
          adminService.getDrives({ page: 0, size: 100 }).catch(() => ({ content: [] })),
        ]);
        if (mounted) {
          setJobs(jobsRes?.content || (Array.isArray(jobsRes) ? jobsRes : []));
          setDrives(drivesRes?.content || (Array.isArray(drivesRes) ? drivesRes : []));
        }
      } catch (err) {
        if (mounted) setError(err.message || "Failed to load jobs and drives");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, []);

  const combined = useMemo(() => {
    const filteredJobs = filter === "All" ? jobs : jobs.filter((job) =>
      job.status?.toLowerCase() === filter.toLowerCase()
    );
    const filteredDrives = filter === "All" ? drives : drives.filter((drive) =>
      drive.approvalStatus?.toLowerCase() === filter.toLowerCase() ||
      drive.driveStatus?.toLowerCase() === filter.toLowerCase()
    );
    return { filteredJobs, filteredDrives };
  }, [drives, filter, jobs]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
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
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm text-slate-500 bg-white rounded-2xl border border-slate-200">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mb-2" />
          <p>Loading jobs and walk-in drives from database...</p>
        </div>
      ) : error ? (
        <div className="p-6 text-center text-sm text-rose-600 bg-rose-50 rounded-2xl border border-rose-200">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card title="Jobs" subtitle="Current corporate job openings from MySQL" padding="p-0">
            <div className="divide-y divide-slate-100">
              {combined.filteredJobs.length > 0 ? (
                combined.filteredJobs.map((job) => (
                  <div key={job.id} className="p-4 hover:bg-slate-50/50 transition">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{job.title}</p>
                        <p className="mt-1 text-[11px] text-slate-500">
                          {job.department || "General"} • {job.location || "Pune"} • {job.employmentType || "Full-Time"}
                        </p>
                      </div>
                      <Badge variant={job.status === "ACTIVE" ? "success" : job.status === "DRAFT" ? "warning" : "neutral"} size="sm">
                        {job.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-sm text-slate-500">No jobs match the selected filter.</div>
              )}
            </div>
          </Card>

          <Card title="Walk-In Drives" subtitle="Walk-in drive events and readiness" padding="p-0">
            <div className="divide-y divide-slate-100">
              {combined.filteredDrives.length > 0 ? (
                combined.filteredDrives.map((drive) => (
                  <div key={drive.id} className="p-4 hover:bg-slate-50/50 transition">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{drive.title}</p>
                        <p className="mt-1 text-[11px] text-slate-500">
                          {drive.city || "Pune"} • Drive Date: {drive.driveDate || "TBA"} • {drive.campusType?.replace(/_/g, " ")}
                        </p>
                      </div>
                      <Badge
                        variant={
                          drive.approvalStatus === "APPROVED" ? "success" :
                          drive.approvalStatus === "PENDING" ? "warning" :
                          drive.approvalStatus === "REJECTED" ? "danger" : "neutral"
                        }
                        size="sm"
                      >
                        {drive.approvalStatus || drive.driveStatus}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-sm text-slate-500">No drives match the selected filter.</div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
