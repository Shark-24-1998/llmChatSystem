import { PROVIDERS } from "../providers/provider.registry.js";

const MODEL_CHAIN = [
  { provider: "openrouter", model: "google/gemma-3-4b-it:free" },
  { provider: "gemini", model: "gemini-2.5-flash-lite" },
  { provider: "gemini", model: "gemini-2.5-flash" },
  { provider: "gemini", model: "gemini-3-flash-preview" },
  { provider: "gemini", model: "gemini-3.1-pro-preview" },
  { provider: "openrouter", model: "qwen/qwen3.6-plus:free" }
];

const MODEL_HEALTH = {};
const COOLDOWN = 60 * 1000;

const isModelHealthy = (model) => {

  const health = MODEL_HEALTH[model];

  if (!health) return true;

  return Date.now() > health.disabledUntil;

};

const markModelUnhealthy = (model) => {

  MODEL_HEALTH[model] = {
    disabledUntil: Date.now() + COOLDOWN
  };

  console.log(`Model disabled for 60s → ${model}`);

};



// -------------------------
// Normal completion
// -------------------------

export const callLLM = async (content) => {

  for (const m of MODEL_CHAIN) {

    if (!isModelHealthy(m.model)) {
      console.log("Skipping unhealthy model:", m.model);
      continue;
    }

    try {

      console.log("Trying model:", m.model);

      const adapter = PROVIDERS[m.provider];

      if (!adapter?.complete) {
        throw new Error(`Provider adapter missing: ${m.provider}`);
      }

      return await adapter.complete(m.model, content);

    } catch (err) {

      console.log(`Model failed: ${m.model}`, err.message);

      if (err.response?.status === 429) {
        markModelUnhealthy(m.model);
      }

    }

  }

  throw new Error("All models failed");

};



// -------------------------
// Streaming completion
// -------------------------

export const callLLMStream = async (content) => {

  for (const m of MODEL_CHAIN) {

    if (!isModelHealthy(m.model)) {
      console.log("Skipping unhealthy model:", m.model);
      continue;
    }

    try {

      console.log("Streaming with:", m.model);

      const adapter = PROVIDERS[m.provider];

      if (!adapter?.stream) {
        throw new Error(`Provider adapter missing: ${m.provider}`);
      }

      const stream = await adapter.stream(
        m.model,
        content
      );

      return stream;

    } catch (err) {

      console.log(`Stream model failed: ${m.model}`, err.message);

      if (err.response?.status === 429) {
        markModelUnhealthy(m.model);
      }

    }

  }

  throw new Error("All models unavailable");

};