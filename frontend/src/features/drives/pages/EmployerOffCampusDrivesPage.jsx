import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";
import { useToast } from "../../../context/ToastContext";
import { apiClient } from "../../../services/apiClient";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { SearchBar } from "../../../components/common/SearchBar";
import { EmptyState } from "../../../components/common/EmptyState";
import {
  CalendarIcon,
  PlusIcon,
  UsersIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  XIcon,
} from "../../../components/common/Icons";

export function EmployerOffCampusDrivesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [filterStatus, setFilterStatus] = useState("ALL");
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    driveDate: new Date(Date.now() + 8 * 86400000).toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "18:00",
    registrationDeadline: new Date(Date.now() + 6 * 86400000).toISOString().split("T")[0],
    venueName: "TechSprint Development Centre, Magarpatta",
    venueAddress: "Tower 7, Cybercity Magarpatta, Hadapsar, Pune - 411028",
    maxRegistrations: 200,
    eligibleDegree: "Any Graduate",
    eligibleBranch: "All Disciplines",
    eligibleGradYearMin: 2023,
    eligibleGradYearMax: 2026,
    minCgpa: 6.0,
    maxBacklogs: 1,
    submitForApproval: false,
  });

  const loadDrives = useCallback(async () => {
    try {
      setLoading(true);
      const companyId = user?.companyId || "comp-pune-01";
      const res = await apiClient.get(`/api/v1/employer/companies/${companyId}/drives`, {
        campusType: "OFF_CAMPUS",
      });
      const list = res?.data?.content || res?.data || [];
      setDrives(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn("Could not fetch real off-campus drives, loading fallback", err);
      setDrives([
        {
          id: "drive-off-campus-01",
          title: "Pune City-Wide Full-Stack Developer Mega Walk-In",
          campusType: "OFF_CAMPUS",
          driveDate: "2026-03-30",
          startTime: "09:00",
          endTime: "17:30",
          venueName: "Magarpatta Cybercity Auditorium",
          approvalStatus: "APPROVED",
          driveStatus: "PUBLISHED",
          registeredCount: 88,
          maxRegistrations: 250,
          eligibleDegree: "B.Tech / B.E. / MCA",
          eligibleBranch: "Any Specialization",
          minCgpa: 6.5,
          maxBacklogs: 1,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [user?.companyId]);

  useEffect(() => {
    loadDrives();
  }, [loadDrives]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast("Please enter a drive title.", "error");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || `${formData.title} open walk-in hiring drive in Pune`,
        driveDate: formData.driveDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        registrationDeadline: formData.registrationDeadline,
        venueName: formData.venueName,
        venueAddress: formData.venueAddress,
        maxRegistrations: parseInt(formData.maxRegistrations) || 150,
        campusType: "OFF_CAMPUS",
        eligibleColleges: [], // Off-campus is open to all colleges
        eligibleDegree: formData.eligibleDegree,
        eligibleBranch: formData.eligibleBranch,
        eligibleGraduationYearMin: parseInt(formData.eligibleGradYearMin) || 2023,
        eligibleGraduationYearMax: parseInt(formData.eligibleGradYearMax) || 2026,
        minCgpa: parseFloat(formData.minCgpa) || 6.0,
        maxBacklogs: parseInt(formData.maxBacklogs) || 1,
      };

      const res = await apiClient.post("/api/v1/drives", payload);
      const created = res.data;

      if (formData.submitForApproval && created?.id) {
        await apiClient.post(`/api/v1/employer/drives/${created.id}/submit`);
        showToast("Off-Campus drive created & submitted for Admin Approval!");
      } else {
        showToast("Off-Campus drive draft saved successfully!");
      }

      setShowCreateModal(false);
      loadDrives();
    } catch (err) {
      showToast(err.message || "Failed to create off-campus drive.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitForApproval = async (driveId) => {
    try {
      await apiClient.post(`/api/v1/employer/drives/${driveId}/submit`);
      showToast("Drive submitted to Admin for verification!");
      loadDrives();
    } catch (err) {
      showToast(err.message || "Failed to submit drive for approval.", "error");
    }
  };

  const filteredDrives = drives.filter((d) => {
    if (filterStatus !== "ALL" && d.approvalStatus !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        d.title?.toLowerCase().includes(q) ||
        d.venueName?.toLowerCase().includes(q) ||
        d.venueAddress?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">
              Off-Campus Walk-In Drives
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-2xs font-bold text-emerald-800">
              Open Industry Hiring
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Host open walk-in interview events across Pune IT clusters (Hinjawadi, Magarpatta, Kharadi, Baner).
          </p>
        </div>

        <Button
          variant="primary"
          icon={PlusIcon}
          onClick={() => setShowCreateModal(true)}
        >
          Create Off-Campus Drive
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card padding="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by drive title, venue, or address..."
            />
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 bg-white shadow-2xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Verification Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING_APPROVAL">Pending Admin Approval</option>
              <option value="APPROVED">Approved & Published</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Drives List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
        </div>
      ) : filteredDrives.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title="No Off-Campus Drives Found"
          description="Create an open off-campus hiring drive to welcome qualified candidates from across Pune."
          actionText="Create Off-Campus Drive"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredDrives.map((drive) => (
            <Card key={drive.id} padding="p-5" className="hover:border-blue-300 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-2xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md">
                      Off-Campus
                    </span>
                    <span
                      className={`text-2xs font-bold px-2 py-0.5 rounded-md ${
                        drive.approvalStatus === "APPROVED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : drive.approvalStatus === "PENDING_APPROVAL"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : drive.approvalStatus === "REJECTED"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {drive.approvalStatus || "DRAFT"}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 truncate">
                    {drive.title}
                  </h3>

                  {/* Criteria Info */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                    <span>
                      Degree: <strong className="text-slate-700">{drive.eligibleDegree || "Open to all graduates"}</strong>
                    </span>
                    <span>
                      Min Cutoff: <strong className="text-slate-700">{drive.minCgpa ? `${drive.minCgpa} CGPA` : "No strict cutoff"}</strong>
                    </span>
                    <span>
                      Max Backlogs: <strong className="text-slate-700">{drive.maxBacklogs ?? "Allowed"}</strong>
                    </span>
                  </div>

                  {/* Date & Venue */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                      {drive.driveDate || "TBA"} ({drive.startTime || "09:00"} - {drive.endTime || "18:00"})
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPinIcon className="h-3.5 w-3.5 text-slate-400" />
                      {drive.venueName || "Tech Park Venue, Pune"}
                    </span>
                    <span className="flex items-center gap-1">
                      <UsersIcon className="h-3.5 w-3.5 text-slate-400" />
                      Candidates: <strong className="text-slate-900">{drive.registeredCount || 0}</strong> / {drive.maxRegistrations || 200} capacity
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {drive.approvalStatus === "DRAFT" && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleSubmitForApproval(drive.id)}
                    >
                      Submit for Admin Approval
                    </Button>
                  )}
                  {drive.approvalStatus === "REJECTED" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSubmitForApproval(drive.id)}
                    >
                      Resubmit for Review
                    </Button>
                  )}
                  <Link to={`/employer/drives/${drive.id}/candidates`}>
                    <Button variant="outline" size="sm" icon={UsersIcon}>
                      Candidates ({drive.registeredCount || 0})
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Off-Campus Drive Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Create Off-Campus Walk-In Drive
                </h3>
                <p className="text-2xs text-slate-500">
                  Open walk-in drive for all eligible Pune candidates.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Drive Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Pune Tech Park Software Engineer Walk-In"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Date, Time & Venue */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-2xs font-semibold text-slate-700 mb-1">
                    Event Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.driveDate}
                    onChange={(e) => setFormData({ ...formData, driveDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-semibold text-slate-700 mb-1">
                    Registration Deadline
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.registrationDeadline}
                    onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-semibold text-slate-700 mb-1">
                    Candidate Capacity Limit
                  </label>
                  <input
                    type="number"
                    min="10"
                    value={formData.maxRegistrations}
                    onChange={(e) => setFormData({ ...formData, maxRegistrations: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-2xs font-semibold text-slate-700 mb-1">
                    Venue Facility Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.venueName}
                    onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                    placeholder="e.g. Hinjawadi Phase 1 Campus Auditorium"
                    className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-semibold text-slate-700 mb-1">
                    Address in Pune
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.venueAddress}
                    onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
                    placeholder="e.g. Rajiv Gandhi Infotech Park, Hinjawadi, Pune"
                    className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Criteria */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-2xs font-semibold text-slate-700 mb-1">
                    Degree Requirement
                  </label>
                  <input
                    type="text"
                    value={formData.eligibleDegree}
                    onChange={(e) => setFormData({ ...formData, eligibleDegree: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-semibold text-slate-700 mb-1">
                    Min CGPA / Cutoff
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={formData.minCgpa}
                    onChange={(e) => setFormData({ ...formData, minCgpa: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-semibold text-slate-700 mb-1">
                    Max Backlogs
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxBacklogs}
                    onChange={(e) => setFormData({ ...formData, maxBacklogs: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={formData.submitForApproval}
                    onChange={(e) => setFormData({ ...formData, submitForApproval: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span>Submit directly for Admin (Sahil) approval upon saving</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={submitting}
                >
                  Save Off-Campus Drive
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
