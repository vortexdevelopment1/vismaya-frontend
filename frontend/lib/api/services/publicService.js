/**
 * Public & Discovery API Service
 * Manages public landing page data, directory search, and guest brief details.
 */

import { apiClient } from "../client.js";
import { isRealMode } from "../config.js";
import { mapOpportunity, mapTalentProfile } from "../mappers/index.js";
import { eliteTalentRoster } from "../../public/homeData.js";
import { mockOpportunities } from "./mockSeedData.js";

const defaultStats = {
  verifiedArtists: "12,400+",
  castingCalls: "450+",
  productionHouses: "180+",
  auditRate: "98.4%",
};

export const publicService = {
  /**
   * Fetch published opportunities with optional search filters
   * @param {Object} params { search, type, location, page, limit }
   */
  async getPublishedOpportunities(params = {}) {
    if (!isRealMode("opportunities")) {
      const published = mockOpportunities.filter((o) => o.status === "Published");
      return {
        success: true,
        data: published.map(mapOpportunity),
      };
    }

    const res = await apiClient.get("/api/opportunities/published", { params });
    const docs = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    return {
      success: true,
      data: docs.map(mapOpportunity),
    };
  },

  /**
   * Fetch single opportunity details by ID
   * @param {string} opportunityId
   */
  async getOpportunityById(opportunityId) {
    if (!isRealMode("opportunities")) {
      const opp = mockOpportunities.find((o) => o.id === opportunityId) || mockOpportunities[0];
      return {
        success: true,
        data: mapOpportunity(opp),
      };
    }

    const res = await apiClient.get(`/api/opportunities/${opportunityId}`);
    const doc = res?.data || res;
    return {
      success: true,
      data: doc ? mapOpportunity(doc) : null,
    };
  },

  /**
   * Search talent directory with criteria
   * @param {Object} params { query, category, location, minAge, maxAge, page, limit }
   */
  async searchTalentDirectory(params = {}) {
    if (!isRealMode("talent")) {
      return {
        success: true,
        data: eliteTalentRoster.map(mapTalentProfile),
      };
    }

    const res = await apiClient.get("/api/talent/profile/search", { params });
    const docs = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    return {
      success: true,
      data: docs.map(mapTalentProfile),
    };
  },

  /**
   * Fetch featured talents for showcase
   */
  async getFeaturedTalent() {
    if (!isRealMode("talent")) {
      return {
        success: true,
        data: eliteTalentRoster.map(mapTalentProfile),
      };
    }

    const res = await apiClient.get("/api/talent/profile/featured");
    const docs = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    return {
      success: true,
      data: docs.map(mapTalentProfile),
    };
  },

  /**
   * Fetch single public talent profile details by vismayaId or Mongo ID
   * @param {string} vismayaIdOrId
   */
  async getPublicTalentProfile(vismayaIdOrId) {
    if (!isRealMode("talent")) {
      const found = eliteTalentRoster.find((t) => t.slug === vismayaIdOrId || t.name === vismayaIdOrId) || eliteTalentRoster[0];
      return {
        success: true,
        data: found ? mapTalentProfile(found) : null,
      };
    }

    const res = await apiClient.get(`/api/talent/profile/${vismayaIdOrId}`);
    const doc = res?.data || res;
    return {
      success: true,
      data: doc ? mapTalentProfile(doc) : null,
    };
  },

  // CONTRACT-PENDING: Public landing page aggregate statistics
  async getPlatformStats() {
    if (!isRealMode("public")) {
      return {
        success: true,
        data: defaultStats,
      };
    }

    const res = await apiClient.get("/api/public/stats");
    return {
      success: true,
      data: res?.data || res,
    };
  },

  /**
   * Fetch platform success stories
   */
  async getSuccessStories() {
    if (!isRealMode("public")) {
      return {
        success: true,
        data: [],
      };
    }

    const res = await apiClient.get("/api/success-stories");
    return {
      success: true,
      data: res?.data || res,
    };
  },

  // CONTRACT-PENDING: Public contact inquiry submission
  async submitContactForm(payload) {
    if (!isRealMode("public")) {
      return {
        success: true,
        message: "Message received. Our production support team will contact you within 24 hours. (Mock)",
      };
    }

    const res = await apiClient.post("/api/contact", payload);
    return {
      success: true,
      data: res?.data || res,
    };
  },
};
