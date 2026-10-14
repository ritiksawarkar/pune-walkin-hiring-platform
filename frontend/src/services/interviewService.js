import { apiClient } from "./apiClient";

export const interviewService = {
  // Schedule or confirm interview and generate access pass
  scheduleInterview: async (data) => {
    const res = await apiClient.post("/api/v1/interviews/schedule", data);
    return res?.data !== undefined ? res.data : res;
  },

  // Get current candidate's confirmed interviews
  getMyInterviews: async () => {
    const res = await apiClient.get("/api/v1/interviews/my");
    return res?.data !== undefined ? res.data : res;
  },

  // Get employer's scheduled interviews
  getEmployerInterviews: async () => {
    const res = await apiClient.get("/api/v1/interviews/employer");
    return res?.data !== undefined ? res.data : res;
  },

  // Get interview pass and QR code by interview ID
  getInterviewPass: async (interviewId) => {
    const res = await apiClient.get(`/api/v1/interviews/${interviewId}/pass`);
    return res?.data !== undefined ? res.data : res;
  },

  // Get pass by unique pass code
  getPassByCode: async (passCode) => {
    const res = await apiClient.get(`/api/v1/interviews/passes/${passCode}`);
    return res?.data !== undefined ? res.data : res;
  },

  // Verify and admit candidate at venue desk
  verifyAndAdmitPass: async (passCode) => {
    const res = await apiClient.post(`/api/v1/interviews/passes/${passCode}/verify`);
    return res?.data !== undefined ? res.data : res;
  },
};
