// Vercel serverless function: POST /api/fetch-tweet
// Mirrors the Express route in server.ts but runs on Vercel's Node runtime.
//
// The tweet logic is loaded via a *dynamic* import inside the try/catch so that a
// module-load failure (e.g. a bundling / "Cannot find module" issue) is caught and
// reported as JSON instead of crashing into Vercel's opaque HTTP 500 page.
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

    const { extractTweetId, fetchTweetData } = await import("../lib/tweet");

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
    // Surface the real cause to the client so we can diagnose without Vercel logs.
    return res.status(500).json({
      error: "Tweet server error: " + (error?.message || String(error)),
      detail: String(error?.stack || "")
        .split("\n")
        .slice(0, 5)
        .join(" | "),
    });
  }
}
