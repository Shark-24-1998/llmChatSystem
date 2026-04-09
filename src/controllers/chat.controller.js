import { createChat, getChats } from "../models/chat.model.js";
import { generateChatTitle } from "../services/title.service.js";

export const createChatController = async (supabase, userId,prompt) => {

  if(!userId){
    throw new Error("userId required");
  }

  const title = await generateChatTitle(prompt);

  const chat = await createChat(supabase, userId,title);

  return chat;

};

export const listChatsController = async (supabase, userId) => {

  const chats = await getChats(supabase, userId);

  return chats;

};