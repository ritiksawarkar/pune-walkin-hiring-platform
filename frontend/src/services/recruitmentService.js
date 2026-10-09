/**
 * Recruitment & Candidate Management Service
 * Front-end mock service for candidate screening, shortlisting, and pipeline stage transitions.
 * 
 * Shared Roles:
 * - Candidate Registration is managed by Yadit
 * - Interview Scheduling & Queue is managed by Sahil
 * - Ritik manages: Screening, Shortlisting, Hold, Rejection, and Interview Handoff.
 */

import { storageService } from "./storageService";

export const PIPELINE_STAGES = [
  { id: "Registered", label: "Registered", color: "blue", description: "Applied via Pune Walk-In portal" },
  { id: "Under Review", label: "Under Review", color: "amber", description: "Resume & qualifications being screened" },
  { id: "Shortlisted", label: "Shortlisted", color: "emerald", description: "Approved for walk-in rounds" },
  { id: "Interview Scheduled", label: "Interview Scheduled", color: "indigo", description: "Handoff to Sahil's interview queue" },
  { id: "Selected", label: "Selected", color: "green", description: "Cleared rounds & offered role" },
  { id: "On Hold", label: "On Hold", color: "purple", description: "Awaiting transcripts / feedback" },
  { id: "Rejected", label: "Rejected", color: "rose", description: "Did not meet criteria or rounds" },
];

export const recruitmentService = {
  async getApplications(filters = {}) {
    await new Promise((r) => setTimeout(r, 100));
    let apps = storageService.getApplications();

    const {
      search = "",
      status = "All",
      driveId = "All",
      jobId = "All",
      sortBy = "date-desc",
    } = filters;

    if (search.trim()) {
      const q = search.toLowerCase();
      apps = apps.filter(
        (a) =>
          a.candidateName.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.qualification.toLowerCase().includes(q) ||
          (a.tokenNumber && a.tokenNumber.toLowerCase().includes(q)) ||
          (a.skills && a.skills.some((s) => s.toLowerCase().includes(q)))
      );
    }

    if (status && status !== "All") {
      apps = apps.filter(
        (a) => a.status.toLowerCase() === status.toLowerCase()
      );
    }

    if (driveId && driveId !== "All") {
      apps = apps.filter((a) => a.driveId === driveId);
    }

    if (jobId && jobId !== "All") {
      apps = apps.filter((a) => a.jobId === jobId);
    }

    // Sorting
    if (sortBy === "date-desc") {
      apps.sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate));
    } else if (sortBy === "date-asc") {
      apps.sort((a, b) => new Date(a.registrationDate) - new Date(b.registrationDate));
    } else if (sortBy === "name-asc") {
      apps.sort((a, b) => a.candidateName.localeCompare(b.candidateName));
    } else if (sortBy === "token-asc") {
      apps.sort((a, b) => (a.tokenNumber || "").localeCompare(b.tokenNumber || ""));
    }

    return apps;
  },

  async getDriveCandidates(driveId, filters = {}) {
    return this.getApplications({ ...filters, driveId });
  },

  async getApplicationById(id) {
    await new Promise((r) => setTimeout(r, 80));
    const apps = storageService.getApplications();
    const app = apps.find((a) => a.id === id);
    if (!app) {
      throw new Error(`Application with ID ${id} not found.`);
    }
    return app;
  },

  /**
   * Update candidate status with audit history
   */
  async updateApplicationStatus(applicationId, newStatus, reason = "", note = "") {
    await new Promise((r) => setTimeout(r, 120));
    const apps = storageService.getApplications();
    const index = apps.findIndex((a) => a.id === applicationId);
    if (index === -1) {
      throw new Error(`Application ${applicationId} not found.`);
    }

    const current = apps[index];
    const prevStatus = current.status;
    const now = new Date();
    const formattedDate = `${now.toISOString().split("T")[0]} ${now.getHours()}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    const historyEntry = {
      status: newStatus,
      date: formattedDate,
      updatedBy: "Ritik Sawarkar (Employer)",
      note: note || (reason ? `Reason: ${reason}` : `Status transitioned from ${prevStatus} to ${newStatus}`),
    };

    const updatedApp = {
      ...current,
      status: newStatus,
      statusHistory: [...(current.statusHistory || []), historyEntry],
      reviewerNotes: note ? `${current.reviewerNotes ? current.reviewerNotes + " | " : ""}${note}` : current.reviewerNotes,
      rejectionReason: newStatus === "Rejected" ? reason : current.rejectionReason,
    };

    apps[index] = updatedApp;
    storageService.setApplications(apps);

    storageService.addActivity({
      type: "status_change",
      title: `Candidate Status: ${newStatus}`,
      description: `${updatedApp.candidateName} moved to ${newStatus} (${updatedApp.jobTitle})`,
      entityId: updatedApp.id,
    });

    return updatedApp;
  },

  /**
   * Calculate pipeline breakdown from single source of truth
   */
  async getRecruitmentPipeline(driveId = "All") {
    await new Promise((r) => setTimeout(r, 90));
    let apps = storageService.getApplications();
    if (driveId && driveId !== "All") {
      apps = apps.filter((a) => a.driveId === driveId);
    }

    const counts = {};
    PIPELINE_STAGES.forEach((stage) => {
      counts[stage.id] = 0;
    });

    apps.forEach((a) => {
      if (counts[a.status] !== undefined) {
        counts[a.status] += 1;
      } else {
        counts[a.status] = 1;
      }
    });

    return {
      total: apps.length,
      stages: PIPELINE_STAGES.map((s) => ({
        ...s,
        count: counts[s.id] || 0,
        percentage: apps.length ? Math.round(((counts[s.id] || 0) / apps.length) * 100) : 0,
      })),
    };
  },

  /**
   * Centralized dashboard statistics calculated directly from mock data
   */
  async getDashboardStats() {
    await new Promise((r) => setTimeout(r, 100));
    const jobs = storageService.getJobs();
    const drives = storageService.getDrives();
    const apps = storageService.getApplications();
    const activities = storageService.getActivities();

    const activeJobs = jobs.filter((j) => j.status === "Active").length;
    const pendingDrives = drives.filter((d) => d.approvalStatus === "Pending Approval").length;
    const approvedDrives = drives.filter((d) => d.approvalStatus === "Approved").length;
    const shortlistedCandidates = apps.filter((a) => a.status === "Shortlisted").length;
    const selectedCandidates = apps.filter((a) => a.status === "Selected").length;

    // Upcoming drives: Approved/Published and date is today or later
    const today = new Date().toISOString().split("T")[0];
    const upcomingDrives = drives
      .filter((d) => d.interviewDate >= today && d.approvalStatus === "Approved")
      .sort((a, b) => new Date(a.interviewDate) - new Date(b.interviewDate))
      .slice(0, 4);

    const recentApplications = [...apps]
      .sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate))
      .slice(0, 5);

    return {
      totalJobs: jobs.length,
      activeJobs,
      totalDrives: drives.length,
      pendingDrives,
      approvedDrives,
      totalCandidates: apps.length,
      shortlistedCandidates,
      selectedCandidates,
      upcomingDrives,
      recentApplications,
      recentActivities: activities.slice(0, 6),
    };
  },
};
