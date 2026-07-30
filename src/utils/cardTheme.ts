import type { CSSProperties } from "react";
import { CardConfig, CardShadow, CardTheme, FontOption } from "../types";

// Styling shared by every card layout (tweet card, quote poster). Keeping it in
// one place means the theme picker means the same thing in both modes.
export interface CardThemeStyle {
  container: string;
  text: string;
  secondaryText: string;
  metricIcon: string;
  borderStyle: string;
  quoteBg: string;
  accentBar: string;
}

export const getCardThemeStyle = (theme: CardTheme): CardThemeStyle => {
  switch (theme) {
    case "light":
      return {
        container: "bg-white text-zinc-900 border border-zinc-200/80 shadow-2xl",
        text: "text-zinc-900",
        secondaryText: "text-zinc-500",
        metricIcon: "text-zinc-400 hover:text-zinc-600",
        borderStyle: "border-zinc-200/80",
        quoteBg: "bg-zinc-50 border-zinc-200",
        accentBar: "bg-zinc-900",
      };
    case "dim":
      return {
        container: "bg-[#15202b] text-slate-100 border border-slate-700/60 shadow-2xl",
        text: "text-slate-100",
        secondaryText: "text-slate-400",
        metricIcon: "text-slate-400 hover:text-slate-200",
        borderStyle: "border-slate-700/60",
        quoteBg: "bg-[#1e2732] border-slate-700",
        accentBar: "bg-sky-400",
      };
    case "glass":
      // No backdrop-blur here — the frosted effect is built from real layers
      // (see GlassBackdrop) so it survives PNG export.
      return {
        container: "text-white border border-white/20 shadow-2xl shadow-black/40",
        text: "text-white",
        secondaryText: "text-zinc-300/80",
        metricIcon: "text-white/60 hover:text-white",
        borderStyle: "border-white/15",
        quoteBg: "bg-white/5 border-white/10",
        accentBar: "bg-white/80",
      };
    case "gradient":
      // The card wears the canvas background as its own fill — the background
      // colour is applied inline by getCardSurfaceStyle().
      return {
        container: "text-white border border-white/20 shadow-2xl",
        text: "text-white",
        secondaryText: "text-white/70",
        metricIcon: "text-white/70",
        borderStyle: "border-white/25",
        quoteBg: "bg-black/20 border-white/20",
        accentBar: "bg-white/90",
      };
    case "paper":
      return {
        container: "bg-[#fbf7ee] text-[#2c2416] border border-[#e2d5c3] shadow-xl",
        text: "text-[#2c2416]",
        secondaryText: "text-[#7a6b57]",
        metricIcon: "text-[#8c7a65]",
        borderStyle: "border-[#e2d5c3]",
        quoteBg: "bg-[#f2e9d8] border-[#e2d5c3]",
        accentBar: "bg-[#b08544]",
      };
    case "obsidian":
      return {
        container: "bg-[#09090b] text-zinc-100 border border-zinc-800 shadow-2xl",
        text: "text-zinc-100",
        secondaryText: "text-zinc-500",
        metricIcon: "text-zinc-500 hover:text-zinc-300",
        borderStyle: "border-zinc-800",
        quoteBg: "bg-zinc-900 border-zinc-800",
        accentBar: "bg-zinc-100",
      };
    case "custom":
      return {
        container: "shadow-2xl",
        text: "",
        secondaryText: "opacity-70",
        metricIcon: "opacity-70",
        borderStyle: "border-current/20",
        quoteBg: "bg-black/10 border-current/20",
        accentBar: "bg-current",
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
        accentBar: "bg-zinc-100",
      };
  }
};

export const getShadowClass = (shadow: CardShadow): string => {
  switch (shadow) {
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

export const getFontClass = (font: FontOption): string => {
  switch (font) {
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

/**
 * Inline styles for the card surface. `fill` is set in bare-frame mode, where
 * the card stretches to become the whole exported image instead of a floating
 * element with a max width.
 */
export const getCardSurfaceStyle = (
  config: CardConfig,
  canvasBackground?: string,
  fill = false
): CSSProperties => {
  const style: CSSProperties = {
    borderRadius: `${config.borderRadius}px`,
    borderColor: config.borderColor,
    maxWidth: fill ? "none" : `${config.cardWidth}px`,
    width: fill ? "100%" : undefined,
    height: fill ? "100%" : undefined,
  };

  if (config.theme === "custom") {
    style.backgroundColor = config.customCardBg;
    style.color = config.customTextColor;
  }

  if (config.theme === "gradient") {
    style.background = canvasBackground || "linear-gradient(135deg, #654ea3 0%, #eaafc8 100%)";
  }

  return style;
};
