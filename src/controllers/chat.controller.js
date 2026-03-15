import { createChat, getChats } from "../models/chat.model.js";
import { generateChatTitle } from "../services/title.service.js";

export const createChatController = async (userId,prompt) => {

  if(!userId){
    throw new Error("userId required");
  }

  const title = await generateChatTitle(prompt);

  const chat = await createChat(userId,title);

  return chat;

};

export const listChatsController = async (userId) => {

  const chats = await getChats(userId);

  return chats;

};