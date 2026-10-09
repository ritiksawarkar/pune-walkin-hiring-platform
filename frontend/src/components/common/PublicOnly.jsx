import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";

export function PublicOnly({ children }) {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    if (role === "ADMIN") return <Navigate to="/admin/dashboard" replace />;
    if (role === "EMPLOYER") return <Navigate to="/employer/dashboard" replace />;
    if (role === "CANDIDATE") return <Navigate to="/candidate/dashboard" replace />;
  }

  return children ? children : <Outlet />;
}
