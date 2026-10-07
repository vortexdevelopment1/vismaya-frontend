/**
 * Talent Domain API Service
 * Manages talent profile, applications, auditions, self-tape submissions, and analytics.
 */

import { apiClient } from "../client.js";
import { isRealMode } from "../config.js";
import { mapTalentProfile, mapTalentProfileToBackend, mapApplication, mapAudition } from "../mappers/index.js";
import { mockApplications, mockAuditions } from "./mockSeedData.js";

const defaultMockProfile = {
  id: "tal-904",
  personal: {
    name: "Aarav Sharma",
    gender: "Male",
    primarySkill: "Acting",
    bio: "Trained method actor with 4+ years theatre and digital camera experience.",
    city: "Mumbai",
  },
  status: "Approved",
};

export const talentService = {
  /**
   * Fetch authenticated talent's profile
   */
  async getMyProfile() {
    if (!isRealMode("talent")) {
      return {
        success: true,
        data: mapTalentProfile(defaultMockProfile),
      };
    }

    const res = await apiClient.get("/api/talent/profile/my");
    const doc = res?.data || res;
    return {
      success: true,
      data: doc ? mapTalentProfile(doc) : null,
    };
  },

  /**
   * Create or update talent profile
   * @param {Object} payload Frontend formatted profile or backend payload
   */
  async saveProfile(payload) {
    if (!isRealMode("talent")) {
      return {
        success: true,
        data: mapTalentProfile({ ...defaultMockProfile, ...payload }),
      };
    }

    const body = payload.personalDetails ? payload : mapTalentProfileToBackend(payload);
    const res = await apiClient.post("/api/talent/profile", body);
    const doc = res?.data || res;
    return {
      success: true,
      data: doc ? mapTalentProfile(doc) : null,
    };
  },

  /**
   * Fetch talent profile completion percentage and missing fields
   */
  async getCompletionStatus() {
    if (!isRealMode("talent")) {
      return {
        success: true,
        data: {
          percentage: 85,
          missingFields: ["Voice Samples", "Showreel"],
          isComplete: false,
        },
      };
    }

    const res = await apiClient.get("/api/talent/profile/completion-status");
    return {
      success: true,
      data: res?.data || res,
    };
  },

  /**
   * Fetch talent analytics (profile views, searches, unlocks)
   */
  async getMyAnalytics() {
    if (!isRealMode("talent")) {
      return {
        success: true,
        data: {
          profileViews: 142,
          searchAppearances: 310,
          shortlistedCount: 8,
          auditionRequests: 3,
        },
      };
    }

    const res = await apiClient.get("/api/talent/profile/analytics");
    return {
      success: true,
      data: res?.data || res,
    };
  },

  /**
   * Fetch all applications submitted by authenticated talent
   */
  async getMyApplications() {
    if (!isRealMode("applications")) {
      return {
        success: true,
        data: mockApplications.map(mapApplication),
      };
    }

    const res = await apiClient.get("/api/applications/my");
    const docs = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    return {
      success: true,
      data: docs.map(mapApplication),
    };
  },

  /**
   * Apply for an opportunity
   * @param {string} opportunityId
   * @param {Object} payload { roleId, notes, customAnswers, mediaIds }
   */
  async applyToOpportunity(opportunityId, payload) {
    if (!isRealMode("applications")) {
      const mockApp = {
        id: "app_mock_" + Date.now(),
        opportunityId,
        talentId: "tal-904",
        status: "Applied",
        submittedAt: new Date().toISOString(),
        ...payload,
      };
      return {
        success: true,
        data: mapApplication(mockApp),
      };
    }

    const res = await apiClient.post(`/api/applications/${opportunityId}/apply`, payload);
    const doc = res?.data || res;
    return {
      success: true,
      data: doc ? mapApplication(doc) : null,
    };
  },

  /**
   * Withdraw an active application
   * @param {string} applicationId
   */
  async withdrawApplication(applicationId) {
    if (!isRealMode("applications")) {
      return {
        success: true,
        data: { id: applicationId, status: "Withdrawn" },
      };
    }

    const res = await apiClient.patch(`/api/applications/${applicationId}/withdraw`);
    const doc = res?.data || res;
    return {
      success: true,
      data: doc ? mapApplication(doc) : null,
    };
  },

  /**
   * Request re-application permission after rejection
   * @param {string} applicationId
   * @param {Object} payload { reason }
   */
  async requestReapplication(applicationId, payload) {
    if (!isRealMode("applications")) {
      return {
        success: true,
        message: "Re-application request submitted for Admin review (Mock)",
      };
    }

    const res = await apiClient.post(`/api/applications/${applicationId}/reapplication-request`, payload);
    return {
      success: true,
      data: res?.data || res,
    };
  },

  /**
   * Fetch all auditions scheduled for authenticated talent
   */
  async getMyAuditions() {
    if (!isRealMode("auditions")) {
      return {
        success: true,
        data: mockAuditions.map(mapAudition),
      };
    }

    const res = await apiClient.get("/api/auditions/my");
    const docs = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    return {
      success: true,
      data: docs.map(mapAudition),
    };
  },

  /**
   * Submit self-tape video for an audition
   * @param {string} auditionId
   * @param {Object} payload { videoUrl, notes }
   */
  async submitSelfTape(auditionId, payload) {
    if (!isRealMode("auditions")) {
      return {
        success: true,
        data: mapAudition({
          id: auditionId,
          status: "Self-tape Received",
          selfTapeUrl: payload.videoUrl,
          selfTapeNotes: payload.notes,
          submittedAt: new Date().toISOString(),
        }),
      };
    }

    const res = await apiClient.post(`/api/auditions/${auditionId}/self-tape`, payload);
    const doc = res?.data || res;
    return {
      success: true,
      data: doc ? mapAudition(doc) : null,
    };
  },
};
