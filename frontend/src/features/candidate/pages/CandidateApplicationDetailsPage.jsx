import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";
import { candidateService } from "../../../services/candidateService";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  CheckCircleIcon,
  FileTextIcon,
  PrinterIcon,
  AlertCircleIcon,
} from "../../../components/common/Icons";
import { TokenPassCard } from "../components/TokenPassCard";

const STATUS_VARIANT = {
  Registered: "primary",
  "Under Review": "warning",
  Shortlisted: "success",
  "Interview Scheduled": "indigo",
  Selected: "success",
  "On Hold": "purple",
  Rejected: "danger",
};

import { interviewService } from "../../../services/interviewService";

export function CandidateApplicationDetailsPage() {
  const { applicationId } = useParams();
  const { user } = useAuth();

  const [application, setApplication] = useState(null);
  const [passInfo, setPassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await candidateService.getApplicationById(applicationId, user);
        setApplication(data);

        try {
          const myInterviews = await interviewService.getMyInterviews();
          const list = Array.isArray(myInterviews) ? myInterviews : (myInterviews?.content || []);
          const match = list.find(i => i.application?.id === applicationId || i.id === applicationId);
          if (match && match.id) {
            const passRes = await interviewService.getInterviewPass(match.id);
            if (passRes) setPassInfo(passRes);
          }
        } catch {
          // Fallback to standard pass view
        }
      } catch (err) {
        setError(err.message || "Application not found.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [applicationId, user]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
        <div className="h-10 w-40 rounded-lg bg-slate-200" />
        <div className="h-64 rounded-2xl bg-slate-200" />
        <div className="h-64 rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-4 max-w-xl mx-auto">
        <AlertCircleIcon className="h-10 w-10 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900">Application Record Not Found</h3>
        <p className="text-xs text-slate-500">{error || "No matching application found for this account."}</p>
        <Link to="/candidate/applications">
          <Button variant="primary" icon={ArrowLeftIcon}>
            Back to My Applications
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Back Link */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          to="/candidate/applications"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to My Applications
        </Link>

        <Button
          variant="outline"
          size="sm"
          icon={PrinterIcon}
          onClick={() => window.print()}
        >
          Print Entry Ticket
        </Button>
      </div>

      {/* 1. Printable Token Pass Card */}
      <TokenPassCard
        application={application}
        drive={application.drive}
        pass={passInfo}
        qrBase64={passInfo?.qrBase64}
        onPrint={() => window.print()}
      />

      {/* 2. Status History & Audit Timeline */}
      <Card
        title="Application Status Timeline & Recruiter Notes"
        subtitle="Chronological audit history of recruiter reviews and decisions"
        padding="p-6"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50">
            <div>
              <span className="text-2xs uppercase font-bold text-slate-400 block">Current Status</span>
              <span className="text-base font-extrabold text-slate-900">{application.status}</span>
            </div>
            <Badge variant={STATUS_VARIANT[application.status] || "neutral"} size="lg">
              {application.status}
            </Badge>
          </div>

          {/* Timeline steps */}
          {application.statusHistory && application.statusHistory.length > 0 ? (
            <div className="relative border-l-2 border-blue-200 ml-4 space-y-6 pl-6 py-2">
              {application.statusHistory.map((step, idx) => (
                <div key={idx} className="relative">
                  {/* Dot */}
                  <span className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 ring-4 ring-white" />

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{step.status}</span>
                      <span className="text-2xs text-slate-400">• {step.date}</span>
                      <span className="text-3xs font-semibold uppercase text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        Updated By: {step.updatedBy}
                      </span>
                    </div>
                    {step.note && (
                      <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 p-2.5 rounded-lg mt-1">
                        {step.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No status changes recorded yet.</p>
          )}

          {/* Recruiter Evaluation Notes */}
          {application.reviewerNotes && (
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 text-xs space-y-1">
              <span className="font-bold uppercase tracking-wider text-blue-900 text-2xs block">
                Official Reviewer Notes from Recruiter:
              </span>
              <p className="text-slate-700 leading-relaxed">{application.reviewerNotes}</p>
            </div>
          )}
        </div>
      </Card>

      {/* 3. Venue & Reporting Instructions */}
      <Card title="Venue Location & Reporting Instructions" padding="p-6">
        <div className="space-y-3 text-xs text-slate-700">
          <div className="flex items-start gap-2.5">
            <MapPinIcon className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 text-sm">
                {application.drive?.venueName || "TechSprint Corporate Auditorium"}
              </p>
              <p className="text-slate-600 mt-0.5">
                {application.drive?.venueAddress || "Tower B, Magarpatta Cybercity, Pune - 411028"}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-1.5 text-2xs text-slate-600">
            <p>
              • <strong>Slot Timing:</strong> Please arrive 30 minutes before your allocated slot (<strong>{application.registrationSlot}</strong>).
            </p>
            <p>
              • <strong>Entry Check:</strong> Present your token number <strong>{application.tokenNumber}</strong> along with a Government Photo ID (Aadhaar or PAN).
            </p>
            <p>
              • <strong>Required Documents:</strong> Bring 2 physical printed resumes and semester marksheets.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
