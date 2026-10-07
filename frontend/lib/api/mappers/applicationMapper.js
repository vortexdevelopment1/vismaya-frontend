/**
 * Application Entity Mapper
 */

import { toFrontendStatus, toBackendStatus } from "../statusMapper.js";

export function fromApi(app) {
  if (!app) return null;

  const id = app._id ? String(app._id) : (app.id ? String(app.id) : "");

  // Extract Opportunity info
  const oppObj = app.opportunityId && typeof app.opportunityId === "object" ? app.opportunityId : null;
  const opportunityId = oppObj ? String(oppObj._id || oppObj.id) : (app.opportunityId ? String(app.opportunityId) : "");
  const opportunityTitle = oppObj?.title || app.opportunityTitle || "";

  // Extract Talent info
  const talentObj = app.talentId && typeof app.talentId === "object" ? app.talentId : null;
  const talentId = talentObj ? String(talentObj._id || talentObj.id) : (app.talentId ? String(app.talentId) : "");
  const talentName = talentObj?.name || talentObj?.stageName || app.talentName || "Talent Candidate";
  const talentEmail = talentObj?.email || app.talentEmail || "";
  const talentAvatar = talentObj?.profilePhoto || talentObj?.avatar || app.talentAvatar || "";

  // Normalize custom answers
  const customAnswers = Array.isArray(app.customAnswers)
    ? app.customAnswers.map((ca) => ({
        questionId: ca.questionId ? String(ca.questionId) : "",
        questionText: ca.questionText || ca.question || "",
        answerText: ca.answerText || ca.answer || "",
      }))
    : [];

  return {
    id,
    _id: id,
    opportunityId,
    opportunityTitle,
    talentId,
    talentName,
    talentEmail,
    talentAvatar,
    roleId: app.roleId || `r-${opportunityId}-1`,
    roleName: app.roleName || oppObj?.role || "Lead Role",
    coverNote: app.coverNote || "",
    customAnswers,
    consentGiven: app.consentGiven !== undefined ? Boolean(app.consentGiven) : true,
    status: toFrontendStatus("application", app.status || "applied"),
    rawStatus: app.status || "applied",
    withdrawalReason: app.withdrawalReason || "",
    withdrawnAt: app.withdrawnAt ? new Date(app.withdrawnAt).toISOString() : null,
    reapplicationRequested: Boolean(app.reapplicationRequested),
    reapplicationRequestReason: app.reapplicationRequestReason || "",
    reapplicationApproved: Boolean(app.reapplicationApproved),
    selectedAt: app.selectedAt ? new Date(app.selectedAt).toISOString() : null,
    notSelectedAt: app.notSelectedAt ? new Date(app.notSelectedAt).toISOString() : null,
    notSelectedReason: app.notSelectedReason || "",
    createdAt: app.createdAt ? new Date(app.createdAt).toISOString() : new Date().toISOString(),
    appliedAt: app.createdAt ? new Date(app.createdAt).toISOString() : new Date().toISOString(),
  };
}

export function toApi(app) {
  if (!app) return {};

  const payload = {
    opportunityId: app.opportunityId,
    coverNote: app.coverNote?.trim(),
    customAnswers: Array.isArray(app.customAnswers)
      ? app.customAnswers.map((ca) => ({
          questionId: ca.questionId,
          questionText: ca.questionText || ca.question || "",
          answerText: ca.answerText || ca.answer || "",
        }))
      : [],
    consentGiven: app.consentGiven !== undefined ? Boolean(app.consentGiven) : true,
  };

  if (app.status) {
    payload.status = toBackendStatus("application", app.status);
  }

  if (app.withdrawalReason) {
    payload.withdrawalReason = app.withdrawalReason;
  }

  if (app.reapplicationRequestReason) {
    payload.reapplicationRequestReason = app.reapplicationRequestReason;
  }

  return payload;
}

export default {
  fromApi,
  toApi,
};
