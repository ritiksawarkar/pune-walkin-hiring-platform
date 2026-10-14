import { useState, useEffect } from "react";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { adminService } from "../../../services/adminService";

export function ActivityLogsPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await adminService.getActivityLogs(0, 50);
        const list = data?.content || (Array.isArray(data) ? data : []);
        if (mounted) setActivities(list);
      } catch (err) {
        if (mounted) setError(err.message || "Failed to load audit logs");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchLogs();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-6">
      <Card title="Platform Activity Log" subtitle="Live audit trail of system events, registrations, and administrative reviews" padding="p-0">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mb-2" />
            <p>Loading activity audit logs from database...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-sm text-rose-600 bg-rose-50 rounded-b-2xl">
            {error}
          </div>
        ) : activities.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No activity records recorded in database yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {activities.map((activity) => (
              <div key={activity.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between hover:bg-slate-50/50 transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">{activity.title || activity.action}</span>
                    <Badge variant="neutral" size="sm">
                      {activity.entityType || "SYSTEM"}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600">{activity.description}</p>
                  {activity.reason && (
                    <p className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-0.5 inline-block">
                      Note: {activity.reason}
                    </p>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 whitespace-nowrap">
                  {activity.createdAt ? new Date(activity.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Recent"}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
