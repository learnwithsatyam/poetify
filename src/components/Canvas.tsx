import React, { forwardRef } from "react";
import { CanvasConfig, CardConfig, TweetData } from "../types";
import { TweetCard } from "./TweetCard";

interface CanvasProps {
  tweet: TweetData;
  canvasConfig: CanvasConfig;
  cardConfig: CardConfig;
  onUpdateTweet: (updated: Partial<TweetData>) => void;
  scale?: number;
}

export const Canvas = forwardRef<HTMLDivElement, CanvasProps>(
  ({ tweet, canvasConfig, cardConfig, onUpdateTweet, scale = 1 }, ref) => {
    // Aspect Ratio CSS class mapping
    const getAspectRatioStyle = () => {
      switch (canvasConfig.aspectRatio) {
        case "1:1":
          return "aspect-square";
        case "16:9":
          return "aspect-video";
        case "9:16":
          return "aspect-[9/16]";
        case "4:3":
          return "aspect-[4/3]";
        case "4:5":
          return "aspect-[4/5]";
        case "3:1":
          return "aspect-[3/1]";
        case "auto":
        default:
          return "h-auto min-h-[360px]";
      }
    };

    // Pattern background overlays
    const getPatternOverlay = () => {
      if (canvasConfig.bgType !== "pattern") return null;

      switch (canvasConfig.bgPattern) {
        case "dots":
          return (
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
          );
        case "grid":
          return (
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.3) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
          );
        case "noise":
        default:
          return null;
      }
    };

    return (
      <div className="w-full flex items-center justify-center p-2 sm:p-6 overflow-auto">
        <div
          className="transition-transform duration-200 ease-out origin-center max-w-full"
          style={{ transform: `scale(${scale})` }}
        >
          {/* Main Printable DOM Node referenced by html-to-image */}
          <div
            ref={ref}
            id="poetify-canvas"
            className={`relative w-full max-w-3xl rounded-3xl overflow-hidden flex items-center justify-center transition-all duration-300 ${getAspectRatioStyle()}`}
            style={{
              padding: `${canvasConfig.padding}px`,
              background:
                canvasConfig.bgType === "solid"
                  ? canvasConfig.bgSolidColor
                  : canvasConfig.bgGradient,
            }}
          >
            {/* Pattern Overlay */}
            {getPatternOverlay()}

            {/* Grain Noise Effect */}
            {canvasConfig.bgNoise && (
              <div
                className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
              />
            )}

            {/* Custom Background Image if specified */}
            {canvasConfig.bgType === "image" && canvasConfig.bgImage && (
              <div
                className="absolute inset-0 bg-cover bg-center pointer-events-none"
                style={{
                  backgroundImage: `url(${canvasConfig.bgImage})`,
                  filter: `blur(${canvasConfig.bgBlur}px)`,
                }}
              />
            )}

            {/* Centered Tweet Card */}
            <div className="relative z-10 w-full flex items-center justify-center">
              <TweetCard
                tweet={tweet}
                config={cardConfig}
                onUpdateTweet={onUpdateTweet}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

Canvas.displayName = "Canvas";
