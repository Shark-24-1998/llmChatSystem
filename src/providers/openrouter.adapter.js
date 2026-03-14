import axios from "axios";

const normalizeMessages = (content) => {
  if (Array.isArray(content)) return content;
  return [{ role: "user", content }];
};

export const openRouterComplete = async (model, content) => {

  const messages = normalizeMessages(content);

  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model,
      temperature: 0,
      messages
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://ai.skinfotech.solutions",
        "X-Title": "AI SkinFotech Solutions"
      }
    }
  );

  return response.data.choices[0].message.content;

};

export const openRouterStream = async (model, content) => {

  const messages = normalizeMessages(content);

  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model,
      stream: true,
      messages
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://ai.skinfotech.solutions",
        "X-Title": "AI SkinFotech Solutions"
      },
      responseType: "stream"
    }
  );

  const encoder = new TextEncoder();

  return new ReadableStream({

    start(controller) {

      response.data.on("data", (chunk) => {

        const lines = chunk.toString().split("\n");

        for (const line of lines) {

          if (!line.startsWith("data:")) continue;

          const jsonStr = line.replace("data: ", "").trim();

          if (jsonStr === "[DONE]") return;

          try {

            const parsed = JSON.parse(jsonStr);

            const token =
              parsed?.choices?.[0]?.delta?.content || "";

            if (token) {
              controller.enqueue(encoder.encode(token));
            }

          } catch { }

        }

      });

      response.data.on("end", () => {

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));

        controller.close();

      });

      response.data.on("error", (err) => {

        controller.error(err);

      });

    }

  });

};