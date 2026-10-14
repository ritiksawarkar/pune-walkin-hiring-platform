
/**
 * Production Authentication Service
 *
 * Spring Boot endpoints:
 * POST /api/v1/auth/login
 * POST /api/v1/auth/register/candidate
 * POST /api/v1/auth/register/employer
 *
 * Supported roles:
 * ADMIN, EMPLOYER, CANDIDATE
 */

import {
  apiClient,
  setAuthToken,
  removeAuthToken,
} from "../../../services/apiClient.js";

export const INITIAL_DEMO_USERS = [
  {
    id: "user-admin-01",
    name: "Platform Admin",
    email: "admin@punewalkin.gov.in",
    role: "ADMIN",
    status: "APPROVED",
  },
  {
    id: "user-emp-01",
    name: "Ritik Sawarkar",
    email: "careers@techsprint.io",
    role: "EMPLOYER",
    status: "APPROVED",
    companyName: "TechSprint Innovations Pvt. Ltd.",
    companyId: "comp-pune-01",
    designation: "Lead Technical Recruiter",
  },
  {
    id: "user-cand-01",
    name: "Amit Deshmukh",
    email: "candidate@example.com",
    role: "CANDIDATE",
    status: "APPROVED",
    collegeName: "COEP Technological University, Pune",
  },
];

const STORAGE_KEYS = {
  SESSION: "punewalkin_auth_session",
};

/**
 * Convert backend status to a consistent format.
 */
function normalizeStatus(status) {
  return String(status || "").trim().toUpperCase();
}

/**
 * Extract the useful backend error message.
 */
function getErrorMessage(error) {
  const data = error?.data;

  if (data?.message) return data.message;
  if (data?.error) return data.error;
  if (error?.message) return error.message;

  return "Something went wrong. Please try again.";
}

/**
 * The API client returns parsed JSON, not an Axios response.
 * Supports both { data: {...} } and direct response objects.
 */
function extractAuthData(response) {
  return response?.data ?? response;
}

/**
 * Create a session only after receiving a valid token.
 */
function createSession(authData) {
  const token = authData?.token;
  const role = normalizeStatus(authData?.role);

  if (!token || typeof token !== "string") {
    throw new Error(
      "Authentication response does not contain a valid token."
    );
  }

  if (!["ADMIN", "EMPLOYER", "CANDIDATE"].includes(role)) {
    throw new Error("Invalid or unsupported user role received.");
  }

  const user = {
    id: authData.id,
    name: authData.fullName,
    email: authData.email,
    role,
    status: normalizeStatus(authData.accountStatus),
    companyId: authData.companyId ?? null,
    companyName: authData.companyName ?? null,
  };

  const session = {
    user,
    token,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  };

  // apiClient uses this same token key for Authorization headers.
  setAuthToken(token);

  try {
    localStorage.setItem(
      STORAGE_KEYS.SESSION,
      JSON.stringify(session)
    );
  } catch (error) {
    removeAuthToken();
    throw new Error("Unable to save the login session in this browser.");
  }

  return session;
}

/**
 * Reject accounts that have not been approved.
 */
function validateAccountStatus(accountStatus) {
  const status = normalizeStatus(accountStatus);

  if (
    status === "PENDING" ||
    status === "PENDING_VERIFICATION" ||
    status === "PENDING_APPROVAL"
  ) {
    throw new Error(
      "Your registration is awaiting admin verification. You can log in after your account is approved."
    );
  }

  if (status === "REJECTED") {
    throw new Error(
      "Your account registration was not approved by the administrator."
    );
  }

  if (status === "SUSPENDED") {
    throw new Error(
      "Your account has been suspended. Please contact the administrator."
    );
  }

  if (status && status !== "APPROVED" && status !== "ACTIVE") {
    throw new Error(
      "Your account is not active. Please contact the administrator."
    );
  }
}

