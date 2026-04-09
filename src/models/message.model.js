export async function saveMessage(supabase, chatId, role, content) {
  const { error } = await supabase
    .from("messages")
    .insert([
      {
        chat_id: chatId,
        role,
        content,
      },
    ]);

  if (error) throw error;
}

export async function getMessages(supabase, chatId) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return data;
}