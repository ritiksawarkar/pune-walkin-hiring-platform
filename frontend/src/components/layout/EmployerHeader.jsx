import { Link, useNavigate } from "react-router-dom";
import {
  MenuIcon,
  PlusIcon,
  BriefcaseIcon,
  CalendarIcon,
  RefreshIcon,
} from "../common/Icons";
import { Button } from "../ui/Button";
import { storageService } from "../../services/storageService";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../features/auth/hooks/useAuth";

export function EmployerHeader({ onMenuClick, title, subtitle }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, logout } = useAuth();

  const handleResetData = () => {
    if (
      window.confirm(
        "Reset all employer data (jobs, drives, applications) to default Pune sample data?"
      )
    ) {
      storageService.resetAllData();
      showToast("Employer data successfully restored to default mock data.", "info");
      window.location.reload();
    }
  };

  const handleLogout = () => {
    logout();
    showToast("You have been signed out successfully.", "info");
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/90 bg-white/95 px-4 sm:px-6 backdrop-blur-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle navigation"
        >
          <MenuIcon className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
            {title || "Employer Portal"}
          </h1>
          {subtitle && (
            <p className="hidden sm:block text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Reset Mock Data Utility */}
        <button
          onClick={handleResetData}
          title="Reset to sample demo data"
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <RefreshIcon className="h-3.5 w-3.5 text-slate-500" />
          <span className="hidden md:inline">Reset Demo</span>
        </button>

        {/* Quick Actions */}
        <Link to="/employer/jobs/new">
          <Button
            variant="outline"
            size="sm"
            icon={BriefcaseIcon}
            className="hidden sm:inline-flex"
          >
            Post Job
          </Button>
        </Link>

        <Link to="/employer/drives/new">
          <Button
            variant="primary"
            size="sm"
            icon={PlusIcon}
          >
            <span className="hidden sm:inline">New Walk-In</span>
            <span className="sm:hidden">New Drive</span>
          </Button>
        </Link>

        {/* Logout Action */}
        <button
          onClick={handleLogout}
          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
          title="Sign out of Employer Portal"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}

