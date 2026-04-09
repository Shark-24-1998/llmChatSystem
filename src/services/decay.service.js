export const applyDecay = (confidence, updatedAt) => {
  if (!updatedAt) return confidence;

  const now = Date.now();
  const last = new Date(updatedAt).getTime();

  const days = (now - last) / (1000 * 60 * 60 * 24);

  // decay formula (simple)
  const decayFactor = Math.exp(-0.05 * days);

  return confidence * decayFactor;
};