/**
 * Candidate Domain Service
 * Pune Walk-In Drive & Hiring Management Platform
 * Assigned Developer: Sagar (Candidate Module)
 * 
 * Central service layer for Candidate dashboard, profile, resume, drive discovery,
 * applications tracking, interviews, notifications, and account settings.
 * Synchronizes seamlessly with shared storageService (owned with Ritik & Krushna).
 */

import { storageService } from "./storageService.js";
import { normalizeApprovalStatus, normalizeCompanyStatus } from "../utils/statusUtils.js";
import { apiClient } from "./apiClient.js";
import { interviewService } from "./interviewService.js";

const STORAGE_KEYS = {
  PROFILE_PREFIX: "punewalkin_candidate_profile_",
  NOTIFICATIONS_PREFIX: "punewalkin_candidate_notifications_",
  SETTINGS_PREFIX: "punewalkin_candidate_settings_",
};

// Seed profile for demo candidate (Amit Deshmukh)
const INITIAL_DEMO_PROFILE = {
  id: "cand-101",
  fullName: "Amit Deshmukh",
  email: "candidate@example.com",
  phone: "+91 98901 23456",
  city: "Pune",
  state: "Maharashtra",
  address: "Flat 402, Shivajinagar Residency, FC Road, Pune - 411005",
  headline: "Aspiring Full Stack Software Engineer | React, Java & Spring Boot",
  about:
    "Proactive computer engineering graduate from Savitribai Phule Pune University (SPPU). Built high-performance web applications using modern React and Spring Boot microservices. Seeking entry-level software engineering roles in Pune IT hubs (Hinjawadi / Magarpatta / Kharadi).",
  qualification: "B.E. Computer Engineering (SPPU Pune, 2025)",
  aggregate: "8.4 CGPA",
  isFresher: false,
  education: [
    {
      id: "edu-1",
      qualification: "Bachelor of Engineering (B.E.)",
      course: "Computer Engineering",
      institution: "Savitribai Phule Pune University (SPPU)",
      graduationYear: "2025",
      score: "8.4 CGPA",
      type: "Full-Time",
    },
    {
      id: "edu-2",
      qualification: "Higher Secondary Certificate (HSC)",
      course: "Science (PCMB)",
      institution: "Fergusson Junior College, Pune",
      graduationYear: "2021",
      score: "88.5%",
      type: "Full-Time",
    },
  ],
  skills: [
    "React.js",
    "JavaScript (ES6+)",
    "Core Java",
    "Spring Boot",
    "MySQL",
    "Tailwind CSS",
    "Git",
    "REST APIs",
  ],
  experience: [
    {
      id: "exp-1",
      title: "Software Engineering Intern",
      company: "Persistent Systems Pune",
      duration: "Jan 2025 - Jun 2025 (6 months)",
      location: "Hinjawadi Phase 1, Pune",
      description:
        "Contributed to building enterprise dashboard interfaces with React.js and tested Spring Boot REST endpoints. Worked with Git and agile sprint ceremonies.",
    },
  ],
  resume: {
    fileName: "Amit_Deshmukh_Resume_2026.pdf",
    fileSize: "245 KB",
    uploadedAt: "2026-10-08",
    fileType: "application/pdf",
    status: "Active",
  },
};

const INITIAL_DEMO_NOTIFICATIONS = [
  {
    id: "notif-01",
    title: "Application Shortlisted!",
    message:
      "Congratulations! TechSprint Innovations has shortlisted your profile for the Junior Full Stack Developer drive.",
    type: "shortlist",
    timestamp: "2 hours ago",
    date: "2026-10-09 11:30",
    read: false,
    link: "/candidate/applications/app-001",
  },
  {
    id: "notif-02",
    title: "Walk-In Drive Confirmed",
    message:
      "Your registration for 'Mega Walk-In Drive for Freshers & Junior Full Stack Engineers' is confirmed. Token TS-W26-004.",
    type: "drive",
    timestamp: "Yesterday",
    date: "2026-10-08 10:14",
    read: false,
    link: "/candidate/applications/app-001",
  },
  {
    id: "notif-03",
    title: "New Walk-In Published in Hinjawadi",
    message:
      "A new drive 'QA Automation & SDET Weekend Walk-In Drive' has been submitted for Pune West cluster.",
    type: "info",
    timestamp: "3 days ago",
    date: "2026-10-06 14:00",
    read: true,
    link: "/candidate/drives",
  },
];

