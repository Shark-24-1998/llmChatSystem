import { supabase } from "@/lib/supabase";


export const createChat = async (userId, title) => {

  const { data, error } = await supabase
    .from("chats")
    .insert([
      {
        user_id: userId,
        title
      }
    ])
    .select()
    .single();

  if (error) throw error;

  return data;

};

export const getChats = async (userId) => {

  const { data, error } = await supabase
    .from("chats")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;

};