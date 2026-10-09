import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { jobService } from "../../../services/jobService";
import { driveService } from "../../../services/driveService";
import { useToast } from "../../../context/ToastContext";
import { JobStatusBadge } from "../components/JobStatusBadge";
import { DriveApprovalBadge } from "../../drives/components/DriveApprovalBadge";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import {
  ArrowLeftIcon,
  EditIcon,
  ArchiveIcon,
  PlusIcon,
  CalendarIcon,
  MapPinIcon,
  BriefcaseIcon,
  UsersIcon,
  ClockIcon,
} from "../../../components/common/Icons";

export function JobDetailsPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [job, setJob] = useState(null);
  const [associatedDrives, setAssociatedDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetails() {
      try {
        setLoading(true);
        const jobData = await jobService.getJobById(jobId);
        setJob(jobData);

        const allDrives = await driveService.getDrives();
        const matchingDrives = allDrives.filter((d) => d.jobId === jobId);
        setAssociatedDrives(matchingDrives);
      } catch (err) {
        showToast("Job not found.", "error");
        navigate("/employer/jobs");
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [jobId, navigate, showToast]);

  const handleArchive = async () => {
    if (window.confirm(`Are you sure you want to archive "${job.title}"?`)) {
      try {
        await jobService.archiveJob(jobId);
        showToast("Job archived successfully.");
        const updated = await jobService.getJobById(jobId);
        setJob(updated);
      } catch (err) {
        showToast("Failed to archive job.", "error");
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

  if (!job) return null;

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="sm"
          icon={ArrowLeftIcon}
          onClick={() => navigate("/employer/jobs")}
        >
          Back to Jobs
        </Button>

        <div className="flex items-center gap-2">
          {job.status !== "Archived" && (
            <Button
              variant="outline"
              size="sm"
              icon={ArchiveIcon}
              onClick={handleArchive}
              className="text-rose-600 border-rose-200 hover:bg-rose-50"
            >
              Archive
            </Button>
          )}
          <Link to={`/employer/jobs/${job.id}/edit`}>
            <Button variant="outline" size="sm" icon={EditIcon}>
              Edit Job
            </Button>
          </Link>
          <Link to={`/employer/drives/new?jobId=${job.id}`}>
            <Button variant="primary" size="sm" icon={PlusIcon}>
              Schedule Walk-In Drive
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Header Card */}
      <Card padding="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <JobStatusBadge status={job.status} />
              <span className="text-xs font-semibold text-slate-500">
                Job ID: {job.id}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{job.title}</h2>
            <p className="text-sm font-medium text-slate-600">
              {job.department} • {job.employmentType} ({job.workMode})
            </p>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-left sm:text-right shrink-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Open Positions
            </p>
            <p className="text-2xl font-extrabold text-blue-900">{job.vacancies}</p>
            <p className="text-xs text-blue-700 font-medium">
              Deadline: {job.deadline}
            </p>
          </div>
        </div>

        {/* Quick Highlights Strip */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <p className="text-slate-400 font-semibold uppercase text-2xs">
              Location
            </p>
            <p className="mt-1 font-semibold text-slate-800 flex items-center gap-1">
              <MapPinIcon className="h-3.5 w-3.5 text-slate-400" />
              {job.location}
            </p>
          </div>
          <div>
            <p className="text-slate-400 font-semibold uppercase text-2xs">
              Experience Required
            </p>
            <p className="mt-1 font-semibold text-slate-800">
              {job.minExperience === 0 && job.maxExperience <= 1
                ? "Freshers (0 - 1 yr)"
                : `${job.minExperience} - ${job.maxExperience} Years`}
            </p>
          </div>
          <div>
            <p className="text-slate-400 font-semibold uppercase text-2xs">
              Compensation (CTC)
            </p>
            <p className="mt-1 font-semibold text-slate-800">
              {job.salaryRange || "As per industry standards"}
            </p>
          </div>
          <div>
            <p className="text-slate-400 font-semibold uppercase text-2xs">
              Posting Date
            </p>
            <p className="mt-1 font-semibold text-slate-800">{job.createdAt}</p>
          </div>
        </div>
      </Card>

      {/* Specifications & Walk-in Drives Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Requirements */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Job Description & Responsibilities" padding="p-6">
            <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
              {job.description}
            </p>

            {job.responsibilities && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Key Deliverables
                </h4>
                <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside">
                  {job.responsibilities.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          <Card title="Eligibility & Required Qualifications" padding="p-6">
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Minimum Qualification
                </p>
                <p className="mt-1 font-semibold text-slate-800">
                  {job.qualification}
                </p>
              </div>

              {job.eligibilityCriteria && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Walk-In Eligibility Criteria
                  </p>
                  <p className="mt-1 text-slate-700 font-medium">
                    {job.eligibilityCriteria}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Technical Skill Competencies
                </p>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills?.map((skill, i) => (
                    <span
                      key={i}
                      className="inline-block rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Col: Associated Walk-In Drives */}
        <div className="space-y-6">
          <Card
            title="Associated Walk-In Drives"
            subtitle="Walk-in interviews scheduled for this vacancy"
            padding="p-4"
          >
            {associatedDrives.length > 0 ? (
              <div className="space-y-3">
                {associatedDrives.map((d) => (
                  <div
                    key={d.id}
                    className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <DriveApprovalBadge status={d.approvalStatus} />
                      <span className="text-2xs font-semibold text-slate-500">
                        {d.registeredCount} Registered
                      </span>
                    </div>

                    <Link
                      to={`/employer/drives/${d.id}`}
                      className="block text-xs font-bold text-slate-900 hover:text-blue-600 line-clamp-2"
                    >
                      {d.title}
                    </Link>

                    <div className="text-2xs text-slate-500 flex items-center gap-1">
                      <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                      {d.interviewDate} ({d.startTime} - {d.endTime})
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <Link
                        to={`/employer/drives/${d.id}/candidates`}
                        className="text-2xs font-semibold text-blue-600 hover:underline"
                      >
                        Candidates ({d.registeredCount})
                      </Link>
                      <Link
                        to={`/employer/drives/${d.id}`}
                        className="text-2xs font-semibold text-slate-600 hover:text-slate-900"
                      >
                        Inspect Drive →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500 space-y-3">
                <CalendarIcon className="h-8 w-8 text-slate-300 mx-auto" />
                <p>No walk-in drive scheduled for this position yet.</p>
                <Link to={`/employer/drives/new?jobId=${job.id}`}>
                  <Button variant="outline" size="sm" icon={PlusIcon}>
                    Create Walk-In Drive
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