const INITIAL_DEMO_SETTINGS = {
  emailAlerts: true,
  smsAlerts: true,
  interviewReminders: true,
  driveRecommendations: true,
  profileVisibility: "Public to Pune Recruiter Network",
};

/**
 * Calculates standardized candidate profile completion percentage
 */
export function calculateProfileCompletion(profile) {
  if (!profile) return 0;
  let score = 0;

  // 1. Core personal details (25%)
  if (profile.fullName && profile.email && profile.phone && profile.city) {
    score += 25;
  } else if (profile.fullName && profile.email) {
    score += 15;
  }

  // 2. Education details (25%)
  if (profile.education && profile.education.length > 0) {
    score += 25;
  }

  // 3. Technical Skills (25%)
  if (profile.skills && profile.skills.length >= 3) {
    score += 25;
  } else if (profile.skills && profile.skills.length > 0) {
    score += 15;
  }

  // 4. Resume upload (25%)
  if (profile.resume && profile.resume.fileName) {
    score += 25;
  }

  return Math.min(100, score);
}

export const candidateService = {
  /**
   * Get candidate profile from storage or initialize default
   */
  async getProfile(user) {
    await new Promise((r) => setTimeout(r, 60));
    const userId = user?.id || "user-cand-01";
    const key = `${STORAGE_KEYS.PROFILE_PREFIX}${userId}`;

    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          ...parsed,
          completionPercentage: calculateProfileCompletion(parsed),
        };
      }
    } catch (e) {
      console.warn("Error reading profile", e);
    }

    // Initialize with demo data tailored to current user
    const initial = {
      ...INITIAL_DEMO_PROFILE,
      fullName: user?.name || INITIAL_DEMO_PROFILE.fullName,
      email: user?.email || INITIAL_DEMO_PROFILE.email,
      phone: user?.phone || INITIAL_DEMO_PROFILE.phone,
    };
    initial.completionPercentage = calculateProfileCompletion(initial);
    try {
      localStorage.setItem(key, JSON.stringify(initial));
    } catch (e) {
      console.warn("Error seeding profile", e);
    }
    return initial;
  },

  /**
   * Update candidate profile
   */
  async updateProfile(user, updatedData) {
    await new Promise((r) => setTimeout(r, 120));
    const userId = user?.id || "user-cand-01";
    const key = `${STORAGE_KEYS.PROFILE_PREFIX}${userId}`;
    const current = await this.getProfile(user);

    const merged = {
      ...current,
      ...updatedData,
      updatedAt: new Date().toISOString(),
    };
    merged.completionPercentage = calculateProfileCompletion(merged);

    try {
      localStorage.setItem(key, JSON.stringify(merged));
    } catch (e) {
      console.warn("Error saving profile", e);
    }

    return merged;
  },

  /**
   * Upload / attach resume prototype metadata
   */
  async uploadResume(user, resumeData) {
    await new Promise((r) => setTimeout(r, 150));
    const profile = await this.getProfile(user);

    const updatedProfile = {
      ...profile,
      resume: {
        fileName: resumeData.fileName,
        fileSize: resumeData.fileSize || "1.2 MB",
        fileType: resumeData.fileType || "application/pdf",
        uploadedAt: new Date().toISOString().split("T")[0],
        status: "Active",
      },
    };

    return this.updateProfile(user, updatedProfile);
  },

  /**
   * Remove resume
   */
  async removeResume(user) {
    await new Promise((r) => setTimeout(r, 80));
    const profile = await this.getProfile(user);
    const updatedProfile = {
      ...profile,
      resume: null,
    };
    return this.updateProfile(user, updatedProfile);
  },

  /**
   * Get all eligible, approved, published walk-in drives for candidates
   */
  async getDrives(user, filters = {}) {
    await new Promise((r) => setTimeout(r, 60));
    const {
      search = "",
      location = "All",
      dateFilter = "All",
      sortBy = "date-asc",
      campusType,
    } = filters;

    let backendDrives = [];
    try {
      const params = { size: 100 };
      if (campusType && campusType !== "ALL") {
        params.campusType = campusType;
      }
      const backendRes = await apiClient.get("/api/v1/drives", params);
      const list = backendRes?.data?.content || backendRes?.content || (Array.isArray(backendRes?.data) ? backendRes.data : []);
      if (Array.isArray(list) && list.length > 0) {
        backendDrives = list.map((d) => ({
          id: d.id,
          title: d.title,
          jobTitle: d.job?.title || d.title,
          companyId: d.company?.id,
          companyName: d.company?.companyName || "TechSprint Innovations",
          driveDate: d.driveDate,
          interviewDate: d.driveDate,
          startTime: d.startTime || "09:30 AM",
          endTime: d.endTime || "05:30 PM",
          registrationDeadline: d.registrationDeadline,
          venueName: d.venueName,
          venueAddress: d.venueAddress,
          city: d.city || "Pune",
          state: d.state || "Maharashtra",
          vacancies: d.vacancies || 1,
          maxRegistrations: d.maxRegistrations || 100,
          registeredCount: d.registeredCount || 0,
          campusType: d.campusType || "OFF_CAMPUS",
          eligibleDegree: d.eligibleDegree,
          eligibleBranch: d.eligibleBranch,
          minCgpa: d.minCgpa,
          maxBacklogs: d.maxBacklogs,
          eligibleColleges: d.eligibleColleges || [],
          approvalStatus: d.approvalStatus || "APPROVED",
          driveStatus: d.status || "Ongoing",
          selectionRounds: ["Technical Assessment", "Technical Interview", "HR Discussion"],
          candidateInstructions: "Carry government photo ID card (Aadhaar/PAN) and 2 printed resumes.",
        }));
      }
    } catch {
      // Backend not reached or offline
    }

    const allDrives = storageService.getDrives();
    const myApps = await this.getMyApplications(user);

    // Only show drives that are Approved and Published (or Ongoing) from Verified companies
    const companies = storageService.getCompanies();
    const primaryCompany = storageService.getCompany();

    let storageDrives = allDrives.filter((d) => {
      const isApproved = normalizeApprovalStatus(d.approvalStatus) === "APPROVED";
      const isPublished = d.driveStatus !== "Draft" && d.driveStatus !== "Cancelled";
      const comp = companies.find((c) => c.id === d.companyId) || primaryCompany;
      const isCompanyVerified = normalizeCompanyStatus(comp?.verificationStatus) === "VERIFIED";
      return isApproved && isPublished && isCompanyVerified;
    });

    const backendIds = new Set(backendDrives.map((d) => d.id));
    let candidateDrives = [...backendDrives, ...storageDrives.filter((d) => !backendIds.has(d.id))];

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      candidateDrives = candidateDrives.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.jobTitle.toLowerCase().includes(q) ||
          d.venueName.toLowerCase().includes(q) ||
          d.city.toLowerCase().includes(q) ||
          (d.selectionRounds &&
            d.selectionRounds.some((r) => r.toLowerCase().includes(q)))
      );
    }

    // Location filter
    if (location && location !== "All") {
      candidateDrives = candidateDrives.filter((d) =>
        d.venueAddress.toLowerCase().includes(location.toLowerCase()) ||
        d.venueName.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Date filter
    const today = new Date().toISOString().split("T")[0];
    if (dateFilter === "Upcoming") {
      candidateDrives = candidateDrives.filter((d) => d.interviewDate >= today);
    } else if (dateFilter === "Past") {
      candidateDrives = candidateDrives.filter((d) => d.interviewDate < today);
    }

    // Attach application status for current candidate
    candidateDrives = candidateDrives.map((d) => {
      const applied = myApps.find((a) => a.driveId === d.id);
      return {
        ...d,
        isApplied: Boolean(applied),
        applicationId: applied?.id || null,
        applicationStatus: applied?.status || null,
        tokenNumber: applied?.tokenNumber || null,
      };
    });

    // Sorting
    if (sortBy === "date-asc") {
      candidateDrives.sort(
        (a, b) => new Date(a.interviewDate) - new Date(b.interviewDate)
      );
    } else if (sortBy === "date-desc") {
      candidateDrives.sort(
        (a, b) => new Date(b.interviewDate) - new Date(a.interviewDate)
      );
    } else if (sortBy === "deadline-asc") {
      candidateDrives.sort(
        (a, b) =>
          new Date(a.registrationDeadline) - new Date(b.registrationDeadline)
      );
    } else if (sortBy === "vacancies-desc") {
      candidateDrives.sort(
        (a, b) => Number(b.vacancies || 0) - Number(a.vacancies || 0)
      );
    }

    return candidateDrives;
  },

  /**
   * Get single drive by ID with company, job, and candidate registration status
   */
  async getDriveDetails(driveId, user) {
    await new Promise((r) => setTimeout(r, 60));
    const allDrives = storageService.getDrives();
    const drive = allDrives.find((d) => d.id === driveId);
    if (!drive) {
      throw new Error(`Walk-In Drive with ID ${driveId} not found.`);
    }

    const company = storageService.getCompany();
    const jobs = storageService.getJobs();
    const associatedJob = jobs.find((j) => j.id === drive.jobId) || null;
    const myApps = await this.getMyApplications(user);
    const existingApp = myApps.find((a) => a.driveId === driveId) || null;

    return {
      ...drive,
      company,
      job: associatedJob,
      isApplied: Boolean(existingApp),
      application: existingApp,
    };
  },

  /**
   * Apply / Register for a walk-in drive
   */
  async applyForDrive(user, driveId, slot = "09:30 AM - Slot A") {
    await new Promise((r) => setTimeout(r, 150));
    const drive = await this.getDriveDetails(driveId, user);

    if (normalizeApprovalStatus(drive.approvalStatus) !== "APPROVED") {
      throw new Error("This drive is not approved for public registration.");
    }

    const today = new Date().toISOString().split("T")[0];
    if (drive.registrationDeadline && drive.registrationDeadline < today) {
      throw new Error("The registration deadline for this walk-in drive has expired.");
    }

    const profile = await this.getProfile(user);
    const applications = storageService.getApplications();
    const candId = user?.id || profile?.id || "cand-101";
    const candEmail = (user?.email || profile?.email || "").toLowerCase();

    // Prevent duplicate application
    const existing = applications.find(
      (a) =>
        a.driveId === driveId &&
        ((a.candidateId && a.candidateId === candId) ||
          (a.email && a.email.toLowerCase() === candEmail))
    );
    if (existing || drive.isApplied) {
      throw new Error("You have already registered for this walk-in drive.");
    }

    // Generate unique, stable application ID and token
    const appId = `app-${String(applications.length + 1).padStart(3, "0")}`;
    const tokenNumber = `TS-W26-${String(Math.floor(100 + Math.random() * 900))}`;
    const now = new Date();
    const formattedDate = now.toISOString().split("T")[0];
    const formattedDateTime = `${formattedDate} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newApplication = {
      id: appId,
      employerId: drive.employerId || "emp-ritik-01",
      candidateId: profile.id || user.id || "cand-101",
      candidateName: profile.fullName || user.name || "Candidate",
      email: profile.email || user.email,
      phone: profile.phone || user.phone || "+91 98901 23456",
      city: profile.city || "Pune",
      qualification: profile.qualification || "B.E. Computer Engineering (2025)",
      skills: profile.skills || ["React.js", "Java"],
      experienceYears: profile.isFresher ? 0 : 0.5,
      driveId: drive.id,
      driveTitle: drive.title,
      jobId: drive.jobId,
      jobTitle: drive.jobTitle,
      registrationDate: formattedDate,
      registrationSlot: slot,
      tokenNumber: tokenNumber,
      resumeFileName: profile.resume?.fileName || "Candidate_Resume.pdf",
      status: "Registered",
      statusHistory: [
        {
          status: "Registered",
          date: formattedDateTime,
          updatedBy: "Candidate Portal (Sagar)",
          note: `Registered for slot ${slot}. Entry token generated: ${tokenNumber}`,
        },
      ],
      reviewerNotes: "",
      rating: 0,
    };

    // Save to shared applications
    const updatedApps = [newApplication, ...applications];
    storageService.setApplications(updatedApps);

    // Increment drive registration count
    const drives = storageService.getDrives();
    const driveIdx = drives.findIndex((d) => d.id === driveId);
    if (driveIdx !== -1) {
      drives[driveIdx].registeredCount = (drives[driveIdx].registeredCount || 0) + 1;
      storageService.setDrives(drives);
    }

    // Add activity log to shared activities
    storageService.addActivity({
      type: "candidate_registered",
      title: "New Walk-In Registration Received",
      description: `${newApplication.candidateName} registered for ${drive.title} (${slot})`,
      entityId: newApplication.id,
    });

    // Add in-app notification for candidate
    await this.addNotification(user, {
      title: "Walk-In Registration Confirmed",
      message: `Your registration for ${drive.title} is confirmed. Token: ${tokenNumber}. Slot: ${slot}.`,
      type: "registration",
      link: `/candidate/applications/${newApplication.id}`,
    });

    return newApplication;
  },

  /**
   * Get all applications for the current candidate
   */
  async getMyApplications(user, filters = {}) {
    await new Promise((r) => setTimeout(r, 60));
    const allApps = storageService.getApplications();
    const userEmail = (user?.email || "candidate@example.com").toLowerCase();
    const userName = (user?.name || "").toLowerCase();

    // Match by candidate ID, candidate email, or name
    let myApps = allApps.filter(
      (a) =>
        (a.candidateId && user?.id && a.candidateId === user.id) ||
        (a.email && a.email.toLowerCase() === userEmail) ||
        (userEmail === "candidate@example.com" &&
          (a.email?.toLowerCase().includes("amit.deshmukh") ||
            a.candidateName?.toLowerCase().includes("amit deshmukh"))) ||
        (a.candidateName && userName && a.candidateName.toLowerCase().includes(userName))
    );

    const { search = "", status = "All", sortBy = "date-desc" } = filters;

    if (search.trim()) {
      const q = search.toLowerCase();
      myApps = myApps.filter(
        (a) =>
          a.driveTitle.toLowerCase().includes(q) ||
          a.jobTitle.toLowerCase().includes(q) ||
          (a.tokenNumber && a.tokenNumber.toLowerCase().includes(q))
      );
    }

    if (status && status !== "All") {
      myApps = myApps.filter(
        (a) => a.status.toLowerCase() === status.toLowerCase()
      );
    }

    if (sortBy === "date-desc") {
      myApps.sort(
        (a, b) => new Date(b.registrationDate) - new Date(a.registrationDate)
      );
    } else if (sortBy === "date-asc") {
      myApps.sort(
        (a, b) => new Date(a.registrationDate) - new Date(b.registrationDate)
      );
    }

    return myApps;
  },

  /**
   * Get single application details by ID
   */
  async getApplicationById(applicationId, user) {
    await new Promise((r) => setTimeout(r, 60));
    const apps = storageService.getApplications();
    const app = apps.find((a) => a.id === applicationId);
    if (!app) {
      throw new Error(`Application with ID ${applicationId} not found.`);
    }

    const drives = storageService.getDrives();
    const drive = drives.find((d) => d.id === app.driveId) || null;
    const company = storageService.getCompany();

    return {
      ...app,
      drive,
      company,
    };
  },

  /**
   * Get candidate interviews derived from shortlisted / scheduled applications
   */
  async getMyInterviews(user) {
    await new Promise((r) => setTimeout(r, 60));
    const today = new Date().toISOString().split("T")[0];

    try {
      const backendInts = await interviewService.getMyInterviews();
      const list = Array.isArray(backendInts) ? backendInts : (backendInts?.content || []);
      if (Array.isArray(list) && list.length > 0) {
        return list.map((i) => {
          const interviewDate = i.interviewDate || today;
          const isPast = interviewDate < today;
          return {
            id: i.id,
            applicationId: i.application?.id || i.id,
            driveId: i.walkInDrive?.id || "drive-001",
            companyName: i.employer?.company?.companyName || i.walkInDrive?.company?.companyName || "TechSprint Innovations",
            companyTagline: "Innovating Pune Tech Ecosystem",
            jobTitle: i.walkInDrive?.job?.title || "Junior Full Stack Engineer",
            driveTitle: i.walkInDrive?.title || "Walk-In Drive",
            interviewDate: interviewDate,
            interviewTime: `${i.startTime || "10:00 AM"} - ${i.endTime || "01:00 PM"}`,
            slot: `${i.startTime || "10:00 AM"} - ${i.endTime || "01:00 PM"}`,
            tokenNumber: i.pass?.passCode || `PASS-${i.id}`,
            venueName: i.venue || "Corporate Auditorium",
            venueAddress: i.address || "Pune Venue",
            instructions: i.reportingInstructions || "Report 30 mins before allocated slot with Govt ID.",
            requiredDocuments: [
              "2 Printed Resumes",
              "Government Photo ID",
              "Academic Marks Sheets",
            ],
            selectionRounds: ["Technical Aptitude", "Hands-on Interview", "HR Round"],
            status: i.status === "CONFIRMED" ? "Interview Scheduled" : i.status,
            passCode: i.pass?.passCode,
            isPast,
          };
        });
      }
    } catch {
      // Backend not available, fallback to local storage
    }

    const apps = await this.getMyApplications(user);
    const drives = storageService.getDrives();
    const company = storageService.getCompany();

    // Match applications with active walk-in drive schedules
    const interviewApps = apps.filter(
      (a) =>
        a.status === "Interview Scheduled" ||
        a.status === "Shortlisted" ||
        a.status === "Selected" ||
        a.status === "Registered"
    );

    return interviewApps.map((a) => {
      const drive = drives.find((d) => d.id === a.driveId);
      const interviewDate = drive?.interviewDate || a.registrationDate;
      const isPast = interviewDate < today;

      return {
        id: `int-${a.id}`,
        applicationId: a.id,
        driveId: a.driveId,
        companyName: company.name,
        companyTagline: company.tagline,
        jobTitle: a.jobTitle,
        driveTitle: a.driveTitle,
        interviewDate: interviewDate,
        interviewTime: drive ? `${drive.startTime} - ${drive.endTime}` : "09:30 AM",
        slot: a.registrationSlot,
        tokenNumber: a.tokenNumber,
        venueName: drive?.venueName || "TechSprint Corporate Auditorium",
        venueAddress: drive?.venueAddress || "Magarpatta Cybercity, Hadapsar, Pune",
        instructions: drive?.candidateInstructions || "Report 30 mins before allocated slot with Govt ID.",
        requiredDocuments: drive?.requiredDocuments || [
          "2 Printed Resumes",
          "Government Photo ID",
          "Academic Marks Sheets",
        ],
        selectionRounds: drive?.selectionRounds || ["Technical Aptitude", "Hands-on Interview", "HR Round"],
        status: a.status,
        isPast,
      };
    });
  },

  /**
   * Get candidate notifications
   */
  async getNotifications(user) {
    await new Promise((r) => setTimeout(r, 50));
    const userId = user?.id || "user-cand-01";
    const key = `${STORAGE_KEYS.NOTIFICATIONS_PREFIX}${userId}`;

    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn("Error reading notifications", e);
    }

    try {
      localStorage.setItem(key, JSON.stringify(INITIAL_DEMO_NOTIFICATIONS));
    } catch (e) {
      console.warn("Error seeding notifications", e);
    }
    return INITIAL_DEMO_NOTIFICATIONS;
  },

  /**
   * Add a notification
   */
  async addNotification(user, notif) {
    const list = await this.getNotifications(user);
    const newNotif = {
      id: `notif-${Date.now()}`,
      timestamp: "Just now",
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
      read: false,
      ...notif,
    };
    const updated = [newNotif, ...list];
    const userId = user?.id || "user-cand-01";
    localStorage.setItem(
      `${STORAGE_KEYS.NOTIFICATIONS_PREFIX}${userId}`,
      JSON.stringify(updated)
    );
    return updated;
  },

  /**
   * Mark single notification as read
   */
  async markNotificationAsRead(user, notifId) {
    const list = await this.getNotifications(user);
    const updated = list.map((n) => (n.id === notifId ? { ...n, read: true } : n));
    const userId = user?.id || "user-cand-01";
    localStorage.setItem(
      `${STORAGE_KEYS.NOTIFICATIONS_PREFIX}${userId}`,
      JSON.stringify(updated)
    );
    return updated;
  },

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsAsRead(user) {
    const list = await this.getNotifications(user);
    const updated = list.map((n) => ({ ...n, read: true }));
    const userId = user?.id || "user-cand-01";
    localStorage.setItem(
      `${STORAGE_KEYS.NOTIFICATIONS_PREFIX}${userId}`,
      JSON.stringify(updated)
    );
    return updated;
  },

  /**
   * Get candidate account settings
   */
  async getSettings(user) {
    const userId = user?.id || "user-cand-01";
    const key = `${STORAGE_KEYS.SETTINGS_PREFIX}${userId}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn("Error reading settings", e);
    }
    return INITIAL_DEMO_SETTINGS;
  },

  /**
   * Save candidate account settings
   */
  async updateSettings(user, settings) {
    const userId = user?.id || "user-cand-01";
    const key = `${STORAGE_KEYS.SETTINGS_PREFIX}${userId}`;
    const merged = { ...INITIAL_DEMO_SETTINGS, ...settings };
    localStorage.setItem(key, JSON.stringify(merged));
    return merged;
  },

  /**
   * Calculate all candidate dashboard metrics directly from mock storage
   */
  async getDashboardMetrics(user) {
    await new Promise((r) => setTimeout(r, 90));
    const profile = await this.getProfile(user);
    const myApps = await this.getMyApplications(user);
    const drives = await this.getDrives(user, { dateFilter: "Upcoming" });
    const interviews = await this.getMyInterviews(user);
    const notifications = await this.getNotifications(user);

    const stats = {
      totalApplications: myApps.length,
      registered: myApps.filter((a) => a.status === "Registered").length,
      underReview: myApps.filter((a) => a.status === "Under Review").length,
      shortlisted: myApps.filter((a) => a.status === "Shortlisted").length,
      interviewScheduled: myApps.filter((a) => a.status === "Interview Scheduled").length,
      selected: myApps.filter((a) => a.status === "Selected").length,
      rejected: myApps.filter((a) => a.status === "Rejected").length,
      onHold: myApps.filter((a) => a.status === "On Hold").length,
    };

    // Recommended drives (limit to 3 top upcoming approved drives)
    const recommendedDrives = drives.slice(0, 3);

    // Upcoming interviews
    const upcomingInterviews = interviews.filter((i) => !i.isPast).slice(0, 2);

    // Recent activities (combine application status events)
    const activities = [];
    myApps.forEach((a) => {
      if (a.statusHistory && a.statusHistory.length > 0) {
        a.statusHistory.forEach((h) => {
          activities.push({
            id: `act-${a.id}-${h.date}`,
            title: `${a.jobTitle}: ${h.status}`,
            description: h.note || `Status updated to ${h.status}`,
            date: h.date,
            applicationId: a.id,
            status: h.status,
          });
        });
      }
    });

    activities.sort((a, b) => (b.date > a.date ? 1 : -1));

    return {
      profile,
      stats,
      recommendedDrives,
      upcomingInterviews,
      recentActivities: activities.slice(0, 5),
      unreadNotificationsCount: notifications.filter((n) => !n.read).length,
    };
  },
};
