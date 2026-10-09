import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { recruitmentService } from "../../../services/recruitmentService";
import { driveService } from "../../../services/driveService";
import { useToast } from "../../../context/ToastContext";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { ApplicationStatusBadge } from "../components/ApplicationStatusBadge";
import {
  ChartBarIcon,
  UsersIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertCircleIcon,
} from "../../../components/common/Icons";

export function RecruitmentPipelinePage() {
  const [searchParams] = useSearchParams();
  const initialDrive = searchParams.get("driveId") || "All";

  const { showToast } = useToast();
  const [pipelineData, setPipelineData] = useState(null);
  const [drives, setDrives] = useState([]);
  const [selectedDrive, setSelectedDrive] = useState(initialDrive);
  const [loading, setLoading] = useState(true);

  const loadPipeline = useCallback(async () => {
    try {
      setLoading(true);
      const [pipe, drivesList] = await Promise.all([
        recruitmentService.getRecruitmentPipeline(selectedDrive),
        driveService.getDrives(),
      ]);
      setPipelineData(pipe);
      setDrives(drivesList);
    } catch (err) {
      showToast("Error loading recruitment pipeline.", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedDrive, showToast]);

  useEffect(() => {
    loadPipeline();
  }, [loadPipeline]);

  const colorStyles = {
    blue: {
      border: "border-blue-200",
      bg: "bg-blue-50/50",
      pill: "bg-blue-600",
      text: "text-blue-700",
    },
    amber: {
      border: "border-amber-200",
      bg: "bg-amber-50/50",
      pill: "bg-amber-500",
      text: "text-amber-700",
    },
    emerald: {
      border: "border-emerald-200",
      bg: "bg-emerald-50/50",
      pill: "bg-emerald-600",
      text: "text-emerald-700",
    },
    indigo: {
      border: "border-indigo-200",
      bg: "bg-indigo-50/50",
      pill: "bg-indigo-600",
      text: "text-indigo-700",
    },
    green: {
      border: "border-emerald-300",
      bg: "bg-emerald-50",
      pill: "bg-emerald-700",
      text: "text-emerald-800",
    },
    purple: {
      border: "border-purple-200",
      bg: "bg-purple-50/50",
      pill: "bg-purple-600",
      text: "text-purple-700",
    },
    rose: {
      border: "border-rose-200",
      bg: "bg-rose-50/50",
      pill: "bg-rose-600",
      text: "text-rose-700",
    },
  };

  return (
    <div className="space-y-6">
      {/* Header and Drive Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Recruitment Funnel & Candidate Pipeline
          </h2>
          <p className="text-xs text-slate-500">
            Real-time stage conversions from portal registration to final offer rollout
          </p>
        </div>

        <div className="w-full sm:w-72">
          <select
            value={selectedDrive}
            onChange={(e) => setSelectedDrive(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="All">All Walk-In Drives (Aggregated)</option>
            {drives.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title} ({d.interviewDate})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
        </div>
      ) : pipelineData ? (
        <>
          {/* Visual Distribution Summary Banner */}
          <Card padding="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Total Active Pool: {pipelineData.total} Candidates
                </h3>
                <p className="text-xs text-slate-500">
                  Stage distribution calculated dynamically from single candidate source of truth
                </p>
              </div>
            </div>

            {/* Segmented Funnel Bar */}
            <div className="h-4 w-full rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
              {pipelineData.stages.map((st) => {
                if (st.count === 0) return null;
                const style = colorStyles[st.color] || colorStyles.blue;
                return (
                  <div
                    key={st.id}
                    title={`${st.label}: ${st.count} (${st.percentage}%)`}
                    style={{ width: `${st.percentage}%` }}
                    className={`${style.pill} transition-all hover:opacity-90`}
                  />
                );
              })}
            </div>

            {/* Funnel Legend */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-2xs font-semibold">
              {pipelineData.stages.map((st) => {
                const style = colorStyles[st.color] || colorStyles.blue;
                return (
                  <div key={st.id} className="flex items-center gap-1.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${style.pill}`} />
                    <span className="text-slate-700">
                      {st.label}: {st.count} ({st.percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Pipeline Stage Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pipelineData.stages.map((stage) => {
              const style = colorStyles[stage.color] || colorStyles.blue;
              return (
                <div
                  key={stage.id}
                  className={`rounded-xl border ${style.border} ${style.bg} p-5 flex flex-col justify-between transition-all hover:shadow-xs`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold uppercase tracking-wider ${style.text}`}>
                        {stage.label}
                      </span>
                      <span className="rounded-md bg-white px-2 py-0.5 text-xs font-extrabold text-slate-800 shadow-2xs border border-slate-200">
                        {stage.percentage}%
                      </span>
                    </div>

                    <p className="text-3xl font-extrabold text-slate-900">
                      {stage.count}
                    </p>

                    <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">
                      {stage.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-200/60">
                    <Link
                      to={`/employer/applications?status=${encodeURIComponent(
                        stage.id
                      )}&driveId=${encodeURIComponent(selectedDrive)}`}
                      className="inline-flex items-center justify-between w-full text-xs font-bold text-slate-800 hover:text-blue-600 group"
                    >
                      <span>Review Stage ({stage.count})</span>
                      <ChevronRightIcon className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Integration Handoff Notice Card */}
          <Card padding="p-6" className="bg-slate-900 text-white border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-400" />
                  <span className="text-2xs font-bold uppercase tracking-wider text-indigo-300">
                    Module Handoff Architecture
                  </span>
                </div>
                <h4 className="text-base font-bold text-white">
                  Integration Contract with Yadit & Sahil
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Candidate registrations flow into your queue from Yadit's Candidate Portal. When you mark candidates as{" "}
                  <span className="text-indigo-300 font-semibold">"Interview Scheduled"</span>, they are automatically placed into Sahil's Interview Queue system for token callouts, interviewer evaluations, and live result logging.
                </p>
              </div>

              <Link to="/employer/applications">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700 shrink-0"
                >
                  Manage Applications
                </Button>
              </Link>
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}
