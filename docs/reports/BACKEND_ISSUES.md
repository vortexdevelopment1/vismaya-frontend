# Vismaya Backend Integration Issue Report
**Document Version:** 1.0.0  
**Audit Date:** October 2026  
**Auditor:** Antigravity Integration Engine  
**Target Backend:** Express 5.2.1 / Mongoose 9.10.4 (`vismaya-backend (3)/vismaya-backend/src`)  
**Precedence Hierarchy:** Master Spec v2.0 (Oct 2026) > Round 28 Decisions > Phase 1 PRD  

---

## Executive Summary

During the comprehensive end-to-end integration and automated live smoke testing of the Vismaya platform, **11 backend defects and route gaps** were identified, reproduced, and logged. 

Per the **HARD RULES**, no backend source files have been modified. All backend issues are documented below with exact file and line references (`[CODE-READ]`), verbatim command execution outputs (`[RAN]`), Master Specification citations, suggested remediation code diffs, and assigned ownership to the Backend Development Team.

---

## Summary of Backend Issues by Severity

| Severity | Count | Issue IDs |
|---|:---:|---|
| **Blocker** | 1 | `BK-001` |
| **High** | 3 | `BK-002`, `BK-009`, `BK-011` |
| **Medium** | 5 | `BK-003`, `BK-004`, `BK-005`, `BK-006`, `BK-007` |
| **Low** | 2 | `BK-008`, `BK-010` |
| **Total** | **11** | |

---

## Detailed Backend Issues Table

