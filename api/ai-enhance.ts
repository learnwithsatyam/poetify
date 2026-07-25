// Vercel serverless function: POST /api/ai-enhance
// Uses the server-side Gemini API key to polish tweet text.
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const prompt = body?.prompt;
    const currentText = body?.currentText;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(400).json({
        error: "Gemini API key is not configured. You can edit tweet text directly in the editor!",
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an expert social media content creator and visual designer.
      Task: ${prompt || "Rewrite and polish this text to make it punchy, engaging, and perfect for a viral tweet visual card."}
      Current text: "${currentText || ""}"
      Return concise, engaging text suitable for a social post. Do not add conversational intro/outro.`,
    });

    const resultText = response.text?.trim() || currentText;
    return res.status(200).json({ enhancedText: resultText });
  } catch (error: any) {
    console.error("AI Enhance error:", error);
    return res.status(500).json({ error: "AI enhancement failed: " + error.message });
  }
}
