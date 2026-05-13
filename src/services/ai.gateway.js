// src/services/ai.gateway.js

import { PROVIDERS } from "../providers/provider.registry.js";

// 🔥 CHANGED: added vision flag to each model
const MODEL_CHAIN = [
  { provider: "gemini",     model: "gemini-2.5-flash-lite",        vision: true  }, // primary, fast, free
  { provider: "gemini",     model: "gemini-3-flash-preview",       vision: true  }, // newer, free tier
  { provider: "gemini",     model: "gemini-2.5-flash",             vision: true  }, // stronger fallback
  { provider: "openrouter", model: "openai/gpt-oss-20b:free",      vision: false }, // replaces gemma, strong
  { provider: "openrouter", model: "qwen/qwen3.6-plus:free",       vision: false }, // last resort 
]

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
      if (!adapter?.complete) throw new Error(`Provider adapter missing: ${m.provider}`);
      return await adapter.complete(m.model, content);
    } catch (err) {
      console.log(`Model failed: ${m.model}`, err.message);
      if (err.response?.status === 429) markModelUnhealthy(m.model);
    }
  }
  throw new Error("All models failed");
};

// -------------------------
// Streaming completion
// -------------------------

// 🔥 CHANGED: added imageBase64, imageMimeType params
export const callLLMStream = async (content, imageBase64 = null, imageMimeType = null) => {

  const hasImage = !!imageBase64;

  for (const m of MODEL_CHAIN) {

    if (!isModelHealthy(m.model)) {
      console.log("Skipping unhealthy model:", m.model);
      continue;
    }

    // 🔥 NEW: skip non-vision models when image is present
    if (hasImage && !m.vision) {
      console.log("Skipping non-vision model:", m.model);
      continue;
    }

    try {
      console.log("Streaming with:", m.model, hasImage ? "[VISION]" : "[TEXT]");

      const adapter = PROVIDERS[m.provider];
      if (!adapter?.stream) throw new Error(`Provider adapter missing: ${m.provider}`);

      // 🔥 CHANGED: pass image params to adapter
      const stream = await adapter.stream(
        m.model,
        content,
        imageBase64,
        imageMimeType
      );

      return stream;

    } catch (err) {
      console.log(`Stream model failed: ${m.model}`, err.message);
      if (err.response?.status === 429) markModelUnhealthy(m.model);
    }
  }

  throw new Error("All models unavailable");
};