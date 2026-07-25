import React, { useState } from "react";
import { Sparkles, X, Wand2, ArrowRight, Info } from "lucide-react";

interface AiEnhanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentText: string;
  onApplyText: (newText: string) => void;
}

export const AiEnhanceModal: React.FC<AiEnhanceModalProps> = ({
  isOpen,
  onClose,
  currentText,
  onApplyText,
}) => {
  const [prompt, setPrompt] = useState("");
  const [noticeMsg, setNoticeMsg] = useState(
    "✨ AI Copywriting & Polish is coming soon! In the meantime, you can edit any post text, name, handle, or avatar directly on the canvas or sidebar."
  );
  const [resultText, setResultText] = useState("");

  if (!isOpen) return null;

  const quickPrompts = [
    "Make it concise & punchy for a viral tweet",
    "Fix grammar & improve visual formatting with bullet points",
    "Turn into an inspiring thought leadership post",
    "Add relevant emojis and bold hooks",
  ];

  const handleTriggerComingSoon = (customPrompt?: string) => {
    const activePrompt = customPrompt || prompt || "Polish and improve formatting";
    setNoticeMsg(
      `✨ AI Polish for "${activePrompt}" is coming soon in the next update! You can edit your tweet text manually below.`
    );
  };

  const handleApply = () => {
    if (resultText) {
      onApplyText(resultText);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5 text-zinc-100 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">Gemini AI Copywriter</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Coming Soon
                </span>
              </div>
              <p className="text-xs text-zinc-400">Polish, rewrite, or reformat your post text</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Coming Soon Notice Banner */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-start gap-2.5 leading-relaxed">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>{noticeMsg}</div>
        </div>

        {/* Current Text Box */}
        <div className="space-y-1.5">
          <label className="text-xs text-zinc-400 font-medium">Current Tweet Text</label>
          <textarea
            value={currentText}
            onChange={(e) => onApplyText(e.target.value)}
            rows={3}
            className="w-full p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 leading-relaxed focus:outline-none focus:border-amber-500/50"
            placeholder="Type or edit your tweet text here..."
          />
        </div>

        {/* Quick Style Buttons */}
        <div className="space-y-2">
          <label className="text-xs text-zinc-400 font-medium">Quick Rewrite Goals (Preview)</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleTriggerComingSoon(qp)}
                className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-amber-500/40 text-left text-[11px] text-zinc-300 hover:text-white transition flex items-center justify-between group"
              >
                <span>{qp}</span>
                <Wand2 className="w-3 h-3 text-amber-400 shrink-0 group-hover:scale-110 transition" />
              </button>
            ))}
          </div>
        </div>

        {/* Custom Prompt Input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Custom instructions (e.g. make it funny, add bullet points...)"
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={() => handleTriggerComingSoon()}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-amber-500/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Enhance</span>
          </button>
        </div>

        {/* Result Preview Box */}
        {resultText && (
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <label className="text-xs text-amber-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> AI Polish Suggestion
            </label>
            <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-zinc-100 leading-relaxed font-sans">
              {resultText}
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-white"
              >
                Discard
              </button>
              <button
                onClick={handleApply}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-black font-bold text-xs flex items-center gap-1.5 transition shadow"
              >
                <span>Apply to Tweet</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

