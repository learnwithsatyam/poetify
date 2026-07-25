import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

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

// Extract Tweet ID from various URL formats or raw ID
function extractTweetId(input: string): string | null {
  if (!input) return null;
  const cleanInput = input.trim();

  // If it's already a numeric ID
  if (/^\d+$/.test(cleanInput)) {
    return cleanInput;
  }

  // Regex matching twitter.com or x.com / status / ID
  const match = cleanInput.match(/(?:twitter\.com|x\.com)\/(?:#!\/)?(\w+)\/status\/(\d+)/i);
  if (match && match[2]) {
    return match[2];
  }

  // Alternative URL structure fallback
  const statusMatch = cleanInput.match(/status\/(\d+)/i);
  if (statusMatch && statusMatch[1]) {
    return statusMatch[1];
  }

  return null;
}

// Endpoint to fetch tweet data given a URL or Tweet ID
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

    // Try FXTwitter / FixupX API first (reliable structured data with media, stats, verified)
    try {
      const fxRes = await fetch(`https://api.fxtwitter.com/status/${tweetId}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; Poetify/1.0)",
        },
      });

      if (fxRes.ok) {
        const fxData = await fxRes.json();
        if (fxData && fxData.tweet) {
          const tw = fxData.tweet;
          const mediaUrls = (tw.media?.photos || []).map((p: any) => p.url);
          if (tw.media?.videos && tw.media.videos.length > 0) {
            const thumbnail = tw.media.videos[0].thumbnail_url;
            if (thumbnail) mediaUrls.push(thumbnail);
          }

          let quoteData = null;
          if (tw.quote) {
            quoteData = {
              text: tw.quote.text,
              author: {
                name: tw.quote.author?.name || "User",
                handle: tw.quote.author?.screen_name || "user",
                avatar: tw.quote.author?.avatar_url || "",
                verified: tw.quote.author?.verified || false,
              },
            };
          }

          return res.json({
            id: tw.id,
            url: tw.url || `https://x.com/${tw.author?.screen_name}/status/${tw.id}`,
            text: tw.text || "",
            createdAt: tw.created_at || new Date().toISOString(),
            author: {
              name: tw.author?.name || "Twitter User",
              handle: tw.author?.screen_name || "user",
              avatar: tw.author?.avatar_url || "",
              verified: tw.author?.verified || false,
              verifiedType: tw.author?.verified_type || "blue",
            },
            metrics: {
              likes: tw.likes || 0,
              retweets: tw.retweets || 0,
              replies: tw.replies || 0,
              views: tw.views || 0,
              bookmarks: tw.bookmarks || 0,
            },
            media: mediaUrls,
            quote: quoteData,
          });
        }
      }
    } catch (fxErr) {
      console.warn("FXTwitter API request failed, trying syndication fallback...", fxErr);
    }

    // Fallback 1: Twitter Syndication CDN API
    try {
      const synRes = await fetch(`https://cdn.syndication.twimg.com/tweet-result?id=${tweetId}&token=a`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      if (synRes.ok) {
        const tw = await synRes.json();
        const mediaUrls: string[] = [];
        if (tw.photos) {
          tw.photos.forEach((p: any) => {
            if (p.url) mediaUrls.push(p.url);
          });
        }

        return res.json({
          id: tw.id_str || tweetId,
          url: `https://x.com/${tw.user?.screen_name || "user"}/status/${tweetId}`,
          text: tw.text || "",
          createdAt: tw.created_at || new Date().toISOString(),
          author: {
            name: tw.user?.name || "Twitter User",
            handle: tw.user?.screen_name || "user",
            avatar: tw.user?.profile_image_url_https?.replace("_normal", "_400x400") || "",
            verified: tw.user?.is_blue_verified || tw.user?.verified || false,
            verifiedType: tw.user?.verified_type || "blue",
          },
          metrics: {
            likes: tw.favorite_count || 0,
            retweets: tw.retweet_count || 0,
            replies: tw.reply_count || 0,
            views: tw.views?.count ? parseInt(tw.views.count, 10) : 0,
            bookmarks: tw.bookmark_count || 0,
          },
          media: mediaUrls,
          quote: tw.quoted_tweet
            ? {
                text: tw.quoted_tweet.text,
                author: {
                  name: tw.quoted_tweet.user?.name || "User",
                  handle: tw.quoted_tweet.user?.screen_name || "user",
                  avatar: tw.quoted_tweet.user?.profile_image_url_https || "",
                  verified: tw.quoted_tweet.user?.is_blue_verified || false,
                },
              }
            : null,
        });
      }
    } catch (synErr) {
      console.warn("Syndication API failed:", synErr);
    }

    // Fallback 2: Twitter OEmbed API
    try {
      const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(
        `https://x.com/x/status/${tweetId}`
      )}`;
      const oRes = await fetch(oembedUrl);
      if (oRes.ok) {
        const oData = await oRes.json();
        // Extract raw text from HTML string returned by oEmbed
        const htmlText = oData.html || "";
        const cleanText = htmlText
          .replace(/<br\s*\/?>/gi, "\n")
          .replace(/<[^>]+>/g, "")
          .replace(/&mdash;[\s\S]*$/, "")
          .trim();

        return res.json({
          id: tweetId,
          url: oData.url || `https://x.com/user/status/${tweetId}`,
          text: cleanText || "Tweet content fetched via Twitter Embed.",
          createdAt: new Date().toISOString(),
          author: {
            name: oData.author_name || "Twitter User",
            handle: (oData.author_url || "").split("/").pop() || "twitteruser",
            avatar: `https://unavatar.io/x/${(oData.author_url || "").split("/").pop() || "twitter"}`,
            verified: true,
            verifiedType: "blue",
          },
          metrics: {
            likes: 1240,
            retweets: 382,
            replies: 89,
            views: 45200,
            bookmarks: 210,
          },
          media: [],
          quote: null,
        });
      }
    } catch (oErr) {
      console.warn("OEmbed API failed:", oErr);
    }

    return res.status(404).json({
      error:
        "Could not fetch tweet automatically. Please check the URL, or use the built-in manual editor to customize your tweet card!",
    });
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
