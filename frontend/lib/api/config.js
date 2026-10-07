/**
 * API Configuration & Feature Flags
 * 
 * Provides per-module toggles for switching between Mock mode and Real Backend API mode.
 * Mock mode is the DEFAULT (NEXT_PUBLIC_USE_MOCK=true).
 */

const rawUseMock = process.env.NEXT_PUBLIC_USE_MOCK;
export const USE_MOCK = rawUseMock === undefined || rawUseMock === "" 
  ? true 
  : rawUseMock.toLowerCase() !== "false";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "");

export const SUPPORTED_MODULES = [
  "auth",
  "public",
  "talent",
  "recruiter",
  "admin",
  "notifications",
  "uploads",
  "payments"
];

// Comma-separated list of enabled modules when USE_MOCK is false (e.g. "auth,public")
const rawModules = (process.env.NEXT_PUBLIC_API_MODULES || "").toLowerCase().trim();
export const API_MODULES = rawModules
  ? rawModules.split(",").map((m) => m.trim()).filter(Boolean)
  : [];

/**
 * Checks whether a specific feature module should use the real backend API.
 * Returns false if global USE_MOCK is true.
 * If USE_MOCK is false, returns true if:
 *   - NEXT_PUBLIC_API_MODULES is empty, "*", or "all" (meaning all modules are real)
 *   - OR the specific module is included in NEXT_PUBLIC_API_MODULES
 *
 * @param {string} moduleName - e.g. "auth", "public", "talent", "recruiter", "admin", "notifications", "uploads", "payments"
 * @returns {boolean}
 */
export function isRealMode(moduleName) {
  if (USE_MOCK) return false;
  if (!moduleName) return true;
  if (API_MODULES.length === 0 || API_MODULES.includes("*") || API_MODULES.includes("all")) {
    return true;
  }
  return API_MODULES.includes(moduleName.toLowerCase().trim());
}

export const API_CONFIG = {
  USE_MOCK,
  API_URL,
  SUPPORTED_MODULES,
  API_MODULES,
  isRealMode,
};

export default API_CONFIG;
