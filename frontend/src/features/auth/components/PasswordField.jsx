import { useState } from "react";
import { EyeIcon, EyeOffIcon, LockIcon } from "../../../components/common/Icons";

export function PasswordField({
  label = "Password",
  name = "password",
  id,
  value,
  onChange,
  placeholder = "Enter your password",
  required = false,
  error,
  helperText,
  disabled = false,
  autoComplete = "current-password",
  className = "",
}) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || name;

  const baseInputStyles =
    "w-full rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed";

  const stateStyles = error
    ? "border-rose-300 text-rose-900 placeholder-rose-300 focus:border-rose-500 focus:ring-rose-200"
    : "border-slate-300 bg-white text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-100";

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
        >
          {label}
          {required && <span className="ml-1 text-rose-500">*</span>}
        </label>
      )}

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
          <LockIcon className="h-4 w-4" />
        </div>

        <input
          id={inputId}
          type={showPassword ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`${baseInputStyles} ${stateStyles} py-2 pl-9 pr-10`}
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
          aria-label={showPassword ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOffIcon className="h-4 w-4" />
          ) : (
            <EyeIcon className="h-4 w-4" />
          )}
        </button>
      </div>

      {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
      {!error && helperText && (
        <p className="text-xs text-slate-500">{helperText}</p>
      )}
    </div>
  );
}
