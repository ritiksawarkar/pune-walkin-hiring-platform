import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";
import {
  DashboardIcon,
  BuildingIcon,
  BriefcaseIcon,
  CalendarIcon,
  UsersIcon,
  ClipboardListIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ChevronDownIcon,
  XIcon,
} from "../common/Icons";

export function EmployerSidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Track if current route is within walk-in drives
  const isDrivesRoute = location.pathname.startsWith("/employer/drives");

  // Keep submenu open if current route is inside drives, or user toggles
  const [drivesExpanded, setDrivesExpanded] = useState(() => isDrivesRoute);

  useEffect(() => {
    if (isDrivesRoute) {
      setDrivesExpanded(true);
    }
  }, [isDrivesRoute]);

  const handleDrivesHeaderClick = (e) => {
    e.preventDefault();
    setDrivesExpanded((prev) => !prev);
    // If not currently in drives, navigate to On-Campus by default
    if (!isDrivesRoute) {
      navigate("/employer/drives/on-campus");
      if (onClose) onClose();
    }
  };

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
                Employer & Recruiter Portal
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-slate-400 hover:text-white"
            aria-label="Close menu"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Company Quick Card */}
        <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-800 text-blue-400 font-bold text-xs border border-slate-700">
              TS
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <p className="truncate text-xs font-semibold text-slate-200">
                  {user?.companyName || "TechSprint Innovations"}
                </p>
                <ShieldCheckIcon className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              </div>
              <p className="truncate text-2xs text-slate-400">
                Magarpatta Cybercity, Pune
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="px-3 pb-2 text-2xs font-bold uppercase tracking-wider text-slate-400">
            Recruitment Management
          </p>

          {/* Dashboard */}
          <NavLink
            to="/employer/dashboard"
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

          {/* Company Profile */}
          <NavLink
            to="/employer/company"
            onClick={() => onClose && onClose()}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white shadow-xs font-semibold"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`
            }
          >
            <BuildingIcon className="h-4.5 w-4.5 shrink-0" />
            <span>Company Profile</span>
          </NavLink>

          {/* Jobs & Openings */}
          <NavLink
            to="/employer/jobs"
            onClick={() => onClose && onClose()}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white shadow-xs font-semibold"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`
            }
          >
            <BriefcaseIcon className="h-4.5 w-4.5 shrink-0" />
            <span>Jobs & Openings</span>
          </NavLink>

          {/* Walk-In Drives Collapsible Submenu */}
          <div>
            <button
              type="button"
              onClick={handleDrivesHeaderClick}
              className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isDrivesRoute
                  ? "bg-slate-800/90 text-white font-semibold"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-4.5 w-4.5 shrink-0 text-blue-400" />
                <span>Walk-In Drives</span>
              </div>
              <ChevronDownIcon
                className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                  drivesExpanded ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Submenu Children */}
            {drivesExpanded && (
              <div className="mt-1 ml-4 pl-3 border-l-2 border-slate-700/80 space-y-1 py-1">
                <NavLink
                  to="/employer/drives/on-campus"
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white font-semibold shadow-xs"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`
                  }
                >
                  <span>On-Campus Walk-In Drives</span>
                  <span className="text-2xs bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono">
                    Colleges
                  </span>
                </NavLink>

                <NavLink
                  to="/employer/drives/off-campus"
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white font-semibold shadow-xs"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`
                  }
                >
                  <span>Off-Campus Walk-In Drives</span>
                  <span className="text-2xs bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                    Open
                  </span>
                </NavLink>
              </div>
            )}
          </div>

          {/* Candidates */}
          <NavLink
            to="/employer/candidates"
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
            <span>Candidates</span>
          </NavLink>

          {/* Applications */}
          <NavLink
            to="/employer/applications"
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
            <span>Applications</span>
          </NavLink>

          {/* Recruitment Pipeline */}
          <NavLink
            to="/employer/pipeline"
            onClick={() => onClose && onClose()}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white shadow-xs font-semibold"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`
            }
          >
            <ChartBarIcon className="h-4.5 w-4.5 shrink-0" />
            <span>Recruitment Pipeline</span>
          </NavLink>
        </div>

        {/* Recruiter Profile Footer */}
        <div className="border-t border-slate-800 p-3.5 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold">
              {user?.name
                ? user.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                : "RS"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-200 truncate">
                {user?.name || "Ritik Sawarkar"}
              </p>
              <p className="text-2xs text-slate-400 truncate">
                {user?.designation || "Lead Recruiter (Employer)"}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}


