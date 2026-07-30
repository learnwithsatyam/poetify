import React from "react";

interface GlassBackdropProps {
  /** CSS background of the surface behind the card. */
  background?: string;
}

/**
 * Export-safe frosted glass: a real blurred backdrop layer using an element-level
 * `filter: blur()` (which html-to-image renders) instead of CSS `backdrop-filter`
 * (which it cannot capture).
 */
export const GlassBackdrop: React.FC<GlassBackdropProps> = ({ background }) => (
  <>
    <div
      className="absolute inset-0 z-0 pointer-events-none"
      style={{
        background: background || "rgb(24,24,37)",
        transform: "scale(1.35)",
        filter: "blur(32px) saturate(1.4)",
      }}
    />
    <div className="absolute inset-0 z-0 pointer-events-none bg-zinc-950/40" />
    <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-white/12 to-transparent" />
  </>
);
