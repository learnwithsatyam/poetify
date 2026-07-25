import React, { useState, useRef, useEffect } from "react";
import { toPng, toBlob } from "html-to-image";
import confetti from "canvas-confetti";
import { ZoomIn, ZoomOut, Maximize2, Sparkles, Download, Copy, Bookmark, AlertCircle, Clock, BarChart2 } from "lucide-react";
import { XLogo } from "./components/XLogo";

import { CanvasConfig, CardConfig, SavedSnap, TweetData } from "./types";
import {
  DEFAULT_CANVAS_CONFIG,
  DEFAULT_CARD_CONFIG,
  SAMPLE_TWEETS,
  STYLE_PRESETS,
} from "./constants/presets";
import { Header } from "./components/Header";
import { Canvas } from "./components/Canvas";
import { Sidebar } from "./components/Sidebar";
import { AiEnhanceModal } from "./components/AiEnhanceModal";
import { SavedSnapsModal } from "./components/SavedSnapsModal";

export default function App() {
  const [tweet, setTweet] = useState<TweetData>(SAMPLE_TWEETS[0].data);
  const [canvasConfig, setCanvasConfig] = useState<CanvasConfig>(DEFAULT_CANVAS_CONFIG);
  const [cardConfig, setCardConfig] = useState<CardConfig>(DEFAULT_CARD_CONFIG);

  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const [scale, setScale] = useState(1);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [savedSnaps, setSavedSnaps] = useState<SavedSnap[]>([]);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Load saved snaps from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("poetify_snaps") || localStorage.getItem("poetcraft_snaps");
      if (stored) {
        setSavedSnaps(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Failed to parse saved snaps", e);
    }
  }, []);

  // Save snaps to localStorage
  const handleSaveCurrentSnap = () => {
    const newSnap: SavedSnap = {
      id: "snap-" + Date.now(),
      title: `${tweet.author.name}'s Tweet`,
      timestamp: Date.now(),
      tweetData: tweet,
      canvasConfig,
      cardConfig,
    };
    const updated = [newSnap, ...savedSnaps];
    setSavedSnaps(updated);
    try {
      localStorage.setItem("poetify_snaps", JSON.stringify(updated));
    } catch (e) {
      console.warn("Storage error", e);
    }

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
    });
  };

  const handleDeleteSnap = (id: string) => {
    const updated = savedSnaps.filter((s) => s.id !== id);
    setSavedSnaps(updated);
    localStorage.setItem("poetify_snaps", JSON.stringify(updated));
  };

  const handleLoadSnap = (snap: SavedSnap) => {
    setTweet(snap.tweetData);
    setCanvasConfig(snap.canvasConfig);
    setCardConfig(snap.cardConfig);
  };

  // Import Tweet from URL API
  const handleImportUrl = async (url: string) => {
    setIsLoading(true);
    setErrorNotice(null);

    try {
      let res: Response;
      try {
        res = await fetch("/api/fetch-tweet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
      } catch {
        // fetch() itself failed (network error / unresolvable URL). This is what
        // surfaces as Safari's cryptic "The string did not match the expected pattern."
        throw new Error(
          "Couldn't reach the tweet server. Make sure the app is running with `npm run dev` and opened at http://localhost:3000 (the /api backend must be live)."
        );
      }

      // Read as text first so a non-JSON response (HTML fallback page, 404, etc.)
      // gives a clear message instead of a cryptic JSON-parse error.
      const raw = await res.text();
      let data: any = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        throw new Error(
          res.ok
            ? "The tweet server returned an unexpected (non-JSON) response. Is the backend running?"
            : `Tweet import failed (HTTP ${res.status}). The /api/fetch-tweet backend route doesn't appear to be running.`
        );
      }

      if (!res.ok) {
        const base = data?.error || `Failed to fetch tweet (HTTP ${res.status}).`;
        throw new Error(data?.detail ? `${base} — ${data.detail}` : base);
      }

      setTweet(data);
    } catch (err: any) {
      setErrorNotice(err?.message || "Failed to import tweet link.");
    } finally {
      setIsLoading(false);
    }
  };

  // Apply Preset Theme
  const handleApplyPreset = (presetId: string) => {
    const preset = STYLE_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      if (preset.canvasConfig) {
        setCanvasConfig((prev) => ({ ...prev, ...preset.canvasConfig }));
      }
      if (preset.cardConfig) {
        setCardConfig((prev) => ({ ...prev, ...preset.cardConfig }));
      }
    }
  };

  // Export High-Res PNG
  const handleExportPng = async () => {
    if (!canvasRef.current) return;
    setIsExporting(true);

    try {
      const dataUrl = await toPng(canvasRef.current, {
        cacheBust: true,
        pixelRatio: 2.5, // 2.5x crisp studio resolution
        quality: 0.98,
      });

      const link = document.createElement("a");
      link.download = `poetify-${tweet.author.handle || "tweet"}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      console.error("Export error:", err);
      setErrorNotice("Could not export canvas image. Try reducing padding or image size.");
    } finally {
      setIsExporting(false);
    }
  };

  // Copy Image Blob directly to Clipboard
  const handleCopyClipboard = async () => {
    if (!canvasRef.current) return;
    setIsCopying(true);

    try {
      const blob = await toBlob(canvasRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        quality: 0.95,
      });

      if (blob && navigator.clipboard) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "image/png": blob,
          }),
        ]);

        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.7 },
        });
      } else {
        throw new Error("Clipboard API not supported in this browser environment");
      }
    } catch (err: any) {
      console.warn("Clipboard copy blocked:", err);
      setErrorNotice("Direct clipboard copying is restricted by your browser context. Please click 'Export PNG' to download the image file.");
    } finally {
      setIsCopying(false);
    }
  };

  const handleUpdateTweet = (updated: Partial<TweetData>) => {
    setTweet((prev) => ({ ...prev, ...updated }));
  };

  const handleResetToDefaults = () => {
    setCanvasConfig(DEFAULT_CANVAS_CONFIG);
    setCardConfig(DEFAULT_CARD_CONFIG);
  };

  return (
    <div className="min-h-screen bg-[#0f0f13] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Ambient Frosted Glass Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[0%] w-[40%] h-[50%] bg-fuchsia-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Header Bar */}
      <Header
        onImportUrl={handleImportUrl}
        isLoading={isLoading}
        onSelectSample={(sampleData) => setTweet(sampleData)}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onOpenSavedModal={() => setIsSavedModalOpen(true)}
        onExportPng={handleExportPng}
        onCopyClipboard={handleCopyClipboard}
        isCopying={isCopying}
        savedCount={savedSnaps.length}
      />

      {/* Error Alert Banner */}
      {errorNotice && (
        <div className="bg-rose-500/10 border-b border-rose-500/20 px-4 py-2.5 text-rose-300 text-xs flex items-center justify-between backdrop-blur-md relative z-30">
          <div className="flex items-center gap-2 max-w-4xl mx-auto">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorNotice}</span>
          </div>
          <button
            onClick={() => setErrorNotice(null)}
            className="text-xs font-bold text-rose-400 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Studio Workspace Grid */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative z-10">
        {/* Sidebar Controls */}
        <Sidebar
          canvasConfig={canvasConfig}
          cardConfig={cardConfig}
          tweet={tweet}
          onUpdateCanvas={(upd) => setCanvasConfig((prev) => ({ ...prev, ...upd }))}
          onUpdateCard={(upd) => setCardConfig((prev) => ({ ...prev, ...upd }))}
          onUpdateTweet={handleUpdateTweet}
          onApplyPreset={handleApplyPreset}
          onResetToDefaults={handleResetToDefaults}
        />

        {/* Main Canvas Viewport / Stage */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 flex flex-col items-center justify-center relative min-h-[450px]">
          {/* Top Canvas Toolbar Container (Responsive on mobile, absolute overlay on desktop) */}
          <div className="w-full md:contents flex flex-wrap items-center justify-between gap-2 mb-3 z-20">
            {/* Quick Visibility Toggles Bar */}
            <div className="md:absolute md:top-4 md:left-4 z-20 flex items-center gap-1.5 bg-white/5 backdrop-blur-md border border-white/10 p-1.5 rounded-2xl shadow-xl text-xs overflow-x-auto max-w-full">
              <span className="text-[10px] uppercase font-bold text-slate-400 px-2 tracking-wider hidden md:inline">
                Quick Toggle:
              </span>
              <button
                onClick={() => setCardConfig((prev) => ({ ...prev, showTimestamp: !prev.showTimestamp }))}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium flex items-center gap-1.5 transition shrink-0 ${
                  cardConfig.showTimestamp
                    ? "bg-indigo-600/30 text-indigo-300 border border-indigo-400/30 font-semibold shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
                title="Show or Hide Date & Timestamp"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Date & Time</span>
              </button>

              <button
                onClick={() => setCardConfig((prev) => ({ ...prev, showMetrics: !prev.showMetrics }))}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium flex items-center gap-1.5 transition shrink-0 ${
                  cardConfig.showMetrics
                    ? "bg-indigo-600/30 text-indigo-300 border border-indigo-400/30 font-semibold shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
                title="Show or Hide Engagement Metrics"
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Metrics</span>
              </button>

              <button
                onClick={() => setCardConfig((prev) => ({ ...prev, showTwitterLogo: !prev.showTwitterLogo }))}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium flex items-center gap-1.5 transition shrink-0 ${
                  cardConfig.showTwitterLogo
                    ? "bg-indigo-600/30 text-indigo-300 border border-indigo-400/30 font-semibold shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
                title="Show or Hide X Logo"
              >
                <XLogo className="w-3.5 h-3.5" />
                <span>X Logo</span>
              </button>
            </div>

            {/* Stage Toolbar (Zoom Controls) */}
            <div className="md:absolute md:top-4 md:right-4 z-20 flex items-center gap-1.5 bg-white/5 backdrop-blur-md border border-white/10 p-1.5 rounded-2xl shadow-xl text-xs ml-auto">
              <button
                onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="px-2 font-mono text-[11px] text-slate-400 font-semibold">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => setScale((s) => Math.min(1.3, s + 0.1))}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-white/10 mx-0.5" />
              <button
                onClick={() => setScale(1)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition"
                title="Reset Zoom"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Canvas */}
          <div className="w-full flex-1 flex items-center justify-center py-6">
            <Canvas
              ref={canvasRef}
              tweet={tweet}
              canvasConfig={canvasConfig}
              cardConfig={cardConfig}
              onUpdateTweet={handleUpdateTweet}
              scale={scale}
            />
          </div>

          {/* Bottom Floating Mobile Export Bar */}
          <div className="flex md:hidden items-center justify-center gap-2 w-full pt-4 pb-2 border-t border-white/10">
            <button
              onClick={handleCopyClipboard}
              disabled={isCopying}
              className="flex-1 py-2.5 rounded-xl bg-white/10 text-white font-medium text-xs flex items-center justify-center gap-1.5 border border-white/10 backdrop-blur-md"
            >
              <Copy className="w-4 h-4 text-indigo-300" />
              <span>{isCopying ? "Copying..." : "Copy Image"}</span>
            </button>
            <button
              onClick={handleExportPng}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/30"
            >
              <Download className="w-4 h-4" />
              <span>Export HD</span>
            </button>
          </div>
        </main>
      </div>

      {/* Footer Status Bar */}
      <footer className="h-8 bg-white/5 backdrop-blur-md border-t border-white/10 px-4 text-[11px] text-slate-400 flex items-center justify-between z-20 relative">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Studio Operational</span>
          </span>
          <span className="hidden sm:inline-block text-slate-600">|</span>
          <span className="hidden sm:inline-block text-slate-400">
            Frosted Glass Rendering Engine
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px]">
          <span>Format: PNG (2.5x HD)</span>
        </div>
      </footer>

      {/* AI Copywriting Modal */}
      <AiEnhanceModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        currentText={tweet.text}
        onApplyText={(newText) => handleUpdateTweet({ text: newText })}
      />

      {/* Saved Snaps Library Modal */}
      <SavedSnapsModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        snaps={savedSnaps}
        onLoadSnap={handleLoadSnap}
        onDeleteSnap={handleDeleteSnap}
        onSaveCurrentSnap={handleSaveCurrentSnap}
      />
    </div>
  );
}
