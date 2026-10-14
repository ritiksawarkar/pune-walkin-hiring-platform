import { useState, useEffect } from "react";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { adminService } from "../../../services/adminService";

export function ReportsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await adminService.getStats();
        if (mounted) setStats(data);
      } catch (err) {
        if (mounted) setError(err.message || "Failed to load platform statistics");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchStats();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-sm text-slate-500 bg-white rounded-2xl border border-slate-200">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mb-2" />
        <p>Loading platform reports and analytics from database...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 text-center text-sm text-rose-600 bg-rose-50 rounded-2xl border border-rose-200">
        {error || "Unable to display analytics."}
      </div>
    );
  }

  const totalCandidates = stats.totalCandidates || 0;
  const selected = stats.selectedApplications || 0;
  const totalApps = stats.totalApplications || 0;
  const conversionRate = totalApps ? Math.round((selected / totalApps) * 100) : 0;

  const distribution = [
    { label: "Approved Candidates", value: stats.approvedCandidates || 0, total: totalCandidates },
    { label: "Pending Verification", value: stats.pendingCandidates || 0, total: totalCandidates },
    { label: "Total Applications", value: totalApps, total: Math.max(totalApps, 1) },
    { label: "Selected Candidates", value: selected, total: Math.max(totalApps, 1) },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Live Active Jobs</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.activeJobs || stats.totalJobs || 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Approved Drives</p>
          <p className="mt-2 text-2xl font-bold text-blue-600">{stats.approvedDrives || 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Verified Companies</p>
          <p className="mt-2 text-2xl font-bold text-amber-600">{stats.verifiedCompanies || 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Placement Rate</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{conversionRate}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card title="Talent & Verification Funnel" subtitle="Platform metrics directly calculated from MySQL" padding="p-5">
          <div className="space-y-4">
            {distribution.map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                  <span>{item.label}</span>
                  <span className="font-semibold text-slate-900">{item.value}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${Math.max((item.value / Math.max(item.total, 1)) * 100, 6)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Operational Snapshot" subtitle="Summary of live database entities" padding="p-5">
          <div className="space-y-3 text-sm text-slate-700">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span>Total registered candidates</span>
              <Badge variant="primary" size="sm">{stats.totalCandidates || 0}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span>On-Campus vs Off-Campus drives</span>
              <div className="flex gap-2">
                <Badge variant="neutral" size="sm">On-Campus: {stats.onCampusDrives || 0}</Badge>
                <Badge variant="neutral" size="sm">Off-Campus: {stats.offCampusDrives || 0}</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span>Selected candidate applications</span>
              <Badge variant="success" size="sm">{selected}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span>Total employers registered</span>
              <Badge variant="warning" size="sm">{stats.totalCompanies || 0}</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
