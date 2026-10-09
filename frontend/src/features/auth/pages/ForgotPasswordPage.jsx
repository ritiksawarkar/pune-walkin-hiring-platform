import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { AuthLayout } from "../components/AuthLayout";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { validateEmail } from "../utils/authValidation";
import { CheckCircleIcon, ArrowLeftIcon } from "../../../components/common/Icons";

export function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailErr = validateEmail(email);
    if (emailErr) {
      setError(emailErr);
      return;
    }

    try {
      setLoading(true);
      setError("");
      await requestPasswordReset(email);
      setSubmitted(true);
    } catch (err) {
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <AuthLayout
        title="Password Recovery Dispatched"
        subtitle="Check your inbox for reset instructions"
        footerText="Remembered your password?"
        footerLink="/login"
        footerActionText="Back to Sign In"
      >
        <div className="text-center space-y-4 py-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
            <CheckCircleIcon className="h-8 w-8" />
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            If an account is associated with <span className="font-semibold text-slate-900">{email}</span>, a secure password reset link has been dispatched with recovery steps.
          </p>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-2xs text-slate-500 text-left">
            <span className="font-bold text-slate-700">Developer Note (Mock Mode): </span>
            In development prototype mode, no actual SMTP email is dispatched. Real transactional email recovery will be executed via Spring Boot Mail / Security in the future backend.
          </div>

          <div className="pt-2">
            <Link to="/login">
              <Button variant="primary" size="md" className="w-full">
                Return to Login
              </Button>
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset Account Password"
      subtitle="Enter your registered email address to receive password recovery instructions"
      footerText="Remember your password?"
      footerLink="/login"
      footerActionText="Sign In"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Registered Email Address"
          type="email"
          name="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError("");
          }}
          required
          error={error}
          placeholder="your.email@example.com"
          autoComplete="email"
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={loading}
          className="w-full mt-2"
        >
          Send Password Reset Link
        </Button>

        <div className="text-center pt-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
