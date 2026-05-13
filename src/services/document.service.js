import { createEmbedding } from "./embedding.service.js";

// ─────────────────────────────────────────
// CHUNKING LOGIC
// ─────────────────────────────────────────

const chunkText = (text, chunkSize = 500, overlap = 50) => {
  const words = text.split(/\s+/);
  const chunks = [];
  let start = 0;

  while (start < words.length) {
    const end = Math.min(start + chunkSize, words.length);
    const chunk = words.slice(start, end).join(" ");
    chunks.push(chunk);

    // if we've reached the end, stop
    if (end === words.length) break;

    // move forward by (chunkSize - overlap) so chunks share 'overlap' words
    start += chunkSize - overlap;
  }

  return chunks;
};

// ─────────────────────────────────────────
// ADD DOCUMENT (user data)
// ─────────────────────────────────────────

export const addDocument = async (supabase, content, title = "Untitled", scope = "user") => {

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) throw new Error("Unauthorized: No user found");

  // 1. Save parent document
  const { data: doc, error: docError } = await supabase
    .from("documents")
    .insert({
      user_id: userId,
      title,
      source_type: "paste",
      content,
    })
    .select()
    .single();

  if (docError) {
    console.error("DOCUMENT INSERT ERROR:", docError);
    throw docError;
  }

  console.log("DOCUMENT SAVED:", doc.id);

  // 2. Chunk the content
  const chunks = chunkText(content);
  console.log(`CHUNKS CREATED: ${chunks.length}`);

  // 3. Embed each chunk and save to document_chunks
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const embedding = await createEmbedding(chunk);

    const { error: chunkError } = await supabase
      .from("document_chunks")
      .insert({
        user_id: userId,
        document_id: doc.id,
        content: chunk,
        embedding,
        chunk_index: i,
        scope,
        metadata: {
          chunk_size: 500,
          overlap: 50,
          total_chunks: chunks.length,
          tokens_approx: chunk.split(/\s+/).length,
        },
      });

    if (chunkError) {
      console.error(`CHUNK ${i} INSERT ERROR:`, chunkError);
    } else {
      console.log(`CHUNK ${i + 1}/${chunks.length} SAVED`);
    }
  }

  return doc.id;
};

// ─────────────────────────────────────────
// ADD GLOBAL DOCUMENT (company/admin data)
// ─────────────────────────────────────────

export const addGlobalDocument = async (supabase, content, title = "Untitled") => {
  // use a system UUID for global docs — no real user owns them
  const SYSTEM_USER_ID = null;

  // 1. Save parent document with scope = global
  const { data: doc, error: docError } = await supabase
    .from("documents")
    .insert({
      user_id: SYSTEM_USER_ID,
      title,
      source_type: "paste",
      content,
      scope: "global",
    })
    .select()
    .single();

  if (docError) {
    console.error("GLOBAL DOCUMENT INSERT ERROR:", docError);
    throw docError;
  }

  console.log("GLOBAL DOCUMENT SAVED:", doc.id);

  // 2. Chunk the content
  const chunks = chunkText(content);
  console.log(`CHUNKS CREATED: ${chunks.length}`);

  // 3. Embed each chunk and save
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const embedding = await createEmbedding(chunk);

    const { error: chunkError } = await supabase
      .from("document_chunks")
      .insert({
        user_id: SYSTEM_USER_ID,
        document_id: doc.id,
        content: chunk,
        embedding,
        chunk_index: i,
        scope: "global",
        metadata: {
          chunk_size: 500,
          overlap: 50,
          total_chunks: chunks.length,
          tokens_approx: chunk.split(/\s+/).length,
        },
      });

    if (chunkError) console.error(`CHUNK ${i} ERROR:`, chunkError);
    else console.log(`CHUNK ${i + 1}/${chunks.length} SAVED`);
  }

  return doc.id;
};

// ─────────────────────────────────────────
// SEARCH CHUNKS (RAG)
// ─────────────────────────────────────────

export const searchDocuments = async (supabase, queryEmbedding) => {

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) {
    console.error("SEARCH ERROR: No user found");
    return [];
  }

  const { data, error } = await supabase.rpc("match_chunks", {
    query_embedding: queryEmbedding,
    match_count: 5,
    match_threshold: 0.5,
    p_user_id: userId,
  });

  if (error) {
    console.error("SEARCH ERROR:", error);
    return [];
  }

  console.log(`RAG: found ${data.length} chunks`);
  return data;
};