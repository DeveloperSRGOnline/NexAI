import apiClient from "./apiClient";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Initiates the Google OAuth 2.0 redirect flow
 */
export const loginWithGoogle = () => {
  window.location.href = `${API_BASE_URL}/auth/google`;
};

/**
 * Development mock login (active in non-production environments)
 */
export const devLogin = async (payload = {}) => {
  const response = await apiClient.post("/auth/dev-login", payload);
  return response.data;
};

/**
 * Fetch authenticated user profile
 */
export const fetchCurrentUser = async () => {
  const response = await apiClient.get("/auth/me", {
    _skipAuthRedirect: true,
  });
  return response.data?.user;
};

/**
 * Log out user and clear cookie
 */
export const logoutUser = async () => {
  try {
    await apiClient.post("/auth/logout");
  } catch (err) {
    console.warn("[Auth] Server logout notification failed:", err.message);
  }
};
