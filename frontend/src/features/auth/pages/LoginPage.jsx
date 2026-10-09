import { useState } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../../../context/ToastContext";
import { AuthLayout } from "../components/AuthLayout";
import { PasswordField } from "../components/PasswordField";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { validateEmail, validatePassword } from "../utils/authValidation";
import {
  AlertCircleIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  BriefcaseIcon,
  UsersIcon,
} from "../../../components/common/Icons";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const roleHint = searchParams.get("role") || "";

  const { login } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    email: roleHint === "ADMIN" ? "admin@punewalkin.gov.in" : roleHint === "CANDIDATE" ? "candidate@example.com" : "careers@techsprint.io",
    password: roleHint === "ADMIN" ? "Admin@123" : roleHint === "CANDIDATE" ? "Candidate@123" : "Employer@123",
    rememberMe: true,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    setServerError("");
  };

  const validate = () => {
    const errs = {};
    const emailErr = validateEmail(formData.email);
    if (emailErr) errs.email = emailErr;

    const passErr = validatePassword(formData.password);
    if (passErr) errs.password = passErr;

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      setServerError("");
      const user = await login(formData.email, formData.password);

      showToast(`Welcome back, ${user.name}!`);

      // Destination strictly determined by authenticated account's assigned role
      const intendedDestination = location.state?.from?.pathname;
      if (intendedDestination && !intendedDestination.startsWith("/login")) {
        // Only redirect to intended if role matches destination
        if (user.role === "EMPLOYER" && intendedDestination.startsWith("/employer")) {
          navigate(intendedDestination, { replace: true });
          return;
        }
        if (user.role === "ADMIN" && intendedDestination.startsWith("/admin")) {
          navigate(intendedDestination, { replace: true });
          return;
        }
        if (user.role === "CANDIDATE" && intendedDestination.startsWith("/candidate")) {
          navigate(intendedDestination, { replace: true });
          return;
        }
      }

      // Default role dashboards
      if (user.role === "ADMIN") {
        navigate("/admin/dashboard", { replace: true });
      } else if (user.role === "EMPLOYER") {
        navigate("/employer/dashboard", { replace: true });
      } else {
        navigate("/candidate/dashboard", { replace: true });
      }
    } catch (err) {
      setServerError(
        err.message || "Invalid credentials. Please verify your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-click credentials filler for development testing
  const handleQuickFill = (role) => {
    if (role === "ADMIN") {
      setFormData({
        email: "admin@punewalkin.gov.in",
        password: "Admin@123",
        rememberMe: true,
      });
    } else if (role === "EMPLOYER") {
      setFormData({
        email: "careers@techsprint.io",
        password: "Employer@123",
        rememberMe: true,
      });
    } else if (role === "CANDIDATE") {
      setFormData({
        email: "candidate@example.com",
        password: "Candidate@123",
        rememberMe: true,
      });
    }
    setErrors({});
    setServerError("");
  };

  return (
    <AuthLayout
      title="Platform Sign In"
      subtitle="Enter your verified credentials to access your portal"
      footerText="Don't have an account yet?"
      footerLink="/register/candidate"
      footerActionText="Create Candidate Account"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <div className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            <AlertCircleIcon className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          error={errors.email}
          placeholder="your.email@example.com"
          autoComplete="email"
        />

        <PasswordField
          label="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          error={errors.password}
          placeholder="Enter account password"
        />

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
            />
            <span>Remember session</span>
          </label>

          <Link
            to="/forgot-password"
            className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={loading}
          className="w-full mt-2"
        >
          Sign In to Portal
        </Button>
      </form>

      {/* Quick Demo Login Credentials Bar for Pair Testing */}
      <div className="mt-6 pt-5 border-t border-slate-100">
        <p className="text-2xs font-bold uppercase tracking-wider text-slate-400 text-center mb-2.5">
          Quick Demo Credentials (Mock Mode)
        </p>
        <div className="grid grid-cols-3 gap-2 text-2xs">
          <button
            type="button"
            onClick={() => handleQuickFill("ADMIN")}
            className="flex flex-col items-center p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
          >
            <ShieldCheckIcon className="h-4 w-4 text-slate-600 mb-1" />
            <span className="font-bold">Admin</span>
            <span className="text-3xs text-slate-400">Sahil</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickFill("EMPLOYER")}
            className="flex flex-col items-center p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
          >
            <BriefcaseIcon className="h-4 w-4 text-blue-600 mb-1" />
            <span className="font-bold">Employer</span>
            <span className="text-3xs text-slate-400">Ritik</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickFill("CANDIDATE")}
            className="flex flex-col items-center p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
          >
            <UsersIcon className="h-4 w-4 text-emerald-600 mb-1" />
            <span className="font-bold">Candidate</span>
            <span className="text-3xs text-slate-400">Yadit</span>
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
