import { generateController } from "@/controllers/generate.controller";
import { createClient } from "@supabase/supabase-js";

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

  const { prompt, chatId } = await req.json();

  const stream = await generateController(supabase, prompt, chatId);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
    },
  });
}