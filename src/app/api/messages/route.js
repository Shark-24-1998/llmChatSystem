import { getMessages } from "@/models/message.model";

export async function GET(req) {

  const { searchParams } = new URL(req.url);

  const chatId = searchParams.get("chatId");

  const messages = await getMessages(chatId);

  return Response.json(messages);

}   