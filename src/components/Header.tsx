import React, { useState } from "react";
import { Sparkles, Download, Copy, Bookmark, ArrowRight, Loader2, Link2, Check, RefreshCw } from "lucide-react";
import { XLogo } from "./XLogo";
import { SAMPLE_TWEETS } from "../constants/presets";
import { TweetData } from "../types";

interface HeaderProps {
  onImportUrl: (url: string) => Promise<void>;
  isLoading: boolean;
  onSelectSample: (sample: TweetData) => void;
  onOpenAiModal: () => void;
  onOpenSavedModal: () => void;
  onExportPng: () => void;
  onCopyClipboard: () => void;
  isCopying: boolean;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onImportUrl,
  isLoading,
  onSelectSample,
  onOpenAiModal,
  onOpenSavedModal,
  onExportPng,
  onCopyClipboard,
  isCopying,
  savedCount,
}) => {
  const [urlInput, setUrlInput] = useState("");
  const [hasCopied, setHasCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    await onImportUrl(urlInput.trim());
  };

  const handleCopyClick = () => {
    onCopyClipboard();
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2500);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/5 backdrop-blur-md border-b border-white/10 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Logo / Title */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-fuchsia-500 to-rose-500 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <div className="w-full h-full bg-[#0f0f13] rounded-[10px] flex items-center justify-center">
                  <XLogo className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
                    Poetify
                  </span>
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Frosted Glass
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Turn tweets & quotes into studio graphics
                </p>
              </div>
            </div>

            {/* Mobile Header Actions */}
            <div className="flex items-center gap-1.5 md:hidden">
              <button
                onClick={onOpenAiModal}
                className="p-2 text-slate-300 hover:text-white rounded-lg bg-white/5 border border-white/10 transition"
                title="AI Polish"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
              </button>
              <button
                onClick={onOpenSavedModal}
                className="p-2 text-slate-300 hover:text-white rounded-lg bg-white/5 border border-white/10 transition relative"
                title="Saved Snaps"
              >
                <Bookmark className="w-4 h-4 text-indigo-400" />
                {savedCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-500 text-[10px] font-bold text-white flex items-center justify-center">
                    {savedCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Import URL Form */}
          <div className="w-full md:flex-1 md:max-w-xl">
            <form onSubmit={handleSubmit} className="relative group">
              <div className="relative flex items-center">
                <div className="absolute left-4 text-slate-400 pointer-events-none">
                  <Link2 className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Paste tweet URL (e.g. https://x.com/naval/status/...)"
                  className="w-full pl-11 pr-28 py-2 bg-white/5 border border-white/10 rounded-full text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition backdrop-blur-md shadow-inner"
                />
                <button
                  type="submit"
                  disabled={isLoading || !urlInput.trim()}
                  className="absolute right-1.5 px-3.5 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs flex items-center gap-1.5 transition shadow-lg shadow-indigo-600/30"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Fetching...</span>
                    </>
                  ) : (
                    <>
                      <span>Capture</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Header Controls */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={onOpenAiModal}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition backdrop-blur-md"
              title="AI Polish (Coming Soon)"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>AI Polish</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                Soon
              </span>
            </button>

            <button
              onClick={onOpenSavedModal}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition backdrop-blur-md relative"
            >
              <Bookmark className="w-4 h-4 text-indigo-400" />
              <span>History</span>
              {savedCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-indigo-500/30 text-indigo-200 text-[10px] font-bold rounded-full border border-indigo-400/30">
                  {savedCount}
                </span>
              )}
            </button>

            <button
              onClick={handleCopyClick}
              disabled={isCopying}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-100 text-xs font-medium flex items-center gap-1.5 transition border border-white/15 backdrop-blur-md shadow-sm"
              title="Copy high-res image to clipboard"
            >
              {hasCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copied!</span>
                </>
              ) : isCopying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                  <span>Copying...</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-indigo-300" />
                  <span>Copy Image</span>
                </>
              )}
            </button>

            <button
              onClick={onExportPng}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-indigo-600/30 border border-white/10"
            >
              <Download className="w-4 h-4" />
              <span>Export HD</span>
            </button>
          </div>
        </div>

        {/* Quick Sample Links Bar */}
        <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
          <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
            <RefreshCw className="w-3 h-3 text-indigo-400" /> Try Samples:
          </span>
          {SAMPLE_TWEETS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onSelectSample(sample.data)}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white shrink-0 transition text-[11px] backdrop-blur-md"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
