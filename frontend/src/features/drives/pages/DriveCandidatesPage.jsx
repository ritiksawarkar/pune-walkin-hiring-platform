import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { driveService } from "../../../services/driveService";
import { recruitmentService } from "../../../services/recruitmentService";
import { useToast } from "../../../context/ToastContext";
import { ApplicationStatusBadge } from "../../recruiter/components/ApplicationStatusBadge";
import { CandidateDetailsModal } from "../../recruiter/components/CandidateDetailsModal";
import { StatusChangeModal } from "../../recruiter/components/StatusChangeModal";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { SearchBar } from "../../../components/common/SearchBar";
import { EmptyState } from "../../../components/common/EmptyState";
import {
  UsersIcon,
  ArrowLeftIcon,
  CalendarIcon,
  MapPinIcon,
  EyeIcon,
  CheckCircleIcon,
  FileTextIcon,
} from "../../../components/common/Icons";

export function DriveCandidatesPage() {
  const { driveId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [drive, setDrive] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: "",
    status: "All",
    sortBy: "date-desc",
  });

  // Modals state
  const [selectedApp, setSelectedApp] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [driveData, appsData] = await Promise.all([
        driveService.getDriveById(driveId),
        recruitmentService.getDriveCandidates(driveId, filters),
      ]);
      setDrive(driveData);
      setCandidates(appsData);
    } catch (err) {
      showToast("Error loading candidate registrations.", "error");
      navigate("/employer/drives");
    } finally {
      setLoading(false);
    }
  }, [driveId, filters, navigate, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusUpdate = async (applicationId, newStatus, reason, note) => {
    try {
      setUpdatingStatus(true);
      await recruitmentService.updateApplicationStatus(
        applicationId,
        newStatus,
        reason,
        note
      );
      showToast(`Candidate status updated to "${newStatus}"!`);
      setIsStatusOpen(false);
      loadData();
    } catch (err) {
      showToast("Failed to update candidate status.", "error");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleQuickShortlist = async (app) => {
    try {
      await recruitmentService.updateApplicationStatus(
        app.id,
        "Shortlisted",
        "",
        "Quick shortlisted from drive candidate list"
      );
      showToast(`${app.candidateName} shortlisted for walk-in rounds!`);
      loadData();
    } catch (err) {
      showToast("Error updating status.", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Drive Context Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="sm"
          icon={ArrowLeftIcon}
          onClick={() => navigate(`/employer/drives/${driveId}`)}
        >
          Back to Drive Details
        </Button>

        <Link to={`/employer/pipeline?driveId=${driveId}`}>
          <Button variant="outline" size="sm">
            View Drive Pipeline
          </Button>
        </Link>
      </div>

      {drive && (
        <Card padding="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Registered Candidates Pool
              </span>
              <h2 className="text-xl font-bold text-slate-900">{drive.title}</h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                  {drive.interviewDate} ({drive.startTime} - {drive.endTime})
                </span>
                <span className="flex items-center gap-1">
                  <MapPinIcon className="h-3.5 w-3.5 text-slate-400" />
                  {drive.venueName}, {drive.city}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-left sm:text-right shrink-0">
              <p className="text-2xs font-bold uppercase text-slate-400">
                Registered Turnout
              </p>
              <p className="text-2xl font-extrabold text-slate-900">
                {candidates.length}{" "}
                <span className="text-xs font-normal text-slate-500">
                  / {drive.maxRegistrations}
                </span>
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Search and Filters */}
      <Card padding="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <SearchBar
            value={filters.search}
            onChange={(val) => setFilters((prev) => ({ ...prev, search: val }))}
            placeholder="Search candidate name, token, skill..."
          />

          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, status: e.target.value }))
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="All">All Recruitment Stages</option>
            <option value="Registered">Registered</option>
            <option value="Under Review">Under Review</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Selected">Selected</option>
            <option value="On Hold">On Hold</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={filters.sortBy}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, sortBy: e.target.value }))
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="date-desc">Newest Registration</option>
            <option value="date-asc">Oldest Registration</option>
            <option value="name-asc">Candidate Name (A-Z)</option>
            <option value="token-asc">Token Number</option>
          </select>
        </div>
      </Card>

      {/* Candidate Registrations Table */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
        </div>
      ) : candidates.length > 0 ? (
        <Card padding="p-0" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-2xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Token / ID</th>
                  <th className="px-6 py-3.5 font-semibold">Candidate</th>
                  <th className="px-6 py-3.5 font-semibold">Academic Profile</th>
                  <th className="px-6 py-3.5 font-semibold">Key Skills</th>
                  <th className="px-6 py-3.5 font-semibold">Slot & Date</th>
                  <th className="px-6 py-3.5 font-semibold">Status</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {candidates.map((cand) => (
                  <tr key={cand.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-bold text-slate-700 rounded-md bg-slate-100 px-2 py-1">
                        {cand.tokenNumber || cand.id}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedApp(cand);
                          setIsDetailsOpen(true);
                        }}
                        className="font-bold text-slate-900 hover:text-blue-600 text-left block"
                      >
                        {cand.candidateName}
                      </button>
                      <div className="text-xs text-slate-500">{cand.email}</div>
                    </td>

                    <td className="px-6 py-4 text-xs">
                      <div className="text-slate-800 font-medium">
                        {cand.qualification}
                      </div>
                      <div className="text-2xs text-slate-500">
                        {cand.experienceYears > 0
                          ? `${cand.experienceYears} Years Exp`
                          : "Fresher"}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {cand.skills?.slice(0, 3).map((s, idx) => (
                          <span
                            key={idx}
                            className="rounded-sm bg-slate-100 px-1.5 py-0.5 text-2xs font-medium text-slate-700"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-600">
                      <div>{cand.registrationDate}</div>
                      <div className="text-2xs text-slate-400">
                        {cand.registrationSlot || "09:30 AM"}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <ApplicationStatusBadge status={cand.status} />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={EyeIcon}
                          onClick={() => {
                            setSelectedApp(cand);
                            setIsDetailsOpen(true);
                          }}
                        >
                          Review
                        </Button>

                        {cand.status === "Registered" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickShortlist(cand)}
                            className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                          >
                            Shortlist
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedApp(cand);
                            setIsStatusOpen(true);
                          }}
                        >
                          Status
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <EmptyState
          icon={UsersIcon}
          title="No candidates registered for this drive yet"
          description="Candidates will register via the candidate portal (Yadit) once this drive is published."
        />
      )}

      {/* Candidate Details Modal */}
      <CandidateDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        application={selectedApp}
        onOpenStatusChange={(app) => {
          setSelectedApp(app);
          setIsStatusOpen(true);
        }}
      />

      {/* Status Update Modal */}
      <StatusChangeModal
        isOpen={isStatusOpen}
        onClose={() => setIsStatusOpen(false)}
        application={selectedApp}
        onConfirm={handleStatusUpdate}
        loading={updatingStatus}
      />
    </div>
  );
}
