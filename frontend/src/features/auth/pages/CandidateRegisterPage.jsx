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
import { ClockIcon, AlertCircleIcon, ShieldCheckIcon } from "../../../components/common/Icons";

const POPULAR_PUNE_COLLEGES = [
  "COEP Technological University, Pune",
  "Pune Institute of Computer Technology (PICT)",
  "MIT World Peace University (MIT-WPU)",
  "Vishwakarma Institute of Technology (VIT Pune)",
  "MKSSS Cummins College of Engineering for Women, Pune",
  "Sinhgad College of Engineering (SCOE), Vadgaon",
  "D.Y. Patil College of Engineering, Akurdi",
  "Pimpri Chinchwad College of Engineering (PCCOE)",
  "Army Institute of Technology (AIT), Pune",
  "Bharati Vidyapeeth Deemed University College of Engineering",
];

export function CandidateRegisterPage() {
  const navigate = useNavigate();
  const { registerCandidate } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    collegeName: "COEP Technological University, Pune",
    degree: "B.Tech",
    branch: "Computer Engineering",
    graduationYear: "2025",
    cgpa: "8.2",
    backlogs: "0",
    skills: "Java, Spring Boot, React, SQL",
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

    if (!formData.collegeName.trim()) {
      errs.collegeName = "College name is required for campus drive eligibility.";
    }
    if (!formData.degree.trim()) {
      errs.degree = "Degree is required.";
    }
    if (!formData.branch.trim()) {
      errs.branch = "Branch / Specialization is required.";
    }
    if (!formData.graduationYear.trim()) {
      errs.graduationYear = "Graduation year is required.";
    }

    const passErr = validatePassword(formData.password);
    if (passErr) errs.password = passErr;

    if (!formData.confirmPassword) {
      errs.confirmPassword = "Confirm password is required.";
    } else if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = "Passwords do not match.";
    }

    if (!formData.termsAccepted) {
      errs.termsAccepted = "You must agree to the platform verification terms.";
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
        collegeName: formData.collegeName,
        degree: formData.degree,
        branch: formData.branch,
        graduationYear: formData.graduationYear,
        cgpa: formData.cgpa,
        backlogs: formData.backlogs,
        skills: formData.skills,
        password: formData.password,
      });

      setIsSuccess(true);
      showToast("Registration submitted! Account is pending admin verification.");
    } catch (err) {
      setServerError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout
        title="Verification Pending"
        subtitle="Your registration is awaiting administrative review"
      >
        <div className="text-center space-y-4 py-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600 border border-amber-200 shadow-xs">
            <ClockIcon className="h-8 w-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Status: PENDING_VERIFICATION
          </div>

          <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-4 text-left text-xs space-y-2">
            <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
              <span className="text-slate-500">Candidate Name:</span>
              <span className="font-semibold text-slate-800">{formData.fullName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
              <span className="text-slate-500">Registered Email:</span>
              <span className="font-mono text-slate-800">{formData.email}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
              <span className="text-slate-500">College / Institute:</span>
              <span className="font-semibold text-slate-800 truncate max-w-[200px]" title={formData.collegeName}>
                {formData.collegeName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Degree & Year:</span>
              <span className="text-slate-800 font-semibold">{formData.degree} ({formData.graduationYear})</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed px-1">
            Your registration is awaiting admin verification. You can log in after your account is approved.
          </p>

          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={() => navigate("/login")}
            >
              Return to Platform Sign In
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create Candidate Account"
      subtitle="Register for Pune Walk-In Drives & On-Campus Recruitment"
      footerText="Already registered?"
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

        <div className="rounded-lg bg-blue-50/70 border border-blue-200/80 p-2.5 flex items-start gap-2">
          <ShieldCheckIcon className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-2xs text-blue-800 leading-relaxed">
            All candidate accounts are reviewed by the platform administrator before activation to verify college credentials for campus drive eligibility.
          </p>
        </div>

        <Input
          label="Full Name"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          required
          error={errors.fullName}
          placeholder="e.g. Snehal Kulkarni"
          autoComplete="name"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            error={errors.email}
            placeholder="snehal@example.com"
            autoComplete="email"
          />

          <Input
            label="Mobile Number"
            type="tel"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            required
            error={errors.mobile}
            placeholder="+91 98900 12345"
            autoComplete="tel"
          />
        </div>

        {/* Academic / College Section */}
        <div className="pt-1 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            College / Institute Name <span className="text-rose-500">*</span>
          </label>
          <input
            list="pune-colleges-list"
            name="collegeName"
            value={formData.collegeName}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
            placeholder="Select or enter your Pune college name"
          />
          <datalist id="pune-colleges-list">
            {POPULAR_PUNE_COLLEGES.map((c, i) => (
              <option key={i} value={c} />
            ))}
          </datalist>
          {errors.collegeName && (
            <p className="mt-1 text-2xs text-rose-600">{errors.collegeName}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div>
            <label className="block text-2xs font-semibold text-slate-700 mb-1">
              Degree <span className="text-rose-500">*</span>
            </label>
            <select
              name="degree"
              value={formData.degree}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 bg-white"
            >
              <option value="B.Tech">B.Tech</option>
              <option value="B.E.">B.E.</option>
              <option value="M.Tech">M.Tech</option>
              <option value="MCA">MCA</option>
              <option value="B.Sc CS/IT">B.Sc CS/IT</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-2xs font-semibold text-slate-700 mb-1">
              Branch / Dept <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              placeholder="e.g. Computer Engg"
              className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-2xs font-semibold text-slate-700 mb-1">
              Graduation Year <span className="text-rose-500">*</span>
            </label>
            <select
              name="graduationYear"
              value={formData.graduationYear}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 bg-white"
            >
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="CGPA / Percentage"
            type="text"
            name="cgpa"
            value={formData.cgpa}
            onChange={handleChange}
            placeholder="e.g. 8.5"
          />

          <Input
            label="Active Backlogs"
            type="number"
            name="backlogs"
            value={formData.backlogs}
            onChange={handleChange}
            placeholder="0"
            min="0"
          />
        </div>

        <Input
          label="Key Technical Skills"
          name="skills"
          value={formData.skills}
          onChange={handleChange}
          placeholder="e.g. Java, Spring Boot, React, MySQL"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
          <PasswordField
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            error={errors.password}
            placeholder="Minimum 8 characters"
            autoComplete="new-password"
          />

          <PasswordField
            label="Confirm Password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            error={errors.confirmPassword}
            placeholder="Re-enter password"
            autoComplete="new-password"
          />
        </div>

        {/* Terms and Verification Agreement */}
        <div className="pt-2">
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600">
            <input
              type="checkbox"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleChange}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4 mt-0.5"
            />
            <span>
              I certify that my academic and college details are accurate. I acknowledge my account will be reviewed by the admin prior to access.
            </span>
          </label>
          {errors.termsAccepted && (
            <p className="mt-1 text-2xs text-rose-600">{errors.termsAccepted}</p>
          )}
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            loading={loading}
          >
            Submit Registration for Verification
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
