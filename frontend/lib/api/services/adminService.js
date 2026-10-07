/**
 * Admin Domain API Service
 * Handles user moderation, opportunity lifecycle review, verifications, audit logs, and broadcasts.
 */

import { apiClient } from "../client.js";
import { isRealMode } from "../config.js";
import {
  mapUser,
  mapOpportunity,
  mapVerification,
  mapBroadcast,
} from "../mappers/index.js";
import {
  mockTalents,
  mockRecruiters,
  mockOpportunities,
  mockBroadcasts,
} from "./mockSeedData.js";

export const adminService = {
  /**
   * Fetch all registered users
   * @param {Object} params { role, status, page, limit }
   */
  async getAllUsers(params = {}) {
    if (!isRealMode("admin")) {
      const all = [...mockTalents, ...mockRecruiters];
      return {
        success: true,
        data: all.map(mapUser),
      };
    }

    const res = await apiClient.get("/api/admin/users", { params });
    const docs = Array.isArray(res?.data) ? res.data : Array.isArray(res?.users) ? res.users : [];
    return {
      success: true,
      data: docs.map(mapUser),
    };
  },

  /**
   * Fetch pending user approvals queue
   */
  async getPendingUsers() {
    if (!isRealMode("admin")) {
      const pending = [...mockTalents, ...mockRecruiters].filter((u) => u.status === "Pending");
      return {
        success: true,
        data: pending.map(mapUser),
      };
    }

    const res = await apiClient.get("/api/admin/users/pending");
    const docs = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    return {
      success: true,
      data: docs.map(mapUser),
    };
  },

  /**
   * Approve a pending user account
   * @param {string} userId
   */
  async approveUser(userId) {
    if (!isRealMode("admin")) {
      return {
        success: true,
        data: mapUser({ id: userId, status: "Approved" }),
      };
    }

    const res = await apiClient.patch(`/api/admin/users/${userId}/approve`);
    const doc = res?.data || res;
    return {
      success: true,
      data: doc ? mapUser(doc) : null,
    };
  },

  /**
   * Reject a user registration
   * @param {string} userId
   * @param {Object} payload { reason }
   */
  async rejectUser(userId, payload = {}) {
    if (!isRealMode("admin")) {
      return {
        success: true,
        data: mapUser({ id: userId, status: "Rejected", ...payload }),
      };
    }

    const res = await apiClient.patch(`/api/admin/users/${userId}/reject`, payload);
    const doc = res?.data || res;
    return {
      success: true,
      data: doc ? mapUser(doc) : null,
    };
  },

  /**
   * Suspend a user account
   * @param {string} userId
   * @param {Object} payload { reason }
   */
  async suspendUser(userId, payload = {}) {
    if (!isRealMode("admin")) {
      return {
        success: true,
        data: mapUser({ id: userId, status: "Suspended", ...payload }),
      };
    }

    const res = await apiClient.patch(`/api/admin/users/${userId}/suspend`, payload);
    const doc = res?.data || res;
    return {
      success: true,
      data: doc ? mapUser(doc) : null,
    };
  },

  /**
   * Reactivate a suspended account
   * @param {string} userId
   */
  async reactivateUser(userId) {
    if (!isRealMode("admin")) {
      return {
        success: true,
        data: mapUser({ id: userId, status: "Approved" }),
      };
    }

    const res = await apiClient.patch(`/api/admin/users/${userId}/reactivate`);
    const doc = res?.data || res;
    return {
      success: true,
      data: doc ? mapUser(doc) : null,
    };
  },

  /**
   * Fetch pending opportunities review queue
   */
  async getPendingOpportunities() {
    if (!isRealMode("admin")) {
      const pending = mockOpportunities.filter((o) => o.status === "Submitted" || o.status === "Changes Requested");
      return {
        success: true,
        data: pending.map(mapOpportunity),
      };
    }

    const res = await apiClient.get("/api/admin/opportunities/pending");
    const docs = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    return {
      success: true,
      data: docs.map(mapOpportunity),
    };
  },

  /**
   * Approve and publish a submitted opportunity
   * @param {string} opportunityId
   */
  async approveOpportunity(opportunityId) {
    if (!isRealMode("admin")) {
      return {
        success: true,
        data: mapOpportunity({ id: opportunityId, status: "Published" }),
      };
    }

    const res = await apiClient.patch(`/api/admin/opportunities/${opportunityId}/approve`);
    const doc = res?.data || res;
    return {
      success: true,
      data: doc ? mapOpportunity(doc) : null,
    };
  },

  /**
   * Reject a submitted opportunity
   * @param {string} opportunityId
   * @param {Object} payload { reason }
   */
  async rejectOpportunity(opportunityId, payload = {}) {
    if (!isRealMode("admin")) {
      return {
        success: true,
        data: mapOpportunity({ id: opportunityId, status: "Rejected", ...payload }),
      };
    }

    const res = await apiClient.patch(`/api/admin/opportunities/${opportunityId}/reject`, payload);
    const doc = res?.data || res;
    return {
      success: true,
      data: doc ? mapOpportunity(doc) : null,
    };
  },

  /**
   * Request corrections on a submitted opportunity
   * @param {string} opportunityId
   * @param {Object} payload { notes }
   */
  async requestOpportunityCorrections(opportunityId, payload) {
    if (!isRealMode("admin")) {
      return {
        success: true,
        data: mapOpportunity({ id: opportunityId, status: "Changes Requested", ...payload }),
      };
    }

    const res = await apiClient.patch(`/api/admin/opportunities/${opportunityId}/request-corrections`, payload);
    const doc = res?.data || res;
    return {
      success: true,
      data: doc ? mapOpportunity(doc) : null,
    };
  },

  /**
   * Review cancellation request
   * @param {string} opportunityId
   * @param {Object} payload { approved, notes }
   */
  async reviewOpportunityCancellation(opportunityId, payload) {
    if (!isRealMode("admin")) {
      return {
        success: true,
        data: mapOpportunity({
          id: opportunityId,
          status: payload.approved ? "Cancelled" : "Published",
        }),
      };
    }

    const res = await apiClient.patch(`/api/admin/opportunities/${opportunityId}/review-cancellation`, payload);
    const doc = res?.data || res;
    return {
      success: true,
      data: doc ? mapOpportunity(doc) : null,
    };
  },

  /**
   * Fetch pending identity/professional/business verifications
   */
  async getPendingVerifications() {
    if (!isRealMode("admin")) {
      return {
        success: true,
        data: [],
      };
    }

    const res = await apiClient.get("/api/admin/verifications/pending");
    const docs = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    return {
      success: true,
      data: docs.map(mapVerification),
    };
  },

  /**
   * Review a verification submission
   * @param {string} verificationId
   * @param {Object} payload { status, notes }
   */
  async reviewVerification(verificationId, payload) {
    if (!isRealMode("admin")) {
      return {
        success: true,
        data: mapVerification({ id: verificationId, ...payload }),
      };
    }

    const res = await apiClient.patch(`/api/admin/verifications/${verificationId}/review`, payload);
    const doc = res?.data || res;
    return {
      success: true,
      data: doc ? mapVerification(doc) : null,
    };
  },

  /**
   * Fetch admin audit logs
   */
  async getAuditLogs(params = {}) {
    if (!isRealMode("admin")) {
      return {
        success: true,
        data: [
          {
            id: "log-1",
            action: "OPPORTUNITY_APPROVED",
            performedBy: "admin@vismaya.com",
            target: "opp-101",
            timestamp: new Date().toISOString(),
          },
        ],
      };
    }

    const res = await apiClient.get("/api/admin/audit-logs", { params });
    return {
      success: true,
      data: res?.data || res,
    };
  },

  /**
   * Global search across users, opportunities, applications
   * @param {string} query
   */
  async globalSearch(query) {
    if (!isRealMode("admin")) {
      return {
        success: true,
        data: { users: [], opportunities: [], applications: [] },
      };
    }

    const res = await apiClient.get("/api/admin/search", { params: { q: query } });
    return {
      success: true,
      data: res?.data || res,
    };
  },

  /**
   * Fetch admin broadcasts
   */
  async getBroadcasts() {
    if (!isRealMode("admin")) {
      return {
        success: true,
        data: mockBroadcasts.map(mapBroadcast),
      };
    }

    try {
      const res = await apiClient.get("/api/admin/broadcasts");
      const docs = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      return {
        success: true,
        data: docs.map(mapBroadcast),
      };
    } catch {
      return {
        success: true,
        data: mockBroadcasts.map(mapBroadcast),
      };
    }
  },

  /**
   * Send or schedule an admin broadcast
   * @param {Object} payload
   */
  async sendBroadcast(payload) {
    if (!isRealMode("admin")) {
      const newBc = {
        id: "bc_mock_" + Date.now(),
        ...payload,
        status: payload.scheduledFor ? "Scheduled" : "Sent",
        sentAt: payload.scheduledFor ? null : new Date().toISOString(),
      };
      return {
        success: true,
        data: mapBroadcast(newBc),
      };
    }

    const res = await apiClient.post("/api/admin/broadcasts", payload);
    const doc = res?.data || res;
    return {
      success: true,
      data: doc ? mapBroadcast(doc) : mapBroadcast(payload),
    };
  },
};
