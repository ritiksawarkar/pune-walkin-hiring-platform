import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";
import {
  DashboardIcon,
  UsersIcon,
  CalendarIcon,
  BriefcaseIcon,
  BuildingIcon,
  ClipboardListIcon,
  ClockIcon,
  BellIcon,
  SettingsIcon,
  FileTextIcon,
  XIcon,
} from "../common/Icons";

export function CandidateSidebar({ isOpen, onClose, unreadCount = 0 }) {
  const { user } = useAuth();
  const location = useLocation();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "AD";

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-lg shadow-sm">
              PW
            </div>
            <div>
              <span className="block text-sm font-semibold tracking-wide text-white">
                Pune Walk-In Hub
              </span>
              <span className="block text-2xs text-blue-400 font-medium">
                Candidate Career Portal
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-slate-400 hover:text-white"
            aria-label="Close navigation"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Pune Job Seeker Badge */}
        <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-900/40 text-blue-300 font-bold text-xs border border-blue-700/50">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-200">
                {user?.name || "Amit Deshmukh"}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <p className="truncate text-2xs text-slate-400">
                  Pune Candidate Active
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="px-3 pb-2 text-2xs font-bold uppercase tracking-wider text-slate-400">
            Candidate Menu
          </p>

          {/* Dashboard */}
          <NavLink
            to="/candidate/dashboard"
            onClick={() => onClose && onClose()}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white shadow-xs font-semibold"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`
            }
          >
            <DashboardIcon className="h-4.5 w-4.5 shrink-0" />
            <span>Dashboard</span>
          </NavLink>

          {/* My Profile */}
          <NavLink
            to="/candidate/profile"
            onClick={() => onClose && onClose()}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white shadow-xs font-semibold"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`
            }
          >
            <UsersIcon className="h-4.5 w-4.5 shrink-0" />
            <span>My Profile</span>
          </NavLink>

          {/* Resume */}
          <NavLink
            to="/candidate/resume"
            onClick={() => onClose && onClose()}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white shadow-xs font-semibold"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`
            }
          >
            <FileTextIcon className="h-4.5 w-4.5 shrink-0" />
            <span>Resume</span>
          </NavLink>

          {/* Walk-In Drives Sub-Section */}
          <div className="pt-2">
            <p className="px-3 pb-1.5 text-3xs font-bold uppercase tracking-wider text-blue-400/80">
              Walk-In Opportunities
            </p>

            {/* Browse All Walk-In Drives */}
            <NavLink
              to="/candidate/drives"
              onClick={() => onClose && onClose()}
              className={() => {
                const isActive = location.pathname === "/candidate/drives" &&
                  (!location.search || location.search === "" || location.search.includes("campus=ALL"));
                return `flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white shadow-xs font-semibold"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`;
              }}
            >
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-4.5 w-4.5 shrink-0 text-blue-400" />
                <span>Browse All Walk-In Drives</span>
              </div>
            </NavLink>

            {/* On-Campus Drives */}
            <NavLink
              to="/candidate/drives?campus=ON_CAMPUS"
              onClick={() => onClose && onClose()}
              className={() => {
                const isActive = location.pathname === "/candidate/drives" && location.search.includes("campus=ON_CAMPUS");
                return `flex items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ml-2 pl-3 border-l-2 border-slate-700/80 ${
                  isActive
                    ? "bg-blue-600 text-white font-semibold shadow-xs border-blue-400"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`;
              }}
            >
              <div className="flex items-center gap-2.5">
                <BuildingIcon className="h-4 w-4 shrink-0 text-blue-300" />
                <span>On-Campus Drives</span>
              </div>
              <span className="text-3xs bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono">
                Colleges
              </span>
            </NavLink>

            {/* Off-Campus Drives */}
            <NavLink
              to="/candidate/drives?campus=OFF_CAMPUS"
              onClick={() => onClose && onClose()}
              className={() => {
                const isActive = location.pathname === "/candidate/drives" && location.search.includes("campus=OFF_CAMPUS");
                return `flex items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ml-2 pl-3 border-l-2 border-slate-700/80 ${
                  isActive
                    ? "bg-blue-600 text-white font-semibold shadow-xs border-emerald-400"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`;
              }}
            >
              <div className="flex items-center gap-2.5">
                <BriefcaseIcon className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>Off-Campus Drives</span>
              </div>
              <span className="text-3xs bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                Open
              </span>
            </NavLink>
          </div>

          {/* My Applications */}
          <NavLink
            to="/candidate/applications"
            onClick={() => onClose && onClose()}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white shadow-xs font-semibold"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`
            }
          >
            <ClipboardListIcon className="h-4.5 w-4.5 shrink-0" />
            <span>My Applications</span>
          </NavLink>

          {/* My Interviews */}
          <NavLink
            to="/candidate/interviews"
            onClick={() => onClose && onClose()}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white shadow-xs font-semibold"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`
            }
          >
            <ClockIcon className="h-4.5 w-4.5 shrink-0" />
            <span>My Interviews</span>
          </NavLink>

          {/* Notifications */}
          <NavLink
            to="/candidate/notifications"
            onClick={() => onClose && onClose()}
            className={({ isActive }) =>
              `flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white shadow-xs font-semibold"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`
            }
          >
            <div className="flex items-center gap-3">
              <BellIcon className="h-4.5 w-4.5 shrink-0" />
              <span>Notifications</span>
            </div>
            {unreadCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-2xs font-bold text-slate-950">
                {unreadCount}
              </span>
            )}
          </NavLink>

          {/* Settings */}
          <NavLink
            to="/candidate/settings"
            onClick={() => onClose && onClose()}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white shadow-xs font-semibold"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`
            }
          >
            <SettingsIcon className="h-4.5 w-4.5 shrink-0" />
            <span>Settings</span>
          </NavLink>
        </div>

        {/* Candidate Profile Footer */}
        <div className="border-t border-slate-800 p-3.5 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-200 truncate">
                {user?.name || "Candidate"}
              </p>
              <p className="text-2xs text-slate-400 truncate">
                {user?.email || "candidate@example.com"}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
