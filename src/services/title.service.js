import { callLLM } from "./ai.gateway.js";

export const generateChatTitle = async (prompt) => {

  const titlePrompt = `
Generate a short chat title (max 5 words).

User message:
"${prompt}"

Only return the title text.
`;

  const title = await callLLM([
    { type:"text", text:titlePrompt }
  ]);

  return title.replace(/["\n]/g,"").trim();

};