import React from "react";
import { Bookmark, X, Trash2, ExternalLink, Calendar, Plus } from "lucide-react";
import { SavedSnap } from "../types";

interface SavedSnapsModalProps {
  isOpen: boolean;
  onClose: () => void;
  snaps: SavedSnap[];
  onLoadSnap: (snap: SavedSnap) => void;
  onDeleteSnap: (id: string) => void;
  onSaveCurrentSnap: () => void;
}

export const SavedSnapsModal: React.FC<SavedSnapsModalProps> = ({
  isOpen,
  onClose,
  snaps,
  onLoadSnap,
  onDeleteSnap,
  onSaveCurrentSnap,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5 text-zinc-100 max-h-[85vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
              <Bookmark className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <h3 className="font-bold text-base">Saved Snaps Library</h3>
              <p className="text-xs text-zinc-400">Revisit and reload your custom tweet graphic creations</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSaveCurrentSnap}
              className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs flex items-center gap-1 transition shadow"
            >
              <Plus className="w-3.5 h-3.5" /> Save Current
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Snaps List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
          {snaps.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 space-y-2">
              <Bookmark className="w-8 h-8 mx-auto text-zinc-700" />
              <p className="text-sm">No saved snaps in your library yet.</p>
              <p className="text-xs">Click "Save Current" to store your active tweet canvas setup!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {snaps.map((snap) => (
                <div
                  key={snap.id}
                  className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition flex flex-col justify-between gap-3 group relative overflow-hidden"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-zinc-100 truncate max-w-[160px]">
                        {snap.tweetData.author.name} (@{snap.tweetData.author.handle})
                      </span>
                      <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(snap.timestamp).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300 line-clamp-3 leading-relaxed">
                      "{snap.tweetData.text}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 capitalize">
                      {snap.cardConfig.theme} card • {snap.canvasConfig.aspectRatio}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onDeleteSnap(snap.id)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Delete snap"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          onLoadSnap(snap);
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <span>Load</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
