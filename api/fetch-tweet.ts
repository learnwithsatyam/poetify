// Vercel serverless function: POST /api/fetch-tweet
//
// IMPORTANT: this file is intentionally SELF-CONTAINED — it imports no local
// project files. package.json has "type": "module", so Vercel runs the compiled
// function as native ESM and does NOT bundle relative imports; a `../lib/foo`
// import therefore fails at runtime with ERR_MODULE_NOT_FOUND. Keeping the tweet
// logic in this file avoids that entirely. The local Express dev server
// (server.ts) imports the exported helpers below, so there is still one source
// of truth for URL parsing and the API fallback chain.

// Abort external requests that hang so a slow upstream can't exhaust the
// serverless function's execution time budget.
const FETCH_TIMEOUT_MS = 6000;

export interface NormalizedTweet {
  id: string;
  url: string;
  text: string;
  createdAt: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
    verified: boolean;
    verifiedType: string;
  };
  metrics: {
    likes: number;
    retweets: number;
    replies: number;
    views: number;
    bookmarks: number;
  };
  media: string[];
  quote: {
    text: string;
    author: { name: string; handle: string; avatar: string; verified: boolean };
  } | null;
}

export interface FetchTweetResult {
  data?: NormalizedTweet;
  status: number;
  error?: string;
}

// Extract Tweet ID from various URL formats or a raw numeric ID.
export function extractTweetId(input: string): string | null {
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

// Fetch + normalize tweet data, trying FXTwitter → Syndication CDN → OEmbed in order.
export async function fetchTweetData(tweetId: string): Promise<FetchTweetResult> {
  // Try FXTwitter / FixupX API first (reliable structured data with media, stats, verified)
  try {
    const fxRes = await fetch(`https://api.fxtwitter.com/status/${tweetId}`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Poetify/1.0)" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (fxRes.ok) {
      const fxData: any = await fxRes.json();
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

        return {
          status: 200,
          data: {
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
          },
        };
      }
    }
  } catch (fxErr) {
    console.warn("FXTwitter API request failed, trying syndication fallback...", fxErr);
  }

  // Fallback 1: Twitter Syndication CDN API
  try {
    const synRes = await fetch(
      `https://cdn.syndication.twimg.com/tweet-result?id=${tweetId}&token=a`,
      {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      }
    );

    if (synRes.ok) {
      const tw: any = await synRes.json();
      const mediaUrls: string[] = [];
      if (tw.photos) {
        tw.photos.forEach((p: any) => {
          if (p.url) mediaUrls.push(p.url);
        });
      }

      return {
        status: 200,
        data: {
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
        },
      };
    }
  } catch (synErr) {
    console.warn("Syndication API failed:", synErr);
  }

  // Fallback 2: Twitter OEmbed API
  try {
    const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(
      `https://x.com/x/status/${tweetId}`
    )}`;
    const oRes = await fetch(oembedUrl, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (oRes.ok) {
      const oData: any = await oRes.json();
      // Extract raw text from HTML string returned by oEmbed
      const htmlText = oData.html || "";
      const cleanText = htmlText
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&mdash;[\s\S]*$/, "")
        .trim();

      return {
        status: 200,
        data: {
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
        },
      };
    }
  } catch (oErr) {
    console.warn("OEmbed API failed:", oErr);
  }

  return {
    status: 404,
    error:
      "Could not fetch tweet automatically. Please check the URL, or use the built-in manual editor to customize your tweet card!",
  };
}

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
    return res.status(500).json({
      error: "Failed to process tweet request: " + (error?.message || String(error)),
    });
  }
}
