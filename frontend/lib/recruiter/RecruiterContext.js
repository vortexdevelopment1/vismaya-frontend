"use client";

import React, { createContext, useContext, useState } from "react";
import {
  initialCompanyProfile,
  initialRequirements,
  initialShortlistedTalent,
  initialRecruiterNotifications,
  initialRecentActivity,
} from "./mockData";

const RecruiterContext = createContext(null);

export function RecruiterProvider({ children }) {
  // 1. Company Profile State
  const [companyProfile, setCompanyProfile] = useState(initialCompanyProfile);

  // 2. Requirements State
  const [requirements, setRequirements] = useState(initialRequirements);

  // 3. Shortlisted Talent State (keyed by reqId)
  const [shortlistedTalent, setShortlistedTalent] = useState(initialShortlistedTalent);

  // 4. Notifications State
  const [notifications, setNotifications] = useState(initialRecruiterNotifications);

  // 5. Activity Feed State
  const [activities, setActivities] = useState(initialRecentActivity);

  // 6. Toasts State
  const [toasts, setToasts] = useState([]);

  // Toast Helpers
  const addToast = ({ type = "success", title, message, duration = 4000 }) => {
    const id = "toast_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, type, title, message }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Requirement Actions
  const addRequirement = (reqData, isDraft = false) => {
    // // TODO: API - POST /api/recruiter/requirements
    const newId = "req-" + Date.now().toString().slice(-4);
    const newReq = {
      id: newId,
      title: reqData.title || "Untitled Requirement",
      type: reqData.type || "Film",
      description: reqData.description || "",
      locations: reqData.locations || "Mumbai",
      shootStartDate: reqData.shootStartDate || "",
      shootEndDate: reqData.shootEndDate || "",
      submittedDate: new Date().toISOString().split("T")[0],
      status: isDraft ? "Draft" : "Submitted",
      statusStage: isDraft ? 0 : 1,
      budgetType: reqData.budgetType || "Paid",
      budgetRange: reqData.budgetRange || "Negotiable",
      deadline: reqData.deadline || "",
      requiredMaterials: reqData.requiredMaterials || ["Commercial Headshot", "Audition Monologue Self-Tape"],
      roles: reqData.roles && reqData.roles.length > 0 ? reqData.roles : [
        {
          id: "r-" + Date.now(),
          roleName: "Character Role",
          artistsCount: 1,
          ageRange: "20 - 30 years",
          gender: "Any",
          look: "Contemporary",
          language: "Hindi",
          skills: "Camera Acting",
          notes: "",
        },
      ],
      applicantsCount: 0,
      hasShortlist: false,
      shortlistCount: 0,
      shortlistFeedbackSent: false,
      adminNote: isDraft
        ? null
        : "Sent to Admin for review. Admin may contact you to clarify details.",
    };

    setRequirements((prev) => [newReq, ...prev]);

    // Activity Log
    setActivities((prev) => [
      {
        id: "act-" + Date.now(),
        title: isDraft ? "Requirement Draft Saved" : "New Requirement Submitted",
        description: `"${newReq.title}" (${newReq.type}) ${isDraft ? "saved as draft" : "sent for Admin review"}`,
        time: "Just now",
        type: "requirement",
      },
      ...prev,
    ]);

    // Notification Log
    if (!isDraft) {
      setNotifications((prev) => [
        {
          id: "r-notif-" + Date.now(),
          title: `Requirement Submitted: ${newReq.title}`,
          message: "Your casting requirement is in the queue for Admin review and verification.",
          type: "Requirements",
          time: "Just now",
          read: false,
          actionHref: "/recruiter/my-requirements",
          badge: "Submitted",
        },
        ...prev,
      ]);
    }

    addToast({
      type: isDraft ? "info" : "success",
      title: isDraft ? "Draft Saved" : "Requirement Submitted to Admin",
      message: isDraft
        ? `"${newReq.title}" saved to your drafts.`
        : `"${newReq.title}" is queued for Admin review and will be published soon.`,
    });

    return newReq;
  };

  const updateRequirement = (id, updatedData) => {
    // // TODO: API - PUT /api/recruiter/requirements/:id
    setRequirements((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updatedData } : r))
    );

    addToast({
      type: "success",
      title: "Requirement Updated",
      message: "Casting requirement details have been updated.",
    });
  };

  const deleteRequirement = (id) => {
    // // TODO: API - DELETE /api/recruiter/requirements/:id
    const target = requirements.find((r) => r.id === id);
    setRequirements((prev) => prev.filter((r) => r.id !== id));

    addToast({
      type: "info",
      title: "Requirement Deleted",
      message: target ? `"${target.title}" has been deleted.` : "Requirement removed.",
    });
  };

  // Candidate Selection & Rating Feedback
  const setCandidatePreference = ({ reqId, candidateId, selectionStatus, starRating }) => {
    // // TODO: API - PATCH /api/recruiter/shortlists/:reqId/candidate/:candidateId
    setShortlistedTalent((prev) => {
      const currentList = prev[reqId] || [];
      const updatedList = currentList.map((cand) => {
        if (cand.id === candidateId) {
          return {
            ...cand,
            selectionStatus: selectionStatus !== undefined ? selectionStatus : cand.selectionStatus,
            starRating: starRating !== undefined ? starRating : cand.starRating,
          };
        }
        return cand;
      });
      return { ...prev, [reqId]: updatedList };
    });
  };

  // Send Feedback to Admin and Lock Preferences
  const sendFeedbackToAdmin = (reqId) => {
    // // TODO: API - POST /api/recruiter/shortlists/:reqId/feedback
    setRequirements((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, shortlistFeedbackSent: true } : r))
    );

    const targetReq = requirements.find((r) => r.id === reqId);

    setNotifications((prev) => [
      {
        id: "r-notif-" + Date.now(),
        title: `Candidate Feedback Sent: ${targetReq ? targetReq.title : "Project"}`,
        message: "Your preferences and star ratings have been received. Vismaya Admin will coordinate audition call sheets and scheduling.",
        type: "Shortlists",
        time: "Just now",
        read: false,
        actionHref: `/recruiter/shortlisted-talent?req=${reqId}`,
        badge: "Feedback Sent",
      },
      ...prev,
    ]);

    addToast({
      type: "success",
      title: "Feedback Sent to Admin",
      message: "Feedback sent. Vismaya will handle scheduling and booking.",
    });
  };

  // Notification Actions
  const markAsRead = (id) => {
    // // TODO: API - PATCH /api/recruiter/notifications/:id/read
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    // // TODO: API - POST /api/recruiter/notifications/mark-all-read
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    addToast({
      type: "success",
      title: "All Marked as Read",
      message: "All recruiter notifications have been marked as read.",
    });
  };

  // Company Profile Actions
  const updateCompanyProfile = (updatedFields) => {
    // // TODO: API - PUT /api/recruiter/profile
    setCompanyProfile((prev) => ({ ...prev, ...updatedFields }));

    addToast({
      type: "success",
      title: "Company Profile Saved",
      message: "Recruiter corporate information updated successfully.",
    });
  };

  // Derived Counts
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;
  const shortlistsReadyCount = requirements.filter(
    (r) => r.hasShortlist && !r.shortlistFeedbackSent && r.status !== "Closed"
  ).length;

  return (
    <RecruiterContext.Provider
      value={{
        companyProfile,
        updateCompanyProfile,
        requirements,
        addRequirement,
        updateRequirement,
        deleteRequirement,
        shortlistedTalent,
        setCandidatePreference,
        sendFeedbackToAdmin,
        notifications,
        markAsRead,
        markAllAsRead,
        unreadNotificationsCount,
        shortlistsReadyCount,
        activities,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </RecruiterContext.Provider>
  );
}

export function useRecruiter() {
  const context = useContext(RecruiterContext);
  if (!context) {
    throw new Error("useRecruiter must be used within a RecruiterProvider");
  }
  return context;
}
