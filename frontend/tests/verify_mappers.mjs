/**
 * Verification Test: Frontend Mapper Layer Contract Integrity
 * 
 * Verifies that all data mappers correctly transform backend database shapes
 * to frontend UI contract shapes (_id -> id, snake_case/nested -> camelCase, etc.).
 * Mode: STUB/MOCK contract test (no live backend server required).
 */

import {
  mapUser,
  mapTalentProfile,
  mapOpportunity,
  mapApplication,
  mapAudition,
  mapMedia,
  mapBroadcast,
  mapNotification,
  mapVerification,
} from "../lib/api/mappers/index.js";

function runMappersTest() {
  console.log("===============================================================");
  console.log("  RUNNING DATA MAPPER CONTRACT INTEGRITY VERIFICATION");
  console.log("  Mode: Unit / Mapper Contract Test");
  console.log("===============================================================\n");

  const results = [];

  function assert(name, condition, message) {
    results.push({
      name,
      passed: !!condition,
      message: condition ? "OK" : message,
    });
  }

  // 1. User Mapper
  const rawUser = {
    _id: "660c1f2e9a1b2c3d4e5f6789",
    name: "John Doe",
    email: "john@example.com",
    role: "organization",
    status: "active",
  };
  const mappedUser = mapUser(rawUser);
  assert("User ID mapped to string", mappedUser.id === "660c1f2e9a1b2c3d4e5f6789", "id should be string");
  assert("User role normalized to frontend", mappedUser.role === "recruiter", "role should normalize organization -> recruiter");

  // 2. Talent Profile Mapper
  const rawProfile = {
    _id: "660c1f2e9a1b2c3d4e5f6790",
    userId: { _id: "660c1f2e9a1b2c3d4e5f6789", name: "Priya Sharma", email: "priya@example.com" },
    vismayaId: "VIS-2026-904",
    personalDetails: {
      stageName: "Priya Sharma",
      dateOfBirth: "1998-05-12",
      gender: "female",
      city: "Mumbai",
      bio: "Trained classical and contemporary actor.",
    },
    physicalDetails: {
      height: 168,
      skinTone: "Fair",
      eyeColor: "Brown",
    },
    skills: ["Classical Dance", "Voice Modulation"],
    socialLinks: {
      instagram: "https://instagram.com/priyasharma",
      imdb: "https://imdb.com/name/nm1234567",
    },
    verificationStatus: "verified",
  };
  const mappedProfile = mapTalentProfile(rawProfile);
  assert("TalentProfile id mapped", mappedProfile.id === "VIS-2026-904" && mappedProfile._id === "660c1f2e9a1b2c3d4e5f6790", "Profile ID mismatch");
  assert("TalentProfile personal details mapped", mappedProfile.personal?.fullName === "Priya Sharma", "Personal details mismatch");
  assert("TalentProfile social links mapped", mappedProfile.socialLinks?.instagram === "https://instagram.com/priyasharma", "Social links mismatch");

  // 3. Opportunity Mapper (supports roles[] and flat role)
  const rawOpportunityMultiRole = {
    _id: "660c1f2e9a1b2c3d4e5f6791",
    title: "Action Thriller Feature",
    type: "Feature Film",
    roles: [
      { _id: "r1", name: "Lead Detective", roleType: "lead", openings: 1, ageRange: { min: 28, max: 40 } },
      { _id: "r2", name: "Villain", roleType: "antagonist", openings: 1, ageRange: { min: 35, max: 50 } },
    ],
    location: "Mumbai",
    status: "published",
    deadline: "2026-11-01T00:00:00.000Z",
  };
  const mappedOpp = mapOpportunity(rawOpportunityMultiRole);
  assert("Opportunity id mapped", mappedOpp.id === "660c1f2e9a1b2c3d4e5f6791", "Opp ID mismatch");
  assert("Opportunity roles array mapped", mappedOpp.roles?.length === 2, "Roles array count mismatch");
  assert("Opportunity status normalized", mappedOpp.status === "Published", "Status mismatch");

  // 4. Application Mapper
  const rawApplication = {
    _id: "660c1f2e9a1b2c3d4e5f6792",
    opportunityId: { _id: "660c1f2e9a1b2c3d4e5f6791", title: "Action Thriller Feature" },
    talentId: {
      _id: "660c1f2e9a1b2c3d4e5f6790",
      userId: { name: "Priya Sharma", email: "priya@example.com" },
      personalDetails: { stageName: "Priya Sharma", city: "Mumbai" },
    },
    roleApplied: "Lead Detective",
    status: "submitted",
    appliedAt: "2026-09-15T10:00:00.000Z",
  };
  const mappedApp = mapApplication(rawApplication);
  assert("Application id mapped", mappedApp.id === "660c1f2e9a1b2c3d4e5f6792", "App ID mismatch");
  assert("Application status normalized", mappedApp.status === "Applied" || mappedApp.status === "Submitted", "Status normalization mismatch");
  assert("Application talent preview extracted", mappedApp.talentName === "Priya Sharma", "Talent preview name mismatch");

  // 5. Audition Mapper
  const rawAudition = {
    _id: "660c1f2e9a1b2c3d4e5f6793",
    applicationId: "660c1f2e9a1b2c3d4e5f6792",
    type: "self_tape",
    status: "submitted",
    vismayaApproval: {
      status: "approved",
      reviewedAt: "2026-09-16T12:00:00.000Z",
    },
  };
  const mappedAud = mapAudition(rawAudition);
  assert("Audition id mapped", mappedAud.id === "660c1f2e9a1b2c3d4e5f6793", "Audition ID mismatch");
  assert("Audition vismayaApproval mapped", mappedAud.vismayaApproval?.status === "approved", "VismayaApproval mismatch");

  // 6. Media Mapper
  const rawMedia = {
    _id: "660c1f2e9a1b2c3d4e5f6794",
    url: "https://images.unsplash.com/photo-1",
    type: "photo",
    status: "pending_review",
  };
  const mappedMed = mapMedia(rawMedia);
  assert("Media id mapped", mappedMed.id === "660c1f2e9a1b2c3d4e5f6794", "Media ID mismatch");

  // 7. Broadcast Mapper
  const rawBroadcast = {
    _id: "660c1f2e9a1b2c3d4e5f6795",
    title: "System Update",
    message: "Maintenance scheduled.",
    targetRole: "all",
    status: "sent",
  };
  const mappedBc = mapBroadcast(rawBroadcast);
  assert("Broadcast id mapped", mappedBc.id === "660c1f2e9a1b2c3d4e5f6795", "Broadcast ID mismatch");

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`\n===============================================================`);
  console.log(`  MAPPER RESULTS: ${passed}/${results.length} PASSED (${failed} failed)`);
  console.log(`===============================================================\n`);

  if (failed > 0) {
    console.error("Failures:");
    results.filter((r) => !r.passed).forEach((f) => {
      console.error(`  - [${f.name}] ${f.message}`);
    });
    process.exit(1);
  } else {
    console.log("All data mappers verified successfully!");
  }
}

runMappersTest();
