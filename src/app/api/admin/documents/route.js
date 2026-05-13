import { createClient } from "@supabase/supabase-js";
import { addGlobalDocument } from "@/services/document.service";

const createAdminSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const verifyAdmin = (req) => {
  const token = req.headers.get("x-admin-token");
  return token === process.env.ADMIN_PASSWORD;
};

// ─────────────────────────────────────────
// GET — fetch ONLY global documents
// ─────────────────────────────────────────
export async function GET(req) {
  if (!verifyAdmin(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminSupabase();

  const { data, error } = await supabase
    .from("documents")
    .select(`
      id,
      title,
      source_type,
      created_at,
      document_chunks(count)
    `)
    .eq("scope", "global")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("ADMIN FETCH ERROR:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  const documents = data.map(doc => ({
    id: doc.id,
    title: doc.title,
    source_type: doc.source_type,
    created_at: doc.created_at,
  }));

  return Response.json(documents);
}

// ─────────────────────────────────────────
// POST — add global document (text)
// ─────────────────────────────────────────
export async function POST(req) {
  if (!verifyAdmin(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, content } = await req.json();
    if (!title?.trim()) return Response.json({ error: "Title is required" }, { status: 400 });
    if (!content?.trim()) return Response.json({ error: "Content is required" }, { status: 400 });

    const supabase = createAdminSupabase();
    const docId = await addGlobalDocument(supabase, content.trim(), title.trim());
    return Response.json({ success: true, docId });
  } catch (err) {
    console.error("ADMIN POST ERROR:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// ─────────────────────────────────────────
// DELETE — delete ONLY global documents
// ─────────────────────────────────────────
export async function DELETE(req) {
  if (!verifyAdmin(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { docId } = await req.json();
    if (!docId) return Response.json({ error: "docId is required" }, { status: 400 });

    const supabase = createAdminSupabase();

    // verify it's global before deleting — protect user data
    const { data: doc, error: fetchError } = await supabase
      .from("documents")
      .select("scope")
      .eq("id", docId)
      .single();

    if (fetchError || !doc) {
      return Response.json({ error: "Document not found" }, { status: 404 });
    }

    if (doc.scope !== "global") {
      return Response.json({
        error: "Cannot delete user documents — admin can only delete global documents"
      }, { status: 403 });
    }

    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("id", docId)
      .eq("scope", "global"); // double safety check

    if (error) {
      console.error("ADMIN DELETE ERROR:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    console.log("GLOBAL DOCUMENT DELETED:", docId);
    return Response.json({ success: true });
  } catch (err) {
    console.error("ADMIN DELETE ERROR:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}