import { createSupabaseServer } from "@/lib/supabaseServer";
import { createChatController, listChatsController } from "@/controllers/chat.controller";

export async function POST(req) {

  const supabase = createSupabaseServer();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title } = await req.json();

  const chat = await createChatController(user.id, title);

  return Response.json(chat);

}

export async function GET(req) {

  const supabase = createSupabaseServer();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const chats = await listChatsController(user.id);

  return Response.json(chats);

}