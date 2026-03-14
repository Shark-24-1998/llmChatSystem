import { callLLMStream } from "../services/ai.gateway.js";
import { buildConversation } from "../services/memory.service.js";
import { getMessages, saveMessage } from "../models/message.model.js";

export const generateController = async (prompt, chatId) => {

  if (!chatId) {
    throw new Error("chatId required");
  }

  await saveMessage(chatId,"user",prompt);

  const history = await getMessages(chatId);

  const conversationContent = buildConversation(history);

  const providerStream = await callLLMStream(conversationContent);

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

      await saveMessage(chatId,"assistant",assistantResponse);

      controller.close();

    }

  });

};