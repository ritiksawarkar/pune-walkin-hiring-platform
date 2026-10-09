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
import {
  ShieldCheckIcon,
  ClockIcon,
  AlertCircleIcon,
} from "../../../components/common/Icons";

export function EmployerRegisterPage() {
  const navigate = useNavigate();
  const { registerEmployer } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    recruiterName: "",
    workEmail: "",
    mobile: "",
    companyName: "",
    website: "",
    designation: "Technical Recruiter",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [verificationPending, setVerificationPending] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    setServerError("");
  };

  const validate = () => {
    const errs = {};
    if (!formData.recruiterName.trim()) {
      errs.recruiterName = "Recruiter full name is required.";
    }
    if (!formData.companyName.trim()) {
      errs.companyName = "Company / Organization name is required.";
    }
    if (!formData.designation.trim()) {
      errs.designation = "Your designation/role is required.";
    }

    const emailErr = validateEmail(formData.workEmail);
    if (emailErr) errs.workEmail = emailErr;

    const phoneErr = validatePhone(formData.mobile);
    if (phoneErr) errs.mobile = phoneErr;

    const passErr = validatePassword(formData.password);
    if (passErr) errs.password = passErr;

    if (!formData.confirmPassword) {
      errs.confirmPassword = "Confirm password is required.";
    } else if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = "Passwords do not match.";
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
      await registerEmployer({
        recruiterName: formData.recruiterName,
        email: formData.workEmail,
        mobile: formData.mobile,
        companyName: formData.companyName,
        website: formData.website,
        designation: formData.designation,
        password: formData.password,
      });

      setVerificationPending(true);
      showToast("Company registered. Verification request submitted to Admin.");
    } catch (err) {
      setServerError(err.message || "Failed to register employer account.");
    } finally {
      setLoading(false);
    }
  };

  if (verificationPending) {
    return (
      <AuthLayout
        title="Verification Pending"
        subtitle="Corporate Registration Submitted to Administration"
      >
        <div className="space-y-4 py-2 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600 border border-amber-200">
            <ClockIcon className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">
              Registration Under Review
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Thank you, <span className="font-semibold text-slate-900">{formData.recruiterName}</span>. Your employer account for <span className="font-semibold text-slate-900">{formData.companyName}</span> has been logged with status <span className="font-bold text-amber-700">PENDING_VERIFICATION</span>.
            </p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-left text-xs text-amber-900 space-y-1.5">
            <p className="font-bold flex items-center gap-1.5">
              <ShieldCheckIcon className="h-4 w-4 text-amber-600 shrink-0" />
              Administrative Verification Required (Admin: Sahil)
            </p>
            <p className="text-amber-800 leading-relaxed">
              To prevent fraudulent walk-in drives, newly registered companies must be vetted by the platform administrator before publishing jobs and scheduling on-site walk-ins in Pune IT clusters.
            </p>
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              size="md"
              className="w-full"
              onClick={() => navigate("/login")}
            >
              Return to Sign In
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Employer / Recruiter Registration"
      subtitle="Register your Pune engineering firm to host walk-in interview drives"
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
          label="Recruiter Full Name"
          name="recruiterName"
          value={formData.recruiterName}
          onChange={handleChange}
          required
          error={errors.recruiterName}
          placeholder="e.g. Ritik Sawarkar"
        />

        <Input
          label="Corporate / Work Email"
          type="email"
          name="workEmail"
          value={formData.workEmail}
          onChange={handleChange}
          required
          error={errors.workEmail}
          placeholder="careers@company.com"
        />

        <Input
          label="Contact Mobile (10 Digits)"
          type="tel"
          name="mobile"
          value={formData.mobile}
          onChange={handleChange}
          required
          error={errors.mobile}
          placeholder="9823045678"
        />

        <Input
          label="Company / Enterprise Name"
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          required
          error={errors.companyName}
          placeholder="e.g. TechSprint Innovations Pvt. Ltd."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Corporate Website (Optional)"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="https://company.io"
          />

          <Input
            label="Your Designation"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            required
            error={errors.designation}
            placeholder="Lead Technical Recruiter"
          />
        </div>

        <PasswordField
          label="Password (Min. 6 Characters)"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          error={errors.password}
          placeholder="Create secure password"
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

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={loading}
          className="w-full mt-3"
        >
          Submit Corporate Registration
        </Button>
      </form>
    </AuthLayout>
  );
}
