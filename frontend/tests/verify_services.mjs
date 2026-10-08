/**
 * Verification Test: Frontend Service Layer Contract Integrity
 * 
 * Verifies that API service functions exist, can be executed safely,
 * and return well-formed API responses across all domain service modules.
 * Mode: STUB/MOCK contract test (no live backend server required).
 */

import {
  authService,
  talentService,
  recruiterService,
  adminService,
  publicService,
  notificationService,
  mediaService,
  paymentService,
  verificationService,
} from "../lib/api/services/index.js";

async function runServicesTest() {
  console.log("===============================================================");
  console.log("  RUNNING SERVICE LAYER CONTRACT INTEGRITY VERIFICATION");
  console.log("  Mode: Stub/Mock Mode (Deterministic offline test)");
  console.log("===============================================================\n");

  const results = [];

  async function testServiceMethod(serviceName, methodName, methodFn, args = []) {
    try {
      if (typeof methodFn !== "function") {
        throw new Error(`Method ${methodName} is not a function (got ${typeof methodFn})`);
      }
      const res = await methodFn.apply(
        serviceName === "authService" ? authService :
        serviceName === "talentService" ? talentService :
        serviceName === "recruiterService" ? recruiterService :
        serviceName === "adminService" ? adminService :
        serviceName === "publicService" ? publicService :
        serviceName === "notificationService" ? notificationService :
        serviceName === "mediaService" ? mediaService :
        serviceName === "paymentService" ? paymentService :
        verificationService,
        args
      );
      const isSuccess = res && typeof res === "object" && res.success !== false;
      results.push({
        service: serviceName,
        method: methodName,
        passed: isSuccess,
        details: isSuccess ? "OK" : "Returned non-success envelope",
      });
    } catch (err) {
      results.push({
        service: serviceName,
        method: methodName,
        passed: false,
        details: err?.message || String(err),
      });
    }
  }

  // 1. Auth Service
  await testServiceMethod("authService", "login", authService.login, [{ email: "test@example.com", password: "password" }]);
  await testServiceMethod("authService", "register", authService.register, [{ email: "new@example.com", password: "password", role: "talent" }]);
  await testServiceMethod("authService", "forgotPassword", authService.forgotPassword, [{ email: "user@example.com" }]);
  await testServiceMethod("authService", "verifyOtp", authService.verifyOtp, [{ email: "user@example.com", otp: "123456" }]);
  await testServiceMethod("authService", "resetPassword", authService.resetPassword, [{ email: "user@example.com", otp: "123456", newPassword: "NewPass123!" }]);
  await testServiceMethod("authService", "changePassword", authService.changePassword, [{ currentPassword: "Old123!", newPassword: "New123!" }]);
  await testServiceMethod("authService", "getSessions", authService.getSessions);
  await testServiceMethod("authService", "revokeSession", authService.revokeSession, ["sess_123"]);
  await testServiceMethod("authService", "revokeAllSessions", authService.revokeAllSessions);
  await testServiceMethod("authService", "logout", authService.logout);

  // 2. Talent Service
  await testServiceMethod("talentService", "getMyProfile", talentService.getMyProfile);
  await testServiceMethod("talentService", "saveProfile", talentService.saveProfile, [{ personalDetails: { stageName: "Test" } }]);
  await testServiceMethod("talentService", "getCompletionStatus", talentService.getCompletionStatus);
  await testServiceMethod("talentService", "getMyAnalytics", talentService.getMyAnalytics);
  await testServiceMethod("talentService", "getMyApplications", talentService.getMyApplications);
  await testServiceMethod("talentService", "applyToOpportunity", talentService.applyToOpportunity, ["opp-101", { roleId: "r-1" }]);
  await testServiceMethod("talentService", "withdrawApplication", talentService.withdrawApplication, ["app-101"]);
  await testServiceMethod("talentService", "getMyAuditions", talentService.getMyAuditions);
  await testServiceMethod("talentService", "submitSelfTape", talentService.submitSelfTape, ["aud-101", { selfTapeUrl: "https://example.com/tape.mp4" }]);

  // 3. Recruiter Service
  await testServiceMethod("recruiterService", "getOrganizationProfile", recruiterService.getOrganizationProfile);
  await testServiceMethod("recruiterService", "saveOrganizationProfile", recruiterService.saveOrganizationProfile, [{ name: "Studio A" }]);
  await testServiceMethod("recruiterService", "getMyProjects", recruiterService.getMyProjects);
  await testServiceMethod("recruiterService", "getProjectById", recruiterService.getProjectById, ["proj-1"]);
  await testServiceMethod("recruiterService", "createProject", recruiterService.createProject, [{ title: "Project X" }]);
  await testServiceMethod("recruiterService", "updateProject", recruiterService.updateProject, ["proj-1", { title: "Updated Project X" }]);
  await testServiceMethod("recruiterService", "getMyOpportunities", recruiterService.getMyOpportunities);
  await testServiceMethod("recruiterService", "createOpportunity", recruiterService.createOpportunity, [{ title: "Role Y" }]);
  await testServiceMethod("recruiterService", "requestOpportunityCancellation", recruiterService.requestOpportunityCancellation, ["opp-101", { reason: "Postponed" }]);
  await testServiceMethod("recruiterService", "getOpportunityApplications", recruiterService.getOpportunityApplications, ["opp-101"]);
  await testServiceMethod("recruiterService", "markApplicationUnderReview", recruiterService.markApplicationUnderReview, ["app-101"]);
  await testServiceMethod("recruiterService", "shortlistApplication", recruiterService.shortlistApplication, ["app-101"]);
  await testServiceMethod("recruiterService", "selectApplication", recruiterService.selectApplication, ["app-101"]);
  await testServiceMethod("recruiterService", "markNotSelected", recruiterService.markNotSelected, ["app-101"]);
  await testServiceMethod("recruiterService", "requestAudition", recruiterService.requestAudition, ["app-101", { type: "self_tape" }]);
  await testServiceMethod("recruiterService", "reviewAudition", recruiterService.reviewAudition, ["aud-101", { rating: 5 }]);
  await testServiceMethod("recruiterService", "getCreditBalance", recruiterService.getCreditBalance);
  await testServiceMethod("recruiterService", "getCreditHistory", recruiterService.getCreditHistory);
  await testServiceMethod("recruiterService", "unlockTalentProfile", recruiterService.unlockTalentProfile, ["tal-904"]);
  await testServiceMethod("recruiterService", "getFavourites", recruiterService.getFavourites);

  // 4. Admin Service
  await testServiceMethod("adminService", "getDashboardStats", adminService.getDashboardStats);
  await testServiceMethod("adminService", "getAllUsers", adminService.getAllUsers);
  await testServiceMethod("adminService", "getPendingUsers", adminService.getPendingUsers);
  await testServiceMethod("adminService", "approveUser", adminService.approveUser, ["user-101"]);
  await testServiceMethod("adminService", "rejectUser", adminService.rejectUser, ["user-101", { reason: "Incomplete" }]);
  await testServiceMethod("adminService", "suspendUser", adminService.suspendUser, ["user-101", { reason: "Policy violation" }]);
  await testServiceMethod("adminService", "reactivateUser", adminService.reactivateUser, ["user-101"]);
  await testServiceMethod("adminService", "getPendingOpportunities", adminService.getPendingOpportunities);
  await testServiceMethod("adminService", "approveOpportunity", adminService.approveOpportunity, ["opp-101"]);
  await testServiceMethod("adminService", "rejectOpportunity", adminService.rejectOpportunity, ["opp-101", { reason: "Invalid format" }]);
  await testServiceMethod("adminService", "requestOpportunityCorrections", adminService.requestOpportunityCorrections, ["opp-101", { reason: "Add dates" }]);
  await testServiceMethod("adminService", "reviewOpportunityCancellation", adminService.reviewOpportunityCancellation, ["opp-101", { approved: true }]);
  await testServiceMethod("adminService", "getPendingVerifications", adminService.getPendingVerifications);
  await testServiceMethod("adminService", "reviewVerification", adminService.reviewVerification, ["ver-101", { status: "approved" }]);
  await testServiceMethod("adminService", "getAuditLogs", adminService.getAuditLogs);
  await testServiceMethod("adminService", "globalSearch", adminService.globalSearch, ["casting"]);
  await testServiceMethod("adminService", "getAnalytics", adminService.getAnalytics);
  await testServiceMethod("adminService", "listTalents", adminService.listTalents);
  await testServiceMethod("adminService", "listOrganizations", adminService.listOrganizations);
  await testServiceMethod("adminService", "getCancellationRequests", adminService.getCancellationRequests);
  await testServiceMethod("adminService", "getAuditionsForRelay", adminService.getAuditionsForRelay);
  await testServiceMethod("adminService", "relayAudition", adminService.relayAudition, ["aud-101"]);
  await testServiceMethod("adminService", "forwardAudition", adminService.forwardAudition, ["aud-101"]);
  await testServiceMethod("adminService", "getMediaForModeration", adminService.getMediaForModeration);
  await testServiceMethod("adminService", "moderateMedia", adminService.moderateMedia, ["med-101", { status: "approved" }]);
  await testServiceMethod("adminService", "getSystemFeed", adminService.getSystemFeed);
  await testServiceMethod("adminService", "getBroadcasts", adminService.getBroadcasts);
  await testServiceMethod("adminService", "getBroadcastById", adminService.getBroadcastById, ["bc-101"]);
  await testServiceMethod("adminService", "sendBroadcast", adminService.sendBroadcast, [{ title: "Notice", message: "System maintenance" }]);
  await testServiceMethod("adminService", "updateBroadcast", adminService.updateBroadcast, ["bc-101", { title: "Updated Notice" }]);
  await testServiceMethod("adminService", "deleteBroadcast", adminService.deleteBroadcast, ["bc-101"]);
  await testServiceMethod("adminService", "getBroadcastReach", adminService.getBroadcastReach);

  // 5. Public Service
  await testServiceMethod("publicService", "getPublishedOpportunities", publicService.getPublishedOpportunities);
  await testServiceMethod("publicService", "getOpportunityById", publicService.getOpportunityById, ["opp-101"]);
  await testServiceMethod("publicService", "searchTalentDirectory", publicService.searchTalentDirectory);
  await testServiceMethod("publicService", "getFeaturedTalent", publicService.getFeaturedTalent);
  await testServiceMethod("publicService", "getPublicTalentProfile", publicService.getPublicTalentProfile, ["priya-sharma"]);
  await testServiceMethod("publicService", "getPlatformStats", publicService.getPlatformStats);
  await testServiceMethod("publicService", "getSuccessStories", publicService.getSuccessStories);
  await testServiceMethod("publicService", "submitContactForm", publicService.submitContactForm, [{ name: "A", email: "a@b.com", message: "Hi" }]);

  // 6. Notification Service
  await testServiceMethod("notificationService", "getMyNotifications", notificationService.getMyNotifications);
  await testServiceMethod("notificationService", "getUnreadCount", notificationService.getUnreadCount);
  await testServiceMethod("notificationService", "markAsRead", notificationService.markAsRead, ["notif-101"]);
  await testServiceMethod("notificationService", "markAllAsRead", notificationService.markAllAsRead);

  // 7. Media Service
  await testServiceMethod("mediaService", "getMyMedia", mediaService.getMyMedia);
  await testServiceMethod("mediaService", "getUserMedia", mediaService.getUserMedia, ["usr-101"]);
  await testServiceMethod("mediaService", "addMedia", mediaService.addMedia, [{ url: "https://images.unsplash.com/photo-1", type: "photo" }]);
  await testServiceMethod("mediaService", "updateMedia", mediaService.updateMedia, ["med-101", { title: "Updated" }]);
  await testServiceMethod("mediaService", "deleteMedia", mediaService.deleteMedia, ["med-101"]);

  // 8. Payment & Verification Services
  await testServiceMethod("paymentService", "createPaymentOrder", paymentService.createPaymentOrder, [{ packageId: "pkg_basic" }]);
  await testServiceMethod("paymentService", "verifyPayment", paymentService.verifyPayment, [{ razorpay_payment_id: "pay_123" }]);
  await testServiceMethod("paymentService", "getMyTransactions", paymentService.getMyTransactions);
  await testServiceMethod("verificationService", "submitIdentityVerification", verificationService.submitIdentityVerification, [{ documentType: "aadhaar", documentNumber: "1234" }]);
  await testServiceMethod("verificationService", "submitProfessionalVerification", verificationService.submitProfessionalVerification, [{ imdbUrl: "https://imdb.com" }]);
  await testServiceMethod("verificationService", "submitBusinessVerification", verificationService.submitBusinessVerification, [{ cin: "U12345" }]);
  await testServiceMethod("verificationService", "getMyVerifications", verificationService.getMyVerifications);

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`\n===============================================================`);
  console.log(`  VERIFICATION RESULTS: ${passed}/${results.length} PASSED (${failed} failed)`);
  console.log(`===============================================================\n`);

  if (failed > 0) {
    console.error("Failures:");
    results.filter((r) => !r.passed).forEach((f) => {
      console.error(`  - [${f.service}.${f.method}] ${f.details}`);
    });
    process.exit(1);
  } else {
    console.log("All tested API service functions executed successfully!");
  }
}

runServicesTest().catch((err) => {
  console.error("Test runner failed:", err);
  process.exit(1);
});
