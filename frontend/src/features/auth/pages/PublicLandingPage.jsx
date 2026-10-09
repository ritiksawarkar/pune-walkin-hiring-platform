import { Link } from "react-router-dom";
import {
  ShieldCheckIcon,
  BriefcaseIcon,
  UsersIcon,
  CalendarIcon,
  MapPinIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "../../../components/common/Icons";
import { Button } from "../../../components/ui/Button";

export function PublicLandingPage() {
  const roleCards = [
    {
      role: "CANDIDATE",
      title: "Job Seekers & Freshers",
      subtitle: "Discover Pune Walk-In Drives",
      description:
        "Explore upcoming on-the-spot walk-in recruitment drives in Magarpatta, Hinjawadi, and Kharadi. Register for slots, obtain hall-ticket tokens, and track your selection status.",
      icon: UsersIcon,
      accentColor: "blue",
      loginLink: "/login?role=CANDIDATE",
      registerLink: "/register/candidate",
      loginText: "Candidate Sign In",
      registerText: "Register as Candidate",
      features: [
        "Instant walk-in registration slots",
        "Digital token passes",
        "Direct company face-to-face interviews",
      ],
    },
    {
      role: "EMPLOYER",
      title: "Employers & HR Recruiters",
      subtitle: "Host Walk-In Drives & Screen Talent",
      description:
        "Manage company profiles, post engineering vacancies, schedule large-scale walk-in drives with Pune venue logistics, review resumes, and shortlist qualified candidates.",
      icon: BriefcaseIcon,
      accentColor: "indigo",
      loginLink: "/login?role=EMPLOYER",
      registerLink: "/register/employer",
      loginText: "Employer Sign In",
      registerText: "Register Company Account",
      features: [
        "Manage job openings & vacancies",
        "Schedule Pune walk-in drives with quotas",
        "Screen resumes & stage candidates",
      ],
    },
    {
      role: "ADMIN",
      title: "Platform Administrators",
      subtitle: "Verification & Operational Moderation",
      description:
        "Verify registered companies, moderate walk-in drive schedules and venues, supervise on-site token queues, and access aggregate Pune hiring reports.",
      icon: ShieldCheckIcon,
      accentColor: "slate",
      loginLink: "/login?role=ADMIN",
      registerLink: null, // Admin cannot be registered publicly!
      loginText: "Admin Portal Sign In",
      registerText: null,
      features: [
        "Walk-In drive compliance & approvals",
        "Corporate credential verification",
        "Audit logs & platform health reports",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-900 antialiased">
      {/* Top Navbar */}
      <header className="border-b border-slate-200/80 bg-white/95 px-4 sm:px-8 py-3.5 backdrop-blur-xs sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-lg shadow-sm">
              PW
            </div>
            <div>
              <span className="block text-sm font-bold tracking-tight text-slate-900">
                Pune Walk-In Drive Hub
              </span>
              <span className="block text-2xs text-slate-500 font-medium">
                Recruitment & Hiring Management Platform
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/register/candidate">
              <Button variant="primary" size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-xs font-semibold text-blue-700 mb-5">
          <span className="h-2 w-2 rounded-full bg-blue-600" />
          Centralized Hiring Ecosystem for Pune IT Clusters
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
          Pune Walk-In Drive & Hiring Management Platform
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Unifying candidates, tech recruiters, and platform administrators across Magarpatta Cybercity, Hinjawadi Infotech Park, and Kharadi EON IT hubs.
        </p>

        {/* 3 Role Selection Entry Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {roleCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.role}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-2xs font-bold uppercase tracking-wider rounded-md bg-slate-100 px-2.5 py-1 text-slate-600">
                      {card.role}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    {card.title}
                  </h3>
                  <p className="text-xs font-semibold text-blue-600 mt-0.5">
                    {card.subtitle}
                  </p>

                  <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                    {card.description}
                  </p>

                  <ul className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600">
                    {card.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircleIcon className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100 space-y-2">
                  <Link to={card.loginLink} className="block">
                    <Button variant="primary" size="sm" className="w-full">
                      {card.loginText}
                    </Button>
                  </Link>

                  {card.registerLink ? (
                    <Link to={card.registerLink} className="block">
                      <Button variant="outline" size="sm" className="w-full">
                        {card.registerText}
                      </Button>
                    </Link>
                  ) : (
                    <p className="text-center text-2xs text-slate-400 pt-1 font-medium">
                      Admin credentials managed by system authority
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pune IT Clusters Highlights */}
      <section className="bg-slate-100/60 border-t border-slate-200 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-around gap-6 text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-2">
            <MapPinIcon className="h-4 w-4 text-blue-600" />
            <span>Magarpatta Cybercity, Hadapsar</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPinIcon className="h-4 w-4 text-blue-600" />
            <span>Hinjawadi Rajiv Gandhi Infotech Park</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPinIcon className="h-4 w-4 text-blue-600" />
            <span>Kharadi EON Free Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="h-4 w-4 text-emerald-600" />
            <span>SPPU & Pune Engineering Placement Network</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-4 text-center text-xs text-slate-500">
        Pune Walk-In Drive & Hiring Management Platform • Multi-Role Frontend Architecture (Admin, Employer, Candidate)
      </footer>
    </div>
  );
}
