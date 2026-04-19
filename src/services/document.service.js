import { createEmbedding } from "./embedding.service.js";

export const addDocument = async (supabase, content) => {

  const embedding = await createEmbedding(content);

  const { error } = await supabase
    .from("documents")
    .insert({ content, embedding });

  if (error) {
    console.error("INSERT ERROR:", error);
  } else {
    console.log("DOCUMENT ADDED");
  }
};

export const searchDocuments = async (supabase, queryEmbedding) => {
  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: queryEmbedding,
    match_count: 3,
    match_threshold: 0.75 
  });

  if (error) {
    console.error("SEARCH ERROR:", error);
    return [];
  }

  return data;
};