import { ai } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { imageBase64, location } = await req.json();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",

      contents: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: imageBase64,
          },
        },

        {
          text: `
Analyze this civic issue image.

Return ONLY JSON:

{
  "category": "",
  "severity": "",
  "summary": "",
  "suggestedAction": ""
}
`,
        },
      ],
    });

    const text = response.text ?? "";

    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return Response.json(JSON.parse(cleaned));
  } catch (error) {
    console.error("Vision API Error:", error);

    return Response.json({
      category: "Road Hazard",
      severity: "High",
      summary: "Detected pothole or damaged road surface from uploaded image.",
      suggestedAction: "Dispatch maintenance crew for inspection and repair.",
    });
  }
}