export const authService = {
  /**
   * Login using credentials verified by the Spring Boot backend.
   */
  async login(email, password) {
    const cleanEmail = String(email || "").trim().toLowerCase();

    if (!cleanEmail || !password) {
      throw new Error("Please enter your email and password.");
    }

    try {
      const response = await apiClient.post(
        "/api/v1/auth/login",
        {
          email: cleanEmail,
          password,
        }
      );

      const authData = extractAuthData(response);

      // Check account status before creating an authenticated session.
      validateAccountStatus(authData?.accountStatus);

      // The backend response field is "token", not "accessToken".
      return createSession(authData);
    } catch (error) {
      if (error?.status === 401) {
        throw new Error(
          "Invalid email or password. Please verify your credentials."
        );
      }

      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Register a candidate.
   * Registration does not automatically log the candidate in.
   */
  async registerCandidate(data) {
    if (!data) {
      throw new Error("Candidate registration details are required.");
    }

    const cleanEmail = String(data.email || "")
      .trim()
      .toLowerCase();

    if (!data.fullName?.trim() || !cleanEmail || !data.password) {
      throw new Error(
        "Full name, email and password are required."
      );
    }

    const skills = Array.isArray(data.skills)
      ? data.skills
      : String(data.skills || "")
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

    const payload = {
      fullName: data.fullName.trim(),
      email: cleanEmail,
      password: data.password,
      phone: data.mobile || data.phone || "",
      collegeName:
        data.collegeName || "Pune University / SPPU",
      degree: data.degree || "B.Tech",
      branch: data.branch || "Computer Engineering",
      graduationYear: String(data.graduationYear || "2025"),
      cgpa:
        data.cgpa !== "" &&
          data.cgpa !== undefined &&
          data.cgpa !== null
          ? Number.parseFloat(data.cgpa)
          : 8.0,
      backlogs:
        data.backlogs !== "" &&
          data.backlogs !== undefined &&
          data.backlogs !== null
          ? Number.parseInt(data.backlogs, 10)
          : 0,
      skills,
    };

    if (
      !Number.isFinite(payload.cgpa) ||
      !Number.isInteger(payload.backlogs)
    ) {
      throw new Error("Please enter valid CGPA and backlog values.");
    }

    try {
      const response = await apiClient.post(
        "/api/v1/auth/register/candidate",
        payload
      );

      return extractAuthData(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Register an employer.
   * Approval is handled by the backend administrator.
   */
  async registerEmployer(data) {
    if (!data) {
      throw new Error("Employer registration details are required.");
    }

    const cleanEmail = String(
      data.workEmail || data.email || ""
    )
      .trim()
      .toLowerCase();

    const companyName = String(data.companyName || "").trim();
    const recruiterName = String(
      data.recruiterName || data.name || ""
    ).trim();

    if (
      !recruiterName ||
      !cleanEmail ||
      !data.password ||
      !companyName
    ) {
      throw new Error(
        "Recruiter name, email, password and company name are required."
      );
    }

    const payload = {
      recruiterName,
      email: cleanEmail,
      password: data.password,
      phone: data.mobile || data.phone || "",
      companyName,
      website: data.website ? data.website.trim() : "",
      designation: data.designation
        ? data.designation.trim()
        : "Technical Recruiter",
      city: data.city || "Pune",
      companyDescription:
        data.description ||
        `${companyName} recruitment team in Pune`,
    };

    try {
      const response = await apiClient.post(
        "/api/v1/auth/register/employer",
        payload
      );

      return extractAuthData(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Log out and clear the authentication session.
   */
  logout() {
    removeAuthToken();

    try {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    } catch (error) {
      console.warn("Unable to clear the saved session.", error);
    }
  },

  /**
   * Get the currently saved session user.
   */
  getCurrentUser() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SESSION);

      if (!raw) return null;

      const session = JSON.parse(raw);

      if (!session?.user || !session?.token) {
        this.logout();
        return null;
      }

      if (
        session.expiresAt &&
        Date.now() >= session.expiresAt
      ) {
        this.logout();
        return null;
      }

      return session.user;
    } catch {
      return null;
    }
  },

  /**
   * Return the complete saved session, if valid.
   */
  getCurrentSession() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SESSION);

      if (!raw) return null;

      const session = JSON.parse(raw);

      if (
        !session?.user ||
        !session?.token ||
        (session.expiresAt && Date.now() >= session.expiresAt)
      ) {
        this.logout();
        return null;
      }

      return session;
    } catch {
      return null;
    }
  },

  /**
   * Request a password reset.
   *
   * NOTE:
   * This is currently a placeholder, not a real backend integration.
   */
  async requestPasswordReset(email) {
    throw new Error(
      "Password reset is not connected to the backend yet."
    );
  },
};
