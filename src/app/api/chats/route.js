import { createClient } from "@supabase/supabase-js";
import { createChatController, listChatsController } from "@/controllers/chat.controller";

export async function GET(req) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 🔥 Ensure user exists
  const { error: upsertError } = await supabase
    .from("users")
    .upsert({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || null,
      avatar_url: user.user_metadata?.avatar_url || null,
    });

  if (upsertError) {
    console.error("USER UPSERT ERROR:", upsertError);
  }

  const chats = await listChatsController(supabase, user.id);

  return Response.json(chats);
}

export async function POST(req) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 🔥 Ensure user exists
  const { error: upsertError } = await supabase
    .from("users")
    .upsert({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || null,
      avatar_url: user.user_metadata?.avatar_url || null,
    });

  if (upsertError) {
    console.error("USER UPSERT ERROR:", upsertError);
  }

  const { prompt } = await req.json();

  const chat = await createChatController(supabase, user.id, prompt);

  return Response.json(chat);
}

export async function DELETE(req) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { chatId } = await req.json();
    if (!chatId) return Response.json({ error: "chatId required" }, { status: 400 });

    // RLS ensures user can only delete their own chats
    const { error } = await supabase
      .from("chats")
      .delete()
      .eq("id", chatId)
      .eq("user_id", user.id);

    if (error) {
      console.error("DELETE CHAT ERROR:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    console.log("CHAT DELETED:", chatId);
    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE CHAT ERROR:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}