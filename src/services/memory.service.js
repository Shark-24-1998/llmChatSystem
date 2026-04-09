const MAX_MESSAGES = 10;

export const buildConversation = (messages, summary, profile) => {

  const trimmed = messages.slice(-(MAX_MESSAGES - 1));

  const history = [];

  
  // 🔥 SUMMARY First
  if (summary) {
    history.push({
      role: "system",
      content: `Summary of previous conversation: ${summary}`
    });
  }

  // 🔥 PROFILE Second
  if (profile && Object.keys(profile).length > 0) {
    history.push({
      role: "system",
      content: `
User Profile:
- Skill Level: ${profile.skill_level?.value || "unknown"}
- Learning Style: ${profile.learning_style || "unknown"}
- Tech Stack: ${profile.tech_stack?.join(", ") || "unknown"}
- Current Goal: ${profile.current_goal || "unknown"}
`
    });
  }


  // 🔥 RECENT MESSAGES
  trimmed.forEach(m => {
    history.push({
      role: m.role,
      content: m.content
    });
  });

  console.log("FINAL SENT:", history.length);

  return history;
};