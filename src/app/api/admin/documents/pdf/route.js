import { createClient } from "@supabase/supabase-js";
import { addGlobalDocument } from "@/services/document.service";
import { extractText } from "unpdf";

const createAdminSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const verifyAdmin = (req) => {
  const token = req.headers.get("x-admin-token");
  return token === process.env.ADMIN_PASSWORD;
};

export async function POST(req) {
  if (!verifyAdmin(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const title = formData.get("title");

    if (!file) return Response.json({ error: "No file uploaded" }, { status: 400 });
    if (!title?.trim()) return Response.json({ error: "Title is required" }, { status: 400 });

    if (file.type !== "application/pdf") {
      return Response.json({ error: "Only PDF files are supported" }, { status: 400 });
    }

    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return Response.json({ error: "File too large. Maximum size is 10MB" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const { text, totalPages } = await extractText(uint8Array, { mergePages: true });

    console.log("ADMIN PDF PAGES:", totalPages);
    console.log("ADMIN PDF TEXT LENGTH:", text?.length);

    if (!text || text.length < 10) {
      return Response.json({
        error: "This appears to be a scanned or image-based PDF. Please copy the text manually and use the Text option instead."
      }, { status: 400 });
    }

    const supabase = createAdminSupabase();
    const docId = await addGlobalDocument(supabase, text, title.trim());

    return Response.json({ success: true, docId, pages: totalPages });
  } catch (err) {
    console.error("ADMIN PDF ERROR:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}