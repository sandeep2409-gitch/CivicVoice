import { ai } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { description, location } = await req.json();

    console.log("Location:", location);

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: `
You are a civic issue analysis agent.

Analyze the following issue report:

${description}

Respond ONLY with a valid JSON object.

{
  "category": "Road Hazard",
  "severity": "High",
  "summary": "Large pothole near a school creating danger for pedestrians and vehicles.",
  "suggestedAction": "Immediate road inspection and repair recommended."
}
`,
    });

    const text = response.text?.trim() || "";

    console.log("Gemini Response:");
    console.log(text);

    const cleanedText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleanedText);

    return Response.json(parsed);
  } catch (error) {
    console.error("Analyze API Error:", error);

    return Response.json(
      {
        category: "Unknown",
        severity: "Medium",
        summary:
          "The AI service encountered an error while processing this report.",
        suggestedAction:
          "Please try again or provide a more detailed description.",
      },
      { status: 200 },
    );
  }
}
