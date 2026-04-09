export const inferSkillFromBehavior = (message) => {

  const length = message.length;

  // long structured input → higher skill
  if (length > 300) {
    return { skill: "intermediate", confidence: 0.7 };
  }

  // advanced keywords
  if (
    message.includes("architecture") ||
    message.includes("optimize") ||
    message.includes("scalable") ||
    message.includes("RAG") ||
    message.includes("embedding")
  ) {
    return { skill: "intermediate", confidence: 0.7 };
  }

  // basic questions
  if (
    message.toLowerCase().includes("what is") ||
    message.toLowerCase().includes("basic") ||
    message.length < 50
  ) {
    return { skill: "beginner", confidence: 0.3 };
  }

  return null;
};