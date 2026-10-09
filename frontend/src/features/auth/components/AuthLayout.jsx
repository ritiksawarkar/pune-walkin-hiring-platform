import { Link } from "react-router-dom";
import { ShieldCheckIcon } from "../../../components/common/Icons";

export function AuthLayout({
  children,
  title,
  subtitle,
  footerLink,
  footerText,
  footerActionText,
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-900 antialiased">
      {/* Top Header */}
      <header className="border-b border-slate-200/80 bg-white/95 px-4 sm:px-8 py-3.5 backdrop-blur-xs sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-lg shadow-sm">
              PW
            </div>
            <div>
              <span className="block text-sm font-bold tracking-tight text-slate-900">
                Pune Walk-In Drive Hub
              </span>
              <span className="block text-2xs text-slate-500 font-medium">
                Recruitment & Walk-In Management Platform
              </span>
            </div>
          </Link>

          <nav className="hidden sm:flex items-center gap-4 text-xs font-semibold text-slate-600">
            <Link to="/" className="hover:text-blue-600 transition-colors">
              Role Entry
            </Link>
            <Link to="/login" className="hover:text-blue-600 transition-colors">
              Sign In
            </Link>
            <Link
              to="/register/candidate"
              className="hover:text-blue-600 transition-colors"
            >
              Candidate Join
            </Link>
            <Link
              to="/register/employer"
              className="text-blue-600 hover:text-blue-700"
            >
              Post Walk-Ins (Employer)
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm">
            {(title || subtitle) && (
              <div className="mb-6 text-center">
                <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-blue-50 text-blue-600 mb-3 border border-blue-100">
                  <ShieldCheckIcon className="h-5 w-5" />
                </div>
                {title && (
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="mt-1.5 text-xs text-slate-500 max-w-xs mx-auto">
                    {subtitle}
                  </p>
                )}
              </div>
            )}

            {children}

            {(footerText || footerActionText) && (
              <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-600">
                {footerText}{" "}
                {footerLink && footerActionText && (
                  <Link
                    to={footerLink}
                    className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    {footerActionText}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-4 text-center text-xs text-slate-500">
        Pune Walk-In Drive & Hiring Management Platform • Centralized Recruitment System (Pune IT Cluster)
      </footer>
    </div>
  );
}
