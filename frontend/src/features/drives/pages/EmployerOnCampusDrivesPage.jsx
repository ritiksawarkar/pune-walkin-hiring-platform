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
  EyeIcon,
  UsersIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  XIcon,
} from "../../../components/common/Icons";

const PUNE_COLLEGES = [
  "COEP Technological University, Pune",
  "Pune Institute of Computer Technology (PICT)",
  "MIT World Peace University (MIT-WPU)",
  "Vishwakarma Institute of Technology (VIT Pune)",
  "MKSSS Cummins College of Engineering for Women, Pune",
  "Sinhgad College of Engineering (SCOE), Vadgaon",
  "D.Y. Patil College of Engineering, Akurdi",
  "Pimpri Chinchwad College of Engineering (PCCOE)",
  "Army Institute of Technology (AIT), Pune",
  "Bharati Vidyapeeth Deemed University College of Engineering",
];

export function EmployerOnCampusDrivesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [filterStatus, setFilterStatus] = useState("ALL");
  const [search, setSearch] = useState("");

  // Create Drive Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    driveDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    startTime: "09:30",
    endTime: "17:30",
    registrationDeadline: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
    venueName: "Campus Auditorium / Placement Cell",
    venueAddress: "Institutional Placement Block, Pune",
    maxRegistrations: 150,
    selectedColleges: ["COEP Technological University, Pune"],
    eligibleDegree: "B.Tech",
    eligibleBranch: "Computer Engineering / IT",
    eligibleGradYearMin: 2025,
    eligibleGradYearMax: 2025,
    minCgpa: 7.5,
    maxBacklogs: 0,
    submitForApproval: false,
  });

  const loadDrives = useCallback(async () => {
    try {
      setLoading(true);
      const companyId = user?.companyId || "comp-pune-01";
      const res = await apiClient.get(`/api/v1/employer/companies/${companyId}/drives`, {
        campusType: "ON_CAMPUS",
      });
      const list = res?.data?.content || res?.data || [];
      setDrives(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn("Could not fetch real drives, loading fallback", err);
      // Fallback sample data if backend endpoint is unavailable
      setDrives([
        {
          id: "drive-on-campus-01",
          title: "COEP & PICT Joint Campus Recruitment Drive 2026",
          campusType: "ON_CAMPUS",
          driveDate: "2026-03-25",
          startTime: "09:30",
          endTime: "18:00",
          venueName: "COEP Main Auditorium, Shivajinagar",
          approvalStatus: "APPROVED",
          driveStatus: "PUBLISHED",
          registeredCount: 42,
          maxRegistrations: 100,
          eligibleColleges: [
            { collegeName: "COEP Technological University, Pune" },
            { collegeName: "Pune Institute of Computer Technology (PICT)" },
          ],
          eligibleDegree: "B.Tech / B.E.",
          eligibleBranch: "Computer / IT / E&TC",
          minCgpa: 7.5,
          maxBacklogs: 0,
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
    if (formData.selectedColleges.length === 0) {
      showToast("Please select at least one participating Pune college.", "error");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || `${formData.title} for participating Pune institutions`,
        driveDate: formData.driveDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        registrationDeadline: formData.registrationDeadline,
        venueName: formData.venueName,
        venueAddress: formData.venueAddress,
        maxRegistrations: parseInt(formData.maxRegistrations) || 100,
        campusType: "ON_CAMPUS",
        eligibleColleges: formData.selectedColleges,
        eligibleDegree: formData.eligibleDegree,
        eligibleBranch: formData.eligibleBranch,
        eligibleGraduationYearMin: parseInt(formData.eligibleGradYearMin) || 2025,
        eligibleGraduationYearMax: parseInt(formData.eligibleGradYearMax) || 2025,
        minCgpa: parseFloat(formData.minCgpa) || 7.0,
        maxBacklogs: parseInt(formData.maxBacklogs) || 0,
      };

      const res = await apiClient.post("/api/v1/drives", payload);
      const created = res.data;

      // Submit for admin review if requested
      if (formData.submitForApproval && created?.id) {
        await apiClient.post(`/api/v1/employer/drives/${created.id}/submit`);
        showToast("On-Campus drive created & submitted for Admin Approval!");
      } else {
        showToast("On-Campus drive draft saved successfully!");
      }

      setShowCreateModal(false);
      loadDrives();
    } catch (err) {
      showToast(err.message || "Failed to create on-campus drive.", "error");
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

  const toggleCollege = (college) => {
    setFormData((prev) => {
      const exists = prev.selectedColleges.includes(college);
      return {
        ...prev,
        selectedColleges: exists
          ? prev.selectedColleges.filter((c) => c !== college)
          : [...prev.selectedColleges, college],
      };
    });
  };

  const filteredDrives = drives.filter((d) => {
    if (filterStatus !== "ALL" && d.approvalStatus !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const titleMatch = d.title?.toLowerCase().includes(q);
      const venueMatch = d.venueName?.toLowerCase().includes(q);
      const colMatch = d.eligibleColleges?.some((c) =>
        (typeof c === "string" ? c : c.collegeName || "").toLowerCase().includes(q)
      );
      return titleMatch || venueMatch || colMatch;
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
              On-Campus Walk-In Drives
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-2xs font-bold text-blue-800">
              Institutional Hiring
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Restrict opportunities to verified Pune colleges with configured branch, graduation year, and CGPA rules.
          </p>
        </div>

        <Button
          variant="primary"
          icon={PlusIcon}
          onClick={() => setShowCreateModal(true)}
        >
          Create On-Campus Drive
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card padding="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by drive title, college name, or venue..."
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
          title="No On-Campus Drives Found"
          description="Create a campus drive and select eligible Pune colleges to recruit directly from institutes."
          actionText="Create Campus Drive"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredDrives.map((drive) => (
            <Card key={drive.id} padding="p-5" className="hover:border-blue-300 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-2xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md">
                      On-Campus
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

                  {/* Eligible Colleges Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-2xs font-semibold text-slate-500">
                      Eligible Institutes:
                    </span>
                    {drive.eligibleColleges && drive.eligibleColleges.length > 0 ? (
                      drive.eligibleColleges.map((c, idx) => (
                        <span
                          key={idx}
                          className="inline-block rounded-md bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 text-2xs font-medium text-indigo-800"
                        >
                          {typeof c === "string" ? c : c.collegeName}
                        </span>
                      ))
                    ) : (
                      <span className="text-2xs text-slate-400 italic">
                        All affiliated Pune colleges
                      </span>
                    )}
                  </div>

                  {/* Academic Cutoff Info */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                    <span>
                      Degree: <strong className="text-slate-700">{drive.eligibleDegree || "Any"}</strong>
                    </span>
                    <span>
                      Branch: <strong className="text-slate-700">{drive.eligibleBranch || "Open"}</strong>
                    </span>
                    <span>
                      Min CGPA: <strong className="text-slate-700">{drive.minCgpa ?? "N/A"}</strong>
                    </span>
                    <span>
                      Max Backlogs: <strong className="text-slate-700">{drive.maxBacklogs ?? 0}</strong>
                    </span>
                  </div>

                  {/* Date & Venue */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                      {drive.driveDate || "TBA"} ({drive.startTime || "09:30"} - {drive.endTime || "17:30"})
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPinIcon className="h-3.5 w-3.5 text-slate-400" />
                      {drive.venueName || "Pune Campus"}
                    </span>
                    <span className="flex items-center gap-1">
                      <UsersIcon className="h-3.5 w-3.5 text-slate-400" />
                      Turnout: <strong className="text-slate-900">{drive.registeredCount || 0}</strong> / {drive.maxRegistrations || 100} registered
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

      {/* Create On-Campus Drive Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Create On-Campus Walk-In Drive
                </h3>
                <p className="text-2xs text-slate-500">
                  Target verified candidates from participating Pune universities and colleges.
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
                  Drive Event Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Pune Tech Campus Pool Drive 2026"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* College Selection Multi-Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Eligible Pune Colleges & Institutes <span className="text-rose-500">*</span>
                </label>
                <p className="text-2xs text-slate-500 mb-2">
                  Only candidates registered with these selected colleges can discover and book slots for this drive.
                </p>
                <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-200 p-2 space-y-1.5 bg-slate-50">
                  {PUNE_COLLEGES.map((college, idx) => {
                    const isSelected = formData.selectedColleges.includes(college);
                    return (
                      <label
                        key={idx}
                        className="flex items-center gap-2 p-1.5 rounded-md hover:bg-white cursor-pointer text-xs text-slate-800"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleCollege(college)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                        />
                        <span className="truncate">{college}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Eligibility Criteria */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-2xs font-semibold text-slate-700 mb-1">
                    Eligible Degree
                  </label>
                  <select
                    value={formData.eligibleDegree}
                    onChange={(e) => setFormData({ ...formData, eligibleDegree: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 bg-white"
                  >
                    <option value="B.Tech">B.Tech / B.E.</option>
                    <option value="M.Tech">M.Tech</option>
                    <option value="MCA">MCA</option>
                    <option value="Any">All Degrees</option>
                  </select>
                </div>

                <div>
                  <label className="block text-2xs font-semibold text-slate-700 mb-1">
                    Graduation Year
                  </label>
                  <select
                    value={formData.eligibleGradYearMin}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        eligibleGradYearMin: e.target.value,
                        eligibleGradYearMax: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 bg-white"
                  >
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2024">2024</option>
                  </select>
                </div>

                <div>
                  <label className="block text-2xs font-semibold text-slate-700 mb-1">
                    Min CGPA Cutoff
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

              {/* Date, Time & Venue */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-2xs font-semibold text-slate-700 mb-1">
                    Interview Date <span className="text-rose-500">*</span>
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
                    Slot Time Range
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-1 py-1 text-2xs text-slate-800"
                    />
                    <span className="text-slate-400 text-xs">-</span>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-1 py-1 text-2xs text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-2xs font-semibold text-slate-700 mb-1">
                    Maximum Turnout Quota
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

              <div>
                <label className="block text-2xs font-semibold text-slate-700 mb-1">
                  On-Campus Venue / Auditorium
                </label>
                <input
                  type="text"
                  required
                  value={formData.venueName}
                  onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                  placeholder="e.g. COEP Main Auditorium, Shivajinagar, Pune"
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-800"
                />
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
                  Save On-Campus Drive
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
