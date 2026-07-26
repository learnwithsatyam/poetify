import React, { useState, useRef } from "react";
import {
  Heart,
  Repeat2,
  MessageCircle,
  BarChart3,
  Bookmark,
  BadgeCheck,
  Image as ImageIcon,
  Edit2,
  Check,
  X,
  Camera,
  Upload,
} from "lucide-react";
import { XLogo } from "./XLogo";
import { CardConfig, TweetData } from "../types";
import {
  formatCompactNumber,
  formatFullNumber,
  formatTweetDate,
  getProxiedImageUrl,
} from "../utils/formatters";

interface TweetCardProps {
  tweet: TweetData;
  config: CardConfig;
  onUpdateTweet: (updated: Partial<TweetData>) => void;
  isInteractive?: boolean;
  // CSS background of the canvas behind the card — used to build an export-safe
  // frosted-glass backdrop (a real blurred layer instead of CSS backdrop-filter).
  frostedBackdrop?: string;
}

export const TweetCard: React.FC<TweetCardProps> = ({
  tweet,
  config,
  onUpdateTweet,
  isInteractive = true,
  frostedBackdrop,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(tweet.text);
  const [editName, setEditName] = useState(tweet.author.name);
  const [editHandle, setEditHandle] = useState(tweet.author.handle);
  const [editAvatar, setEditAvatar] = useState(tweet.author.avatar || "");
  const [editLikes, setEditLikes] = useState(tweet.metrics.likes.toString());
  const [editRetweets, setEditRetweets] = useState(tweet.metrics.retweets.toString());
  const [editReplies, setEditReplies] = useState(tweet.metrics.replies.toString());
  const [editViews, setEditViews] = useState(tweet.metrics.views.toString());

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setEditAvatar(dataUrl);
        onUpdateTweet({
          author: {
            ...tweet.author,
            avatar: dataUrl,
          },
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveEdit = () => {
    onUpdateTweet({
      text: editText,
      author: {
        ...tweet.author,
        name: editName,
        handle: editHandle,
        avatar: editAvatar,
      },
      metrics: {
        ...tweet.metrics,
        likes: parseInt(editLikes, 10) || 0,
        retweets: parseInt(editRetweets, 10) || 0,
        replies: parseInt(editReplies, 10) || 0,
        views: parseInt(editViews, 10) || 0,
      },
    });
    setIsEditing(false);
  };

  // Theme Styling Classes & Inline CSS
  const getThemeStyles = () => {
    switch (config.theme) {
      case "light":
        return {
          container: "bg-white text-zinc-900 border border-zinc-200/80 shadow-2xl",
          text: "text-zinc-900",
          secondaryText: "text-zinc-500",
          metricIcon: "text-zinc-400 hover:text-zinc-600",
          borderStyle: "border-zinc-200/80",
          quoteBg: "bg-zinc-50 border-zinc-200",
        };
      case "dim":
        return {
          container: "bg-[#15202b] text-slate-100 border border-slate-700/60 shadow-2xl",
          text: "text-slate-100",
          secondaryText: "text-slate-400",
          metricIcon: "text-slate-400 hover:text-slate-200",
          borderStyle: "border-slate-700/60",
          quoteBg: "bg-[#1e2732] border-slate-700",
        };
      case "glass":
        // No backdrop-blur here — the frosted effect is built from real layers
        // (see the glass backdrop block below) so it survives PNG export.
        return {
          container: "text-white border border-white/20 shadow-2xl shadow-black/40",
          text: "text-white",
          secondaryText: "text-zinc-300/80",
          metricIcon: "text-white/60 hover:text-white",
          borderStyle: "border-white/15",
          quoteBg: "bg-white/5 border-white/10",
        };
      case "paper":
        return {
          container: "bg-[#fbf7ee] text-[#2c2416] border border-[#e2d5c3] shadow-xl",
          text: "text-[#2c2416]",
          secondaryText: "text-[#7a6b57]",
          metricIcon: "text-[#8c7a65]",
          borderStyle: "border-[#e2d5c3]",
          quoteBg: "bg-[#f2e9d8] border-[#e2d5c3]",
        };
      case "obsidian":
        return {
          container: "bg-[#09090b] text-zinc-100 border border-zinc-800 shadow-2xl",
          text: "text-zinc-100",
          secondaryText: "text-zinc-500",
          metricIcon: "text-zinc-500 hover:text-zinc-300",
          borderStyle: "border-zinc-800",
          quoteBg: "bg-zinc-900 border-zinc-800",
        };
      case "custom":
        return {
          container: "shadow-2xl",
          text: "",
          secondaryText: "opacity-70",
          metricIcon: "opacity-70",
          borderStyle: "border-current/20",
          quoteBg: "bg-black/10 border-current/20",
        };
      case "dark":
      default:
        return {
          container: "bg-zinc-950 text-zinc-100 border border-zinc-800/90 shadow-2xl",
          text: "text-zinc-100",
          secondaryText: "text-zinc-400",
          metricIcon: "text-zinc-500 hover:text-zinc-300",
          borderStyle: "border-zinc-800",
          quoteBg: "bg-zinc-900/80 border-zinc-800",
        };
    }
  };

  const themeStyle = getThemeStyles();

  // Shadow class mapping
  const getShadowClass = () => {
    switch (config.shadow) {
      case "none":
        return "shadow-none";
      case "soft":
        return "shadow-lg shadow-black/10";
      case "medium":
        return "shadow-xl shadow-black/20";
      case "heavy":
        return "shadow-2xl shadow-black/50";
      case "glow":
        return "shadow-[0_0_50px_rgba(244,63,94,0.25)]";
      case "elevated":
        return "shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]";
      default:
        return "shadow-2xl";
    }
  };

  // Font family mapping
  const getFontClass = () => {
    switch (config.fontFamily) {
      case "serif":
        return "font-serif tracking-normal";
      case "mono":
        return "font-mono tracking-tight";
      case "display":
        return "font-sans font-medium tracking-tight";
      case "handwriting":
        return "font-serif italic";
      case "sans":
      default:
        return "font-sans tracking-normal";
    }
  };

  // Format hashtags and mentions
  const renderFormattedText = (content: string) => {
    if (!content) return null;
    const parts = content.split(/(\s+)/);

    return parts.map((part, idx) => {
      if (part.startsWith("#") || part.startsWith("@")) {
        return (
          <span key={idx} className="text-sky-400 hover:underline font-medium">
            {part}
          </span>
        );
      }
      if (part.startsWith("http://") || part.startsWith("https://")) {
        return (
          <span key={idx} className="text-sky-400 hover:underline font-normal">
            {part.length > 30 ? part.substring(0, 30) + "..." : part}
          </span>
        );
      }
      return <React.Fragment key={idx}>{part}</React.Fragment>;
    });
  };

  const formatNum = (num: number) =>
    config.metricFormat === "compact" ? formatCompactNumber(num) : formatFullNumber(num);

  const proxiedAvatar = tweet.author.avatar ? getProxiedImageUrl(tweet.author.avatar) : "";

  return (
    <div className="relative group/card">
      {/* Inline Quick Edit Toggle Button */}
      {isInteractive && !isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          className="absolute -top-3 -right-3 z-20 px-2.5 py-1 rounded-full bg-rose-500 text-white text-[11px] font-semibold flex items-center gap-1 shadow-lg opacity-0 group-hover/card:opacity-100 transition duration-200"
        >
          <Edit2 className="w-3 h-3" /> Edit Card
        </button>
      )}

      {/* Main Tweet Card Container */}
      <div
        className={`relative overflow-hidden w-full mx-auto rounded-2xl transition-all duration-300 ${
          themeStyle.container
        } ${getShadowClass()} ${getFontClass()} ${
          config.border ? "border" : "border-0"
        }`}
        style={
          config.theme === "custom"
            ? {
                maxWidth: `${config.cardWidth}px`,
                backgroundColor: config.customCardBg,
                color: config.customTextColor,
                borderRadius: `${config.borderRadius}px`,
                borderColor: config.borderColor,
              }
            : {
                maxWidth: `${config.cardWidth}px`,
                borderRadius: `${config.borderRadius}px`,
                borderColor: config.borderColor,
              }
        }
      >
        {/* Export-safe frosted glass: a real blurred backdrop layer using an
            element-level `filter: blur()` (which html-to-image renders) instead
            of CSS `backdrop-filter` (which it cannot capture). */}
        {config.theme === "glass" && (
          <>
            <div
              className="absolute inset-0 z-0 pointer-events-none"
              style={{
                background: frostedBackdrop || "rgb(24,24,37)",
                transform: "scale(1.35)",
                filter: "blur(32px) saturate(1.4)",
              }}
            />
            <div className="absolute inset-0 z-0 pointer-events-none bg-zinc-950/40" />
            <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-white/12 to-transparent" />
          </>
        )}

        <div className="relative z-10">
        <div className="p-5 sm:p-6 flex flex-col gap-4">
          {/* Header Row: Author Avatar, Name, Handle, Twitter Logo */}
          <div className="flex items-start justify-between gap-3">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleAvatarFileUpload}
              className="hidden"
            />

            <div className="flex items-center gap-3 min-w-0">
              {config.showAvatar && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative shrink-0 group/avatar cursor-pointer"
                  title="Click to change avatar photo"
                >
                  {proxiedAvatar ? (
                    <img
                      src={proxiedAvatar}
                      alt={tweet.author.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10 group-hover/avatar:opacity-80 transition"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center font-bold text-white text-lg ring-2 ring-white/10">
                      {tweet.author.name.charAt(0) || "T"}
                    </div>
                  )}
                  {/* Hover Overlay Icon */}
                  <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition flex items-center justify-center text-white">
                    <Camera className="w-4 h-4" />
                  </div>
                </div>
              )}

              <div className="flex flex-col min-w-0 leading-tight">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Author Name"
                      className="px-2 py-0.5 rounded bg-black/20 border border-white/20 text-sm font-bold focus:outline-none"
                    />
                  ) : (
                    <span className={`font-bold text-base ${themeStyle.text} truncate`}>
                      {tweet.author.name}
                    </span>
                  )}

                  {config.showVerified && tweet.author.verified && (
                    <BadgeCheck
                      className={`w-4 h-4 shrink-0 ${
                        tweet.author.verifiedType === "gold"
                          ? "text-amber-400"
                          : tweet.author.verifiedType === "grey"
                          ? "text-zinc-400"
                          : "text-sky-500"
                      }`}
                    />
                  )}
                </div>

                {isEditing ? (
                  <div className="flex items-center gap-1 mt-1">
                    <input
                      type="text"
                      value={editHandle}
                      onChange={(e) => setEditHandle(e.target.value)}
                      placeholder="handle"
                      className="px-2 py-0.5 rounded bg-black/20 border border-white/20 text-xs focus:outline-none"
                    />
                  </div>
                ) : (
                  <span className={`text-sm ${themeStyle.secondaryText} truncate`}>
                    @{tweet.author.handle}
                  </span>
                )}
              </div>
            </div>

            {/* X / Twitter Badge */}
            {config.showTwitterLogo && (
              <div className="shrink-0 p-1 opacity-90">
                <XLogo className="w-5 h-5" />
              </div>
            )}
          </div>

          {/* Tweet Text Body */}
          <div className="leading-relaxed whitespace-pre-wrap">
            {isEditing ? (
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={4}
                className="w-full p-2.5 rounded-xl bg-black/20 border border-white/20 text-sm focus:outline-none resize-y"
              />
            ) : (
              <p
                className={`${themeStyle.text}`}
                style={{ fontSize: `${config.fontSize}px`, textAlign: config.textAlignment }}
              >
                {renderFormattedText(tweet.text)}
              </p>
            )}
          </div>

          {/* Media Images Grid */}
          {config.showMedia && tweet.media && tweet.media.length > 0 && (
            <div
              className={`grid gap-2 rounded-xl overflow-hidden border ${themeStyle.borderStyle} mt-1`}
              style={{
                gridTemplateColumns:
                  tweet.media.length === 1 ? "1fr" : "repeat(2, minmax(0, 1fr))",
              }}
            >
              {tweet.media.map((imgUrl, idx) => (
                <div key={idx} className="relative aspect-video max-h-80 bg-black/10 overflow-hidden">
                  <img
                    src={getProxiedImageUrl(imgUrl)}
                    alt="Tweet media"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover hover:scale-105 transition duration-500"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Quoted Tweet Block */}
          {config.showQuote && tweet.quote && (
            <div
              className={`p-3.5 rounded-xl border ${themeStyle.quoteBg} flex flex-col gap-2 text-xs mt-1`}
            >
              <div className="flex items-center gap-1.5 font-semibold">
                <span>{tweet.quote.author.name}</span>
                <span className={themeStyle.secondaryText}>@{tweet.quote.author.handle}</span>
              </div>
              <p className={themeStyle.text}>{tweet.quote.text}</p>
            </div>
          )}

          {/* Date & Timestamp Row */}
          {config.showTimestamp && (
            <div
              className={`text-xs ${themeStyle.secondaryText} pt-1 border-t ${themeStyle.borderStyle} flex items-center justify-between gap-2`}
            >
              <span>{formatTweetDate(tweet.createdAt)}</span>
              <span className="text-[10px] uppercase font-semibold tracking-wider opacity-60">
                X for Web
              </span>
            </div>
          )}

          {/* Engagement Metrics Row */}
          {config.showMetrics && (
            <div
              className={`flex items-center justify-between pt-2 border-t ${themeStyle.borderStyle} text-xs ${themeStyle.secondaryText}`}
            >
              <div className="flex items-center gap-1.5 hover:text-sky-400 transition cursor-default">
                <MessageCircle className="w-4 h-4 text-sky-400/80" />
                <span>{formatNum(tweet.metrics.replies)}</span>
              </div>

              <div className="flex items-center gap-1.5 hover:text-emerald-400 transition cursor-default">
                <Repeat2 className="w-4 h-4 text-emerald-400/80" />
                <span>{formatNum(tweet.metrics.retweets)}</span>
              </div>

              <div className="flex items-center gap-1.5 hover:text-rose-400 transition cursor-default">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                <span>{formatNum(tweet.metrics.likes)}</span>
              </div>

              <div className="flex items-center gap-1.5 hover:text-sky-400 transition cursor-default">
                <BarChart3 className="w-4 h-4 text-sky-400/80" />
                <span>{formatNum(tweet.metrics.views)}</span>
              </div>

              <div className="flex items-center gap-1.5 hover:text-amber-400 transition cursor-default">
                <Bookmark className="w-4 h-4 text-amber-400/80" />
                <span>{formatNum(tweet.metrics.bookmarks)}</span>
              </div>
            </div>
          )}

          {/* Inline Edit Form Actions & Avatar Input */}
          {isEditing && (
            <div className="pt-3 border-t border-white/20 flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-black/20 p-2.5 rounded-xl border border-white/10 text-xs">
                <span className="font-semibold text-slate-300 shrink-0">Avatar Image:</span>
                <input
                  type="text"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  placeholder="Paste avatar URL (https://...)"
                  className="flex-1 px-2 py-1 rounded bg-black/30 border border-white/10 text-xs focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded bg-indigo-600/50 hover:bg-indigo-600 text-indigo-200 hover:text-white font-medium flex items-center gap-1 shrink-0 transition"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload Photo
                </button>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-xs font-medium text-zinc-300 flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-xs font-semibold text-white flex items-center gap-1 shadow"
                >
                  <Check className="w-3.5 h-3.5" /> Apply Changes
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Custom Watermark */}
        {config.showWatermark && (
          <div className="px-5 py-2 rounded-b-2xl bg-black/20 text-[11px] font-medium text-center opacity-75 tracking-wide border-t border-white/10">
            {config.watermarkText || "Created with Poetify"}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
