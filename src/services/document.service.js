export const addDocument = async (supabase, content) => {

  const { error } = await supabase
    .from("documents")
    .insert({ content });

  if (error) {
    console.error("INSERT ERROR:", error);
  } else {
    console.log("DOCUMENT ADDED");
  }
};