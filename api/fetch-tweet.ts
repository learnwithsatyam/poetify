// Vercel serverless function: POST /api/fetch-tweet
// Mirrors the Express route in server.ts but runs on Vercel's Node runtime.
import { extractTweetId, fetchTweetData } from "../lib/tweet";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Vercel parses JSON bodies automatically, but guard against a raw string too.
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const url = body?.url;
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
      return res.status(200).json(result.data);
    }
    return res.status(result.status || 404).json({ error: result.error || "Could not fetch tweet." });
  } catch (error: any) {
    console.error("Fetch tweet error:", error);
    return res.status(500).json({ error: "Failed to process tweet request: " + error.message });
  }
}
