import React, { useState, useRef } from "react";
import {
  Palette,
  Layout,
  Type,
  Eye,
  Sparkles,
  Sliders,
  Check,
  RotateCcw,
  Square,
  Maximize2,
  Lock,
  Layers,
  Image as ImageIcon,
  Camera,
  Upload,
  User,
  BadgeCheck,
} from "lucide-react";
import { AspectRatio, CanvasConfig, CardConfig, CardTheme, FontOption, TweetData } from "../types";
import { GRADIENT_PRESETS, STYLE_PRESETS } from "../constants/presets";

interface SidebarProps {
  canvasConfig: CanvasConfig;
  cardConfig: CardConfig;
  tweet: TweetData;
  onUpdateCanvas: (updated: Partial<CanvasConfig>) => void;
  onUpdateCard: (updated: Partial<CardConfig>) => void;
  onUpdateTweet: (updated: Partial<TweetData>) => void;
  onApplyPreset: (presetId: string) => void;
  onResetToDefaults: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  canvasConfig,
  cardConfig,
  tweet,
  onUpdateCanvas,
  onUpdateCard,
  onUpdateTweet,
  onApplyPreset,
  onResetToDefaults,
}) => {
  const [activeTab, setActiveTab] = useState<"presets" | "background" | "card" | "content">(
    "presets"
  );
  const avatarFileRef = useRef<HTMLInputElement>(null);

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
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

  const aspectRatios: { id: AspectRatio; label: string; desc: string }[] = [
    { id: "auto", label: "Auto", desc: "Fit Content" },
    { id: "1:1", label: "1:1", desc: "Square (Insta/LinkedIn)" },
    { id: "16:9", label: "16:9", desc: "Landscape (YouTube/Twitter)" },
    { id: "9:16", label: "9:16", desc: "Story/Reels" },
    { id: "4:5", label: "4:5", desc: "Insta Portrait" },
    { id: "4:3", label: "4:3", desc: "Presentation" },
  ];

  const cardThemes: { id: CardTheme; label: string; color: string }[] = [
    { id: "dark", label: "Dark", color: "bg-zinc-950 border-zinc-700" },
    { id: "light", label: "Light", color: "bg-white border-zinc-300 text-zinc-900" },
    { id: "glass", label: "Glass", color: "bg-zinc-900/60 backdrop-blur border-white/30" },
    { id: "dim", label: "Dim Navy", color: "bg-[#15202b] border-slate-600" },
    { id: "obsidian", label: "Obsidian", color: "bg-black border-zinc-800" },
    { id: "paper", label: "Paper", color: "bg-[#fbf7ee] text-[#2c2416] border-[#e2d5c3]" },
    { id: "custom", label: "Custom", color: "bg-gradient-to-r from-purple-500 to-pink-500" },
  ];

  const fontOptions: { id: FontOption; label: string; style: string }[] = [
    { id: "sans", label: "Inter / Sans", style: "font-sans" },
    { id: "serif", label: "Playfair / Serif", style: "font-serif" },
    { id: "mono", label: "JetBrains / Mono", style: "font-mono" },
    { id: "display", label: "Modern Display", style: "font-sans font-medium" },
  ];

  return (
    <aside className="w-full lg:w-96 bg-white/5 border-r border-white/10 backdrop-blur-xl flex flex-col h-full text-slate-200">
      {/* Top Tab Bar Navigation */}
      <div className="grid grid-cols-4 p-2 bg-white/5 border-b border-white/10 text-xs font-medium">
        <button
          onClick={() => setActiveTab("presets")}
          className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition backdrop-blur-md ${
            activeTab === "presets"
              ? "bg-indigo-600/30 border border-indigo-400/30 text-indigo-300 font-bold shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Presets</span>
        </button>

        <button
          onClick={() => setActiveTab("background")}
          className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition backdrop-blur-md ${
            activeTab === "background"
              ? "bg-indigo-600/30 border border-indigo-400/30 text-indigo-300 font-bold shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
          }`}
        >
          <Palette className="w-4 h-4 text-fuchsia-400" />
          <span>Canvas</span>
        </button>

        <button
          onClick={() => setActiveTab("card")}
          className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition backdrop-blur-md ${
            activeTab === "card"
              ? "bg-indigo-600/30 border border-indigo-400/30 text-indigo-300 font-bold shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
          }`}
        >
          <Layout className="w-4 h-4 text-cyan-400" />
          <span>Card</span>
        </button>

        <button
          onClick={() => setActiveTab("content")}
          className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition backdrop-blur-md ${
            activeTab === "content"
              ? "bg-indigo-600/30 border border-indigo-400/30 text-indigo-300 font-bold shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
          }`}
        >
          <Eye className="w-4 h-4 text-amber-400" />
          <span>Elements</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs custom-scrollbar">
        {/* PRESETS TAB */}
        {activeTab === "presets" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Designer Presets
              </h3>
              <button
                onClick={onResetToDefaults}
                className="text-[11px] text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {STYLE_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onApplyPreset(p.id)}
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/50 hover:bg-white/10 transition text-left flex items-center justify-between group shadow-sm backdrop-blur-md"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl shadow-inner flex items-center justify-center shrink-0 border border-white/20"
                      style={{
                        background: p.canvasConfig?.bgGradient || "#18181b",
                      }}
                    >
                      <div className="w-5 h-5 rounded-md bg-white/20 backdrop-blur border border-white/30" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-100 group-hover:text-indigo-300 transition">
                        {p.name}
                      </div>
                      <div className="text-[10px] text-slate-400 capitalize">
                        {p.category} style • {p.cardConfig?.theme || "dark"} card
                      </div>
                    </div>
                  </div>
                  <Check className="w-4 h-4 text-indigo-400 opacity-0 group-hover:opacity-100 transition" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* BACKGROUND / CANVAS TAB */}
        {activeTab === "background" && (
          <div className="space-y-6">
            {/* Aspect Ratio Selector */}
            <div className="space-y-2">
              <label className="font-semibold text-zinc-200 block">Canvas Ratio</label>
              <div className="grid grid-cols-3 gap-1.5">
                {aspectRatios.map((ratio) => (
                  <button
                    key={ratio.id}
                    onClick={() => onUpdateCanvas({ aspectRatio: ratio.id })}
                    className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-center gap-0.5 ${
                      canvasConfig.aspectRatio === ratio.id
                        ? "bg-rose-500/10 border-rose-500 text-rose-400 font-bold"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                    }`}
                  >
                    <span className="text-xs">{ratio.label}</span>
                    <span className="text-[9px] opacity-75">{ratio.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Canvas Padding Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-zinc-200">Padding</label>
                <span className="text-zinc-400 font-mono">{canvasConfig.padding}px</span>
              </div>
              <input
                type="range"
                min={16}
                max={120}
                step={4}
                value={canvasConfig.padding}
                onChange={(e) => onUpdateCanvas({ padding: parseInt(e.target.value, 10) })}
                className="w-full accent-rose-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Background Style Type */}
            <div className="space-y-3">
              <label className="font-semibold text-zinc-200 block">Gradient Palette</label>
              <div className="grid grid-cols-4 gap-2">
                {GRADIENT_PRESETS.map((grad) => (
                  <button
                    key={grad.id}
                    onClick={() =>
                      onUpdateCanvas({
                        bgType: "gradient",
                        bgGradient: grad.value,
                      })
                    }
                    className={`h-12 rounded-xl border transition relative overflow-hidden group shadow-inner ${
                      canvasConfig.bgGradient === grad.value
                        ? "ring-2 ring-rose-500 border-white scale-105"
                        : "border-zinc-800 hover:border-zinc-600"
                    }`}
                    style={{ background: grad.value }}
                    title={grad.name}
                  >
                    {canvasConfig.bgGradient === grad.value && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white drop-shadow" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Solid Color Picker */}
            <div className="space-y-2 pt-2 border-t border-zinc-900">
              <label className="font-semibold text-zinc-200 block">Solid Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={canvasConfig.bgSolidColor}
                  onChange={(e) =>
                    onUpdateCanvas({
                      bgType: "solid",
                      bgSolidColor: e.target.value,
                    })
                  }
                  className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer"
                />
                <input
                  type="text"
                  value={canvasConfig.bgSolidColor}
                  onChange={(e) =>
                    onUpdateCanvas({
                      bgType: "solid",
                      bgSolidColor: e.target.value,
                    })
                  }
                  className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-xs focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Grain Noise Effect Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
              <div>
                <span className="font-semibold text-zinc-200 block">Film Grain Noise</span>
                <span className="text-[10px] text-zinc-500">Add subtle studio texture</span>
              </div>
              <input
                type="checkbox"
                checked={canvasConfig.bgNoise}
                onChange={(e) => onUpdateCanvas({ bgNoise: e.target.checked })}
                className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* CARD STYLE TAB */}
        {activeTab === "card" && (
          <div className="space-y-6">
            {/* Card Theme Picker */}
            <div className="space-y-2">
              <label className="font-semibold text-zinc-200 block">Card Theme</label>
              <div className="grid grid-cols-2 gap-2">
                {cardThemes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => onUpdateCard({ theme: theme.id })}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition ${
                      cardConfig.theme === theme.id
                        ? "border-rose-500 ring-1 ring-rose-500 bg-zinc-900 font-semibold text-rose-400"
                        : "border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border ${theme.color}`} />
                    <span className="text-xs">{theme.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Card Theme Color Pickers */}
            {cardConfig.theme === "custom" && (
              <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300">Card Background</span>
                  <input
                    type="color"
                    value={cardConfig.customCardBg}
                    onChange={(e) => onUpdateCard({ customCardBg: e.target.value })}
                    className="w-8 h-8 rounded-lg bg-zinc-800 border-none cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300">Text Color</span>
                  <input
                    type="color"
                    value={cardConfig.customTextColor}
                    onChange={(e) => onUpdateCard({ customTextColor: e.target.value })}
                    className="w-8 h-8 rounded-lg bg-zinc-800 border-none cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Typography Font Family */}
            <div className="space-y-2">
              <label className="font-semibold text-zinc-200 block">Font Family</label>
              <div className="grid grid-cols-2 gap-2">
                {fontOptions.map((font) => (
                  <button
                    key={font.id}
                    onClick={() => onUpdateCard({ fontFamily: font.id })}
                    className={`p-2.5 rounded-xl border text-center transition ${font.style} ${
                      cardConfig.fontFamily === font.id
                        ? "border-rose-500 bg-rose-500/10 text-rose-400 font-bold"
                        : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {font.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-zinc-200">Font Size</label>
                <span className="text-zinc-400 font-mono">{cardConfig.fontSize}px</span>
              </div>
              <input
                type="range"
                min={12}
                max={24}
                step={1}
                value={cardConfig.fontSize}
                onChange={(e) => onUpdateCard({ fontSize: parseInt(e.target.value, 10) })}
                className="w-full accent-rose-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Card Width Slider (size of the inner card within the canvas) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-zinc-200">Card Width</label>
                <span className="text-zinc-400 font-mono">{cardConfig.cardWidth}px</span>
              </div>
              <input
                type="range"
                min={320}
                max={720}
                step={8}
                value={cardConfig.cardWidth}
                onChange={(e) => onUpdateCard({ cardWidth: parseInt(e.target.value, 10) })}
                className="w-full accent-rose-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-[10px] text-zinc-500">Controls how large the tweet card is inside the canvas frame.</p>
            </div>

            {/* Corner Radius Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-zinc-200">Corner Radius</label>
                <span className="text-zinc-400 font-mono">{cardConfig.borderRadius}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={32}
                step={2}
                value={cardConfig.borderRadius}
                onChange={(e) => onUpdateCard({ borderRadius: parseInt(e.target.value, 10) })}
                className="w-full accent-rose-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Card Shadow */}
            <div className="space-y-2">
              <label className="font-semibold text-zinc-200 block">Card Shadow</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(["none", "soft", "medium", "heavy", "glow", "elevated"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => onUpdateCard({ shadow: s })}
                    className={`py-2 px-1 rounded-xl border text-center capitalize transition ${
                      cardConfig.shadow === s
                        ? "border-rose-500 bg-rose-500/10 text-rose-400 font-bold"
                        : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Border Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
              <span className="font-semibold text-zinc-200">Card Border</span>
              <input
                type="checkbox"
                checked={cardConfig.border}
                onChange={(e) => onUpdateCard({ border: e.target.checked })}
                className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* ELEMENTS / CONTENT TAB */}
        {activeTab === "content" && (
          <div className="space-y-5">
            {/* Author Profile & Avatar Editor */}
            <div className="space-y-3 bg-white/5 p-3.5 rounded-2xl border border-white/10 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-rose-400" />
                  Author & Avatar Profile
                </h3>
              </div>

              {/* Hidden File Uploader */}
              <input
                type="file"
                ref={avatarFileRef}
                accept="image/*"
                onChange={handleAvatarFile}
                className="hidden"
              />

              {/* Avatar Preview + Upload Controls */}
              <div className="flex items-center gap-3 pt-1">
                <div
                  onClick={() => avatarFileRef.current?.click()}
                  className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-white/20 cursor-pointer group bg-zinc-800 flex items-center justify-center"
                  title="Click to upload custom photo"
                >
                  {tweet.author.avatar ? (
                    <img
                      src={tweet.author.avatar}
                      alt="Author Avatar"
                      className="w-full h-full object-cover group-hover:opacity-75 transition"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center font-bold text-white text-base">
                      {tweet.author.name.charAt(0) || "T"}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                    <Camera className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex-1 space-y-1.5">
                  <button
                    onClick={() => avatarFileRef.current?.click()}
                    className="w-full py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow transition"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Avatar Photo</span>
                  </button>
                  {tweet.author.avatar && (
                    <button
                      onClick={() =>
                        onUpdateTweet({
                          author: { ...tweet.author, avatar: "" },
                        })
                      }
                      className="w-full py-1 text-[11px] text-rose-400 hover:text-rose-300 transition text-center"
                    >
                      Remove Photo / Use Initial
                    </button>
                  )}
                </div>
              </div>

              {/* Avatar URL Text Field */}
              <div className="space-y-1 pt-1">
                <label className="text-zinc-400 block text-[10px]">Avatar Image URL</label>
                <input
                  type="text"
                  value={tweet.author.avatar || ""}
                  onChange={(e) =>
                    onUpdateTweet({
                      author: { ...tweet.author, avatar: e.target.value },
                    })
                  }
                  className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs focus:outline-none focus:border-rose-500 text-slate-200"
                  placeholder="https://example.com/photo.jpg"
                />
              </div>

              {/* Author Name and Handle */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-zinc-400 block text-[10px]">Name</label>
                  <input
                    type="text"
                    value={tweet.author.name}
                    onChange={(e) =>
                      onUpdateTweet({
                        author: { ...tweet.author, name: e.target.value },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs focus:outline-none focus:border-rose-500 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block text-[10px]">Handle (@)</label>
                  <input
                    type="text"
                    value={tweet.author.handle}
                    onChange={(e) =>
                      onUpdateTweet({
                        author: { ...tweet.author, handle: e.target.value },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs focus:outline-none focus:border-rose-500 text-slate-200"
                  />
                </div>
              </div>
            </div>

            <h3 className="font-semibold text-slate-200 text-xs uppercase tracking-wider">Visible Elements</h3>

            <div className="space-y-1.5 bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
              {[
                { key: "showAvatar", label: "Author Avatar" },
                { key: "showVerified", label: "Verified Badge" },
                { key: "showTwitterLogo", label: "X Logo" },
                { key: "showTimestamp", label: "Date & Timestamp" },
                { key: "showMetrics", label: "Engagement Metrics" },
                { key: "showMedia", label: "Media Attachments" },
                { key: "showQuote", label: "Quoted Tweet Block" },
                { key: "showWatermark", label: "Custom Watermark" },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center justify-between py-2 px-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition text-xs"
                >
                  <span className="text-slate-300 font-medium">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={(cardConfig as any)[item.key]}
                    onChange={(e) => onUpdateCard({ [item.key]: e.target.checked })}
                    className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                  />
                </label>
              ))}
            </div>

            {/* Watermark Input */}
            {cardConfig.showWatermark && (
              <div className="space-y-1 pt-2">
                <label className="text-zinc-400 block text-[11px]">Watermark Text</label>
                <input
                  type="text"
                  value={cardConfig.watermarkText}
                  onChange={(e) => onUpdateCard({ watermarkText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs focus:outline-none focus:border-rose-500"
                  placeholder="e.g. Created with Poetify"
                />
              </div>
            )}

            {/* Quick Metrics Editor */}
            <div className="pt-4 border-t border-zinc-900 space-y-3">
              <h4 className="font-semibold text-zinc-200">Metrics Formatter</h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdateCard({ metricFormat: "compact" })}
                  className={`flex-1 py-1.5 rounded-xl border text-center ${
                    cardConfig.metricFormat === "compact"
                      ? "border-rose-500 bg-rose-500/10 text-rose-400 font-bold"
                      : "border-zinc-800 bg-zinc-900 text-zinc-400"
                  }`}
                >
                  Compact (14.2K)
                </button>
                <button
                  onClick={() => onUpdateCard({ metricFormat: "full" })}
                  className={`flex-1 py-1.5 rounded-xl border text-center ${
                    cardConfig.metricFormat === "full"
                      ? "border-rose-500 bg-rose-500/10 text-rose-400 font-bold"
                      : "border-zinc-800 bg-zinc-900 text-zinc-400"
                  }`}
                >
                  Full (14,200)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
