import { apiClient } from "./apiClient";

export const adminService = {
  // Statistics
  getStats: async () => {
    const res = await apiClient.get("/api/v1/admin/stats");
    return res.data;
  },

  // Candidates approval & management
  getCandidates: async (params = {}) => {
    const { status = "ALL", search = "", page = 0, size = 20 } = params;
    const query = new URLSearchParams();
    if (status) query.set("status", status);
    if (search) query.set("search", search);
    query.set("page", page);
    query.set("size", size);

    const res = await apiClient.get(`/api/v1/admin/candidates?${query.toString()}`);
    return res.data;
  },

  getCandidateById: async (userId) => {
    const res = await apiClient.get(`/api/v1/admin/candidates/${userId}`);
    return res.data;
  },

  approveCandidate: async (userId) => {
    const res = await apiClient.post(`/api/v1/admin/candidates/${userId}/approve`);
    return res.data;
  },

  rejectCandidate: async (userId, reason) => {
    const res = await apiClient.post(`/api/v1/admin/candidates/${userId}/reject`, { reason });
    return res.data;
  },

  // Companies / Employer approval & management
  getCompanies: async (params = {}) => {
    const { status, page = 0, size = 50 } = params;
    const query = new URLSearchParams();
    if (status && status !== "ALL") query.set("status", status);
    query.set("page", page);
    query.set("size", size);

    const res = await apiClient.get(`/api/v1/admin/companies?${query.toString()}`);
    return res.data;
  },

  approveCompany: async (companyId) => {
    const res = await apiClient.post(`/api/v1/admin/companies/${companyId}/verify`);
    return res.data;
  },

  rejectCompany: async (companyId, reason) => {
    const res = await apiClient.post(`/api/v1/admin/companies/${companyId}/reject`, { reason });
    return res.data;
  },

  // Drives approval & management
  getDrives: async (params = {}) => {
    const { status, campusType, page = 0, size = 50 } = params;
    const query = new URLSearchParams();
    if (status && status !== "ALL") query.set("status", status);
    if (campusType && campusType !== "ALL") query.set("campusType", campusType);
    query.set("page", page);
    query.set("size", size);

    const res = await apiClient.get(`/api/v1/admin/drives?${query.toString()}`);
    return res.data;
  },

  approveDrive: async (driveId, feedback = "") => {
    const res = await apiClient.post(`/api/v1/admin/drives/${driveId}/approve`, { feedback });
    return res.data;
  },

  rejectDrive: async (driveId, reason = "") => {
    const res = await apiClient.post(`/api/v1/admin/drives/${driveId}/reject`, { reason });
    return res.data;
  },

  // Users
  getUsers: async (page = 0, size = 20) => {
    const res = await apiClient.get(`/api/v1/admin/users?page=${page}&size=${size}`);
    return res.data;
  },

  updateUserStatus: async (userId, status) => {
    const res = await apiClient.patch(`/api/v1/admin/users/${userId}/status`, { status });
    return res.data;
  },

  // Activity logs
  getActivityLogs: async (page = 0, size = 50) => {
    const res = await apiClient.get(`/api/v1/admin/activity-logs?page=${page}&size=${size}`);
    return res.data;
  },

  // Applications
  getApplications: async (page = 0, size = 50) => {
    const res = await apiClient.get(`/api/v1/admin/applications?page=${page}&size=${size}`);
    return res.data;
  },

  // Jobs
  getJobs: async (page = 0, size = 50) => {
    const res = await apiClient.get(`/api/v1/jobs?page=${page}&size=${size}`);
    return res.data;
  },

  // Notifications
  getNotifications: async (page = 0, size = 50) => {
    const res = await apiClient.get(`/api/v1/notifications?page=${page}&size=${size}`);
    return res.data;
  },

  getUnreadNotificationCount: async () => {
    const res = await apiClient.get("/api/v1/notifications/unread-count");
    return res.data;
  },

  markNotificationAsRead: async (notificationId) => {
    const res = await apiClient.patch(`/api/v1/notifications/${notificationId}/read`);
    return res.data;
  },
};
