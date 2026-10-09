import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { recruitmentService } from "../../../services/recruitmentService";
import { driveService } from "../../../services/driveService";
import { useToast } from "../../../context/ToastContext";
import { ApplicationStatusBadge } from "../components/ApplicationStatusBadge";
import { CandidateDetailsModal } from "../components/CandidateDetailsModal";
import { StatusChangeModal } from "../components/StatusChangeModal";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { SearchBar } from "../../../components/common/SearchBar";
import { EmptyState } from "../../../components/common/EmptyState";
import { Pagination } from "../../../components/common/Pagination";
import {
  UsersIcon,
  EyeIcon,
  CheckCircleIcon,
  FilterIcon,
} from "../../../components/common/Icons";

export function RecruiterApplicationsPage() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialStatus = searchParams.get("status") || "All";
  const initialDrive = searchParams.get("driveId") || "All";

  const { showToast } = useToast();
  const [applications, setApplications] = useState([]);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: initialSearch,
    status: initialStatus,
    driveId: initialDrive,
    sortBy: "date-desc",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals
  const [selectedApp, setSelectedApp] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [appsData, drivesData] = await Promise.all([
        recruitmentService.getApplications(filters),
        driveService.getDrives(),
      ]);
      setApplications(appsData);
      setDrives(drivesData);
    } catch (err) {
      showToast("Error loading applications.", "error");
    } finally {
      setLoading(false);
    }
  }, [filters, showToast]);

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
      showToast(`Status updated to "${newStatus}"!`);
      setIsStatusOpen(false);
      loadData();
    } catch (err) {
      showToast("Failed to update status.", "error");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      status: "All",
      driveId: "All",
      sortBy: "date-desc",
    });
    setCurrentPage(1);
  };

  // Pagination calculation
  const totalItems = applications.length;
  const paginatedApps = applications.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Candidate Applications & Screening
          </h2>
          <p className="text-xs text-slate-500">
            Review applicant qualifications, verify resumes, and shortlist candidates across all Pune walk-in drives
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <Card padding="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <SearchBar
              value={filters.search}
              onChange={(val) => {
                setFilters((prev) => ({ ...prev, search: val }));
                setCurrentPage(1);
              }}
              placeholder="Search candidate name, token, skill..."
            />
          </div>

          <div>
            <select
              value={filters.driveId}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, driveId: e.target.value }));
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="All">All Walk-In Drives</option>
              {drives.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title} ({d.interviewDate})
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filters.status}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, status: e.target.value }));
                setCurrentPage(1);
              }}
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
          </div>

          <div>
            <select
              value={filters.sortBy}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, sortBy: e.target.value }));
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="date-desc">Newest Registration</option>
              <option value="date-asc">Oldest Registration</option>
              <option value="name-asc">Candidate Name (A-Z)</option>
              <option value="token-asc">Token Number</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Applications Table */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
        </div>
      ) : paginatedApps.length > 0 ? (
        <Card padding="p-0" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-2xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Token / ID</th>
                  <th className="px-6 py-3.5 font-semibold">Candidate</th>
                  <th className="px-6 py-3.5 font-semibold">Walk-In Drive & Job</th>
                  <th className="px-6 py-3.5 font-semibold">Qualification</th>
                  <th className="px-6 py-3.5 font-semibold">Registration Date</th>
                  <th className="px-6 py-3.5 font-semibold">Status</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-700">
                      <span className="rounded-md bg-slate-100 px-2 py-1">
                        {app.tokenNumber || app.id}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          setIsDetailsOpen(true);
                        }}
                        className="font-bold text-slate-900 hover:text-blue-600 text-left block"
                      >
                        {app.candidateName}
                      </button>
                      <div className="text-xs text-slate-500">{app.email}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-xs font-bold text-slate-800 line-clamp-1 max-w-xs">
                        {app.jobTitle}
                      </div>
                      <div className="text-2xs text-slate-500 line-clamp-1 max-w-xs">
                        {app.driveTitle}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs">
                      <div className="text-slate-800 font-medium">
                        {app.qualification}
                      </div>
                      <div className="text-2xs text-slate-500">
                        {app.experienceYears > 0
                          ? `${app.experienceYears} Years Exp`
                          : "Fresher"}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-600">
                      <div>{app.registrationDate}</div>
                      <div className="text-2xs text-slate-400">
                        {app.registrationSlot || "09:30 AM"}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <ApplicationStatusBadge status={app.status} />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={EyeIcon}
                          onClick={() => {
                            setSelectedApp(app);
                            setIsDetailsOpen(true);
                          }}
                        >
                          Review
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedApp(app);
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

          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </Card>
      ) : (
        <EmptyState
          icon={UsersIcon}
          title="No candidate applications match filters"
          description="Try broadening your search term or selecting 'All' in the filters above."
          actionLabel="Clear Filters"
          onAction={handleResetFilters}
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
