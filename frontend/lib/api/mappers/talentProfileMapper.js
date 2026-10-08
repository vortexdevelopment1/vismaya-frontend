/**
 * Talent Profile Entity Mapper
 * 
 * Maps between backend TalentProfile nested schema and frontend UI components.
 */

function safeIsoDate(val, fallback = null) {
  if (!val) return fallback;
  const d = new Date(val);
  return !isNaN(d.getTime()) ? d.toISOString() : (typeof val === "string" ? val : fallback);
}

export function fromApi(profile) {
  if (!profile) return null;

  const id = profile._id ? String(profile._id) : (profile.id ? String(profile.id) : "");
  const userIdObj = profile.userId && typeof profile.userId === "object" ? profile.userId : null;
  const userId = userIdObj ? String(userIdObj._id || userIdObj.id) : (profile.userId ? String(profile.userId) : "");

  const userEmail = userIdObj?.email || profile.contactDetails?.email || profile.personal?.email || "";
  const userMobile = userIdObj?.mobile || profile.contactDetails?.mobile || profile.personal?.phone || "";
  const userName = userIdObj?.name || profile.contactDetails?.name || profile.personal?.fullName || "";

  const computedName = profile.stageName?.trim() || 
    profile.personal?.stageName?.trim() ||
    profile.personal?.fullName?.trim() ||
    profile.personal?.name?.trim() ||
    [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim() ||
    userName ||
    "Anonymous Talent";

  const primaryProfession = profile.primaryProfession || profile.primaryDesignation || profile.personal?.primaryRole || "";
  const location = [profile.currentCity || profile.personal?.city, profile.currentState || profile.personal?.state].filter(Boolean).join(", ") || profile.currentCity || profile.personal?.city || "India";

  // Normalize skills array: supports both [{ name, proficiency }] and ["Acting", "Dance"]
  const skillsList = Array.isArray(profile.skills)
    ? profile.skills.map((s) => (typeof s === "string" ? s : s?.name || "")).filter(Boolean)
    : (Array.isArray(profile.skillsAndLanguages?.skills) ? profile.skillsAndLanguages.skills : []);

  const languagesList = Array.isArray(profile.languages)
    ? profile.languages.map((l) => (typeof l === "string" ? l : l?.language || "")).filter(Boolean)
    : (Array.isArray(profile.skillsAndLanguages?.languages) ? profile.skillsAndLanguages.languages : []);

  const photosList = Array.isArray(profile.portfolio?.photos)
    ? profile.portfolio.photos
    : (Array.isArray(profile.photos) ? profile.photos : []);

  const videosList = Array.isArray(profile.portfolio?.videos)
    ? profile.portfolio.videos
    : (Array.isArray(profile.videos) ? profile.videos : []);

  const showreelUrl = profile.portfolio?.showreelUrl || profile.showreel || (videosList.length > 0 ? videosList[0] : "");

  return {
    id: profile.vismayaId || id,
    _id: id,
    vismayaId: profile.vismayaId || id,
    userId,
    name: computedName,
    stageName: profile.stageName || profile.personal?.stageName || "",
    firstName: profile.firstName || "",
    middleName: profile.middleName || "",
    lastName: profile.lastName || "",
    headline: profile.headline || "",
    bio: profile.bio || profile.personal?.bio || "",
    personal: {
      fullName: computedName,
      stageName: profile.stageName || profile.personal?.stageName || "",
      dob: profile.dob || profile.personal?.dob || "",
      gender: profile.gender || profile.personal?.gender || "",
      city: profile.currentCity || profile.personal?.city || "",
      state: profile.currentState || profile.personal?.state || "",
      email: userEmail,
      phone: userMobile,
      bio: profile.bio || profile.personal?.bio || "",
      primaryRole: primaryProfession,
    },
    profilePhoto: profile.profilePhoto || profile.avatar || photosList[0] || "",
    avatar: profile.profilePhoto || profile.avatar || photosList[0] || "",
    dob: safeIsoDate(profile.dob, profile.personal?.dob || "") ? safeIsoDate(profile.dob, profile.personal?.dob || "").split("T")[0] : (profile.personal?.dob || ""),
    gender: profile.gender || profile.personal?.gender || "prefer_not_to_say",
    nationality: profile.nationality || "Indian",
    careerStage: profile.careerStage || "aspiring",
    category: profile.category || "open_talent",
    primaryProfession,
    profession: primaryProfession,
    secondaryProfessions: Array.isArray(profile.secondaryProfessions) ? profile.secondaryProfessions : [],
    primaryDepartment: profile.primaryDepartment || "",
    primaryDesignation: profile.primaryDesignation || "",
    specializations: Array.isArray(profile.specializations) ? profile.specializations : [],
    secondaryDepartments: Array.isArray(profile.secondaryDepartments) ? profile.secondaryDepartments : [],
    city: profile.currentCity || "",
    currentCity: profile.currentCity || "",
    state: profile.currentState || "",
    currentState: profile.currentState || "",
    country: profile.country || "India",
    location,
    workingCities: Array.isArray(profile.workingCities) ? profile.workingCities : [],
    willingToTravel: profile.willingToTravel !== undefined ? Boolean(profile.willingToTravel) : true,
    willingToRelocate: Boolean(profile.willingToRelocate),
    passportAvailable: Boolean(profile.passportAvailable),
    skills: skillsList,
    skillsDetailed: Array.isArray(profile.skills) ? profile.skills : [],
    languages: languagesList,
    languagesDetailed: Array.isArray(profile.languages) ? profile.languages : [],
    accentsAndDialects: Array.isArray(profile.accentsAndDialects) ? profile.accentsAndDialects : [],
    credits: Array.isArray(profile.credits) ? profile.credits.map((c) => ({
      id: c._id ? String(c._id) : (c.id || ""),
      projectTitle: c.projectTitle || "",
      projectType: c.projectType || "",
      roleOrDesignation: c.roleOrDesignation || "",
      year: c.year || null,
      directorOrProduction: c.directorOrProduction || "",
      characterName: c.characterName || "",
      referenceLink: c.referenceLink || "",
      isVerifiedCredit: Boolean(c.isVerifiedCredit),
    })) : [],
    training: Array.isArray(profile.training) ? profile.training.map((t) => ({
      id: t._id ? String(t._id) : (t.id || ""),
      institution: t.institution || "",
      courseName: t.courseName || "",
      mentor: t.mentor || "",
      yearCompleted: t.yearCompleted || null,
    })) : [],
    awards: Array.isArray(profile.awards) ? profile.awards.map((a) => ({
      id: a._id ? String(a._id) : (a.id || ""),
      title: a.title || "",
      organization: a.organization || "",
      year: a.year || null,
      category: a.category || "",
    })) : [],
    portfolio: {
      photos: photosList,
      videos: videosList,
      showreelUrl,
    },
    photos: photosList,
    showreel: showreelUrl,
    physicalAttributes: {
      heightCm: profile.physicalAttributes?.heightCm || null,
      weightKg: profile.physicalAttributes?.weightKg || null,
      eyeColor: profile.physicalAttributes?.eyeColor || "",
      hairColor: profile.physicalAttributes?.hairColor || "",
      skinTone: profile.physicalAttributes?.skinTone || "",
      bodyType: profile.physicalAttributes?.bodyType || "",
    },
    remunerationExpectation: {
      ratePerDay: profile.remunerationExpectation?.ratePerDay || null,
      ratePerProject: profile.remunerationExpectation?.ratePerProject || null,
      currency: profile.remunerationExpectation?.currency || "INR",
      isNegotiable: profile.remunerationExpectation?.isNegotiable !== undefined ? Boolean(profile.remunerationExpectation.isNegotiable) : true,
    },
    profileCompletionPercentage: profile.profileCompletionPercentage || 0,
    completionPercentage: profile.profileCompletionPercentage || 0,
    isSearchable: Boolean(profile.isSearchable),
    isFeatured: Boolean(profile.isFeatured),
    isTrending: Boolean(profile.isTrending),
    isUnder18: Boolean(profile.isUnder18),
    email: userEmail,
    mobile: userMobile,
    contactDetails: {
      email: userEmail,
      mobile: userMobile,
      name: userName,
    },
  };
}

export function toApi(profile) {
  if (!profile) return {};

  const payload = {
    stageName: profile.stageName?.trim() || profile.name?.trim(),
    firstName: profile.firstName?.trim(),
    middleName: profile.middleName?.trim(),
    lastName: profile.lastName?.trim(),
    headline: profile.headline?.trim(),
    bio: profile.bio?.trim(),
    profilePhoto: profile.profilePhoto || profile.avatar,
    gender: profile.gender,
    nationality: profile.nationality || "Indian",
    careerStage: profile.careerStage,
    category: profile.category || "open_talent",
    primaryProfession: profile.primaryProfession || profile.profession,
    secondaryProfessions: Array.isArray(profile.secondaryProfessions) ? profile.secondaryProfessions : [],
    primaryDepartment: profile.primaryDepartment,
    primaryDesignation: profile.primaryDesignation,
    specializations: Array.isArray(profile.specializations) ? profile.specializations : [],
    secondaryDepartments: Array.isArray(profile.secondaryDepartments) ? profile.secondaryDepartments : [],
    currentCity: profile.currentCity || profile.city,
    currentState: profile.currentState || profile.state,
    country: profile.country || "India",
    workingCities: Array.isArray(profile.workingCities) ? profile.workingCities : [],
    willingToTravel: profile.willingToTravel !== undefined ? Boolean(profile.willingToTravel) : true,
    willingToRelocate: Boolean(profile.willingToRelocate),
    passportAvailable: Boolean(profile.passportAvailable),
  };

  if (profile.dob) {
    payload.dob = new Date(profile.dob);
  }

  // Format skills
  if (Array.isArray(profile.skills)) {
    payload.skills = profile.skills.map((s) => {
      if (typeof s === "string") return { name: s, proficiency: "intermediate" };
      return { name: s.name, proficiency: s.proficiency || "intermediate" };
    });
  }

  // Format languages
  if (Array.isArray(profile.languages)) {
    payload.languages = profile.languages.map((l) => {
      if (typeof l === "string") return { language: l, proficiency: "conversational" };
      return { language: l.language, proficiency: l.proficiency || "conversational" };
    });
  }

  if (Array.isArray(profile.credits)) payload.credits = profile.credits;
  if (Array.isArray(profile.training)) payload.training = profile.training;
  if (Array.isArray(profile.awards)) payload.awards = profile.awards;

  payload.portfolio = {
    photos: Array.isArray(profile.portfolio?.photos) ? profile.portfolio.photos : (Array.isArray(profile.photos) ? profile.photos : []),
    videos: Array.isArray(profile.portfolio?.videos) ? profile.portfolio.videos : (Array.isArray(profile.videos) ? profile.videos : []),
    showreelUrl: profile.portfolio?.showreelUrl || profile.showreel || "",
  };

  if (profile.physicalAttributes) payload.physicalAttributes = profile.physicalAttributes;
  if (profile.remunerationExpectation) payload.remunerationExpectation = profile.remunerationExpectation;

  return payload;
}

export default {
  fromApi,
  toApi,
};
