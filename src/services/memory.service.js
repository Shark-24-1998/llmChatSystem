const MAX_MESSAGES = 10;

export const buildConversation = (messages, summary, profile) => {

  const trimmed = messages.slice(-(MAX_MESSAGES - 1));
  const history = [];

  // 1. SUMMARY
  if (summary) {
    history.push({
      role: "system",
      content: `Summary of previous conversation: ${summary}`
    });
  }

  // 2. PROFILE — now includes all personal facts
  if (profile && Object.keys(profile).length > 0) {
    const lines = [];

    if (profile.name) lines.push(`- Name: ${profile.name}`);
    if (profile.skill_level) lines.push(`- Skill Level: ${profile.skill_level?.value || profile.skill_level}`);
    if (profile.learning_style) lines.push(`- Learning Style: ${profile.learning_style}`);
    if (profile.tech_stack?.length > 0) lines.push(`- Tech Stack: ${profile.tech_stack.join(", ")}`);
    if (profile.current_goal) lines.push(`- Current Goal: ${profile.current_goal}`);
    if (profile.salary) lines.push(`- Salary: ${profile.salary}`);
    if (profile.location) lines.push(`- Location: ${profile.location}`);
    if (profile.job_title) lines.push(`- Job Title: ${profile.job_title}`);
    if (profile.company) lines.push(`- Company: ${profile.company}`);
    if (profile.age) lines.push(`- Age: ${profile.age}`);
    if (profile.hobbies?.length > 0) lines.push(`- Hobbies: ${profile.hobbies.join(", ")}`);
    if (profile.languages?.length > 0) lines.push(`- Languages: ${profile.languages.join(", ")}`);
    if (profile.personal_notes) lines.push(`- Notes: ${profile.personal_notes}`);

    if (lines.length > 0) {
      history.push({
        role: "system",
        content: `User Profile:\n${lines.join("\n")}`
      });
    }
  }

  // 3. CONFLICT RESOLUTION RULE
  history.push({
    role: "system",
    content: `Important instructions for handling user information:
- User Profile contains the most recent and up-to-date facts about the user. Always trust User Profile over anything else.
- Documents and knowledge base contain static reference material. Use them for context and detail.
- If User Profile and a document conflict on the same fact, always use the User Profile value as the source of truth.
- Never tell the user their profile and documents conflict. Just silently use the most recent value from User Profile.
- Keep answers concise and to the point unless the user explicitly asks for more detail or elaboration.
- Only include personal profile details if they are directly relevant to the question being asked.`
  });

  // 4. WEB SEARCH TOOL INSTRUCTION
 // 4. WEB SEARCH TOOL INSTRUCTION
history.push({
  role: "system",
  content: `You have access to a real-time web search tool.
Today's date is: ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

When the user asks about anything that requires current or up-to-date information (news, weather, sports scores, stock prices, recent events, current leaders, etc.), you MUST use it.

To use web search, respond with ONLY this on the first line:
[SEARCH: your search query]

Examples:
- User asks "who won IPL yesterday?" → respond: [SEARCH: IPL match result May 13 2026]
- User asks "weather in Pune today?" → respond: [SEARCH: Pune weather today]
- User asks "latest AI news?" → respond: [SEARCH: latest AI news May 2026]

CRITICAL RULES:
- Always use today's date when searching for recent events
- When search results are provided, use ONLY those results to answer
- NEVER mix search results with your training data
- If search results don't have the answer, say "I couldn't find accurate information"
- Never guess or make up sports scores, match results, or current events`
});

  // 5. RECENT MESSAGES
  trimmed.forEach(m => {
    history.push({ role: m.role, content: m.content });
  });

  console.log("FINAL SENT:", history.length);
  return history;
};