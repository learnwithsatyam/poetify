export interface Author {
  name: string;
  handle: string;
  avatar: string;
  verified: boolean;
  verifiedType?: "blue" | "gold" | "grey" | "none";
}

export interface TweetMetrics {
  likes: number;
  retweets: number;
  replies: number;
  views: number;
  bookmarks: number;
}

export interface QuotedTweet {
  text: string;
  author: Author;
}

export interface TweetData {
  id: string;
  url: string;
  text: string;
  createdAt: string;
  author: Author;
  metrics: TweetMetrics;
  media: string[];
  quote?: QuotedTweet | null;
}

export type AspectRatio = "auto" | "1:1" | "16:9" | "9:16" | "4:3" | "4:5" | "3:1";

export type CardTheme = "light" | "dark" | "dim" | "glass" | "obsidian" | "paper" | "custom";

export type FontOption = "sans" | "serif" | "mono" | "display" | "handwriting";

export type CardShadow = "none" | "soft" | "medium" | "heavy" | "glow" | "elevated";

export interface CanvasConfig {
  aspectRatio: AspectRatio;
  padding: number; // in pixels (e.g. 16 to 120)
  bgType: "gradient" | "solid" | "pattern" | "image";
  bgGradient: string; // Tailwind or CSS gradient string
  bgSolidColor: string;
  bgImage?: string;
  bgPattern?: "none" | "dots" | "grid" | "noise";
  bgBlur: number; // 0 to 20
  bgNoise: boolean;
}

export interface CardConfig {
  theme: CardTheme;
  customCardBg: string;
  customTextColor: string;
  borderRadius: number; // 0 to 32
  shadow: CardShadow;
  border: boolean;
  borderColor: string;
  fontFamily: FontOption;
  fontSize: number; // 12 to 24
  cardWidth: number; // max width of the inner card in px (e.g. 320 to 720)
  textAlignment: "left" | "center";
  
  // Visibility toggles
  showAvatar: boolean;
  showVerified: boolean;
  showTwitterLogo: boolean;
  showTimestamp: boolean;
  showMetrics: boolean;
  showMedia: boolean;
  showQuote: boolean;
  showWatermark: boolean;
  watermarkText: string;
  
  // Custom metrics overrides
  metricFormat: "compact" | "full"; // e.g. 12.4K vs 12,400
}

export interface SavedSnap {
  id: string;
  title: string;
  timestamp: number;
  tweetData: TweetData;
  canvasConfig: CanvasConfig;
  cardConfig: CardConfig;
  previewThumbnail?: string;
}

export interface StylePreset {
  id: string;
  name: string;
  category: "classic" | "vibrant" | "dark" | "minimal" | "retro";
  canvasConfig: Partial<CanvasConfig>;
  cardConfig: Partial<CardConfig>;
}
