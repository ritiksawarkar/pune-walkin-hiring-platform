import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { driveService } from "../../../services/driveService";
import { useToast } from "../../../context/ToastContext";
import { DriveApprovalBadge } from "../components/DriveApprovalBadge";
import { DriveStatusBadge } from "../components/DriveStatusBadge";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon,
  EditIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  FileTextIcon,
} from "../../../components/common/Icons";

export function DriveDetailsPage() {
  const { driveId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [drive, setDrive] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDrive() {
      try {
        setLoading(true);
        const data = await driveService.getDriveById(driveId);
        setDrive(data);
      } catch (err) {
        showToast("Drive not found.", "error");
        navigate("/employer/drives");
      } finally {
        setLoading(false);
      }
    }
    loadDrive();
  }, [driveId, navigate, showToast]);

  const handleSubmitApproval = async () => {
    if (
      window.confirm(
        `Submit "${drive.title}" to Administrator (Sahil) for review and publishing?`
      )
    ) {
      try {
        await driveService.submitDriveForApproval(driveId);
        showToast("Walk-in drive submitted for Admin approval!");
        const updated = await driveService.getDriveById(driveId);
        setDrive(updated);
      } catch (err) {
        showToast(err.message || "Failed to submit drive.", "error");
      }
    }
  };

  const handleCancelDrive = async () => {
    const reason = window.prompt("Please state the reason for cancelling this drive:");
    if (reason !== null) {
      try {
        await driveService.cancelDrive(driveId, reason);
        showToast("Walk-in drive marked as Cancelled.");
        const updated = await driveService.getDriveById(driveId);
        setDrive(updated);
      } catch (err) {
        showToast("Failed to cancel drive.", "error");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!drive) return null;

  const fillPercent = Math.min(
    100,
    Math.round(
      ((drive.registeredCount || 0) / (drive.maxRegistrations || 100)) * 100
    )
  );

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="sm"
          icon={ArrowLeftIcon}
          onClick={() => navigate("/employer/drives")}
        >
          Back to Drives
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          {drive.driveStatus !== "Cancelled" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelDrive}
              className="text-rose-600 border-rose-200 hover:bg-rose-50"
            >
              Cancel Drive
            </Button>
          )}

          {(drive.approvalStatus === "Draft" ||
            drive.approvalStatus === "Changes Requested") && (
            <Link to={`/employer/drives/${drive.id}/edit`}>
              <Button variant="outline" size="sm" icon={EditIcon}>
                Edit Details
              </Button>
            </Link>
          )}

          {drive.approvalStatus === "Draft" && (
            <Button
              variant="primary"
              size="sm"
              icon={CheckCircleIcon}
              onClick={handleSubmitApproval}
            >
              Submit for Approval
            </Button>
          )}

          <Link to={`/employer/drives/${drive.id}/candidates`}>
            <Button variant="secondary" size="sm" icon={UsersIcon}>
              View Candidates ({drive.registeredCount})
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Drive Header Card */}
      <Card padding="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <DriveApprovalBadge status={drive.approvalStatus} />
              <DriveStatusBadge status={drive.driveStatus} />
              <Link
                to={`/employer/jobs/${drive.jobId}`}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Target Role: {drive.jobTitle}
              </Link>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {drive.title}
            </h2>
            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
              {drive.description}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-left sm:text-right shrink-0 min-w-[180px]">
            <p className="text-2xs font-bold uppercase tracking-wider text-slate-500">
              Turnout Quota
            </p>
            <p className="text-2xl font-extrabold text-slate-900">
              {drive.registeredCount} / {drive.maxRegistrations}
            </p>
            <p className="text-xs text-blue-600 font-semibold mt-0.5">
              {drive.vacancies} Positions Available
            </p>
          </div>
        </div>

        {/* Schedule & Venue Quick Row */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <p className="text-slate-400 font-semibold uppercase text-2xs">
              Interview Date & Slot
            </p>
            <p className="mt-1 font-bold text-slate-800 flex items-center gap-1.5">
              <CalendarIcon className="h-4 w-4 text-blue-600" />
              {drive.interviewDate} ({drive.startTime} - {drive.endTime})
            </p>
          </div>

          <div>
            <p className="text-slate-400 font-semibold uppercase text-2xs">
              Pune Venue Location
            </p>
            <p className="mt-1 font-semibold text-slate-800 flex items-center gap-1.5 truncate">
              <MapPinIcon className="h-4 w-4 text-blue-600 shrink-0" />
              <span className="truncate">{drive.venueName}, {drive.city}</span>
            </p>
          </div>

          <div>
            <p className="text-slate-400 font-semibold uppercase text-2xs">
              Registration Deadline
            </p>
            <p className="mt-1 font-semibold text-slate-800 flex items-center gap-1.5">
              <ClockIcon className="h-4 w-4 text-amber-600" />
              {drive.registrationDeadline}
            </p>
          </div>
        </div>
      </Card>

      {/* Approval Lifecycle Status Notice */}
      <Card
        title="Administrative Approval Lifecycle"
        subtitle="Verification status managed by Admin (Sahil)"
        padding="p-6"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border p-4 text-xs sm:text-sm">
            {drive.approvalStatus === "Approved" ? (
              <>
                <CheckCircleIcon className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-900">
                    Drive Verified & Approved by Admin
                  </p>
                  <p className="text-emerald-700 mt-0.5">
                    This drive is live and discoverable by candidates on the Pune walk-in discovery portal (developed by Yadit). Candidate registrations will appear in real time.
                  </p>
                </div>
              </>
            ) : drive.approvalStatus === "Pending Approval" ? (
              <>
                <ClockIcon className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-900">
                    Awaiting Administrative Approval
                  </p>
                  <p className="text-amber-700 mt-0.5">
                    Drive details submitted on {drive.submittedAt || "recent date"}. Sahil (Admin) will review venue compliance, slot limits, and publish the drive.
                  </p>
                </div>
              </>
            ) : drive.approvalStatus === "Changes Requested" ? (
              <>
                <AlertCircleIcon className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-rose-900">
                    Changes Requested by Reviewer
                  </p>
                  <p className="text-rose-800 font-medium mt-1">
                    "{drive.adminFeedback}"
                  </p>
                  <div className="mt-3">
                    <Link to={`/employer/drives/${drive.id}/edit`}>
                      <Button variant="primary" size="sm">
                        Address Feedback & Resubmit
                      </Button>
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <>
                <FileTextIcon className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-900">
                      Draft Walk-In Drive (Not Yet Submitted)
                    </p>
                    <p className="text-slate-600 mt-0.5">
                      Review all venue and round details before submitting to the administrator.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSubmitApproval}
                  >
                    Submit for Approval
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Rounds & Logistics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Selection Rounds & Evaluation Stages" padding="p-6">
          <ul className="space-y-3">
            {drive.selectionRounds?.map((round, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3 text-xs sm:text-sm font-medium text-slate-800"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs">
                  {idx + 1}
                </span>
                <span>{round}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Required Candidate Documents" padding="p-6">
          <ul className="space-y-2.5">
            {drive.requiredDocuments?.map((doc, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700"
              >
                <CheckCircleIcon className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{doc}</span>
              </li>
            ))}
          </ul>

          {drive.candidateInstructions && (
            <div className="mt-5 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Venue Entry Instructions
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {drive.candidateInstructions}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
