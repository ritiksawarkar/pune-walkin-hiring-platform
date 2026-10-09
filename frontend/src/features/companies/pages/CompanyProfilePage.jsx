import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { companyService } from "../../../services/companyService";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import {
  BuildingIcon,
  ShieldCheckIcon,
  MapPinIcon,
  MailIcon,
  PhoneIcon,
  ExternalLinkIcon,
  EditIcon,
  UsersIcon,
  CalendarIcon,
} from "../../../components/common/Icons";

export function CompanyProfilePage() {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCompany() {
      try {
        setLoading(true);
        const data = await companyService.getCompanyProfile();
        setCompany(data);
      } catch (err) {
        console.error("Failed to load company profile", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCompany();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!company) return null;

  return (
    <div className="space-y-6">
      {/* Header Profile Banner */}
      <Card padding="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white font-extrabold text-2xl shadow-sm border border-slate-700">
              TS
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {company.name}
                </h2>
                <Badge variant="success" dot={true}>
                  <ShieldCheckIcon className="h-3.5 w-3.5" />
                  {company.verificationStatus}
                </Badge>
              </div>
              <p className="text-sm text-slate-600 font-medium">
                {company.tagline}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <BuildingIcon className="h-3.5 w-3.5 text-slate-400" />
                  {company.industry}
                </span>
                <span className="flex items-center gap-1">
                  <MapPinIcon className="h-3.5 w-3.5 text-slate-400" />
                  {company.city}, {company.state}
                </span>
                <span className="flex items-center gap-1">
                  <UsersIcon className="h-3.5 w-3.5 text-slate-400" />
                  {company.companySize}
                </span>
              </div>
            </div>
          </div>

          <Link to="/employer/company/edit">
            <Button variant="outline" icon={EditIcon} size="md">
              Edit Profile
            </Button>
          </Link>
        </div>
      </Card>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Description & Locations */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="About the Company" padding="p-6">
            <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
              {company.description}
            </p>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Active Pune Interview Hubs
              </h4>
              <div className="flex flex-wrap gap-2">
                {company.activeLocations?.map((loc, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700"
                  >
                    <MapPinIcon className="h-3.5 w-3.5 text-blue-600" />
                    {loc}
                  </span>
                ))}
              </div>
            </div>
          </Card>

          <Card title="Corporate Headquarters & Walk-In Venue" padding="p-6">
            <div className="space-y-3 text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <MapPinIcon className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">Physical Address</p>
                  <p className="text-slate-600">{company.officeAddress}</p>
                  {company.landmark && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      Landmark: {company.landmark}
                    </p>
                  )}
                  <p className="text-xs text-slate-500">
                    {company.city}, {company.state} - {company.pincode}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Contact & HR Verification */}
        <div className="space-y-6">
          <Card title="Official Communications" padding="p-6">
            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <p className="text-2xs font-semibold uppercase tracking-wider text-slate-400">
                  Official Website
                </p>
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 flex items-center gap-1.5 font-medium text-blue-600 hover:text-blue-700"
                >
                  {company.website}
                  <ExternalLinkIcon className="h-3.5 w-3.5" />
                </a>
              </div>

              <div>
                <p className="text-2xs font-semibold uppercase tracking-wider text-slate-400">
                  Recruitment Email
                </p>
                <div className="mt-1 flex items-center gap-2 text-slate-800 font-medium">
                  <MailIcon className="h-4 w-4 text-slate-400" />
                  {company.officialEmail}
                </div>
              </div>

              <div>
                <p className="text-2xs font-semibold uppercase tracking-wider text-slate-400">
                  Primary Contact Desk
                </p>
                <div className="mt-1 flex items-center gap-2 text-slate-800 font-medium">
                  <PhoneIcon className="h-4 w-4 text-slate-400" />
                  {company.contactNumber}
                </div>
              </div>

              <div>
                <p className="text-2xs font-semibold uppercase tracking-wider text-slate-400">
                  Alternate Contact
                </p>
                <div className="mt-1 flex items-center gap-2 text-slate-800 font-medium">
                  <PhoneIcon className="h-4 w-4 text-slate-400" />
                  {company.alternateContact}
                </div>
              </div>
            </div>
          </Card>

          <Card title="Assigned HR / Recruiter" padding="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                RS
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {company.hrContactPerson}
                </p>
                <p className="text-xs text-slate-500">{company.hrContactRole}</p>
                <Badge variant="indigo" size="sm" className="mt-1">
                  Module Owner (Ritik)
                </Badge>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 text-2xs text-slate-500">
              Responsible for walk-in drive schedules, applicant evaluations, and coordination with Pune placement teams.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
