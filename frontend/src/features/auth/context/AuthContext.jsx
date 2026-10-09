import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize session on mount
  useEffect(() => {
    try {
      const activeUser = authService.getCurrentUser();
      if (activeUser) {
        setUser(activeUser);
      }
    } catch (err) {
      console.warn("Failed to initialize auth session", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const { user: loggedInUser } = await authService.login(email, password);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      setError(err.message || "Failed to log in.");
      throw err;
    }
  }, []);

  const registerCandidate = useCallback(async (data) => {
    setError(null);
    try {
      const { user: registeredUser } = await authService.registerCandidate(data);
      setUser(registeredUser);
      return registeredUser;
    } catch (err) {
      setError(err.message || "Failed to register candidate.");
      throw err;
    }
  }, []);

  const registerEmployer = useCallback(async (data) => {
    setError(null);
    try {
      const result = await authService.registerEmployer(data);
      // Employer is not automatically logged in because status is PENDING_VERIFICATION
      return result;
    } catch (err) {
      setError(err.message || "Failed to register employer.");
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setError(null);
  }, []);

  const requestPasswordReset = useCallback(async (email) => {
    setError(null);
    return authService.requestPasswordReset(email);
  }, []);

  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: Boolean(user),
    loading,
    error,
    login,
    registerCandidate,
    registerEmployer,
    logout,
    requestPasswordReset,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
