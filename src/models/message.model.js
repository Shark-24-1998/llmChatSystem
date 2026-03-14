import { supabase } from "@/lib/supabase"

export async function saveMessage(chatId, role, content) {

 const { error } = await supabase
  .from("messages")
  .insert([
   {
    chat_id: chatId,
    role,
    content
   }
  ])

 if(error) throw error
}

export async function getMessages(chatId) {

 const { data } = await supabase
  .from("messages")
  .select("*")
  .eq("chat_id", chatId)
  .order("created_at", { ascending: true })

 return data
}   