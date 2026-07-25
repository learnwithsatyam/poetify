import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { extractTweetId, fetchTweetData } from "./api/_lib/tweet";

const app = express();
const PORT = 3000;

app.use(express.json());

// Proxy image endpoint to bypass CORS when html-to-image renders canvas
app.get("/api/proxy-image", async (req, res) => {
  try {
    const imageUrl = req.query.url as string;
    if (!imageUrl) {
      return res.status(400).send("Missing image URL");
    }

    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      return res.status(response.status).send("Failed to fetch image");
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", contentType);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.send(buffer);
  } catch (err: any) {
    console.error("Proxy image error:", err);
    return res.status(500).send("Proxy error: " + err.message);
  }
});

// Endpoint to fetch tweet data given a URL or Tweet ID.
// The URL parsing + API fallback chain lives in api/_lib/tweet.ts so it is shared
// with the Vercel serverless function (api/fetch-tweet.ts).
app.post("/api/fetch-tweet", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "Please provide a valid Twitter/X URL or ID" });
    }

    const tweetId = extractTweetId(url);
    if (!tweetId) {
      return res.status(400).json({
        error: "Invalid Twitter/X link. Example valid link: https://x.com/jack/status/20",
      });
    }

    const result = await fetchTweetData(tweetId);
    if (result.data) {
      return res.json(result.data);
    }
    return res.status(result.status || 404).json({ error: result.error || "Could not fetch tweet." });
  } catch (error: any) {
    console.error("Fetch tweet error:", error);
    return res.status(500).json({ error: "Failed to process tweet request: " + error.message });
  }
});

// AI Helper route to generate AI tweet ideas or rewrite content
app.post("/api/ai-enhance", async (req, res) => {
  try {
    const { prompt, currentText } = req.body;
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
    return res.json({ enhancedText: resultText });
  } catch (error: any) {
    console.error("AI Enhance error:", error);
    return res.status(500).json({ error: "AI enhancement failed: " + error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Poetify server running on http://localhost:${PORT}`);
  });
}

startServer();
