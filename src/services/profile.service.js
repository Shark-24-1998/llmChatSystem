import { applyDecay } from "./decay.service.js";

// ─────────────────────────────────────────
// LLM-BASED PERSONAL FACT EXTRACTION
// ─────────────────────────────────────────
export const extractProfile = (message) => {
  const msg = message.toLowerCase();
  const profile = {};

  // NAME
  const nameMatch = message.match(/my name is ([A-Z][a-z]+(?: [A-Z][a-z]+)*)/i);
  if (nameMatch) profile.name = nameMatch[1];

  // SALARY
  const salaryMatch = message.match(/salary is ([₹\d,\.]+(?:\s*(?:lakhs?|lpa|per year|pa))?)/i);
  if (salaryMatch) profile.salary = salaryMatch[1].trim();


  // LOCATION — replace old line with this
  const locationMatch = message.match(/(?:live in|living in|from|based in|located in)\s+([A-Za-z][a-zA-Z\s]+?)(?:\s+and|\.|,|$)/i);
  if (locationMatch) profile.location = locationMatch[1].trim();

  // JOB TITLE
  const jobMatch = message.match(/(?:my job title is|i am a|i'm a|work as a|working as a)\s+([a-zA-Z\s]+?)(?:\.|,|working|at|in|and|$)/i);
  if (jobMatch) profile.job_title = jobMatch[1].trim();

  // COMPANY
  const companyMatch = message.match(/(?:working at|work at|employed at|joined|at)\s+([a-zA-Z\s]+?)(?:\.|,|and|company|$)/i);
  if (companyMatch) profile.company = companyMatch[1].trim();
  // AGE
  const ageMatch = message.match(/(?:my age is|i am|i'm)\s+(\d{1,2})(?:\s*years old)?/i);
  if (ageMatch) profile.age = ageMatch[1];

  // SKILL LEVEL
  if (msg.includes("beginner")) profile.skill_level = "beginner";
  if (msg.includes("intermediate")) profile.skill_level = "intermediate";
  if (msg.includes("advanced") || msg.includes("expert")) profile.skill_level = "advanced";

  // LEARNING STYLE
  if (msg.includes("step by step")) profile.learning_style = "step-by-step";
  if (msg.includes("visual")) profile.learning_style = "visual";
  if (msg.includes("hands on") || msg.includes("hands-on")) profile.learning_style = "hands-on";

  // TECH STACK
  const techKeywords = ["next.js", "react", "node.js", "python", "typescript", "javascript", "vue", "angular", "flutter", "swift"];
  const foundTech = techKeywords.filter(t => msg.includes(t));
  if (foundTech.length > 0) profile.tech_stack = foundTech;

  // HOBBIES
  const hobbyKeywords = ["cricket", "football", "swimming", "gaming", "reading", "cooking", "anime", "music", "hiking", "movies", "foodie"];
  const foundHobbies = hobbyKeywords.filter(h => msg.includes(h));
  if (foundHobbies.length > 0) profile.hobbies = foundHobbies;

  // LANGUAGES
  const langKeywords = ["english", "hindi", "marathi", "tamil", "telugu", "kannada", "gujarati", "bengali"];
  const foundLangs = langKeywords.filter(l => msg.includes(l));
  if (foundLangs.length > 0) profile.languages = foundLangs;

  if (Object.keys(profile).length > 0) {
    console.log("EXTRACTED PROFILE:", profile);
  }

  return profile;
};

// ─────────────────────────────────────────
// MERGE LOGIC
// ─────────────────────────────────────────
const SKILL_CONFIDENCE = {
  beginner: 0.3,
  intermediate: 0.6,
  advanced: 0.9
};

export const mergeProfiles = (oldProfile, newProfile) => {
  const result = { ...oldProfile };

  // SKILL LEVEL — confidence based
  if (newProfile.skill_level) {
    const isBehaviorSignal = newProfile.isBehavior || false;
    let newConfidence = SKILL_CONFIDENCE[newProfile.skill_level] || 0.2;
    if (isBehaviorSignal) newConfidence += 0.2;

    const oldConfidence = applyDecay(
      oldProfile.skill_level?.confidence || 0,
      oldProfile.skill_level?.updated_at
    );

    if (newConfidence >= oldConfidence) {
      result.skill_level = {
        value: newProfile.skill_level,
        confidence: newConfidence,
        updated_at: new Date().toISOString()
      };
    }
  }

  // SIMPLE STRING FIELDS — always update if provided
  for (const field of ["name", "salary", "location", "job_title", "company", "age", "learning_style", "current_goal", "personal_notes"]) {
    if (newProfile[field]) {
      result[field] = newProfile[field];
    }
  }

  // ARRAY FIELDS — merge unique values
  for (const field of ["tech_stack", "hobbies", "languages"]) {
    if (newProfile[field]?.length > 0) {
      result[field] = Array.from(
        new Set([...(oldProfile[field] || []), ...newProfile[field]])
      );
    }
  }

  return result;
};

// ─────────────────────────────────────────
// GET PROFILE
// ─────────────────────────────────────────
export const getUserProfile = async (supabase, userId) => {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.log("NO PROFILE FOUND, RETURN EMPTY");
    return {};
  }

  return data;
};

// ─────────────────────────────────────────
// UPDATE PROFILE
// ─────────────────────────────────────────
export const updateUserProfile = async (supabase, userId, newProfile) => {
  const existing = await getUserProfile(supabase, userId);
  const merged = mergeProfiles(existing || {}, newProfile);

  const cleaned = Object.fromEntries(
    Object.entries(merged).filter(([_, v]) => v !== undefined)
  );

  const { error } = await supabase
    .from("user_profiles")
    .upsert({
      user_id: userId,
      ...cleaned,
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error("PROFILE UPDATE ERROR:", error);
  } else {
    console.log("PROFILE UPDATED:", merged);
  }
};

// ─────────────────────────────────────────
// EXTRACT GOAL (kept for compatibility)
// ─────────────────────────────────────────
export const extractGoal = (message) => {
  const msg = message.toLowerCase();
  if (msg.includes("build") || msg.includes("creating") || msg.includes("developing")) {
    return message;
  }
  if (msg.includes("learning")) {
    return message;
  }
  return null;
};