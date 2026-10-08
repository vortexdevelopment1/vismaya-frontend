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
  initialTalents,
  initialRecruiters,
  initialRequirementRequests,
  initialCastingCalls,
  initialApplications,
  initialMediaQueue,
  initialPayments,
  initialBroadcasts,
  initialRecentAdminActivity,
  initialAnalyticsData,
} from "../../admin/mockData.js";
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
      const all = [...initialTalents, ...initialRecruiters];
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
      const pending = [...initialTalents, ...initialRecruiters].filter(
        (u) => (u.status || "").toLowerCase() === "pending"
      );
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
      return {
        success: true,
        data: initialRequirementRequests.map(mapOpportunity),
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
        data: initialRecentAdminActivity,
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

  // CONTRACT-PENDING: Admin console aggregated metrics dashboard
  async getDashboardStats() {
    if (!isRealMode("admin")) {
      return {
        success: true,
        data: initialAnalyticsData,
      };
    }

    const res = await apiClient.get("/api/admin/dashboard");
    return {
      success: true,
      data: res?.data || res,
    };
  },

  // CONTRACT-PENDING: Admin platform-wide performance and engagement analytics
  async getAnalytics(params = {}) {
    if (!isRealMode("admin")) {
      return {
        success: true,
        data: initialAnalyticsData,
      };
    }

    const res = await apiClient.get("/api/admin/analytics", { params });
    return {
      success: true,
      data: res?.data || res,
    };
  },

  // CONTRACT-PENDING: Admin talent management directory list with filters
  async listTalents(params = {}) {
    if (!isRealMode("admin")) {
      return {
        success: true,
        data: initialTalents.map(mapUser),
      };
    }

    const res = await apiClient.get("/api/admin/talents", { params });
    const docs = Array.isArray(res?.data) ? res.data : Array.isArray(res?.talents) ? res.talents : [];
    return {
      success: true,
      data: docs.map(mapUser),
    };
  },

  // CONTRACT-PENDING: Admin recruiter / organization management directory list
  async listOrganizations(params = {}) {
    if (!isRealMode("admin")) {
      return {
        success: true,
        data: initialRecruiters.map(mapUser),
      };
    }

    const res = await apiClient.get("/api/admin/organizations", { params });
    const docs = Array.isArray(res?.data) ? res.data : Array.isArray(res?.organizations) ? res.organizations : [];
    return {
      success: true,
      data: docs.map(mapUser),
    };
  },

  // CONTRACT-PENDING: Admin casting brief cancellation requests queue
  async getCancellationRequests(params = {}) {
    if (!isRealMode("admin")) {
      return {
        success: true,
        data: initialRequirementRequests.map(mapOpportunity),
      };
    }

    const res = await apiClient.get("/api/admin/cancellation-requests", { params });
    const docs = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    return {
      success: true,
      data: docs.map(mapOpportunity),
    };
  },

  // CONTRACT-PENDING: Admin audition submissions relay queue
  async getAuditionsForRelay(params = {}) {
    if (!isRealMode("admin")) {
      return {
        success: true,
        data: initialApplications,
      };
    }

    const res = await apiClient.get("/api/admin/auditions", { params });
    const docs = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    return {
      success: true,
      data: docs,
    };
  },

  // CONTRACT-PENDING: Admin relay audition request to talent
  async relayAudition(auditionId, payload = {}) {
    if (!isRealMode("admin")) {
      return {
        success: true,
        message: "Audition relayed to talent (Mock)",
      };
    }

    const res = await apiClient.patch(`/api/admin/auditions/${auditionId}/relay`, payload);
    return {
      success: true,
      data: res?.data || res,
    };
  },

  // CONTRACT-PENDING: Admin forward submitted self-tape to organization
  async forwardAudition(auditionId, payload = {}) {
    if (!isRealMode("admin")) {
      return {
        success: true,
        message: "Self-tape forwarded to organization (Mock)",
      };
    }

    const res = await apiClient.patch(`/api/admin/auditions/${auditionId}/forward`, payload);
    return {
      success: true,
      data: res?.data || res,
    };
  },

  // CONTRACT-PENDING: Admin media moderation queue
  async getMediaForModeration(params = {}) {
    if (!isRealMode("admin")) {
      return {
        success: true,
        data: initialMediaQueue,
      };
    }

    const res = await apiClient.get("/api/admin/media", { params });
    const docs = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    return {
      success: true,
      data: docs,
    };
  },

  // CONTRACT-PENDING: Admin media item approval / rejection moderation decision
  async moderateMedia(mediaId, payload = {}) {
    if (!isRealMode("admin")) {
      return {
        success: true,
        message: `Media ${payload.status || "moderated"} (Mock)`,
      };
    }

    const res = await apiClient.patch(`/api/admin/media/${mediaId}/moderate`, payload);
    return {
      success: true,
      data: res?.data || res,
    };
  },

  // CONTRACT-PENDING: Admin live system activity stream
  async getSystemFeed() {
    if (!isRealMode("admin")) {
      return {
        success: true,
        data: initialRecentAdminActivity,
      };
    }

    const res = await apiClient.get("/api/admin/system-feed");
    const docs = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    return {
      success: true,
      data: docs,
    };
  },

  // CONTRACT-PENDING: Admin platform broadcasts list
  async getBroadcasts() {
    if (!isRealMode("admin")) {
      return {
        success: true,
        data: initialBroadcasts.map(mapBroadcast),
      };
    }

    const res = await apiClient.get("/api/admin/broadcasts");
    const docs = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    return {
      success: true,
      data: docs.map(mapBroadcast),
    };
  },

  // CONTRACT-PENDING: Admin single broadcast detail
  async getBroadcastById(broadcastId) {
    if (!isRealMode("admin")) {
      const bc = initialBroadcasts.find((b) => b.id === broadcastId) || initialBroadcasts[0];
      return {
        success: true,
        data: mapBroadcast(bc),
      };
    }

    const res = await apiClient.get(`/api/admin/broadcasts/${broadcastId}`);
    const doc = res?.data || res;
    return {
      success: true,
      data: doc ? mapBroadcast(doc) : null,
    };
  },

  // CONTRACT-PENDING: Admin broadcast creation & dispatch
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

  // CONTRACT-PENDING: Admin broadcast update
  async updateBroadcast(broadcastId, payload) {
    if (!isRealMode("admin")) {
      return {
        success: true,
        data: mapBroadcast({ id: broadcastId, ...payload }),
      };
    }

    const res = await apiClient.patch(`/api/admin/broadcasts/${broadcastId}`, payload);
    const doc = res?.data || res;
    return {
      success: true,
      data: doc ? mapBroadcast(doc) : null,
    };
  },

  // CONTRACT-PENDING: Admin broadcast deletion
  async deleteBroadcast(broadcastId) {
    if (!isRealMode("admin")) {
      return {
        success: true,
        message: "Broadcast deleted (Mock)",
      };
    }

    const res = await apiClient.delete(`/api/admin/broadcasts/${broadcastId}`);
    return {
      success: true,
      data: res?.data || res,
    };
  },

  // CONTRACT-PENDING: Admin broadcast target audience reach estimation
  async getBroadcastReach(target = "all") {
    if (!isRealMode("admin")) {
      const reachMap = { all: 18450, talent: 14200, recruiter: 4250 };
      return {
        success: true,
        data: { target, estimatedReach: reachMap[target] || 18450 },
      };
    }

    const res = await apiClient.get("/api/admin/broadcasts/reach", { params: { target } });
    return {
      success: true,
      data: res?.data || res,
    };
  },
};
