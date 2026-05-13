import { createClient } from "@supabase/supabase-js";
import { addDocument } from "@/services/document.service";

const createSupabase = (token) => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { global: { headers: { Authorization: `Bearer ${token}` } } }
);

// ─────────────────────────────────────────
// GET — fetch all documents for this user
// ─────────────────────────────────────────
export async function GET(req) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createSupabase(token);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // fetch documents + chunk count for each
  const { data, error } = await supabase
    .from("documents")
    .select(`
      id,
      title,
      source_type,
      created_at,
      document_chunks(count)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("FETCH DOCUMENTS ERROR:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  // flatten chunk count
  const documents = data.map(doc => ({
    id: doc.id,
    title: doc.title,
    source_type: doc.source_type,
    created_at: doc.created_at,
    chunk_count: doc.document_chunks?.[0]?.count || 0
  }));

  return Response.json(documents);
}

// ─────────────────────────────────────────
// POST — add new document
// ─────────────────────────────────────────
export async function POST(req) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createSupabase(token);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { title, content } = await req.json();
    if (!title?.trim()) return Response.json({ error: "Title is required" }, { status: 400 });
    if (!content?.trim()) return Response.json({ error: "Content is required" }, { status: 400 });

    const docId = await addDocument(supabase, content.trim(), title.trim());
    return Response.json({ success: true, docId });
  } catch (err) {
    console.error("DOCUMENT API ERROR:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// ─────────────────────────────────────────
// DELETE — delete document + all its chunks
// ─────────────────────────────────────────
export async function DELETE(req) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createSupabase(token);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { docId } = await req.json();
    if (!docId) return Response.json({ error: "docId is required" }, { status: 400 });

    // RLS ensures user can only delete their own documents
    // ON DELETE CASCADE automatically deletes all chunks
    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("id", docId);

    if (error) {
      console.error("DELETE ERROR:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    console.log("DOCUMENT DELETED:", docId);
    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE API ERROR:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}