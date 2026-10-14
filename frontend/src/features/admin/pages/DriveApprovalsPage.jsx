import { useEffect, useState, useMemo, useCallback } from "react";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  AlertCircleIcon,
  BuildingIcon,
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  GraduationCapIcon,
} from "../../../components/common/Icons";
import { adminService } from "../../../services/adminService";
import { useToast } from "../../../context/ToastContext";

const STATUS_OPTIONS = ["ALL", "PENDING", "APPROVED", "REJECTED"];
const CAMPUS_OPTIONS = ["ALL", "ON_CAMPUS", "OFF_CAMPUS"];

export function DriveApprovalsPage() {
  const { showToast } = useToast();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [campusFilter, setCampusFilter] = useState("ALL");
  const [selectedId, setSelectedId] = useState(null);

  // Rejection modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [driveToReject, setDriveToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const loadDrives = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getDrives({
        status: statusFilter,
        campusType: campusFilter,
        size: 50,
      });
      const data = res?.data || res;
      const list = data?.content || (Array.isArray(data) ? data : []);
      setDrives(list);
      if (list.length > 0 && !selectedId) {
        setSelectedId(list[0].id);
      }
    } catch (err) {
      showToast(err.message || "Failed to load drives for review", "error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, campusFilter, selectedId, showToast]);

  useEffect(() => {
    loadDrives();
  }, [loadDrives]);

  const selectedDrive = useMemo(() => {
    return drives.find((d) => d.id === selectedId) || drives[0] || null;
  }, [drives, selectedId]);

  const isCompanyVerified =
    selectedDrive?.company?.verificationStatus === "VERIFIED";

  const handleApprove = async (driveId) => {
    const drive = drives.find((d) => d.id === driveId);
    if (!isCompanyVerified) {
      alert("A drive belonging to an unverified company must not be approved. Please verify the company first.");
      return;
    }

    if (!window.confirm(`Approve and publish walk-in drive "${drive?.title}"?`)) {
      return;
    }

    try {
      setActionLoading(true);
      await adminService.approveDrive(driveId, "Approved by admin for public candidate discovery.");
      showToast(`Drive "${drive?.title}" approved and published!`);
      loadDrives();
    } catch (err) {
      showToast(err.message || "Failed to approve drive", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectDialog = (drive) => {
    setDriveToReject(drive);
    setRejectionReason(
      drive.adminFeedback ||
        "Venue capacity limits, reporting guidelines, or academic eligibility criteria require revision."
    );
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!driveToReject) return;
    try {
      setActionLoading(true);
      await adminService.rejectDrive(driveToReject.id, rejectionReason);
      showToast(`Drive "${driveToReject.title}" rejected.`, "warning");
      setRejectModalOpen(false);
      loadDrives();
    } catch (err) {
      showToast(err.message || "Failed to reject drive", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const pendingCount = drives.filter((d) => d.approvalStatus === "PENDING").length;
  const approvedCount = drives.filter((d) => d.approvalStatus === "APPROVED").length;
  const onCampusCount = drives.filter((d) => d.campusType === "ON_CAMPUS").length;
  const offCampusCount = drives.filter((d) => d.campusType === "OFF_CAMPUS").length;

  return (
    <div className="space-y-6">
      {/* Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Total Drives</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{drives.length}</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs">
          <p className="text-xs font-medium text-amber-700">Pending Review</p>
          <p className="mt-2 text-2xl font-bold text-amber-700">{pendingCount}</p>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 shadow-xs">
          <p className="text-xs font-medium text-blue-700">On-Campus Drives</p>
          <p className="mt-2 text-2xl font-bold text-blue-700">{onCampusCount}</p>
        </div>
        <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-4 shadow-xs">
          <p className="text-xs font-medium text-purple-700">Off-Campus Drives</p>
          <p className="mt-2 text-2xl font-bold text-purple-700">{offCampusCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.3fr,.9fr] gap-6">
        {/* Drive Queue List */}
        <Card title="Walk-In Drive Approval Queue" subtitle="Admin compliance and capacity audit" padding="p-0">
          <div className="border-b border-slate-200 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-semibold text-slate-500 mr-1">Status:</span>
                {STATUS_OPTIONS.map((st) => (
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

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-semibold text-slate-500 mr-1">Type:</span>
                {CAMPUS_OPTIONS.map((ct) => (
                  <button
                    key={ct}
                    type="button"
                    onClick={() => setCampusFilter(ct)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                      campusFilter === ct
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {ct === "ON_CAMPUS" ? "On-Campus" : ct === "OFF_CAMPUS" ? "Off-Campus" : "All Types"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            {loading ? (
              <div className="py-12 text-center text-sm text-slate-500">
                <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mb-2"></div>
                Loading walk-in drives...
              </div>
            ) : drives.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No drives found matching the selected filters.
              </div>
            ) : (
              drives.map((drive) => {
                const isSelected = selectedDrive?.id === drive.id;
                const isOnCampus = drive.campusType === "ON_CAMPUS";
                return (
                  <div
                    key={drive.id}
                    onClick={() => setSelectedId(drive.id)}
                    className={`p-4 transition-colors cursor-pointer ${
                      isSelected ? "bg-blue-50/60" : "bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">{drive.title}</p>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                              isOnCampus
                                ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                                : "bg-purple-100 text-purple-800 border border-purple-200"
                            }`}
                          >
                            {isOnCampus ? "ON-CAMPUS" : "OFF-CAMPUS"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{drive.company?.companyName || "Company"}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                          <span>{drive.interviewDate}</span>
                          <span className="text-slate-300">•</span>
                          <span>{drive.city || "Pune"}</span>
                          <span className="text-slate-300">•</span>
                          <span>Cap: {drive.capacity || 200}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-emerald-700 font-semibold">{drive.registeredCount || 0} registered</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <Badge
                          variant={
                            drive.approvalStatus === "APPROVED"
                              ? "success"
                              : drive.approvalStatus === "REJECTED"
                              ? "danger"
                              : "warning"
                          }
                          size="sm"
                        >
                          {drive.approvalStatus}
                        </Badge>
                        <Button
                          variant={isSelected ? "primary" : "outline"}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedId(drive.id);
                          }}
                        >
                          Review
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Selected Drive Dossier */}
        {selectedDrive ? (
          <Card title="Drive Compliance Review" subtitle={selectedDrive.title} padding="p-5">
            <div className="space-y-4 text-sm text-slate-700">
              {/* Host Company Verification Check */}
              <div
                className={`rounded-xl border p-3.5 ${
                  isCompanyVerified
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : "border-rose-200 bg-rose-50 text-rose-900"
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-xs">
                  {isCompanyVerified ? (
                    <CheckCircleIcon className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircleIcon className="h-4 w-4 text-rose-600 shrink-0" />
                  )}
                  <span>
                    Host Company: {selectedDrive.company?.companyName} ({selectedDrive.company?.verificationStatus || "UNVERIFIED"})
                  </span>
                </div>
                <p className="mt-1 text-xs opacity-90">
                  {isCompanyVerified
                    ? "Host employer company is verified. Drive is legally permitted for publishing."
                    : "Company is pending or unverified. A drive belonging to an unverified company must not be approved."}
                </p>
              </div>

              {/* Campus Classification Details */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Campus Classification</span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                      selectedDrive.campusType === "ON_CAMPUS"
                        ? "bg-indigo-600 text-white"
                        : "bg-purple-600 text-white"
                    }`}
                  >
                    {selectedDrive.campusType === "ON_CAMPUS" ? "On-Campus Walk-In" : "Off-Campus Walk-In"}
                  </span>
                </div>

                {selectedDrive.campusType === "ON_CAMPUS" && (
                  <div className="pt-1.5 border-t border-slate-200 text-xs">
                    <p className="font-semibold text-slate-800 mb-1">Eligible Pune Colleges:</p>
                    {selectedDrive.eligibleColleges && selectedDrive.eligibleColleges.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedDrive.eligibleColleges.map((col, i) => (
                          <span key={i} className="rounded bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-indigo-900 font-medium text-[11px]">
                            {col}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-rose-600">No eligible colleges specified!</p>
                    )}
                  </div>
                )}
              </div>

              {/* Eligibility Criteria */}
              <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1.5 text-xs">
                <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Academic Eligibility Cutoffs</p>
                <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
                  <div>
                    <span className="text-slate-400">Min CGPA:</span>{" "}
                    <strong className="text-slate-800">{selectedDrive.minCgpa ? selectedDrive.minCgpa.toFixed(2) : "None"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Max Backlogs:</span>{" "}
                    <strong className="text-slate-800">{selectedDrive.maxBacklogs ?? "None"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Batches:</span>{" "}
                    <strong className="text-slate-800">
                      {selectedDrive.eligibleGraduationYears?.join(", ") || "All Batches"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Capacity:</span>{" "}
                    <strong className="text-slate-800">{selectedDrive.capacity || 200} Candidates</strong>
                  </div>
                </div>
              </div>

              {/* Event Schedule & Venue */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs space-y-1.5">
                <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Drive Logistics</p>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>Date: <strong className="text-slate-800">{selectedDrive.interviewDate}</strong></div>
                  <div>Reporting: <strong className="text-slate-800">{selectedDrive.reportingTime || "09:00 AM"}</strong></div>
                  <div>Venue: <strong className="text-slate-800">{selectedDrive.venueName || "Pune Office"}</strong></div>
                  <div>Address: <strong className="text-slate-800">{selectedDrive.venueAddress || selectedDrive.city || "Pune"}</strong></div>
                </div>
              </div>

              {/* Rejection / Feedback */}
              {selectedDrive.adminFeedback && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                  <p className="font-bold">Prior Review Comments:</p>
                  <p className="mt-1">{selectedDrive.adminFeedback}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
                {selectedDrive.approvalStatus !== "APPROVED" && (
                  <Button
                    variant="success"
                    size="md"
                    onClick={() => handleApprove(selectedDrive.id)}
                    disabled={actionLoading || !isCompanyVerified}
                    icon={CheckCircleIcon}
                    title={!isCompanyVerified ? "Company must be verified before approving drive." : ""}
                  >
                    Approve & Publish Drive
                  </Button>
                )}

                {selectedDrive.approvalStatus === "PENDING" && (
                  <Button
                    variant="danger"
                    size="md"
                    onClick={() => openRejectDialog(selectedDrive)}
                    disabled={actionLoading}
                    icon={XCircleIcon}
                  >
                    Reject Drive
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ) : (
          <div className="flex items-center justify-center p-12 text-sm text-slate-400 border border-dashed rounded-xl bg-slate-50">
            Select a walk-in drive to inspect details
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {driveToReject && (
        <Modal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title={`Reject Walk-In Drive: ${driveToReject.title}`}
          subtitle="Specify why this drive does not meet campus compliance or venue standards"
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
              Rejection Reason & Feedback <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Venue capacity is insufficient, reporting instructions are missing, or eligible college criteria is incorrectly set."
              className="w-full rounded-lg border border-slate-200 p-3 text-xs sm:text-sm text-slate-800 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            />
            <p className="text-[11px] text-slate-500">
              The employer recruiter will receive this feedback and can edit and resubmit their drive draft.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
