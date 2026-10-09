import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../../../context/ToastContext";
import { AuthLayout } from "../components/AuthLayout";
import { PasswordField } from "../components/PasswordField";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import {
  validateEmail,
  validatePassword,
  validatePhone,
} from "../utils/authValidation";
import { CheckCircleIcon, AlertCircleIcon } from "../../../components/common/Icons";

export function CandidateRegisterPage() {
  const navigate = useNavigate();
  const { registerCandidate } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

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
    if (!formData.fullName.trim()) {
      errs.fullName = "Full name is required.";
    }

    const emailErr = validateEmail(formData.email);
    if (emailErr) errs.email = emailErr;

    const phoneErr = validatePhone(formData.mobile);
    if (phoneErr) errs.mobile = phoneErr;

    const passErr = validatePassword(formData.password);
    if (passErr) errs.password = passErr;

    if (!formData.confirmPassword) {
      errs.confirmPassword = "Confirm password is required.";
    } else if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = "Passwords do not match.";
    }

    if (!formData.termsAccepted) {
      errs.termsAccepted = "You must agree to the platform terms and privacy policy.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      setServerError("");
      await registerCandidate({
        fullName: formData.fullName,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
      });

      setIsSuccess(true);
      showToast("Candidate account created successfully!");
    } catch (err) {
      setServerError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout
        title="Registration Successful!"
        subtitle="Your candidate account is now active"
      >
        <div className="text-center space-y-4 py-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
            <CheckCircleIcon className="h-8 w-8" />
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Welcome to Pune Walk-In Drive Hub, <span className="font-bold text-slate-900">{formData.fullName}</span>! You can now explore upcoming walk-in drives across Pune IT parks and generate digital walk-in pass tokens.
          </p>

          <div className="pt-4">
            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={() => navigate("/candidate/dashboard")}
            >
              Go to Candidate Dashboard
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create Candidate Account"
      subtitle="Register to attend Pune walk-in interviews and book slots"
      footerText="Already have an account?"
      footerLink="/login"
      footerActionText="Sign In"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {serverError && (
          <div className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            <AlertCircleIcon className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <Input
          label="Full Name"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          required
          error={errors.fullName}
          placeholder="e.g. Pooja Shinde"
        />

        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          error={errors.email}
          placeholder="name@example.com"
        />

        <Input
          label="Mobile Number (10 Digits)"
          type="tel"
          name="mobile"
          value={formData.mobile}
          onChange={handleChange}
          required
          error={errors.mobile}
          placeholder="9876543210"
        />

        <PasswordField
          label="Password (Min. 6 Characters)"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          error={errors.password}
          placeholder="Create account password"
        />

        <PasswordField
          label="Confirm Password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          error={errors.confirmPassword}
          placeholder="Confirm password"
        />

        <div className="pt-1">
          <label className="flex items-start gap-2 cursor-pointer select-none text-xs text-slate-600">
            <input
              type="checkbox"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleChange}
              className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
            />
            <span>
              I agree to the Pune Walk-In Platform Terms of Service and Privacy Guidelines.
            </span>
          </label>
          {errors.termsAccepted && (
            <p className="text-xs font-medium text-rose-600 mt-1">
              {errors.termsAccepted}
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={loading}
          className="w-full mt-3"
        >
          Create Candidate Account
        </Button>

        <div className="text-center pt-2">
          <Link
            to="/register/employer"
            className="text-2xs font-semibold text-slate-500 hover:text-blue-600"
          >
            Are you a recruiter? Register your company here →
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
