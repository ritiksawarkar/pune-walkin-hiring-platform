import {
  BriefcaseIcon,
  CalendarIcon,
  UsersIcon,
  CheckCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
} from "../../../components/common/Icons";

export function RecruitmentStats({ stats }) {
  const statCards = [
    {
      title: "Total Jobs Posted",
      value: stats.totalJobs,
      subValue: `${stats.activeJobs} Active Openings`,
      icon: BriefcaseIcon,
      color: "blue",
    },
    {
      title: "Walk-In Drives",
      value: stats.totalDrives,
      subValue: `${stats.approvedDrives} Approved & Live`,
      icon: CalendarIcon,
      color: "emerald",
    },
    {
      title: "Drives Pending Approval",
      value: stats.pendingDrives,
      subValue: "Awaiting Admin (Sahil)",
      icon: ClockIcon,
      color: "amber",
    },
    {
      title: "Total Candidate Applications",
      value: stats.totalCandidates,
      subValue: `${stats.shortlistedCandidates} Shortlisted for Walk-In`,
      icon: UsersIcon,
      color: "indigo",
    },
    {
      title: "Shortlisted Candidates",
      value: stats.shortlistedCandidates,
      subValue: "Eligible for on-site tests",
      icon: CheckCircleIcon,
      color: "green",
    },
    {
      title: "Final Selections",
      value: stats.selectedCandidates,
      subValue: "Offers Extended",
      icon: ShieldCheckIcon,
      color: "purple",
    },
  ];

  const colorStyles = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    green: "bg-emerald-50 text-emerald-600 border-emerald-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {statCards.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="flex items-center justify-between p-5 rounded-xl border border-slate-200/80 bg-white shadow-2xs hover:border-slate-300 transition-colors"
          >
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {item.title}
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{item.value}</p>
              <p className="mt-1 text-xs text-slate-600 font-medium">
                {item.subValue}
              </p>
            </div>
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl border ${
                colorStyles[item.color] || colorStyles.blue
              }`}
            >
              <Icon className="h-6 w-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
