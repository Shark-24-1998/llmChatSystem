
import { supabase } from "./src/lib/supabase.js";
import { addDocument } from "./src/services/document.service.js";


async function  runTest() {
    try {
    console.log("🚀 Testing addDocument...");

    // await addDocument(supabase, "RAG is a system that retrieves external knowledge.");
    // console.log("✅ Document 1 added");

    // await addDocument(supabase, "Embeddings convert text into vectors.");
    // console.log("✅ Document 2 added");

    await addDocument(supabase, "Embeddings convert text into high-dimensional vectors that capture semantic meaning.")
    console.log("✅ Document 3 added");

    await addDocument(supabase,  "A vector database stores embeddings and allows fast similarity search using algorithms like cosine similarity.")
    console.log("✅ Document 4 added")

    await addDocument(supabase, "Chunking is the process of splitting large documents into smaller pieces before embedding them.")
    console.log("✅ Document 4 added")

    console.log("🎉 All documents inserted successfully!");
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

runTest()