/**
 * Walk-In Drive Management Service
 * Front-end mock service for drive scheduling, venue coordination, and employer approval submission.
 * 
 * Approval Lifecycle:
 * Draft -> Pending Approval (Submitted by Ritik)
 * [Admin review conducted by Sahil] -> Approved | Changes Requested | Rejected
 * Approved drives become Published / Ongoing / Completed
 */

import { storageService } from "./storageService";

export const driveService = {
  async getDrives(filters = {}) {
    await new Promise((r) => setTimeout(r, 100));
    let drives = storageService.getDrives();

    const {
      search = "",
      approvalStatus = "All",
      driveStatus = "All",
      location = "All",
      sortBy = "date-asc",
    } = filters;

    if (search.trim()) {
      const q = search.toLowerCase();
      drives = drives.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.jobTitle.toLowerCase().includes(q) ||
          d.venueName.toLowerCase().includes(q) ||
          d.city.toLowerCase().includes(q)
      );
    }

    if (approvalStatus && approvalStatus !== "All") {
      drives = drives.filter(
        (d) => d.approvalStatus.toLowerCase() === approvalStatus.toLowerCase()
      );
    }

    if (driveStatus && driveStatus !== "All") {
      drives = drives.filter(
        (d) => d.driveStatus.toLowerCase() === driveStatus.toLowerCase()
      );
    }

    if (location && location !== "All") {
      drives = drives.filter((d) =>
        d.venueAddress.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Sorting
    if (sortBy === "date-asc") {
      drives.sort((a, b) => new Date(a.interviewDate) - new Date(b.interviewDate));
    } else if (sortBy === "date-desc") {
      drives.sort((a, b) => new Date(b.interviewDate) - new Date(a.interviewDate));
    } else if (sortBy === "registrations-desc") {
      drives.sort((a, b) => Number(b.registeredCount || 0) - Number(a.registeredCount || 0));
    } else if (sortBy === "vacancies-desc") {
      drives.sort((a, b) => Number(b.vacancies || 0) - Number(a.vacancies || 0));
    }

    return drives;
  },

  async getDriveById(id) {
    await new Promise((r) => setTimeout(r, 80));
    const drives = storageService.getDrives();
    const drive = drives.find((d) => d.id === id);
    if (!drive) {
      throw new Error(`Walk-In Drive with ID ${id} not found.`);
    }
    return drive;
  },

  async createDrive(data) {
    await new Promise((r) => setTimeout(r, 150));
    const drives = storageService.getDrives();
    const company = storageService.getCompany();

    const newDrive = {
      id: `drive-${String(drives.length + 1).padStart(2, "0")}`,
      employerId: company.employerId || "emp-ritik-01",
      companyId: company.id || "comp-pune-01",
      registeredCount: 0,
      approvalStatus: data.submitDirectly ? "Pending Approval" : "Draft",
      driveStatus: "Draft",
      adminFeedback: null,
      createdAt: new Date().toISOString().split("T")[0],
      submittedAt: data.submitDirectly ? new Date().toISOString().split("T")[0] : null,
      vacancies: Number(data.vacancies) || 1,
      maxRegistrations: Number(data.maxRegistrations) || 50,
      selectionRounds: Array.isArray(data.selectionRounds)
        ? data.selectionRounds
        : data.selectionRounds
        ? data.selectionRounds.split("\n").filter(Boolean)
        : [],
      requiredDocuments: Array.isArray(data.requiredDocuments)
        ? data.requiredDocuments
        : data.requiredDocuments
        ? data.requiredDocuments.split("\n").filter(Boolean)
        : [],
      ...data,
    };

    const updatedList = [newDrive, ...drives];
    storageService.setDrives(updatedList);

    storageService.addActivity({
      type: data.submitDirectly ? "drive_submit" : "drive_created",
      title: data.submitDirectly ? "Walk-In Drive Submitted" : "Walk-In Drive Draft Created",
      description: `Created drive "${newDrive.title}" for ${newDrive.interviewDate}`,
      entityId: newDrive.id,
    });

    return newDrive;
  },

  async updateDrive(id, data) {
    await new Promise((r) => setTimeout(r, 150));
    const drives = storageService.getDrives();
    const index = drives.findIndex((d) => d.id === id);
    if (index === -1) {
      throw new Error(`Walk-In Drive with ID ${id} not found.`);
    }

    const current = drives[index];
    const updatedDrive = {
      ...current,
      ...data,
      vacancies: Number(data.vacancies ?? current.vacancies),
      maxRegistrations: Number(data.maxRegistrations ?? current.maxRegistrations),
      selectionRounds: Array.isArray(data.selectionRounds)
        ? data.selectionRounds
        : typeof data.selectionRounds === "string"
        ? data.selectionRounds.split("\n").filter(Boolean)
        : current.selectionRounds,
      requiredDocuments: Array.isArray(data.requiredDocuments)
        ? data.requiredDocuments
        : typeof data.requiredDocuments === "string"
        ? data.requiredDocuments.split("\n").filter(Boolean)
        : current.requiredDocuments,
      updatedAt: new Date().toISOString().split("T")[0],
    };

    drives[index] = updatedDrive;
    storageService.setDrives(drives);

    storageService.addActivity({
      type: "drive_updated",
      title: "Walk-In Drive Updated",
      description: `Updated details for "${updatedDrive.title}"`,
      entityId: updatedDrive.id,
    });

    return updatedDrive;
  },

  /**
   * Submit draft walk-in drive for administrative approval
   * Note: Employers cannot approve their own drive. Approval is performed by Sahil (Admin).
   */
  async submitDriveForApproval(id) {
    await new Promise((r) => setTimeout(r, 120));
    const drives = storageService.getDrives();
    const drive = drives.find((d) => d.id === id);
    if (!drive) throw new Error(`Drive ${id} not found`);

    if (drive.approvalStatus !== "Draft" && drive.approvalStatus !== "Changes Requested") {
      throw new Error(`Cannot submit drive in status "${drive.approvalStatus}".`);
    }

    drive.approvalStatus = "Pending Approval";
    drive.submittedAt = new Date().toISOString().split("T")[0];
    drive.adminFeedback = null; // Cleared on new submission
    storageService.setDrives(drives);

    storageService.addActivity({
      type: "drive_submit",
      title: "Walk-In Drive Submitted for Approval",
      description: `Submitted "${drive.title}" to Admin (Sahil) for verification.`,
      entityId: drive.id,
    });

    return drive;
  },

  async resubmitDrive(id, resubmissionNotes = "") {
    await new Promise((r) => setTimeout(r, 120));
    const drives = storageService.getDrives();
    const drive = drives.find((d) => d.id === id);
    if (!drive) throw new Error(`Drive ${id} not found`);

    drive.approvalStatus = "Pending Approval";
    drive.resubmissionNotes = resubmissionNotes;
    drive.submittedAt = new Date().toISOString().split("T")[0];
    storageService.setDrives(drives);

    storageService.addActivity({
      type: "drive_submit",
      title: "Drive Resubmitted with Revisions",
      description: `Resubmitted "${drive.title}" after addressing reviewer comments.`,
      entityId: drive.id,
    });

    return drive;
  },

  async cancelDrive(id, reason = "") {
    await new Promise((r) => setTimeout(r, 100));
    const drives = storageService.getDrives();
    const drive = drives.find((d) => d.id === id);
    if (!drive) throw new Error(`Drive ${id} not found`);

    drive.driveStatus = "Cancelled";
    drive.cancellationReason = reason;
    storageService.setDrives(drives);

    storageService.addActivity({
      type: "drive_cancelled",
      title: "Walk-In Drive Cancelled",
      description: `Cancelled "${drive.title}". Reason: ${reason || "Employer request"}`,
      entityId: drive.id,
    });

    return drive;
  },
};
