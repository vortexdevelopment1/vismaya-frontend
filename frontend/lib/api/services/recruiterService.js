/**
 * Recruiter / Organization API Service
 * Manages organization profile, projects, casting briefs (opportunities), applicants, auditions, and credits.
 */

import { apiClient } from "../client.js";
import { isRealMode } from "../config.js";
import {
  mapOrganization,
  mapProject,
  mapOpportunity,
  mapApplication,
  mapAudition,
  mapCreditTransaction,
} from "../mappers/index.js";
import {
  initialCompanyProfile,
  initialRequirements,
  initialShortlistedTalent,
} from "../../recruiter/mockData.js";
import {
  mockOrganizations,
  mockProjects,
  mockOpportunities,
  mockApplications,
  mockAuditions,
} from "./mockSeedData.js";

export const recruiterService = {
  /**
   * Fetch recruiter's organization profile
   */
  async getOrganizationProfile() {
    if (!isRealMode("recruiter")) {
      return {
        success: true,
        data: mapOrganization(initialCompanyProfile),
      };
    }

    const res = await apiClient.get("/api/organization/profile");
    const doc = res?.data || res;
    return {
      success: true,
      data: doc ? mapOrganization(doc) : null,
    };
  },

  /**
   * Create or update organization profile
   * @param {Object} payload Organization profile details
   */
  async saveOrganizationProfile(payload) {
    if (!isRealMode("recruiter")) {
      return {
        success: true,
        data: mapOrganization({ ...initialCompanyProfile, ...payload }),
      };
    }

    const res = await apiClient.post("/api/organization/profile", payload);
    const doc = res?.data || res;
    return {
      success: true,
      data: doc ? mapOrganization(doc) : null,
    };
  },

  /**
   * Fetch all projects created by organization
   */
  async getMyProjects() {
    if (!isRealMode("projects")) {
      return {
        success: true,
        data: mockProjects.map(mapProject),
      };
    }

    const res = await apiClient.get("/api/projects");
    const docs = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    return {
      success: true,
      data: docs.map(mapProject),
    };
  },

  /**
   * Fetch a single project by ID
   * @param {string} projectId
   */
  async getProjectById(projectId) {
    if (!isRealMode("projects")) {
      const proj = mockProjects.find((p) => p.id === projectId) || mockProjects[0];
      return {
        success: true,
        data: mapProject(proj),
      };
    }

    const res = await apiClient.get(`/api/projects/${projectId}`);
    const doc = res?.data || res;
    return {
      success: true,
      data: doc ? mapProject(doc) : null,
    };
  },

  /**
   * Create a new project
   * @param {Object} payload { title, type, description, bannerImage }
   */
  async createProject(payload) {
    if (!isRealMode("projects")) {
      const newProj = {
        id: "proj_mock_" + Date.now(),
        orgId: "org-1",
        title: payload.title,
        type: payload.type || "Feature Film",
        description: payload.description || "",
        status: "Active",
        createdAt: new Date().toISOString(),
      };
      return {
        success: true,
        data: mapProject(newProj),
      };
    }

    const res = await apiClient.post("/api/projects", payload);
    const doc = res?.data || res;
    return {
      success: true,
      data: doc ? mapProject(doc) : null,
    };
  },

  /**
   * Update an existing project
   * @param {string} projectId
   * @param {Object} payload
   */
  async updateProject(projectId, payload) {
    if (!isRealMode("projects")) {
      return {
        success: true,
        data: mapProject({ id: projectId, ...payload }),
      };
    }

    const res = await apiClient.patch(`/api/projects/${projectId}`, payload);
    const doc = res?.data || res;
    return {
      success: true,
      data: doc ? mapProject(doc) : null,
    };
  },

  /**
   * Fetch all casting briefs created by organization
   */
  async getMyOpportunities() {
    if (!isRealMode("opportunities")) {
      return {
        success: true,
        data: initialRequirements.map(mapOpportunity),
      };
    }

    const res = await apiClient.get("/api/opportunities/my-opportunities");
    const docs = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    return {
      success: true,
      data: docs.map(mapOpportunity),
    };
  },

  /**
   * Create a new casting brief (opportunity)
   * @param {Object} payload Casting brief details
   */
  async createOpportunity(payload) {
    if (!isRealMode("opportunities")) {
      const mockOpp = {
        id: "opp_mock_" + Date.now(),
        orgId: "org-1",
        title: payload.title,
        status: payload.isDraft ? "Draft" : "Submitted",
        ...payload,
      };
      return {
        success: true,
        data: mapOpportunity(mockOpp),
      };
    }

    const res = await apiClient.post("/api/opportunities", payload);
    const doc = res?.data || res;
    return {
      success: true,
      data: doc ? mapOpportunity(doc) : null,
    };
  },

  /**
   * Request cancellation for an opportunity
   * @param {string} opportunityId
   * @param {Object} payload { reason }
   */
  async requestOpportunityCancellation(opportunityId, payload) {
    if (!isRealMode("opportunities")) {
      return {
        success: true,
        message: "Cancellation requested (Mock)",
      };
    }

    const res = await apiClient.post(`/api/opportunities/${opportunityId}/cancel-request`, payload);
    return {
      success: true,
      data: res?.data || res,
    };
  },

  /**
   * Fetch applications for a specific opportunity
   * @param {string} opportunityId
   */
  async getOpportunityApplications(opportunityId) {
    if (!isRealMode("applications")) {
      const shortlisted = initialShortlistedTalent[opportunityId] || [];
      const apps = shortlisted.length > 0
        ? shortlisted
        : mockApplications.filter((a) => a.opportunityId === opportunityId || a.reqId === opportunityId);
      return {
        success: true,
        data: (apps.length > 0 ? apps : mockApplications).map(mapApplication),
      };
    }

    const res = await apiClient.get(`/api/applications/opportunity/${opportunityId}`);
    const docs = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    return {
      success: true,
      data: docs.map(mapApplication),
    };
  },

  /**
   * Mark application as under review
   * @param {string} applicationId
   */
  async markApplicationUnderReview(applicationId) {
    if (!isRealMode("applications")) {
      return {
        success: true,
        data: mapApplication({ id: applicationId, status: "Under Review" }),
      };
    }

    const res = await apiClient.patch(`/api/applications/${applicationId}/review`);
    const doc = res?.data || res;
    return {
      success: true,
      data: doc ? mapApplication(doc) : null,
    };
  },

  /**
   * Shortlist candidate application
   * @param {string} applicationId
   */
  async shortlistApplication(applicationId) {
    if (!isRealMode("applications")) {
      return {
        success: true,
        data: mapApplication({ id: applicationId, status: "Shortlisted" }),
      };
    }

    const res = await apiClient.patch(`/api/applications/${applicationId}/shortlist`);
    const doc = res?.data || res;
    return {
      success: true,
      data: doc ? mapApplication(doc) : null,
    };
  },

  /**
   * Select candidate for role
   * @param {string} applicationId
   */
  async selectApplication(applicationId) {
    if (!isRealMode("applications")) {
      return {
        success: true,
        data: mapApplication({ id: applicationId, status: "Selected" }),
      };
    }

    const res = await apiClient.patch(`/api/applications/${applicationId}/select`);
    const doc = res?.data || res;
    return {
      success: true,
      data: doc ? mapApplication(doc) : null,
    };
  },

  /**
   * Mark application as not selected
   * @param {string} applicationId
   */
  async markNotSelected(applicationId) {
    if (!isRealMode("applications")) {
      return {
        success: true,
        data: mapApplication({ id: applicationId, status: "Not Selected" }),
      };
    }

    const res = await apiClient.patch(`/api/applications/${applicationId}/not-selected`);
    const doc = res?.data || res;
    return {
      success: true,
      data: doc ? mapApplication(doc) : null,
    };
  },

  /**
   * Request an audition round from candidate
   * @param {string} applicationId
   * @param {Object} payload { type, deadline, instructions, scriptSidesUrl }
   */
  async requestAudition(applicationId, payload) {
    if (!isRealMode("auditions")) {
      const mockAud = {
        id: "aud_mock_" + Date.now(),
        applicationId,
        status: "Requested",
        ...payload,
      };
      return {
        success: true,
        data: mapAudition(mockAud),
      };
    }

    const res = await apiClient.post(`/api/auditions/application/${applicationId}`, payload);
    const doc = res?.data || res;
    return {
      success: true,
      data: doc ? mapAudition(doc) : null,
    };
  },

  /**
   * Review submitted audition
   * @param {string} auditionId
   * @param {Object} payload { status, feedback }
   */
  async reviewAudition(auditionId, payload) {
    if (!isRealMode("auditions")) {
      return {
        success: true,
        data: mapAudition({ id: auditionId, ...payload }),
      };
    }

    const res = await apiClient.patch(`/api/auditions/${auditionId}/review`, payload);
    const doc = res?.data || res;
    return {
      success: true,
      data: doc ? mapAudition(doc) : null,
    };
  },

  /**
   * Fetch organization credit balance
   */
  async getCreditBalance() {
    if (!isRealMode("credits")) {
      return {
        success: true,
        data: { balance: 42, usedCredits: 18, totalAllocated: 60 },
      };
    }

    const res = await apiClient.get("/api/credits/balance");
    return {
      success: true,
      data: res?.data || res,
    };
  },

  /**
   * Fetch credit transaction history
   */
  async getCreditHistory() {
    if (!isRealMode("credits")) {
      return {
        success: true,
        data: [
          mapCreditTransaction({
            id: "tx-1",
            amount: 50,
            type: "purchase",
            description: "Credit Pack Standard",
            createdAt: "2026-09-01T10:00:00.000Z",
          }),
          mapCreditTransaction({
            id: "tx-2",
            amount: -1,
            type: "unlock",
            description: "Talent Profile Unlock: VIS-TAL-904",
            createdAt: "2026-09-15T14:30:00.000Z",
          }),
        ],
      };
    }

    const res = await apiClient.get("/api/credits/history");
    const docs = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    return {
      success: true,
      data: docs.map(mapCreditTransaction),
    };
  },

  /**
   * Unlock candidate contact info using 1 credit
   * @param {string} talentIdOrVismayaId
   */
  async unlockTalentProfile(talentIdOrVismayaId) {
    if (!isRealMode("credits")) {
      return {
        success: true,
        message: "Profile unlocked successfully (Mock)",
        phone: "+91 98765 43210",
        email: "talent.verified@vismaya.com",
      };
    }

    const res = await apiClient.post(`/api/credits/unlock/${talentIdOrVismayaId}`);
    return {
      success: true,
      data: res?.data || res,
    };
  },

  /**
   * Fetch recruiter favourites
   */
  async getFavourites() {
    if (!isRealMode("recruiter")) {
      return {
        success: true,
        data: [],
      };
    }

    const res = await apiClient.get("/api/organization/favourites");
    return {
      success: true,
      data: res?.data || res,
    };
  },
};
