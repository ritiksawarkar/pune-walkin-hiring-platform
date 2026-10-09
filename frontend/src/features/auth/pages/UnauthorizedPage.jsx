import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { AlertCircleIcon, ShieldCheckIcon } from "../../../components/common/Icons";
import { Button } from "../../../components/ui/Button";

export function UnauthorizedPage() {
  const { user, logout } = useAuth();

  const getDashboardLink = () => {
    if (user?.role === "ADMIN") return "/admin/dashboard";
    if (user?.role === "EMPLOYER") return "/employer/dashboard";
    if (user?.role === "CANDIDATE") return "/candidate/dashboard";
    return "/login";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm space-y-5">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200">
          <AlertCircleIcon className="h-8 w-8" />
        </div>

        <div>
          <span className="text-2xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
            403 • Access Forbidden
          </span>
          <h2 className="mt-3 text-xl font-bold text-slate-900">
            Unauthorized Role Access
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
            You are authenticated as <span className="font-bold text-slate-800">{user?.name || "Guest"}</span> with assigned role <span className="font-bold text-blue-600">{user?.role || "NONE"}</span>. You do not have security clearance for this protected area.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-2xs text-slate-600 text-left space-y-1">
          <p className="font-semibold text-slate-800 flex items-center gap-1.5">
            <ShieldCheckIcon className="h-4 w-4 text-blue-600" />
            Strict Role-Based Access Control (RBAC)
          </p>
          <p className="text-slate-500">
            The platform strictly separates ADMIN, EMPLOYER, and CANDIDATE workspaces to ensure operational privacy.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Link to={getDashboardLink()} className="w-full">
            <Button variant="primary" size="md" className="w-full">
              Go to My Authorized Dashboard
            </Button>
          </Link>
          <Button
            variant="outline"
            size="md"
            className="w-full"
            onClick={logout}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
