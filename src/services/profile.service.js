import { applyDecay } from "./decay.service.js";


// extract basic signals (rule-based for now)
export const extractProfile = (message) => {
  const msg = message.toLowerCase();

  const profile = {};

  if (msg.includes("step by step")) {
    profile.learning_style = "step-by-step";
  }

  if (msg.includes("beginner")) {
    profile.skill_level = "beginner";
  }

  if (msg.includes("intermediate")) {
    profile.skill_level = "intermediate";
  }

  if (msg.includes("next.js")) {
    profile.tech_stack = ["Next.js"];
  }

  if (msg.includes("react")) {
    profile.tech_stack = ["React"];
  }

  if (msg.includes("api")) {
    profile.current_goal = "learning APIs";
  }

  return profile;
};



// merge logic (CRITICAL: don’t overwrite good data with empty)
const SKILL_CONFIDENCE = {
  beginner: 0.3,
  intermediate: 0.6,
  advanced: 0.9
};

export const mergeProfiles = (oldProfile, newProfile) => {

  const result = { ...oldProfile };

  // SKILL LEVEL LOGIC
  if (newProfile.skill_level) {
      const isBehaviorSignal = newProfile.isBehavior || false;

    let newConfidence = SKILL_CONFIDENCE[newProfile.skill_level] || 0.2;

     // 🔥 boost for behavior
  if (isBehaviorSignal) {
    newConfidence += 0.2;
  }

    const oldConfidence = applyDecay(
      oldProfile.skill_level?.confidence || 0,
      oldProfile.skill_level?.updated_at
    )

    // Only update if stronger signal
    if (newConfidence >= oldConfidence) {
      result.skill_level = {
        value: newProfile.skill_level,
        confidence: newConfidence,
        updated_at: new Date().toISOString()
      };
    }
  }

  // LEARNING STYLE (stable trait)
  if (newProfile.learning_style) {
    result.learning_style = newProfile.learning_style;
  }

  // TECH STACK (merge)
  if (newProfile.tech_stack) {
    result.tech_stack = Array.from(
      new Set([...(oldProfile.tech_stack || []), ...newProfile.tech_stack])
    );
  }

  //GOAL  (merge)
  if (newProfile.current_goal) {
  result.current_goal = newProfile.current_goal;
}

  return result;
};



// get profile
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



// update profile
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

//EXTRACT GOAL  
export const extractGoal = (message) => {

  const msg = message.toLowerCase();

  if (msg.includes("build") || msg.includes("creating") || msg.includes("developing")) {
    return message; // simple: store raw goal sentence
  }

  if (msg.includes("learning")) {
    return message;
  }

  return null;
};