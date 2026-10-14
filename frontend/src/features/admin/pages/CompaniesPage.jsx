import { useEffect, useState, useMemo, useCallback } from "react";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import {
  SearchIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExternalLinkIcon,
  MailIcon,
  PhoneIcon,
  BuildingIcon,
  MapPinIcon,
} from "../../../components/common/Icons";
import { adminService } from "../../../services/adminService";
import { useToast } from "../../../context/ToastContext";

const STATUS_FILTERS = ["ALL", "PENDING", "VERIFIED", "REJECTED"];

export function CompaniesPage() {
  const { showToast } = useToast();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedId, setSelectedId] = useState(null);

  // Rejection modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [companyToReject, setCompanyToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const loadCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getCompanies({ status: statusFilter, size: 50 });
      const data = res?.data || res;
      const list = data?.content || (Array.isArray(data) ? data : []);
      setCompanies(list);
      if (list.length > 0 && !selectedId) {
        setSelectedId(list[0].id);
      }
    } catch (err) {
      showToast(err.message || "Failed to load company records", "error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, selectedId, showToast]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      const name = (c.companyName || "").toLowerCase();
      const email = (c.companyEmail || "").toLowerCase();
      const hr = (c.hrContactPerson || "").toLowerCase();
      const employer = (c.employer?.fullName || "").toLowerCase();
      return name.includes(q) || email.includes(q) || hr.includes(q) || employer.includes(q);
    });
  }, [companies, search]);

  const selectedCompany = useMemo(() => {
    return filteredCompanies.find((c) => c.id === selectedId) || filteredCompanies[0] || null;
  }, [filteredCompanies, selectedId]);

  const handleApprove = async (companyId) => {
    const comp = companies.find((c) => c.id === companyId);
    if (!window.confirm(`Verify and approve ${comp?.companyName || "this company"}? This will activate the employer account.`)) {
      return;
    }

    try {
      setActionLoading(true);
      await adminService.approveCompany(companyId);
      showToast(`Company "${comp?.companyName}" verified & approved successfully!`);
      loadCompanies();
    } catch (err) {
      showToast(err.message || "Failed to approve company", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectDialog = (company) => {
    setCompanyToReject(company);
    setRejectionReason(
      company.rejectionReason ||
        "Submitted corporate credentials, registration certificate, or company domain could not be verified."
    );
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!companyToReject) return;
    try {
      setActionLoading(true);
      await adminService.rejectCompany(companyToReject.id, rejectionReason);
      showToast(`Company registration rejected for ${companyToReject.companyName}.`, "warning");
      setRejectModalOpen(false);
      loadCompanies();
    } catch (err) {
      showToast(err.message || "Failed to reject company", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const pendingCount = companies.filter((c) => c.verificationStatus === "PENDING").length;
  const verifiedCount = companies.filter((c) => c.verificationStatus === "VERIFIED").length;
  const rejectedCount = companies.filter((c) => c.verificationStatus === "REJECTED").length;

  return (
    <div className="space-y-6">
      {/* Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Total Companies</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{companies.length}</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs">
          <p className="text-xs font-medium text-amber-700">Pending Verification</p>
          <p className="mt-2 text-2xl font-bold text-amber-700">{pendingCount}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
          <p className="text-xs font-medium text-emerald-700">Verified & Approved</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">{verifiedCount}</p>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 shadow-xs">
          <p className="text-xs font-medium text-rose-700">Rejected</p>
          <p className="mt-2 text-2xl font-bold text-rose-700">{rejectedCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.3fr,.9fr] gap-6">
        {/* Table list */}
        <Card title="Employer Verification Requests" subtitle="Search by company name, employer, or work email" padding="p-0">
          <div className="border-b border-slate-200 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search company, recruiter, or work email..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {STATUS_FILTERS.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                      statusFilter === st
                        ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-12 text-center text-sm text-slate-500">
                <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mb-2"></div>
                Loading employer companies...
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500">
                No company records found matching filters.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Company</th>
                    <th className="px-4 py-3 font-semibold">Contact Person</th>
                    <th className="px-4 py-3 font-semibold">Location</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredCompanies.map((comp) => {
                    const isSelected = selectedCompany?.id === comp.id;
                    return (
                      <tr
                        key={comp.id}
                        onClick={() => setSelectedId(comp.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? "bg-blue-50/50" : "hover:bg-slate-50"
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">{comp.companyName}</div>
                          <div className="text-xs text-slate-500">{comp.companyEmail}</div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-700">
                          <div className="font-medium text-slate-800">{comp.employer?.fullName || comp.hrContactPerson || "Recruiter"}</div>
                          <div className="text-slate-400">{comp.phone || comp.employer?.mobile || "—"}</div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          {comp.city || "Pune"}, {comp.state || "Maharashtra"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              comp.verificationStatus === "VERIFIED"
                                ? "success"
                                : comp.verificationStatus === "REJECTED"
                                ? "danger"
                                : "warning"
                            }
                            size="sm"
                          >
                            {comp.verificationStatus}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant={isSelected ? "primary" : "outline"}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedId(comp.id);
                            }}
                          >
                            Inspect
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </Card>

        {/* Selected Company Details Card */}
        {selectedCompany ? (
          <Card title="Corporate Verification Dossier" subtitle={selectedCompany.companyName} padding="p-5">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-800 font-bold text-lg">
                  {selectedCompany.companyName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-base">{selectedCompany.companyName}</p>
                  <p className="text-xs text-slate-500">{selectedCompany.industry || "Information Technology / Engineering"}</p>
                </div>
              </div>

              {/* Status banner */}
              <div
                className={`rounded-xl border p-3.5 ${
                  selectedCompany.verificationStatus === "VERIFIED"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : selectedCompany.verificationStatus === "REJECTED"
                    ? "border-rose-200 bg-rose-50 text-rose-900"
                    : "border-amber-200 bg-amber-50 text-amber-900"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>Status: {selectedCompany.verificationStatus}</span>
                  <Badge
                    variant={
                      selectedCompany.verificationStatus === "VERIFIED"
                        ? "success"
                        : selectedCompany.verificationStatus === "REJECTED"
                        ? "danger"
                        : "warning"
                    }
                    size="sm"
                  >
                    {selectedCompany.verificationStatus}
                  </Badge>
                </div>
                {selectedCompany.rejectionReason && (
                  <p className="mt-1.5 text-xs text-rose-700">
                    <span className="font-semibold">Rejection Reason:</span> {selectedCompany.rejectionReason}
                  </p>
                )}
              </div>

              {/* Contact Details */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2 text-xs text-slate-700">
                <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Primary Contact</p>
                <div className="flex items-center gap-2">
                  <MailIcon className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>Work Email: <strong className="text-slate-800">{selectedCompany.companyEmail}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneIcon className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>Phone: <strong className="text-slate-800">{selectedCompany.phone || "Not provided"}</strong></span>
                </div>
                {selectedCompany.website && (
                  <div className="flex items-center gap-2">
                    <ExternalLinkIcon className="h-4 w-4 text-slate-400 shrink-0" />
                    <a
                      href={selectedCompany.website.startsWith("http") ? selectedCompany.website : `https://${selectedCompany.website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {selectedCompany.website}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>
                    Location: {selectedCompany.headquartersAddress || selectedCompany.city || "Pune, Maharashtra"}
                  </span>
                </div>
              </div>

              {/* Recruiter info */}
              <div className="rounded-xl border border-slate-200 bg-white p-3.5 text-xs space-y-1.5">
                <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Authorized Recruiter</p>
                <p className="text-slate-800 font-semibold">{selectedCompany.employer?.fullName || selectedCompany.hrContactPerson || "Employer"}</p>
                <p className="text-slate-500">Account: {selectedCompany.employer?.email || selectedCompany.companyEmail}</p>
                <p className="text-slate-500">Designation: {selectedCompany.hrContactRole || "Technical Recruiter"}</p>
              </div>

              {/* Description */}
              {selectedCompany.description && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-700">
                  <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">Company Description</p>
                  <p className="leading-relaxed">{selectedCompany.description}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                {selectedCompany.verificationStatus !== "VERIFIED" && (
                  <Button
                    variant="success"
                    size="md"
                    onClick={() => handleApprove(selectedCompany.id)}
                    disabled={actionLoading}
                    icon={CheckCircleIcon}
                  >
                    Approve & Verify Company
                  </Button>
                )}
                {selectedCompany.verificationStatus === "PENDING" && (
                  <Button
                    variant="danger"
                    size="md"
                    onClick={() => openRejectDialog(selectedCompany)}
                    disabled={actionLoading}
                    icon={XCircleIcon}
                  >
                    Reject Registration
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ) : (
          <div className="flex items-center justify-center p-12 text-sm text-slate-400 border border-dashed rounded-xl bg-slate-50">
            Select a company to view verification details
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {companyToReject && (
        <Modal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title={`Reject Verification: ${companyToReject.companyName}`}
          subtitle="Provide reasons why the corporate registration was rejected"
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
              Corporate Verification Rejection Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Invalid GSTIN/CIN, non-operational corporate website, or contact email domain does not match organization."
              className="w-full rounded-lg border border-slate-200 p-3 text-xs sm:text-sm text-slate-800 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            />
            <p className="text-[11px] text-slate-500">
              The employer will see this notification reason upon login and will not be permitted to publish jobs or drives.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
