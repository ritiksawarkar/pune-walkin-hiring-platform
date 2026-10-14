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

  // Role toggle: CANDIDATES vs EMPLOYERS
  const [roleTab, setRoleTab] = useState("CANDIDATES");
  const [employers, setEmployers] = useState([]);
  const [selectedEmployer, setSelectedEmployer] = useState(null);
  const [employerDetailOpen, setEmployerDetailOpen] = useState(false);

  // Modals state
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [stats, setStats] = useState({
    totalCandidates: 0,
    pendingCandidates: 0,
    approvedCandidates: 0,
    rejectedCandidates: 0,
    totalCompanies: 0,
    pendingCompanies: 0,
    verifiedCompanies: 0,
  });

  const loadStats = useCallback(async () => {
    try {
      const res = await adminService.getStats();
      const s = res?.data || res;
      if (s) {
        setStats({
          totalCandidates: s.totalCandidates ?? 0,
          pendingCandidates: s.pendingCandidates ?? 0,
          approvedCandidates: s.approvedCandidates ?? 0,
          rejectedCandidates: s.rejectedCandidates ?? 0,
          totalCompanies: s.totalCompanies ?? 0,
          pendingCompanies: s.pendingCompanies ?? 0,
          verifiedCompanies: s.verifiedCompanies ?? 0,
        });
      }
    } catch (e) {
      console.warn("Failed to load candidate stats", e);
    }
  }, []);

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
      const list = pageData?.content || (Array.isArray(pageData) ? pageData : []);
      setCandidates(list);
      setTotalPages(pageData?.totalPages || 1);
      setTotalElements(pageData?.totalElements || list.length);
    } catch (err) {
      showToast(err.message || "Failed to load candidate registrations", "error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, page, showToast]);

  const loadEmployers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getCompanies({
        status: statusFilter,
        size: 50,
      });
      const data = res?.data || res;
      const list = data?.content || (Array.isArray(data) ? data : []);
      setEmployers(list);
    } catch (err) {
      showToast(err.message || "Failed to load employer registrations", "error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, showToast]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (roleTab === "CANDIDATES") {
      loadCandidates();
    } else {
      loadEmployers();
    }
  }, [roleTab, loadCandidates, loadEmployers]);

  const handleApproveEmployer = async (company) => {
    if (!window.confirm(`Verify and approve employer "${company.companyName}"? This will activate the employer account.`)) {
      return;
    }
    try {
      setActionLoading(true);
      await adminService.approveCompany(company.id);
      showToast(`Employer company "${company.companyName}" verified & approved!`);
      if (employerDetailOpen) setEmployerDetailOpen(false);
      loadEmployers();
      loadStats();
    } catch (err) {
      showToast(err.message || "Failed to approve company", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectEmployer = async (company) => {
    const reason = prompt("Enter rejection reason for this employer registration:", "Corporate registration credentials could not be verified.");
    if (!reason) return;
    try {
      setActionLoading(true);
      await adminService.rejectCompany(company.id, reason);
      showToast(`Employer registration rejected for ${company.companyName}.`, "warning");
      if (employerDetailOpen) setEmployerDetailOpen(false);
      loadEmployers();
      loadStats();
    } catch (err) {
      showToast(err.message || "Failed to reject company", "error");
    } finally {
      setActionLoading(false);
    }
  };

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
      loadStats();
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
      loadStats();
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

  const pendingCount = stats.pendingCandidates ?? candidates.filter((c) => String(c.accountStatus).toUpperCase() === "PENDING").length;
  const approvedCount = stats.approvedCandidates ?? candidates.filter((c) => String(c.accountStatus).toUpperCase() === "APPROVED").length;
  const rejectedCount = stats.rejectedCandidates ?? candidates.filter((c) => String(c.accountStatus).toUpperCase() === "REJECTED").length;
  const totalCount = stats.totalCandidates ?? totalElements;

  const filteredEmployers = employers.filter((emp) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (emp.companyName || "").toLowerCase().includes(q) ||
      (emp.companyEmail || "").toLowerCase().includes(q) ||
      (emp.hrContactPerson || "").toLowerCase().includes(q) ||
      (emp.employer?.fullName || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Role Navigation Switcher */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          type="button"
          onClick={() => {
            setRoleTab("CANDIDATES");
            setPage(0);
          }}
          className={`pb-3 px-2 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            roleTab === "CANDIDATES"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>Candidate Registrations</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            {stats.totalCandidates || candidates.length}
          </span>
          {pendingCount > 0 && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
              {pendingCount} Pending
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            setRoleTab("EMPLOYERS");
            setPage(0);
          }}
          className={`pb-3 px-2 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            roleTab === "EMPLOYERS"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>Employer & Company Registrations</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            {stats.totalCompanies || employers.length}
          </span>
          {stats.pendingCompanies > 0 && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
              {stats.pendingCompanies} Pending
            </span>
          )}
        </button>
      </div>

      {/* Overview Cards */}
      {roleTab === "CANDIDATES" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <p className="text-xs font-medium text-slate-500">Total Registered Candidates</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{totalCount}</p>
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
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <p className="text-xs font-medium text-slate-500">Total Registered Companies</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{stats.totalCompanies || employers.length}</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs">
            <p className="text-xs font-medium text-amber-700">Pending Verification</p>
            <p className="mt-2 text-2xl font-bold text-amber-700">{stats.pendingCompanies}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
            <p className="text-xs font-medium text-emerald-700">Verified & Active</p>
            <p className="mt-2 text-2xl font-bold text-emerald-700">{stats.verifiedCompanies}</p>
          </div>
          <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 shadow-xs">
            <p className="text-xs font-medium text-rose-700">Needs Action</p>
            <p className="mt-2 text-2xl font-bold text-rose-700">{stats.pendingCompanies}</p>
          </div>
        </div>
      )}

      {/* Main Table / Directory */}
      <Card
        title={roleTab === "CANDIDATES" ? "Candidate Registration Requests" : "Employer & Company Requests"}
        subtitle={
          roleTab === "CANDIDATES"
            ? "Review, approve, or reject Pune student and graduate registrations"
            : "Review corporate details and verify employer hiring access for walk-in drives"
        }
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
                placeholder={
                  roleTab === "CANDIDATES"
                    ? "Search candidates by name, email, or college..."
                    : "Search companies by name, email, or recruiter..."
                }
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

        {roleTab === "CANDIDATES" ? (
          /* Candidate List */
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
        ) : (
          /* Employer List */
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-12 text-center text-sm text-slate-500">
                <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mb-2"></div>
                Loading employer registrations from database...
              </div>
            ) : filteredEmployers.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500">
                No employer registration records found matching the criteria.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Company & Recruiter</th>
                    <th className="px-4 py-3 font-semibold">City / Location</th>
                    <th className="px-4 py-3 font-semibold">Contact Email & Phone</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredEmployers.map((emp) => {
                    const isPending = String(emp.verificationStatus).toUpperCase() === "PENDING";
                    const isVerified = String(emp.verificationStatus).toUpperCase() === "VERIFIED";

                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">{emp.companyName}</div>
                          <div className="text-xs text-slate-500">
                            Recruiter: {emp.employer?.fullName || emp.hrContactPerson || "Hiring Lead"}
                          </div>
                          {emp.website && (
                            <a
                              href={emp.website.startsWith("http") ? emp.website : `https://${emp.website}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-blue-600 hover:underline"
                            >
                              {emp.website}
                            </a>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          <div>{emp.city || "Pune"}, {emp.state || "MH"}</div>
                          <div className="text-slate-400">{emp.industryType || "IT Services"}</div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          <div>{emp.companyEmail || emp.employer?.email || "—"}</div>
                          <div className="text-slate-400">{emp.contactPhone || emp.employer?.phone || "—"}</div>
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(emp.verificationStatus)}
                          {emp.rejectionReason && (
                            <div className="mt-1 text-[11px] text-rose-600 max-w-xs truncate" title={emp.rejectionReason}>
                              Reason: {emp.rejectionReason}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedEmployer(emp);
                                setEmployerDetailOpen(true);
                              }}
                            >
                              Details
                            </Button>

                            {!isVerified && (
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleApproveEmployer(emp)}
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
                                onClick={() => handleRejectEmployer(emp)}
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
        )}

        {/* Pagination */}
        {roleTab === "CANDIDATES" && totalPages > 1 && (
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

      {/* Employer Details Modal */}
      {selectedEmployer && (
        <Modal
          isOpen={employerDetailOpen}
          onClose={() => setEmployerDetailOpen(false)}
          title={`Company Profile: ${selectedEmployer.companyName}`}
          subtitle={`Corporate verification for Employer ID: ${selectedEmployer.id}`}
          maxWidth="max-w-2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <div>{getStatusBadge(selectedEmployer.verificationStatus)}</div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setEmployerDetailOpen(false)}>
                  Close
                </Button>
                {String(selectedEmployer.verificationStatus).toUpperCase() !== "VERIFIED" && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleApproveEmployer(selectedEmployer)}
                    disabled={actionLoading}
                    icon={CheckCircleIcon}
                  >
                    Verify & Approve Company
                  </Button>
                )}
                {String(selectedEmployer.verificationStatus).toUpperCase() === "PENDING" && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRejectEmployer(selectedEmployer)}
                    disabled={actionLoading}
                    icon={XCircleIcon}
                  >
                    Reject Employer
                  </Button>
                )}
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-sm text-slate-700">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Corporate & Contact Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500">Corporate Email:</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{selectedEmployer.companyEmail || selectedEmployer.employer?.email || "—"}</p>
                </div>
                <div>
                  <span className="text-slate-500">Contact Phone:</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{selectedEmployer.contactPhone || selectedEmployer.employer?.phone || "—"}</p>
                </div>
                <div>
                  <span className="text-slate-500">Recruiter / HR Lead:</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{selectedEmployer.employer?.fullName || selectedEmployer.hrContactPerson || "—"}</p>
                </div>
                <div>
                  <span className="text-slate-500">Website:</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{selectedEmployer.website || "—"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Location & Operations</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500">Location / City:</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{selectedEmployer.city || "Pune"}, {selectedEmployer.state || "MH"}</p>
                </div>
                <div>
                  <span className="text-slate-500">Industry Sector:</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{selectedEmployer.industryType || "IT / Software Development"}</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500">Office Address:</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{selectedEmployer.address || "Pune Corporate Park, MH"}</p>
                </div>
              </div>
            </div>

            {selectedEmployer.rejectionReason && (
              <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-xs text-rose-800">
                <p className="font-bold">Prior Rejection Reason:</p>
                <p className="mt-1">{selectedEmployer.rejectionReason}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
