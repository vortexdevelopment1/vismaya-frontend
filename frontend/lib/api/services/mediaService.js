/**
 * Media Portfolio API Service
 * Handles media assets (photos, showreels, audio, documents), file uploads, and moderation metadata.
 */

import { apiClient } from "../client.js";
import { isRealMode } from "../config.js";
import { mapMedia } from "../mappers/index.js";
import { uploadMedia } from "../uploadMedia.js";
import { initialMediaQueue } from "../../admin/mockData.js";
import { mockMediaQueue } from "./mockSeedData.js";

export const mediaService = {
  /**
   * Fetch authenticated user's uploaded media
   */
  async getMyMedia() {
    if (!isRealMode("media")) {
      return {
        success: true,
        data: initialMediaQueue.map(mapMedia),
      };
    }

    const res = await apiClient.get("/api/media/my");
    const docs = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    return {
      success: true,
      data: docs.map(mapMedia),
    };
  },

  /**
   * Fetch media for a specific user ID
   * @param {string} userId
   */
  async getUserMedia(userId) {
    if (!isRealMode("media")) {
      const userMedia = initialMediaQueue.filter((m) => m.talentId === userId || m.userId === userId);
      return {
        success: true,
        data: (userMedia.length > 0 ? userMedia : initialMediaQueue).map(mapMedia),
      };
    }

    const res = await apiClient.get(`/api/media/user/${userId}`);
    const docs = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    return {
      success: true,
      data: docs.map(mapMedia),
    };
  },

  /**
   * Add a new media item record
   * @param {Object} payload { url, type, title, isHeadshot, isPrimary }
   */
  async addMedia(payload) {
    if (!isRealMode("media")) {
      const mockItem = {
        id: "med_mock_" + Date.now(),
        url: payload.url,
        type: payload.type || "photo",
        title: payload.title || "Untitled",
        status: "Pending",
        createdAt: new Date().toISOString(),
        ...payload,
      };
      return {
        success: true,
        data: mapMedia(mockItem),
      };
    }

    const res = await apiClient.post("/api/media", payload);
    const doc = res?.data || res;
    return {
      success: true,
      data: doc ? mapMedia(doc) : null,
    };
  },

  /**
   * Update media metadata
   * @param {string} mediaId
   * @param {Object} payload
   */
  async updateMedia(mediaId, payload) {
    if (!isRealMode("media")) {
      return {
        success: true,
        data: mapMedia({ id: mediaId, ...payload }),
      };
    }

    const res = await apiClient.patch(`/api/media/${mediaId}`, payload);
    const doc = res?.data || res;
    return {
      success: true,
      data: doc ? mapMedia(doc) : null,
    };
  },

  /**
   * Delete a media item
   * @param {string} mediaId
   */
  async deleteMedia(mediaId) {
    if (!isRealMode("media")) {
      return {
        success: true,
        message: "Media deleted (Mock)",
      };
    }

    const res = await apiClient.delete(`/api/media/${mediaId}`);
    return {
      success: true,
      data: res?.data || res,
    };
  },

  /**
   * High-level upload helper: uploads binary file and registers media record
   * @param {File|Blob} file
   * @param {Object} options { type, title, isHeadshot }
   */
  async uploadFile(file, options = {}) {
    const uploadRes = await uploadMedia(file, options);
    if (!uploadRes.success) return uploadRes;

    return this.addMedia({
      url: uploadRes.url,
      type: options.type || "photo",
      title: options.title || file.name || "Upload",
      isHeadshot: options.isHeadshot || false,
    });
  },
};
