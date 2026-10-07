/**
 * Media Upload Abstraction
 * 
 * In Mock Mode: Returns simulated / data URLs matching current prototype behavior.
 * In Real Mode: Throws or returns clear "storage provider not configured" error until
 *               a cloud storage provider (e.g., S3, Cloudinary, Supabase Storage) is integrated.
 */

import { USE_MOCK, isRealMode } from "./config.js";
import { ApiError } from "./client.js";

/**
 * Upload a media file (headshot, showreel, self-tape, verification document, logo).
 * 
 * @param {Object} params
 * @param {File|Blob|string} params.file - File to upload
 * @param {string} [params.category="other"] - "headshot", "showreel", "self_tape", "document", "logo"
 * @param {Function} [params.onProgress] - Optional progress callback (percent: number)
 * @returns {Promise<{ url: string, thumbnailUrl?: string, fileSizeBytes?: number, mimeType?: string }>}
 */
export async function uploadMedia({ file, category = "other", onProgress } = {}) {
  const realUploads = isRealMode("uploads");

  // In Mock Mode: return local blob URL / simulated URL
  if (!realUploads) {
    if (typeof file === "string") {
      return {
        url: file,
        thumbnailUrl: file,
        mimeType: "image/jpeg",
        fileSizeBytes: 1024 * 100,
      };
    }

    if (file instanceof Blob || (typeof File !== "undefined" && file instanceof File)) {
      if (onProgress) {
        onProgress(50);
        setTimeout(() => onProgress(100), 100);
      }

      // Convert to Object URL for browser preview in mock mode
      const mockUrl = URL.createObjectURL(file);
      return {
        url: mockUrl,
        thumbnailUrl: mockUrl,
        mimeType: file.type || "image/jpeg",
        fileSizeBytes: file.size || 0,
      };
    }

    return {
      url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
      mimeType: "image/jpeg",
      fileSizeBytes: 204800,
    };
  }

  // In Real Mode: Direct storage upload provider is pending infrastructure decision
  // CONTRACT-PENDING: Cloud storage provider (e.g. AWS S3 presigned URL or Cloudinary upload)
  throw new ApiError(
    "Cloud storage provider is not configured. Media direct upload requires a configured storage provider.",
    501,
    ["STORAGE_PROVIDER_NOT_CONFIGURED"]
  );
}

export default uploadMedia;
