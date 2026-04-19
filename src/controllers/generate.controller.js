import { callLLMStream } from "../services/ai.gateway.js";
import { buildConversation } from "../services/memory.service.js";
import { getMessages, saveMessage } from "../models/message.model.js";
import { updateSummary } from "@/services/summarize.service.js";
import {
  extractProfile,
  updateUserProfile,
  getUserProfile,
  extractGoal
} from "../services/profile.service.js";
import { inferSkillFromBehavior } from "../services/behavior.service.js";
import { createEmbedding } from "@/services/embedding.service.js";
import { searchDocuments } from "@/services/document.service.js";

// 🔥 CHANGED: added imageBase64, imageMimeType
export const generateController = async (supabase, prompt, chatId, imageBase64 = null, imageMimeType = null) => {

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;

  if (!userId) throw new Error("Unauthorized: No user found");
  if (!chatId) throw new Error("chatId required");

  console.log("FINAL USER ID:", userId);
  console.log("HAS IMAGE:", !!imageBase64); // 🔥 NEW

  // 1. Save user message
  await saveMessage(supabase, chatId, "user", prompt);

  // 2. PROFILE EXTRACTION + UPDATE
  const extractedProfile = extractProfile(prompt);
  if (Object.keys(extractedProfile).length > 0) {
    await updateUserProfile(supabase, userId, extractedProfile);
  }

  // GOAL EXTRACTION
  const goal = extractGoal(prompt);
  if (goal) {
    await updateUserProfile(supabase, userId, { current_goal: goal });
  }

  // BEHAVIOR ANALYSIS
  const behavior = inferSkillFromBehavior(prompt);
  if (behavior) {
    await updateUserProfile(supabase, userId, {
      skill_level: behavior.skill,
      isBehavior: true
    });
  }

  // 3. GET HISTORY
  const history = await getMessages(supabase, chatId);

  // 4. GET EXISTING SUMMARY FROM DB
  const { data: chat, error: fetchError } = await supabase
    .from("chats")
    .select("summary, last_summary_count")
    .eq("id", chatId)
    .single();

  if (fetchError) console.error("FETCH SUMMARY ERROR:", fetchError);

  let summary = chat?.summary || null;
  const lastCount = chat?.last_summary_count || 0;

  console.log("DB SUMMARY:", summary);
  console.log("LAST SUMMARY COUNT:", lastCount);
  console.log("HISTORY LENGTH:", history.length);

  // 5. GET USER PROFILE
  const userProfile = await getUserProfile(supabase, userId);

  // 6. FORCE SUMMARY REFRESH
  if (extractedProfile.skill_level) {
    console.log("FORCING SUMMARY REFRESH DUE TO SKILL CHANGE");
    const updatedSummary = await updateSummary(null, history, userProfile);
    const { error } = await supabase
      .from("chats")
      .update({ summary: updatedSummary, last_summary_count: history.length })
      .eq("id", chatId);
    if (error) console.error("SUMMARY FORCE UPDATE ERROR:", error);
    else { console.log("SUMMARY FORCE UPDATE SUCCESS"); summary = updatedSummary; }
  }

  // 7. INITIAL SUMMARY
  else if (!summary && history.length > 20) {
    console.log("INITIAL SUMMARY TRIGGERED");
    const oldMessages = history.slice(0, -10);
    const updatedSummary = await updateSummary(null, oldMessages, userProfile);
    const { error } = await supabase
      .from("chats")
      .update({ summary: updatedSummary, last_summary_count: history.length })
      .eq("id", chatId);
    if (error) console.error("SUMMARY UPDATE ERROR:", error);
    else { console.log("INITIAL SUMMARY SAVED"); summary = updatedSummary; }
  }

  // 8. INCREMENTAL SUMMARY
  else if (history.length - lastCount >= 5) {
    console.log("INCREMENTAL SUMMARY TRIGGERED");
    const newMessages = history.slice(lastCount);
    console.log("NEW MESSAGES COUNT:", newMessages.length);
    const updatedSummary = await updateSummary(summary, newMessages, userProfile);
    const { error } = await supabase
      .from("chats")
      .update({ summary: updatedSummary, last_summary_count: history.length })
      .eq("id", chatId);
    if (error) console.error("SUMMARY UPDATE ERROR:", error);
    else { console.log("INCREMENTAL SUMMARY SAVED"); summary = updatedSummary; }
  }

  // 9. RAG SEARCH
  const queryEmbedding = await createEmbedding(prompt);
  const docs = await searchDocuments(supabase, queryEmbedding);
 const context = docs.length > 0 ? docs.map(d => d.content).join("\n\n") : null;
  console.log(docs.length > 0 ? `RAG CONTEXT: ${context}` : "RAG: no relevant docs found");

  // 10. BUILD FINAL CONVERSATION
  const conversationContent = buildConversation(history, summary, userProfile);
  // 🔥 only inject RAG context if relevant docs were found
if (context) {
  conversationContent.unshift({
    role: "system",
    content: `Relevant Knowledge:\n${context}`
  });
}

  // 11. CALL LLM — 🔥 CHANGED: pass image params
  const providerStream = await callLLMStream(
    conversationContent,
    imageBase64,
    imageMimeType
  );

  const reader = providerStream.getReader();
  const decoder = new TextDecoder();
  let assistantResponse = "";

  return new ReadableStream({
    async start(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        assistantResponse += text;
        controller.enqueue(value);
      }

      // 12. SAVE ASSISTANT RESPONSE
      await saveMessage(supabase, chatId, "assistant", assistantResponse);
      controller.close();
    },
  });
};