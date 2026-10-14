import { useEffect, useState, useCallback } from "react";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import {
  SearchIcon,
  UserCheckIcon,
  XCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  GraduationCapIcon,
  PhoneIcon,
  MailIcon,
  BuildingIcon,
  FileTextIcon,
} from "../../../components/common/Icons";
import { adminService } from "../../../services/adminService";
import { useToast } from "../../../context/ToastContext";

const STATUS_FILTERS = ["ALL", "PENDING", "APPROVED", "REJECTED", "SUSPENDED"];

export function UserManagementPage() {
  const { showToast } = useToast();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modals state
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const loadCandidates = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getCandidates({
        status: statusFilter,
        search,
        page,
        size: 15,
      });
      // Page<CandidateAdminResponse>
      const pageData = res?.data || res;
      setCandidates(pageData?.content || []);
      setTotalPages(pageData?.totalPages || 0);
      setTotalElements(pageData?.totalElements || 0);
    } catch (err) {
      showToast(err.message || "Failed to load candidate registrations", "error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, page, showToast]);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  const handleApprove = async (candidate) => {
    if (!window.confirm(`Approve registration for ${candidate.fullName}? This will activate their candidate account.`)) {
      return;
    }

    try {
      setActionLoading(true);
      await adminService.approveCandidate(candidate.userId);
      showToast(`Candidate ${candidate.fullName} has been approved successfully!`);
      if (detailModalOpen) setDetailModalOpen(false);
      loadCandidates();
    } catch (err) {
      showToast(err.message || "Failed to approve candidate", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectDialog = (candidate) => {
    setSelectedCandidate(candidate);
    setRejectionReason(
      candidate.rejectionReason ||
        "Candidate academic background or submitted verification documents do not meet current eligibility requirements."
    );
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedCandidate) return;
    try {
      setActionLoading(true);
      await adminService.rejectCandidate(selectedCandidate.userId, rejectionReason);
      showToast(`Registration rejected for ${selectedCandidate.fullName}.`, "warning");
      setRejectModalOpen(false);
      if (detailModalOpen) setDetailModalOpen(false);
      loadCandidates();
    } catch (err) {
      showToast(err.message || "Failed to reject candidate", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = String(status).toUpperCase();
    if (s === "APPROVED") return <Badge variant="success" size="sm">APPROVED</Badge>;
    if (s === "PENDING" || s === "PENDING_APPROVAL") return <Badge variant="warning" size="sm">PENDING APPROVAL</Badge>;
    if (s === "REJECTED") return <Badge variant="danger" size="sm">REJECTED</Badge>;
    if (s === "SUSPENDED") return <Badge variant="danger" size="sm">SUSPENDED</Badge>;
    return <Badge variant="neutral" size="sm">{status}</Badge>;
  };

  const pendingCount = candidates.filter((c) => String(c.accountStatus).toUpperCase() === "PENDING").length;
  const approvedCount = candidates.filter((c) => String(c.accountStatus).toUpperCase() === "APPROVED").length;
  const rejectedCount = candidates.filter((c) => String(c.accountStatus).toUpperCase() === "REJECTED").length;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Total Registered Candidates</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{totalElements}</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs">
          <p className="text-xs font-medium text-amber-700">Pending Review</p>
          <p className="mt-2 text-2xl font-bold text-amber-700">{pendingCount}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
          <p className="text-xs font-medium text-emerald-700">Approved & Active</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">{approvedCount}</p>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 shadow-xs">
          <p className="text-xs font-medium text-rose-700">Rejected</p>
          <p className="mt-2 text-2xl font-bold text-rose-700">{rejectedCount}</p>
        </div>
      </div>

      {/* Main Table / Directory */}
      <Card
        title="Candidate Registration Requests"
        subtitle="Review, approve, or reject Pune student and graduate registrations"
        padding="p-0"
      >
        {/* Filters & Search */}
        <div className="border-b border-slate-200 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                placeholder="Search candidates by name, email, or college..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => {
                    setStatusFilter(status);
                    setPage(0);
                  }}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                    statusFilter === status
                      ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold shadow-xs"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Candidate List */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-sm text-slate-500">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mb-2"></div>
              Loading candidate requests from database...
            </div>
          ) : candidates.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              No candidate registration records found matching the criteria.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Candidate</th>
                  <th className="px-4 py-3 font-semibold">College / Institute</th>
                  <th className="px-4 py-3 font-semibold">Degree & Branch</th>
                  <th className="px-4 py-3 font-semibold">Batch & CGPA</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {candidates.map((cand) => {
                  const isPending = String(cand.accountStatus).toUpperCase() === "PENDING";
                  const isApproved = String(cand.accountStatus).toUpperCase() === "APPROVED";

                  return (
                    <tr key={cand.userId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{cand.fullName}</div>
                        <div className="text-xs text-slate-500">{cand.email}</div>
                        {cand.phone && <div className="text-[11px] text-slate-400">{cand.phone}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800 text-xs sm:text-sm">
                          {cand.collegeName || "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        <div>{cand.degree || "B.E. / B.Tech"}</div>
                        <div className="text-slate-400">{cand.branch || "General"}</div>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <div className="font-medium text-slate-700">Class of {cand.graduationYear || "2025"}</div>
                        <div className="text-slate-400">
                          CGPA: <span className="font-semibold text-slate-700">{cand.cgpa ? cand.cgpa.toFixed(2) : "—"}</span>
                          {cand.backlogs != null && (
                            <span className="ml-1.5 text-amber-600">({cand.backlogs} backlogs)</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(cand.accountStatus)}
                        {cand.rejectionReason && (
                          <div className="mt-1 text-[11px] text-rose-600 max-w-xs truncate" title={cand.rejectionReason}>
                            Reason: {cand.rejectionReason}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCandidate(cand);
                              setDetailModalOpen(true);
                            }}
                          >
                            Details
                          </Button>

                          {!isApproved && (
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleApprove(cand)}
                              disabled={actionLoading}
                              icon={CheckCircleIcon}
                            >
                              Approve
                            </Button>
                          )}

                          {isPending && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => openRejectDialog(cand)}
                              disabled={actionLoading}
                              icon={XCircleIcon}
                            >
                              Reject
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-500">
            <div>
              Showing Page {page + 1} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Candidate Details Modal */}
      {selectedCandidate && (
        <Modal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          title={`Candidate Profile: ${selectedCandidate.fullName}`}
          subtitle={`Registration review for candidate ID: ${selectedCandidate.userId}`}
          maxWidth="max-w-2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <div>
                {getStatusBadge(selectedCandidate.accountStatus)}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setDetailModalOpen(false)}>
                  Close
                </Button>
                {String(selectedCandidate.accountStatus).toUpperCase() !== "APPROVED" && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleApprove(selectedCandidate)}
                    disabled={actionLoading}
                    icon={CheckCircleIcon}
                  >
                    Approve Candidate
                  </Button>
                )}
                {String(selectedCandidate.accountStatus).toUpperCase() === "PENDING" && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setDetailModalOpen(false);
                      openRejectDialog(selectedCandidate);
                    }}
                    disabled={actionLoading}
                    icon={XCircleIcon}
                  >
                    Reject Registration
                  </Button>
                )}
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-sm text-slate-700">
            {/* Top Contact Info */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Personal & Contact</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <MailIcon className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-800">{selectedCandidate.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneIcon className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-800">{selectedCandidate.phone || "Not specified"}</span>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Academic & College Profile</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500">College / Institute:</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{selectedCandidate.collegeName || "Not assigned"}</p>
                </div>
                <div>
                  <span className="text-slate-500">Graduation Batch:</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{selectedCandidate.graduationYear || "2025"}</p>
                </div>
                <div>
                  <span className="text-slate-500">Degree & Specialization:</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{selectedCandidate.degree} — {selectedCandidate.branch}</p>
                </div>
                <div>
                  <span className="text-slate-500">Academic Standing:</span>
                  <p className="font-semibold text-slate-900 mt-0.5">
                    CGPA: {selectedCandidate.cgpa ? selectedCandidate.cgpa.toFixed(2) : "N/A"} | Active Backlogs: {selectedCandidate.backlogs ?? 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Skills */}
            {selectedCandidate.skills && selectedCandidate.skills.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Technical Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCandidate.skills.map((skill, i) => (
                    <span key={i} className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 border border-blue-100">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Rejection / Status Notes */}
            {selectedCandidate.rejectionReason && (
              <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-xs text-rose-800">
                <p className="font-bold">Prior Rejection Reason:</p>
                <p className="mt-1">{selectedCandidate.rejectionReason}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Rejection Reason Dialog */}
      {selectedCandidate && (
        <Modal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title={`Reject Registration: ${selectedCandidate.fullName}`}
          subtitle="Provide clear feedback so the candidate understands why registration was not approved"
          maxWidth="max-w-lg"
          footer={
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setRejectModalOpen(false)} disabled={actionLoading}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleRejectConfirm}
                loading={actionLoading}
                disabled={!rejectionReason.trim()}
              >
                Confirm Rejection
              </Button>
            </div>
          }
        >
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700">
              Rejection Reason & Compliance Feedback <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Incomplete college verification documents, non-eligible degree program, or duplicate entry."
              className="w-full rounded-lg border border-slate-200 p-3 text-xs sm:text-sm text-slate-800 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            />
            <p className="text-[11px] text-slate-500">
              This message will be shown to the candidate when they attempt to log in with their credentials.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
