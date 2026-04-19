// src/providers/gemini.adapter.js

import axios from "axios";

const STREAMING_SUPPORTED = [
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash"
];

// 🔥 CHANGED: now builds proper parts array with optional image
const buildGeminiContents = (content, imageBase64 = null, imageMimeType = null) => {

  // Extract plain text from conversation
  let textPrompt = "";

  if (typeof content === "string") {
    textPrompt = content;
  } else if (Array.isArray(content)) {
    textPrompt = content
      .map(m => {
        if (Array.isArray(m.content)) {
          return m.content
            .filter(c => c.type === "text")
            .map(c => c.text)
            .join("");
        }
        if (typeof m.content === "string") return m.content;
        if (m.type === "text") return m.text;
        return "";
      })
      .join("\n");
  }

  // 🔥 Build parts array
  const parts = [];

  // Image goes FIRST (Gemini prefers image before text)
  if (imageBase64 && imageMimeType) {
    parts.push({
      inline_data: {
        mime_type: imageMimeType,
        data: imageBase64
      }
    });
    console.log("GEMINI: image part added", imageMimeType);
  }

  // Text always added
  parts.push({ text: textPrompt });

  return parts;
};

export const geminiComplete = async (model, content, imageBase64 = null, imageMimeType = null) => {

  const parts = buildGeminiContents(content, imageBase64, imageMimeType);

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [{ role: "user", parts }]
    }
  );

  return response.data.candidates[0].content.parts[0].text;
};

export const geminiStream = async (model, content, imageBase64 = null, imageMimeType = null) => {

  const parts = buildGeminiContents(content, imageBase64, imageMimeType);

  const encoder = new TextEncoder();

  const endpoint = STREAMING_SUPPORTED.includes(model)
    ? `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${process.env.GEMINI_API_KEY}`
    : `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const response = await axios.post(
    endpoint,
    {
      contents: [{ role: "user", parts }]  // 🔥 parts instead of hardcoded text
    },
    {
      responseType: STREAMING_SUPPORTED.includes(model) ? "stream" : "json"
    }
  );

  return new ReadableStream({
    async start(controller) {

      if (!STREAMING_SUPPORTED.includes(model)) {
        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const words = text.split(" ");
        for (const word of words) {
          controller.enqueue(encoder.encode(word + " "));
          await new Promise(r => setTimeout(r, 20));
        }
        controller.close();
        return;
      }

      let buffer = "";

      response.data.on("data", (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split("\n");
        buffer = lines.pop();

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data:")) continue;
          const jsonStr = trimmed.replace(/^data:\s*/, "");
          if (jsonStr === "[DONE]") continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const token = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || "";
            if (token) controller.enqueue(encoder.encode(token));
          } catch {}
        }
      });

      response.data.on("end", () => controller.close());
      response.data.on("error", (err) => controller.error(err));
    }
  });
};