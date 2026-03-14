import { createChat, getChats } from "../models/chat.model.js";

export const createChatController = async (userId, title) => {

  const chat = await createChat(userId, title || "New Chat");

  return chat;

};

export const listChatsController = async (userId) => {

  const chats = await getChats(userId);

  return chats;

};