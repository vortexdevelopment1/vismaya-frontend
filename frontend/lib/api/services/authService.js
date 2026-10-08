/**
 * Authentication API Service
 * Handles user registration, login, session tokens, password recovery, and profile queries.
 */

import { apiClient } from "../client.js";
import { isRealMode } from "../config.js";
import { mapUser } from "../mappers/index.js";

export const authService = {
  /**
   * Register a new user
   * @param {Object} payload { email, password, role, name, studioName, ... }
   */
  async register(payload) {
    if (!isRealMode("auth")) {
      return {
        success: true,
        user: {
          id: "usr_mock_reg_" + Date.now(),
          email: payload.email,
          role: payload.role || "talent",
          name: payload.name || "New User",
          status: "Pending",
        },
        token: "mock_jwt_token_" + Date.now(),
      };
    }

    const res = await apiClient.post("/api/auth/register", payload);
    const data = res?.data || res;
    const rawUser = res?.user || res?.data?.user || (data?.email ? data : null);
    const token = res?.token || res?.data?.token || data?.token;
    return {
      success: true,
      user: rawUser ? mapUser(rawUser) : null,
      token: token || null,
    };
  },

  /**
   * Log in an existing user
   * @param {Object} credentials { email, password }
   */
  async login({ email, password }) {
    if (!isRealMode("auth")) {
      let role = "talent";
      if (email?.includes("recruiter") || email?.includes("org") || email?.includes("zee") || email?.includes("dharma")) {
        role = "organization";
      } else if (email?.includes("admin")) {
        role = "admin";
      }

      return {
        success: true,
        user: {
          id: "usr_mock_" + role,
          email,
          role,
          name: role === "admin" ? "Admin User" : role === "organization" ? "Zee Films Recruiter" : "Aarav Sharma",
          status: "Active",
        },
        token: "mock_jwt_token_auth",
      };
    }

    const res = await apiClient.post("/api/auth/login", { email, password });
    const data = res?.data || res;
    const rawUser = res?.user || res?.data?.user || (data?.email ? data : null);
    const token = res?.token || res?.data?.token || data?.token;
    return {
      success: true,
      user: rawUser ? mapUser(rawUser) : null,
      token: token || null,
    };
  },

  /**
   * Initiate password recovery
   * @param {Object} payload { email }
   */
  async forgotPassword({ email }) {
    if (!isRealMode("auth")) {
      return { success: true, message: "OTP sent to your email (Mock)" };
    }
    return apiClient.post("/api/auth/forgot-password", { email });
  },

  /**
   * Verify OTP code for password recovery
   * @param {Object} payload { email, otp }
   */
  async verifyOtp({ email, otp }) {
    if (!isRealMode("auth")) {
      return { success: true, message: "OTP verified (Mock)" };
    }
    return apiClient.post("/api/auth/verify-otp", { email, otp });
  },

  /**
   * Reset password with verified OTP
   * @param {Object} payload { email, otp, newPassword }
   */
  async resetPassword({ email, otp, newPassword }) {
    if (!isRealMode("auth")) {
      return { success: true, message: "Password updated successfully (Mock)" };
    }
    return apiClient.post("/api/auth/reset-password", { email, otp, newPassword });
  },

  // CONTRACT-PENDING: User self-service change password
  async changePassword({ currentPassword, newPassword }) {
    if (!isRealMode("auth")) {
      return { success: true, message: "Password updated successfully (Mock)" };
    }
    return apiClient.post("/api/auth/change-password", { currentPassword, newPassword });
  },

  // CONTRACT-PENDING: Active login sessions list
  async getSessions() {
    if (!isRealMode("auth")) {
      return {
        success: true,
        data: [
          {
            id: "sess_mock_1",
            device: "Chrome on Windows 11",
            ip: "127.0.0.1",
            lastActive: new Date().toISOString(),
            isCurrent: true,
          },
        ],
      };
    }
    const res = await apiClient.get("/api/auth/sessions");
    return {
      success: true,
      data: res?.data || res || [],
    };
  },

  // CONTRACT-PENDING: Revoke specific login session
  async revokeSession(sessionId) {
    if (!isRealMode("auth")) {
      return { success: true, message: "Session revoked (Mock)" };
    }
    return apiClient.delete(`/api/auth/sessions/${sessionId}`);
  },

  // CONTRACT-PENDING: Revoke all other login sessions
  async revokeAllSessions() {
    if (!isRealMode("auth")) {
      return { success: true, message: "All other sessions revoked (Mock)" };
    }
    return apiClient.delete("/api/auth/sessions");
  },

  // CONTRACT-PENDING: Server-side token invalidation / logout
  async logout() {
    if (!isRealMode("auth")) {
      return { success: true, message: "Logged out (Mock)" };
    }
    return apiClient.post("/api/auth/logout");
  },
};
