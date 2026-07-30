import React, { useRef, useState } from "react";
import { BadgeCheck, Check, Edit2, Upload, X } from "lucide-react";
import { XLogo } from "./XLogo";
import { GlassBackdrop } from "./GlassBackdrop";
import { CardConfig, TweetData } from "../types";
import {
  getCardSurfaceStyle,
  getCardThemeStyle,
  getFontClass,
  getShadowClass,
} from "../utils/cardTheme";
import { getProxiedImageUrl } from "../utils/formatters";

interface QuotePosterProps {
  tweet: TweetData;
  config: CardConfig;
  onUpdateTweet: (updated: Partial<TweetData>) => void;
  isInteractive?: boolean;
  canvasBackground?: string;
  fill?: boolean;
  contentPadding?: number;
}

// Auto-fit is deliberately length-based rather than measured: a measuring pass
// would race the export (html-to-image captures immediately after paint), so a
// deterministic scale keeps the PNG identical to the preview.
const AUTO_FIT_STEPS: { maxChars: number; scale: number }[] = [
  { maxChars: 70, scale: 1 },
  { maxChars: 130, scale: 0.84 },
  { maxChars: 210, scale: 0.68 },
  { maxChars: 320, scale: 0.55 },
  { maxChars: Infinity, scale: 0.45 },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * Big typographic quote graphic — the layout used by quote posts on Instagram:
 * no avatar chrome or engagement metrics, just the line, the attribution and a
 * lot of breathing room.
 */
export const QuotePoster: React.FC<QuotePosterProps> = ({
  tweet,
  config,
  onUpdateTweet,
  isInteractive = true,
  canvasBackground,
  fill = false,
  contentPadding,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(tweet.text);
  const [editName, setEditName] = useState(tweet.author.name);
  const [editHandle, setEditHandle] = useState(tweet.author.handle);
  const [editAvatar, setEditAvatar] = useState(tweet.author.avatar || "");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setEditAvatar(dataUrl);
        onUpdateTweet({ author: { ...tweet.author, avatar: dataUrl } });
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
    });
    setIsEditing(false);
  };

  const themeStyle = getCardThemeStyle(config.theme);
  const shadowClass = fill ? "shadow-none" : getShadowClass(config.shadow);
  const isCentered = config.textAlignment === "center";

  const scale = config.posterAutoFit
    ? AUTO_FIT_STEPS.find((step) => tweet.text.length <= step.maxChars)!.scale
    : 1;
  const quoteSize = Math.max(16, Math.round(config.posterFontSize * scale));
  const attributionSize = clamp(Math.round(quoteSize * 0.34), 12, 22);
  const blockGap = clamp(Math.round(quoteSize * 0.55), 12, 40);
  const padding = contentPadding ?? clamp(Math.round(quoteSize * 1.1), 32, 88);
  const insetOffset = Math.max(12, Math.round(padding * 0.42));

  const proxiedAvatar = tweet.author.avatar ? getProxiedImageUrl(tweet.author.avatar) : "";
  const showAvatar = config.showAvatar && !!proxiedAvatar;

  return (
    <div className={`relative group/card ${fill ? "w-full h-full" : "w-full"}`}>
      {isInteractive && !isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          className="absolute -top-3 -right-3 z-20 px-2.5 py-1 rounded-full bg-rose-500 text-white text-[11px] font-semibold flex items-center gap-1 shadow-lg opacity-0 group-hover/card:opacity-100 transition duration-200"
        >
          <Edit2 className="w-3 h-3" /> Edit Quote
        </button>
      )}

      <div
        className={`relative overflow-hidden w-full mx-auto transition-all duration-300 ${
          themeStyle.container
        } ${shadowClass} ${getFontClass(config.fontFamily)} ${
          config.border ? "border" : "border-0"
        } ${fill ? "" : "min-h-[280px]"}`}
        style={getCardSurfaceStyle(config, canvasBackground, fill)}
      >
        {config.theme === "glass" && <GlassBackdrop background={canvasBackground} />}

        {/* Hairline frame inset from the card edge (classic printed-poster look) */}
        {config.posterInsetBorder && (
          <div
            className={`absolute z-10 pointer-events-none border ${themeStyle.borderStyle} opacity-70`}
            style={{
              top: insetOffset,
              right: insetOffset,
              bottom: insetOffset,
              left: insetOffset,
              borderRadius: `${Math.max(0, config.borderRadius - insetOffset / 2)}px`,
            }}
          />
        )}

        <div
          className="relative z-10 flex flex-col w-full h-full"
          style={{ padding: `${padding}px` }}
        >
          {config.showTwitterLogo && (
            <div
              className={`flex ${isCentered ? "justify-center" : "justify-start"} opacity-80`}
              style={{ marginBottom: blockGap }}
            >
              <XLogo className="w-6 h-6" />
            </div>
          )}

          <div
            className={`flex-1 flex flex-col justify-center ${
              isCentered ? "items-center" : "items-start"
            }`}
          >
            {config.posterMark === "glyph" && (
              <span
                className="font-serif leading-none opacity-20 select-none"
                style={{ fontSize: `${Math.round(quoteSize * 2)}px`, marginBottom: -blockGap }}
                aria-hidden
              >
                &ldquo;
              </span>
            )}

            {config.posterMark === "bar" && (
              <div
                className={`rounded-full ${themeStyle.accentBar} opacity-90`}
                style={{ width: quoteSize * 1.6, height: Math.max(3, quoteSize * 0.09), marginBottom: blockGap }}
              />
            )}

            {isEditing ? (
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={4}
                className="w-full p-3 rounded-xl bg-black/20 border border-white/20 text-sm focus:outline-none resize-y"
              />
            ) : (
              <p
                className={`${themeStyle.text} font-semibold whitespace-pre-wrap w-full`}
                style={{
                  fontSize: `${quoteSize}px`,
                  lineHeight: 1.2,
                  letterSpacing: "-0.015em",
                  textAlign: config.textAlignment,
                }}
              >
                {tweet.text}
              </p>
            )}

            {config.showAttribution && !isEditing && (
              <div
                className={`flex items-center gap-3 ${isCentered ? "justify-center" : ""}`}
                style={{ marginTop: blockGap * 1.4 }}
              >
                {showAvatar && (
                  <img
                    src={proxiedAvatar}
                    alt={tweet.author.name}
                    referrerPolicy="no-referrer"
                    className="rounded-full object-cover ring-2 ring-white/20 shrink-0"
                    style={{ width: attributionSize * 2.6, height: attributionSize * 2.6 }}
                  />
                )}
                <div className={isCentered && !showAvatar ? "text-center" : ""}>
                  <div
                    className="font-semibold uppercase flex items-center gap-1.5"
                    style={{ fontSize: `${attributionSize}px`, letterSpacing: "0.16em" }}
                  >
                    <span>
                      {showAvatar ? "" : "— "}
                      {tweet.author.name}
                    </span>
                    {config.showVerified && tweet.author.verified && (
                      <BadgeCheck
                        className="shrink-0 text-sky-500"
                        style={{ width: attributionSize, height: attributionSize }}
                      />
                    )}
                  </div>
                  {tweet.author.handle && (
                    <div
                      className={themeStyle.secondaryText}
                      style={{ fontSize: `${Math.round(attributionSize * 0.92)}px`, letterSpacing: "0.04em" }}
                    >
                      @{tweet.author.handle}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {config.showWatermark && !isEditing && (
            <div
              className={`${themeStyle.secondaryText} uppercase tracking-[0.2em] ${
                isCentered ? "text-center" : "text-left"
              }`}
              style={{ fontSize: `${Math.round(attributionSize * 0.8)}px`, marginTop: blockGap * 1.5 }}
            >
              {config.watermarkText || "Created with Poetify"}
            </div>
          )}

          {/* Inline Edit Form */}
          {isEditing && (
            <div className="mt-4 pt-4 border-t border-white/20 flex flex-col gap-3 text-xs">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleAvatarFileUpload}
                className="hidden"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Author name"
                  className="px-2.5 py-1.5 rounded-lg bg-black/20 border border-white/20 focus:outline-none"
                />
                <input
                  type="text"
                  value={editHandle}
                  onChange={(e) => setEditHandle(e.target.value)}
                  placeholder="handle"
                  className="px-2.5 py-1.5 rounded-lg bg-black/20 border border-white/20 focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-600/50 hover:bg-indigo-600 text-indigo-100 font-medium flex items-center gap-1.5 transition"
                >
                  <Upload className="w-3.5 h-3.5" /> Photo
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 rounded-lg bg-black/30 hover:bg-black/50 font-medium text-zinc-200 flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 font-semibold text-white flex items-center gap-1 shadow"
                  >
                    <Check className="w-3.5 h-3.5" /> Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
