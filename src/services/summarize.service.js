import { callLLM } from "./ai.gateway.js";

export async function updateSummary(oldSummary, newMessages, profile = null) {

  const newText = newMessages
    .map(m => `${m.role}: ${m.content}`)
    .join("\n");

  // 🔥 PROFILE CONTEXT (authoritative)
  const profileContext = profile
    ? `
User Profile (authoritative, must not be contradicted):
- Skill Level: ${profile.skill_level?.value || profile.skill_level || "unknown"}
- Learning Style: ${profile.learning_style || "unknown"}
- Tech Stack: ${profile.tech_stack?.join(", ") || "unknown"}
- Current Goal: ${profile.current_goal || "unknown"}
`
    : "";

  const prompt = `
You are updating a conversation summary.

${profileContext}

Previous summary:
${oldSummary || "None"}

New messages:
${newText}

Instructions:
- Update the summary with important new information
- Keep it concise (max 100 words)
- Preserve key facts like skills, goals, and progress
- DO NOT contradict the user profile
- If messages conflict with the profile, prioritize the profile
- DO NOT invent transitions like "user changed from X to Y" unless explicitly clear

New Summary:
`;

  const updatedSummary = await callLLM(prompt);

  return updatedSummary;
}