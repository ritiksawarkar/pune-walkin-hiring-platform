import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { driveService } from "../../../services/driveService";
import { useToast } from "../../../context/ToastContext";
import { DriveApprovalBadge } from "../components/DriveApprovalBadge";
import { DriveStatusBadge } from "../components/DriveStatusBadge";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { SearchBar } from "../../../components/common/SearchBar";
import { EmptyState } from "../../../components/common/EmptyState";
import {
  CalendarIcon,
  PlusIcon,
  EyeIcon,
  EditIcon,
  UsersIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
} from "../../../components/common/Icons";

export function DrivesPage() {
  const { showToast } = useToast();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: "",
    approvalStatus: "All",
    driveStatus: "All",
    sortBy: "date-asc",
  });

  const loadDrives = useCallback(async () => {
    try {
      setLoading(true);
      const data = await driveService.getDrives(filters);
      setDrives(data);
    } catch (err) {
      showToast("Error loading walk-in drives.", "error");
    } finally {
      setLoading(false);
    }
  }, [filters, showToast]);

  useEffect(() => {
    loadDrives();
  }, [loadDrives]);

  const handleSubmitForApproval = async (drive) => {
    if (
      window.confirm(
        `Submit "${drive.title}" for Administrative Approval (Sahil)?`
      )
    ) {
      try {
        await driveService.submitDriveForApproval(drive.id);
        showToast("Drive submitted to Admin for approval.");
        loadDrives();
      } catch (err) {
        showToast(err.message || "Failed to submit drive.", "error");
      }
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      approvalStatus: "All",
      driveStatus: "All",
      sortBy: "date-asc",
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Walk-In Drives & On-Site Hiring Events
          </h2>
          <p className="text-xs text-slate-500">
            Coordinate venues, candidate quotas, and track verification status with Sahil (Admin)
          </p>
        </div>

        <Link to="/employer/drives/new">
          <Button variant="primary" icon={PlusIcon}>
            Schedule Walk-In Drive
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <Card padding="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="lg:col-span-1">
            <SearchBar
              value={filters.search}
              onChange={(val) => setFilters((prev) => ({ ...prev, search: val }))}
              placeholder="Search by drive title, job, venue..."
            />
          </div>

          <div>
            <select
              value={filters.approvalStatus}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, approvalStatus: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="All">All Approval Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Changes Requested">Changes Requested</option>
              <option value="Draft">Draft</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <select
              value={filters.driveStatus}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, driveStatus: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="All">All Drive Lifecycles</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, sortBy: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="date-asc">Interview Date (Upcoming First)</option>
              <option value="date-desc">Interview Date (Latest First)</option>
              <option value="registrations-desc">Most Registrations</option>
              <option value="vacancies-desc">Most Vacancies</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Drives List */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
        </div>
      ) : drives.length > 0 ? (
        <div className="space-y-4">
          {drives.map((drive) => {
            const fillPercentage = Math.min(
              100,
              Math.round(
                ((drive.registeredCount || 0) / (drive.maxRegistrations || 100)) * 100
              )
            );
            return (
              <Card
                key={drive.id}
                padding="p-5 sm:p-6"
                className="hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <DriveApprovalBadge status={drive.approvalStatus} />
                      <DriveStatusBadge status={drive.driveStatus} />
                      <span className="text-xs font-semibold text-blue-600">
                        {drive.jobTitle}
                      </span>
                    </div>

                    <Link
                      to={`/employer/drives/${drive.id}`}
                      className="text-base sm:text-lg font-bold text-slate-900 hover:text-blue-600 block line-clamp-1"
                    >
                      {drive.title}
                    </Link>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-slate-600 pt-1">
                      <div className="flex items-center gap-1.5 font-medium">
                        <CalendarIcon className="h-4 w-4 text-slate-400" />
                        <span>Date: {drive.interviewDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ClockIcon className="h-4 w-4 text-slate-400" />
                        <span>
                          {drive.startTime} - {drive.endTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPinIcon className="h-4 w-4 text-slate-400 shrink-0" />
                        <span className="truncate">{drive.venueName}, {drive.city}</span>
                      </div>
                    </div>

                    {drive.adminFeedback && (
                      <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50/70 p-3 text-xs text-rose-800">
                        <span className="font-bold">Reviewer Feedback (Sahil): </span>
                        {drive.adminFeedback}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Registrations & Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100 min-w-[220px]">
                    <div className="text-left sm:text-right lg:text-right w-full">
                      <div className="flex justify-between sm:justify-end gap-3 items-center text-xs text-slate-500 mb-1">
                        <span>Registrations</span>
                        <span className="font-bold text-slate-900">
                          {drive.registeredCount} / {drive.maxRegistrations}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${fillPercentage}%` }}
                        />
                      </div>
                      <p className="text-2xs text-slate-400 mt-1">
                        {drive.vacancies} open position(s)
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Link to={`/employer/drives/${drive.id}/candidates`}>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={UsersIcon}
                        >
                          Candidates ({drive.registeredCount})
                        </Button>
                      </Link>

                      <Link to={`/employer/drives/${drive.id}`}>
                        <Button variant="ghost" size="sm" icon={EyeIcon}>
                          Details
                        </Button>
                      </Link>

                      {(drive.approvalStatus === "Draft" ||
                        drive.approvalStatus === "Changes Requested") && (
                        <Link to={`/employer/drives/${drive.id}/edit`}>
                          <Button variant="ghost" size="sm" icon={EditIcon}>
                            Edit
                          </Button>
                        </Link>
                      )}

                      {drive.approvalStatus === "Draft" && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleSubmitForApproval(drive)}
                        >
                          Submit
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={CalendarIcon}
          title="No walk-in drives found"
          description="Try adjusting your filter settings or schedule a new walk-in drive in Pune."
          actionLabel="Clear Filters"
          onAction={handleResetFilters}
        />
      )}
    </div>
  );
}
