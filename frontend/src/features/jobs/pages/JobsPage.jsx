import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { jobService } from "../../../services/jobService";
import { useToast } from "../../../context/ToastContext";
import { JobStatusBadge } from "../components/JobStatusBadge";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { SearchBar } from "../../../components/common/SearchBar";
import { EmptyState } from "../../../components/common/EmptyState";
import {
  BriefcaseIcon,
  PlusIcon,
  EyeIcon,
  EditIcon,
  ArchiveIcon,
  CalendarIcon,
  MapPinIcon,
} from "../../../components/common/Icons";

export function JobsPage() {
  const { showToast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: "",
    status: "All",
    department: "All",
    employmentType: "All",
    sortBy: "newest",
  });

  const loadJobs = useCallback(async () => {
    try {
      setLoading(true);
      const [jobsData, deptsData] = await Promise.all([
        jobService.getJobs(filters),
        jobService.getDepartments(),
      ]);
      setJobs(jobsData);
      setDepartments(deptsData);
    } catch (err) {
      showToast("Error loading job vacancies.", "error");
    } finally {
      setLoading(false);
    }
  }, [filters, showToast]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleArchive = async (job) => {
    if (window.confirm(`Are you sure you want to archive "${job.title}"?`)) {
      try {
        await jobService.archiveJob(job.id);
        showToast(`Job "${job.title}" marked as archived.`);
        loadJobs();
      } catch (err) {
        showToast("Failed to archive job.", "error");
      }
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      status: "All",
      department: "All",
      employmentType: "All",
      sortBy: "newest",
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Job Openings & Vacancy Management
          </h2>
          <p className="text-xs text-slate-500">
            Define roles, minimum qualifications, and eligible criteria for Pune walk-in interviews
          </p>
        </div>

        <Link to="/employer/jobs/new">
          <Button variant="primary" icon={PlusIcon}>
            Post New Job
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <Card padding="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2">
            <SearchBar
              value={filters.search}
              onChange={(val) => setFilters((prev) => ({ ...prev, search: val }))}
              placeholder="Search by title, skill, or location..."
            />
          </div>

          <div>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          <div>
            <select
              value={filters.department}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, department: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="All">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
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
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="vacancies-desc">Most Vacancies</option>
              <option value="title-asc">Title (A-Z)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Jobs Table */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
        </div>
      ) : jobs.length > 0 ? (
        <Card padding="p-0" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-2xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Job Title & POD</th>
                  <th className="px-6 py-3.5 font-semibold">Location</th>
                  <th className="px-6 py-3.5 font-semibold">Vacancies</th>
                  <th className="px-6 py-3.5 font-semibold">Experience</th>
                  <th className="px-6 py-3.5 font-semibold">Deadline</th>
                  <th className="px-6 py-3.5 font-semibold">Status</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        to={`/employer/jobs/${job.id}`}
                        className="font-bold text-slate-900 hover:text-blue-600"
                      >
                        {job.title}
                      </Link>
                      <div className="text-xs text-slate-500 font-medium mt-0.5">
                        {job.department} • {job.employmentType}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {job.requiredSkills?.slice(0, 3).map((s, i) => (
                          <span
                            key={i}
                            className="inline-block rounded-sm bg-slate-100 px-1.5 py-0.5 text-2xs font-medium text-slate-600"
                          >
                            {s}
                          </span>
                        ))}
                        {job.requiredSkills?.length > 3 && (
                          <span className="text-2xs text-slate-400">
                            +{job.requiredSkills.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs">
                      <div className="flex items-center gap-1 text-slate-800 font-medium">
                        <MapPinIcon className="h-3.5 w-3.5 text-slate-400" />
                        {job.location}
                      </div>
                      <div className="text-2xs text-slate-500 mt-0.5">
                        {job.workMode}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">
                        {job.vacancies} Open
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs font-medium text-slate-700">
                      {job.minExperience === 0 && job.maxExperience <= 1
                        ? "Freshers (0-1 yr)"
                        : `${job.minExperience} - ${job.maxExperience} yrs`}
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-600">
                      {job.deadline}
                    </td>

                    <td className="px-6 py-4">
                      <JobStatusBadge status={job.status} />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link to={`/employer/jobs/${job.id}`} title="View Details">
                          <button className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        </Link>
                        <Link to={`/employer/jobs/${job.id}/edit`} title="Edit Job">
                          <button className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                            <EditIcon className="h-4 w-4" />
                          </button>
                        </Link>
                        {job.status === "Active" && (
                          <Link
                            to={`/employer/drives/new?jobId=${job.id}`}
                            title="Schedule Walk-In Drive for this Role"
                          >
                            <button className="rounded p-1.5 text-blue-600 hover:bg-blue-50">
                              <CalendarIcon className="h-4 w-4" />
                            </button>
                          </Link>
                        )}
                        {job.status !== "Archived" && (
                          <button
                            onClick={() => handleArchive(job)}
                            title="Archive Job"
                            className="rounded p-1.5 text-rose-500 hover:bg-rose-50"
                          >
                            <ArchiveIcon className="h-4 w-4" />
                          </button>
                        )}
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
          icon={BriefcaseIcon}
          title="No jobs found matching criteria"
          description="Try modifying search keywords or clearing your active filters."
          actionLabel="Clear All Filters"
          onAction={handleResetFilters}
        />
      )}
    </div>
  );
}
