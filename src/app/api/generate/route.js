import { generateController } from "@/controllers/generate.controller";

export async function POST(req) {

  const { prompt, chatId } = await req.json();

  const stream = await generateController(prompt, chatId);

  return new Response(stream,{
    headers:{
      "Content-Type":"text/event-stream"
    }
  });

}