import { Modal } from "../../../components/ui/Modal";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { ApplicationStatusBadge } from "./ApplicationStatusBadge";
import {
  FileTextIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  DownloadIcon,
} from "../../../components/common/Icons";

export function CandidateDetailsModal({
  isOpen,
  onClose,
  application,
  onOpenStatusChange,
}) {
  if (!application) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={application.candidateName}
      subtitle={`Application Token: ${application.tokenNumber || application.id} • ${application.jobTitle}`}
      maxWidth="max-w-2xl"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              onClose();
              if (onOpenStatusChange) onOpenStatusChange(application);
            }}
          >
            Update Recruitment Status
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Header Summary & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50 p-4">
          <div>
            <div className="flex items-center gap-2">
              <ApplicationStatusBadge status={application.status} />
              <span className="text-2xs text-slate-500 font-medium">
                Registered: {application.registrationDate}
              </span>
            </div>
            <p className="mt-1 text-xs font-semibold text-slate-700">
              Walk-In Slot: {application.registrationSlot || "09:30 AM"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-md bg-white px-2.5 py-1 text-xs font-bold text-slate-800 border border-slate-200 shadow-2xs">
              Token: {application.tokenNumber || application.id}
            </span>
          </div>
        </div>

        {/* Contact & Location Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <MailIcon className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="truncate">{application.email}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <PhoneIcon className="h-4 w-4 text-slate-400 shrink-0" />
            <span>{application.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <MapPinIcon className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="truncate">{application.city || "Pune"}</span>
          </div>
        </div>

        {/* Academic & Skills Profile */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Qualifications & Competencies
          </h4>
          <div className="rounded-lg border border-slate-200 p-3.5 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-900">
                {application.qualification}
              </span>
              <span className="font-medium text-slate-600">
                {application.experienceYears > 0
                  ? `${application.experienceYears} Years Experience`
                  : "Fresher / Entry-Level"}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {application.skills?.map((s, idx) => (
                <span
                  key={idx}
                  className="rounded-md bg-blue-50 border border-blue-100 px-2 py-0.5 text-2xs font-semibold text-blue-700"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Resume Preview Simulation */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Resume / Curriculum Vitae
          </h4>
          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600 font-bold border border-rose-100">
                <FileTextIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  {application.resumeFileName || "Candidate_Resume.pdf"}
                </p>
                <p className="text-2xs text-slate-500">
                  Verified PDF Document • Uploaded via Candidate Portal
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => alert(`Simulated Download: ${application.resumeFileName || "Candidate_Resume.pdf"}`)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <DownloadIcon className="h-3.5 w-3.5 text-slate-500" />
              <span>Preview / Download</span>
            </button>
          </div>
        </div>

        {/* Reviewer Notes */}
        {application.reviewerNotes && (
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Recruiter Screening Notes
            </h4>
            <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700 border border-slate-200/80">
              {application.reviewerNotes}
            </div>
          </div>
        )}

        {/* Rejection Reason if rejected */}
        {application.rejectionReason && (
          <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
            <span className="font-bold">Rejection Justification: </span>
            {application.rejectionReason}
          </div>
        )}

        {/* Status Audit History Timeline */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Recruitment Status History & Audit Trail
          </h4>
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg bg-white overflow-hidden">
            {application.statusHistory && application.statusHistory.length > 0 ? (
              application.statusHistory.map((step, idx) => (
                <div key={idx} className="p-3 text-xs space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      {step.status}
                    </span>
                    <span className="text-2xs text-slate-400">{step.date}</span>
                  </div>
                  <p className="text-slate-600">{step.note}</p>
                  <p className="text-2xs text-slate-400">
                    Updated by: {step.updatedBy || "Ritik Sawarkar"}
                  </p>
                </div>
              ))
            ) : (
              <p className="p-3 text-xs text-slate-500">
                No previous status transitions recorded.
              </p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
