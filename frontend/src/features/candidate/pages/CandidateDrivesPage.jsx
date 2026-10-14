import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";
import { candidateService } from "../../../services/candidateService";
import { useToast } from "../../../context/ToastContext";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  BriefcaseIcon,
  SearchIcon,
  UsersIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  AwardIcon,
} from "../../../components/common/Icons";
import { RegistrationModal } from "../components/RegistrationModal";

const PUNE_LOCATIONS = [
  "All",
  "Magarpatta",
  "Hinjawadi",
  "Kharadi",
  "Baner",
  "Viman Nagar",
  "Shivajinagar",
];

export function CandidateDrivesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [drives, setDrives] = useState([]);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tabs: ALL | ON_CAMPUS | OFF_CAMPUS
  const campusParam = searchParams.get("campus");
  const [campusTab, setCampusTab] = useState(() => {
    if (campusParam === "ON_CAMPUS" || campusParam === "OFF_CAMPUS") return campusParam;
    return "ALL";
  });

  useEffect(() => {
    if (campusParam === "ON_CAMPUS" || campusParam === "OFF_CAMPUS") {
      setCampusTab(campusParam);
    } else if (!campusParam || campusParam === "ALL") {
      setCampusTab("ALL");
    }
  }, [campusParam]);

  const handleTabChange = (newTab) => {
    setCampusTab(newTab);
    const newParams = new URLSearchParams(searchParams);
    if (newTab === "ALL") {
      newParams.delete("campus");
    } else {
      newParams.set("campus", newTab);
    }
    setSearchParams(newParams);
  };

  // Filters state
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [sortBy, setSortBy] = useState("date-asc");

  // Registration modal
  const [selectedDriveForReg, setSelectedDriveForReg] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [driveList, profile] = await Promise.all([
        candidateService.getDrives(user, {
          search,
          location,
          dateFilter,
          sortBy,
        }),
        candidateService.getProfile(user).catch(() => null),
      ]);
      setDrives(driveList);
      if (profile) setCandidateProfile(profile);
    } catch (err) {
      console.error(err);
      showToast("Error loading walk-in drives.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, search, location, dateFilter, sortBy]);

  const candidateCollege =
    candidateProfile?.collegeName ||
    candidateProfile?.education?.[0]?.institution ||
    user?.collegeName ||
    "COEP Technological University, Pune";

  // Filter drives by campus tab
  const filteredDrives = useMemo(() => {
    return drives.filter((d) => {
      if (campusTab === "ON_CAMPUS") {
        return d.campusType === "ON_CAMPUS" || d.campusType === "CAMPUS" || (d.eligibleColleges && d.eligibleColleges.length > 0);
      }
      if (campusTab === "OFF_CAMPUS") {
        return d.campusType === "OFF_CAMPUS" || (!d.eligibleColleges || d.eligibleColleges.length === 0);
      }
      return true;
    });
  }, [drives, campusTab]);

  const handleApplySuccess = (app) => {
    showToast(`Registered successfully! Walk-in Pass Token: ${app.tokenNumber}`);
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                Pune IT Corridors
              </span>
              <span className="text-2xs text-slate-400 font-medium">
                Verified On-Site Recruitment
              </span>
            </div>
            <h2 className="mt-1 text-2xl font-black text-slate-900 tracking-tight">
              Browse Walk-In Drives
            </h2>
            <p className="mt-1 text-xs text-slate-500 max-w-2xl">
              Explore open, verified walk-in opportunities hosted by companies in Pune. Reserve your slot, secure an entry pass, and report directly to the venue.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <span>Your College:</span>
              <strong className="text-blue-700 truncate max-w-[200px]" title={candidateCollege}>
                {candidateCollege}
              </strong>
            </div>
            <span className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
              Available: <strong>{filteredDrives.length}</strong>
            </span>
          </div>
        </div>

        {/* Campus Type Tabs */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => handleTabChange("ALL")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              campusTab === "ALL"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            All Walk-In Drives ({drives.length})
          </button>

          <button
            onClick={() => handleTabChange("ON_CAMPUS")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              campusTab === "ON_CAMPUS"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <span>🎓 On-Campus Drives</span>
            <span className="text-2xs bg-white/20 px-1.5 py-0.2 rounded font-mono">
              College Exclusive
            </span>
          </button>

          <button
            onClick={() => handleTabChange("OFF_CAMPUS")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              campusTab === "OFF_CAMPUS"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <span>🏢 Off-Campus Drives</span>
            <span className="text-2xs bg-white/20 px-1.5 py-0.2 rounded font-mono">
              City Open
            </span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-4 pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <SearchIcon className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, role, skills, or venue..."
              className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Location Filter */}
          <div>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              {PUNE_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc === "All" ? "All Pune Locations" : `Cluster: ${loc}`}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="All">All Schedule Dates</option>
              <option value="Upcoming">Upcoming Drives Only</option>
              <option value="Past">Past Concluded Drives</option>
            </select>
          </div>

          {/* Sorting */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="date-asc">Sort: Nearest Date First</option>
              <option value="date-desc">Sort: Latest Date First</option>
              <option value="deadline-asc">Sort: Registration Deadline</option>
              <option value="vacancies-desc">Sort: Most Vacancies</option>
            </select>
          </div>
        </div>
      </div>

      {/* Drives Results List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-slate-200" />
          ))}
        </div>
      ) : filteredDrives.length > 0 ? (
        <div className="space-y-4">
          {filteredDrives.map((drive) => {
            const isOnCampus =
              drive.campusType === "ON_CAMPUS" ||
              drive.campusType === "CAMPUS" ||
              (drive.eligibleColleges && drive.eligibleColleges.length > 0);

            // Calculate eligibility for on-campus drives
            let isEligible = true;
            let eligibilityReason = "Eligible to Register";

            if (isOnCampus && drive.eligibleColleges && drive.eligibleColleges.length > 0) {
              const matched = drive.eligibleColleges.some((c) => {
                const name = typeof c === "string" ? c : c.collegeName || "";
                return (
                  candidateCollege.toLowerCase().includes(name.toLowerCase()) ||
                  name.toLowerCase().includes(candidateCollege.toLowerCase())
                );
              });
              if (!matched) {
                isEligible = false;
                eligibilityReason = `Restricted to designated colleges.`;
              }
            }

            return (
              <div
                key={drive.id}
                className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs hover:border-blue-400 hover:shadow-sm transition-all space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {isOnCampus ? (
                        <span className="text-2xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-md">
                          🎓 On-Campus Drive
                        </span>
                      ) : (
                        <span className="text-2xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md">
                          🏢 Off-Campus Drive
                        </span>
                      )}

                      <span className="text-xs font-bold text-slate-800">
                        {drive.companyName || "TechSprint Innovations Pvt. Ltd."}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-2xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded-sm">
                        {drive.jobTitle || "Software Engineer"}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-2xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-sm">
                        {drive.vacancies || 10} Openings
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors">
                      <Link to={`/candidate/drives/${drive.id}`}>{drive.title}</Link>
                    </h3>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {drive.isApplied ? (
                      <Badge variant="primary" size="md">
                        Registered (Token: {drive.tokenNumber})
                      </Badge>
                    ) : (
                      <Badge variant="success" size="md">
                        Registration Open
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Description Snippet */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {drive.description}
                </p>

                {/* Participating Colleges for On-Campus */}
                {isOnCampus && (
                  <div className="rounded-lg bg-blue-50/60 border border-blue-200/80 p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-2xs font-bold text-blue-900 uppercase tracking-wider">
                        Participating Colleges & Institutes:
                      </span>
                      {isEligible ? (
                        <span className="inline-flex items-center gap-1 text-2xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircleIcon className="h-3 w-3 text-emerald-600" />
                          Eligible: Your college is participating
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-2xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          <AlertCircleIcon className="h-3 w-3 text-amber-600" />
                          {eligibilityReason}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {drive.eligibleColleges && drive.eligibleColleges.length > 0 ? (
                        drive.eligibleColleges.map((c, idx) => {
                          const collegeTitle = typeof c === "string" ? c : c.collegeName;
                          const isMine =
                            candidateCollege.toLowerCase().includes(collegeTitle.toLowerCase()) ||
                            collegeTitle.toLowerCase().includes(candidateCollege.toLowerCase());
                          return (
                            <span
                              key={idx}
                              className={`rounded-md px-2 py-0.5 text-2xs font-medium border ${
                                isMine
                                  ? "bg-emerald-100 text-emerald-900 border-emerald-300 font-bold"
                                  : "bg-white text-slate-700 border-slate-200"
                              }`}
                            >
                              {collegeTitle} {isMine && "(Your College)"}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-2xs text-slate-500">
                          All affiliated Pune universities & autonomous colleges
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Meta details footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                      Date: <strong className="text-slate-800">{drive.interviewDate || drive.driveDate || "Upcoming"}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <ClockIcon className="h-3.5 w-3.5 text-slate-400" />
                      Slot: {drive.startTime || "09:30"} - {drive.endTime || "17:30"}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPinIcon className="h-3.5 w-3.5 text-slate-400" />
                      Venue: {drive.venueName || "Pune Tech Park"}
                    </span>
                    <span className="flex items-center gap-1">
                      <UsersIcon className="h-3.5 w-3.5 text-slate-400" />
                      Capacity: {drive.registeredCount || 0} / {drive.maxRegistrations || 100}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link to={`/candidate/drives/${drive.id}`}>
                      <Button variant="outline" size="sm">
                        View Full Details
                      </Button>
                    </Link>

                    {drive.isApplied ? (
                      <Button variant="outline" size="sm" disabled>
                        Already Registered ✓
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={!isEligible}
                        onClick={() => setSelectedDriveForReg(drive)}
                      >
                        {isEligible ? "Register for Walk-In" : "Not Eligible"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <CalendarIcon className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-3 text-sm font-bold text-slate-800">
            No Opportunities Match Your Current Filter
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            {campusTab === "ON_CAMPUS"
              ? "No On-Campus recruitment drives are currently scheduled for your college. Check back soon or browse Off-Campus drives."
              : "Try adjusting your search criteria or clear filters to view all Pune walk-in opportunities."}
          </p>
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCampusTab("ALL");
                setSearch("");
                setLocation("All");
                setDateFilter("All");
              }}
            >
              Reset All Filters
            </Button>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {selectedDriveForReg && (
        <RegistrationModal
          drive={selectedDriveForReg}
          isOpen={Boolean(selectedDriveForReg)}
          onClose={() => setSelectedDriveForReg(null)}
          onSuccess={handleApplySuccess}
        />
      )}
    </div>
  );
}
