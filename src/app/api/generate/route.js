// src/app/api/generate/route.js

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

  // 🔥 CHANGED: formData instead of json
  const formData = await req.formData();
  const prompt = formData.get("prompt");
  const chatId = formData.get("chatId");
  const imageFile = formData.get("image") ?? null;

  // 🔥 Convert image to base64 if present
  let imageBase64 = null;
  let imageMimeType = null;

  if (imageFile) {
    const arrayBuffer = await imageFile.arrayBuffer();
    imageBase64 = Buffer.from(arrayBuffer).toString("base64");
    imageMimeType = imageFile.type;
    console.log("IMAGE RECEIVED:", imageMimeType, imageBase64.length, "chars");
  } else {
    console.log("NO IMAGE — text only");
  }

  const stream = await generateController(
    supabase,
    prompt,
    chatId,
    imageBase64,
    imageMimeType
  );

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
    },
  });
}