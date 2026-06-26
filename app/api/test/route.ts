import { ai } from "@/lib/gemini";

export async function GET() {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
    contents: "Say hello from civic-us",
  });

  return Response.json({
    text: response.text,
  });
}