| ID | Severity | Area | What is Wrong | Evidence (`[CODE-READ]` / `[RAN]`) | Spec Reference | Suggested Fix | Owner |
|---|---|---|---|---|---|---|---|
| **BK-001** | **Blocker** | Routes / Organization | `organization.routes.js` registers parameterized wildcard `GET /:slug` on line 39 **before** explicit routes `GET /profile` (line 49) and `GET /favourites` (line 88). Express matches `/profile` and `/favourites` as slug parameters, causing both authenticated endpoints to return HTTP 404. | `[CODE-READ]` [organization.routes.js:39-88](file:///c:/Users/kishu/OneDrive/Desktop/vortex/vismaya-2/vismaya-backend%20(3)/vismaya-backend/src/routes/organization.routes.js#L39-L88)<br>`[RAN]` `frontend/tests/live_backend_smoke.mjs` lines 5b/5c returned HTTP 404: `{"success":false,"message":"Organization not found"}` | Master Spec v2.0 §12, §30 | Move `router.get("/:slug", ...)` to the very bottom of `organization.routes.js` below all static and specific routes. | Backend Dev |
| **BK-002** | **High** | Credits & Billing | `POST /api/credits/unlock/:talentId` successfully executes and unlocks a talent profile even when the recruiter's `creditBalance` is 0 or negative. The controller fails to assert `organization.creditBalance > 0` before granting access. | `[CODE-READ]` [credit.controller.js:42-78](file:///c:/Users/kishu/OneDrive/Desktop/vortex/vismaya-2/vismaya-backend%20(3)/vismaya-backend/src/controllers/credit.controller.js#L42-L78)<br>`[RAN]` `frontend/tests/live_backend_smoke.mjs` test 13b returned HTTP 200: `{"success":true,"message":"Profile unlocked successfully (1 credit consumed)"}` with 0 balance. | Master Spec v2.0 §12, §29 ("100 included credits, full profile = 1 credit") | In `unlockTalentProfile`, add guard: `if (organization.creditBalance < 1) return res.status(402).json({ success: false, message: "Insufficient credits. Please purchase a credit pack." });` | Backend Dev |
| **BK-003** | **Medium** | Public / Contact | Backend has no route handler or controller for contact form submissions (`POST /api/contact` or `POST /contact`). Submissions fail or have no backend persistence/email notification handler. | `[CODE-READ]` [app.js:65-90](file:///c:/Users/kishu/OneDrive/Desktop/vortex/vismaya-2/vismaya-backend%20(3)/vismaya-backend/src/app.js#L65-L90)<br>`[RAN]` `audit_routes_services.mjs` flagged `publicService.submitContactForm` as UNROUTED | Master Spec v2.0 §3, §37 | Create `src/routes/contact.routes.js` and `src/controllers/contact.controller.js` to accept `{ name, email, subject, message }`, store in DB and trigger email to `contact@vismaya.io`. | Backend Dev |
| **BK-004** | **Medium** | Public / Stats | Backend does not expose `GET /api/public/stats` for live landing page metrics (total talent, active productions, auditions hosted). | `[CODE-READ]` [app.js:65-90](file:///c:/Users/kishu/OneDrive/Desktop/vortex/vismaya-2/vismaya-backend%20(3)/vismaya-backend/src/app.js#L65-L90)<br>`[RAN]` `audit_routes_services.mjs` flagged `publicService.getPublicStats` as UNROUTED | Master Spec v2.0 §3, §10 | Add `GET /api/public/stats` aggregating verified talent count, completed opportunities, and active production companies. | Backend Dev |
| **BK-005** | **Medium** | Admin / Broadcasts | Backend does not implement Admin broadcast creation or listing (`POST /api/admin/broadcasts`, `GET /api/admin/broadcasts`, `DELETE /api/admin/broadcasts/:id`). | `[CODE-READ]` [admin.routes.js:1-98](file:///c:/Users/kishu/OneDrive/Desktop/vortex/vismaya-2/vismaya-backend%20(3)/vismaya-backend/src/routes/admin.routes.js#L1-L98)<br>`[RAN]` `audit_routes_services.mjs` flagged `adminService.createBroadcast` as UNROUTED | Master Spec v2.0 §44 (Super Admin modules) | Implement `Broadcast` schema and routes under `/api/admin/broadcasts`. | Backend Dev |
| **BK-006** | **Medium** | Admin / Analytics | Backend lacks dedicated multi-dimensional analytics endpoint (`GET /api/admin/analytics`). Only basic single-point metrics (`GET /api/admin/metrics/dashboard`) exist. | `[CODE-READ]` [admin.routes.js:70-98](file:///c:/Users/kishu/OneDrive/Desktop/vortex/vismaya-2/vismaya-backend%20(3)/vismaya-backend/src/routes/admin.routes.js#L70-L98)<br>`[RAN]` `audit_routes_services.mjs` flagged `adminService.getAnalyticsData` as UNROUTED | Master Spec v2.0 §44 | Add `GET /api/admin/analytics` returning time-series registrations, revenue by pack, audition throughput, and verification conversion rates. | Backend Dev |
| **BK-007** | **Medium** | Admin / Directories | Backend lacks global cross-organization listing endpoints for Admin: `GET /api/admin/projects`, `GET /api/admin/applications`, `GET /api/admin/opportunities`. Admin can only view pending opportunities (`/api/admin/opportunities/pending`). | `[CODE-READ]` [admin.routes.js:50-80](file:///c:/Users/kishu/OneDrive/Desktop/vortex/vismaya-2/vismaya-backend%20(3)/vismaya-backend/src/routes/admin.routes.js#L50-L80) | Master Spec v2.0 §44 | Add admin list-all endpoints with pagination, filters, and status queries across all organizations and talent. | Backend Dev |
| **BK-008** | **Low** | Opportunities | Backend has no hard `DELETE /api/opportunities/:id` route. It only supports cancellation requests (`POST /api/opportunities/:id/cancel-request`) and completion (`POST /api/opportunities/:id/complete`). | `[CODE-READ]` [opportunity.routes.js:46-60](file:///c:/Users/kishu/OneDrive/Desktop/vortex/vismaya-2/vismaya-backend%20(3)/vismaya-backend/src/routes/opportunity.routes.js#L46-L60) | Round 28 Item 17, Master Spec §31 | Retain cancellation flow as primary; add draft deletion (`DELETE /api/opportunities/:id`) if opportunity is still in `draft` status. | Backend Dev |
| **BK-009** | **High** | Admin / Audit Logging | `AdminAuditLog` model schema validation fails on opportunity approval because `targetType: "opportunity"` is missing from the enum definition in `AdminAuditLog.model.js`. | `[CODE-READ]` [audit.service.js:11](file:///c:/Users/kishu/OneDrive/Desktop/vortex/vismaya-2/vismaya-backend%20(3)/vismaya-backend/src/services/audit.service.js#L11)<br>`[RAN]` Live server console log: `ValidationError: AdminAuditLog validation failed: targetType: 'opportunity' is not a valid enum value for path 'targetType'` | Master Spec v2.0 §44 (Audit Trail) | Add `'opportunity'` and `'audition'` to `targetType` enum list in `src/models/adminAuditLog.model.js`. | Backend Dev |
| **BK-010** | **Low** | Auditions | Backend unifies relay and forward into a single approval endpoint (`PATCH /api/admin/auditions/:id/approve` / `PUT /api/admin/auditions/:id/review`). There is no multi-stage relay pipeline in Express. | `[CODE-READ]` [admin.controller.js:510-535](file:///c:/Users/kishu/OneDrive/Desktop/vortex/vismaya-2/vismaya-backend%20(3)/vismaya-backend/src/controllers/admin.controller.js#L510-L535) | Master Spec v2.0 §33, Round 28 Item 10 | Document single-action admin review as intended product workflow or add separate relay state machine if required. | Backend Dev |
| **BK-011** | **High** | Privacy & Data Masking | `GET /api/talent/profile` and public search queries return raw unmasked contact details (mobile, email, address) if not explicitly projected out at controller level. | `[CODE-READ]` [talent.controller.js:80-110](file:///c:/Users/kishu/OneDrive/Desktop/vortex/vismaya-2/vismaya-backend%20(3)/vismaya-backend/src/controllers/talent.controller.js#L80-L110) | Master Spec v2.0 §39, §49 (Privacy Matrix) | Ensure Mongoose queries apply projection: `.select('-user.email -user.mobile -address -guardianContact')` unless unlocked via credit transaction. | Backend Dev |

---

## Detailed Defect Deep Dives & Verification Evidence

### 1. BK-001: Route Order Shadowing in `organization.routes.js`
- **Location:** `vismaya-backend (3)/vismaya-backend/src/routes/organization.routes.js:39`
- **The Defect:** Express router evaluates routes in the exact order they are mounted. Because `router.get("/:slug", ...)` is registered before `router.get("/profile", ...)` and `router.get("/favourites", ...)`, Express treats `"profile"` and `"favourites"` as the `:slug` string parameter.
- **Verification Evidence `[RAN]`:**
```bash
# Executing live HTTP GET /api/organization/profile with valid Recruiter JWT
HTTP/1.1 404 Not Found
Content-Type: application/json; charset=utf-8
{
  "success": false,
  "message": "Organization not found"
}
```
- **Remediation Code Diff:**
```diff
--- a/src/routes/organization.routes.js
+++ b/src/routes/organization.routes.js
@@ -36,8 +36,6 @@ router.get("/public/:slug", optionalAuth, organizationController.getPublicOrgan
 // Public / General Route
-router.get("/:slug", optionalAuth, organizationController.getPublicOrganizationBySlug);
-
 // Protected routes (Organization only)
 router.get("/profile", authenticate, authorizeRole("organization"), organizationController.getOrganizationProfile);
 router.post("/profile", authenticate, authorizeRole("organization"), organizationController.saveOrganizationProfile);
@@ -88,4 +86,7 @@ router.get("/favourites", authenticate, authorizeRole("organization"), organizat
 
+// Move slug wildcard to bottom
+router.get("/:slug", optionalAuth, organizationController.getPublicOrganizationBySlug);
+
 module.exports = router;
```

---

### 2. BK-002: Zero-Balance Credit Unlock Vulnerability
- **Location:** `vismaya-backend (3)/vismaya-backend/src/controllers/credit.controller.js:42-78`
- **The Defect:** When a recruiter calls `POST /api/credits/unlock/:talentId`, the controller decrements the credit count without verifying `creditBalance >= 1`.
- **Verification Evidence `[RAN]`:**
```javascript
// Ran via frontend/tests/live_backend_smoke.mjs
// Step 13a: Initial Balance
GET /api/credits/balance => { balance: 0 }
// Step 13b: Profile Unlock with 0 balance
POST /api/credits/unlock/6ac75a9bbafad66787a6e57f => HTTP 200 OK
{
  "success": true,
  "message": "Profile unlocked successfully (1 credit consumed)",
  "unlockedTalentId": "6ac75a9bbafad66787a6e57f"
}
```
- **Remediation Code Diff:**
```javascript
// In src/controllers/credit.controller.js
if (!organization || organization.creditBalance < 1) {
    return res.status(402).json({
        success: false,
        message: "Insufficient credit balance to unlock full profile. Please purchase credits."
    });
}
```

---

### 3. BK-009: `AdminAuditLog` Mongoose Enum Validation Failure
- **Location:** `vismaya-backend (3)/vismaya-backend/src/models/adminAuditLog.model.js` and `src/services/audit.service.js:11`
- **The Defect:** When admin approves an opportunity (`PATCH /api/admin/opportunities/:id/approve`), `audit.service.js` creates a log with `targetType: "opportunity"`. The Mongoose schema only permits `['user', 'media', 'verification', 'system']`.
- **Verification Evidence `[RAN]`:**
```
Audit log error: ValidationError: AdminAuditLog validation failed: targetType: `opportunity` is not a valid enum value for path `targetType`.
    at SchemaString.doValidate (node_modules/mongoose/lib/schemaType.js:1547:13)
    at model.create (node_modules/mongoose/lib/model.js:2807:5)
    at logAdminAction (src/services/audit.service.js:11:16)
    at approveOpportunity (src/controllers/admin.controller.js:399:9)
```
- **Remediation Code Diff:**
```diff
--- a/src/models/adminAuditLog.model.js
+++ b/src/models/adminAuditLog.model.js
@@ -14,7 +14,7 @@ const adminAuditLogSchema = new mongoose.Schema({
     targetType: {
         type: String,
         required: true,
-        enum: ['user', 'media', 'verification', 'system']
+        enum: ['user', 'media', 'verification', 'opportunity', 'audition', 'project', 'system']
     },
```

---

## Conclusion & Action Plan for Backend Dev
1. **Apply Route Order Fix (BK-001):** Resolves recruiter profile and favourites 404s immediately.
2. **Apply Credit Balance Guard (BK-002):** Secures talent profile access and payment pack monetisation.
3. **Extend AdminAuditLog Enum (BK-009):** Eliminates unhandled Mongoose validation warnings in production server logs.
4. **Implement Missing Public & Admin Endpoints (BK-003 to BK-007):** Unlocks full multi-dimensional admin analytics and live platform contact routing.
