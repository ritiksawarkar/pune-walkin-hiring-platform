/**
 * Job Management Service
 * Front-end mock service for managing job vacancies and walk-in eligibility criteria
 */

import { storageService } from "./storageService";

export const jobService = {
  async getJobs(filters = {}) {
    await new Promise((r) => setTimeout(r, 100));
    let jobs = storageService.getJobs();

    const {
      search = "",
      status = "All",
      department = "All",
      employmentType = "All",
      sortBy = "newest",
    } = filters;

    if (search.trim()) {
      const q = search.toLowerCase();
      jobs = jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.department.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q) ||
          (j.requiredSkills && j.requiredSkills.some((s) => s.toLowerCase().includes(q)))
      );
    }

    if (status && status !== "All") {
      jobs = jobs.filter((j) => j.status.toLowerCase() === status.toLowerCase());
    }

    if (department && department !== "All") {
      jobs = jobs.filter((j) => j.department.toLowerCase() === department.toLowerCase());
    }

    if (employmentType && employmentType !== "All") {
      jobs = jobs.filter(
        (j) => j.employmentType.toLowerCase() === employmentType.toLowerCase()
      );
    }

    // Sorting
    if (sortBy === "newest") {
      jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "oldest") {
      jobs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === "vacancies-desc") {
      jobs.sort((a, b) => Number(b.vacancies) - Number(a.vacancies));
    } else if (sortBy === "title-asc") {
      jobs.sort((a, b) => a.title.localeCompare(b.title));
    }

    return jobs;
  },

  async getJobById(id) {
    await new Promise((r) => setTimeout(r, 80));
    const jobs = storageService.getJobs();
    const job = jobs.find((j) => j.id === id);
    if (!job) {
      throw new Error(`Job with ID ${id} not found.`);
    }
    return job;
  },

  async createJob(data) {
    await new Promise((r) => setTimeout(r, 150));
    const jobs = storageService.getJobs();
    const company = storageService.getCompany();

    const newJob = {
      id: `job-${String(jobs.length + 1).padStart(2, "0")}`,
      employerId: company.employerId || "emp-ritik-01",
      companyId: company.id || "comp-pune-01",
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      status: data.status || "Active",
      vacancies: Number(data.vacancies) || 1,
      minExperience: Number(data.minExperience) || 0,
      maxExperience: Number(data.maxExperience) || 2,
      requiredSkills: Array.isArray(data.requiredSkills)
        ? data.requiredSkills
        : data.requiredSkills
        ? data.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      ...data,
    };

    const updatedList = [newJob, ...jobs];
    storageService.setJobs(updatedList);

    storageService.addActivity({
      type: "job_created",
      title: "New Job Opening Created",
      description: `Posted "${newJob.title}" with ${newJob.vacancies} vacancies`,
      entityId: newJob.id,
    });

    return newJob;
  },

  async updateJob(id, data) {
    await new Promise((r) => setTimeout(r, 150));
    const jobs = storageService.getJobs();
    const index = jobs.findIndex((j) => j.id === id);
    if (index === -1) {
      throw new Error(`Job with ID ${id} not found.`);
    }

    const updatedJob = {
      ...jobs[index],
      ...data,
      vacancies: Number(data.vacancies ?? jobs[index].vacancies),
      minExperience: Number(data.minExperience ?? jobs[index].minExperience),
      maxExperience: Number(data.maxExperience ?? jobs[index].maxExperience),
      requiredSkills: Array.isArray(data.requiredSkills)
        ? data.requiredSkills
        : typeof data.requiredSkills === "string"
        ? data.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean)
        : jobs[index].requiredSkills,
      updatedAt: new Date().toISOString().split("T")[0],
    };

    jobs[index] = updatedJob;
    storageService.setJobs(jobs);

    storageService.addActivity({
      type: "job_updated",
      title: "Job Details Updated",
      description: `Modified requirements for "${updatedJob.title}"`,
      entityId: updatedJob.id,
    });

    return updatedJob;
  },

  async archiveJob(id) {
    await new Promise((r) => setTimeout(r, 100));
    const jobs = storageService.getJobs();
    const job = jobs.find((j) => j.id === id);
    if (!job) {
      throw new Error(`Job with ID ${id} not found.`);
    }

    job.status = "Archived";
    job.updatedAt = new Date().toISOString().split("T")[0];
    storageService.setJobs(jobs);

    storageService.addActivity({
      type: "job_archived",
      title: "Job Archived",
      description: `Archived job listing "${job.title}"`,
      entityId: job.id,
    });

    return job;
  },

  async getDepartments() {
    const jobs = storageService.getJobs();
    const set = new Set(jobs.map((j) => j.department).filter(Boolean));
    return Array.from(set);
  },
};
