/**
 * Storage & Mock State Persistence Service
 * Simulates persistence layer with window.localStorage
 * Keeps employer data isolated and consistent across page reloads.
 */

import {
  INITIAL_COMPANY,
  INITIAL_JOBS,
  INITIAL_DRIVES,
  INITIAL_APPLICATIONS,
  INITIAL_ACTIVITIES,
} from "../mock/mockData";

const STORAGE_KEYS = {
  COMPANY: "punewalkin_employer_company",
  JOBS: "punewalkin_employer_jobs",
  DRIVES: "punewalkin_employer_drives",
  APPLICATIONS: "punewalkin_employer_applications",
  ACTIVITIES: "punewalkin_employer_activities",
};

export const storageService = {
  getCompany() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMPANY);
      return data ? JSON.parse(data) : INITIAL_COMPANY;
    } catch {
      return INITIAL_COMPANY;
    }
  },

  setCompany(company) {
    try {
      localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(company));
    } catch (e) {
      console.warn("Storage error saving company", e);
    }
    return company;
  },

  getJobs() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.JOBS);
      return data ? JSON.parse(data) : INITIAL_JOBS;
    } catch {
      return INITIAL_JOBS;
    }
  },

  setJobs(jobs) {
    try {
      localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
    } catch (e) {
      console.warn("Storage error saving jobs", e);
    }
    return jobs;
  },

  getDrives() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DRIVES);
      return data ? JSON.parse(data) : INITIAL_DRIVES;
    } catch {
      return INITIAL_DRIVES;
    }
  },

  setDrives(drives) {
    try {
      localStorage.setItem(STORAGE_KEYS.DRIVES, JSON.stringify(drives));
    } catch (e) {
      console.warn("Storage error saving drives", e);
    }
    return drives;
  },

  getApplications() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
      return data ? JSON.parse(data) : INITIAL_APPLICATIONS;
    } catch {
      return INITIAL_APPLICATIONS;
    }
  },

  setApplications(applications) {
    try {
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications));
    } catch (e) {
      console.warn("Storage error saving applications", e);
    }
    return applications;
  },

  getActivities() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      return data ? JSON.parse(data) : INITIAL_ACTIVITIES;
    } catch {
      return INITIAL_ACTIVITIES;
    }
  },

  addActivity(activity) {
    try {
      const activities = this.getActivities();
      const updated = [
        {
          id: `act-${Date.now()}`,
          timestamp: "Just now",
          ...activity,
        },
        ...activities,
      ].slice(0, 15);
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  },

  resetAllData() {
    try {
      localStorage.removeItem(STORAGE_KEYS.COMPANY);
      localStorage.removeItem(STORAGE_KEYS.JOBS);
      localStorage.removeItem(STORAGE_KEYS.DRIVES);
      localStorage.removeItem(STORAGE_KEYS.APPLICATIONS);
      localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
    } catch (e) {
      console.warn("Error resetting storage", e);
    }
  },
};
