"use client";

import { usePlayer } from "@/context/PlayerContext";
import TrackList from "@/components/TrackList";
import { Heart, Music, Play } from "lucide-react";

export default function LibraryPage() {
  const { favorites, playTrack } = usePlayer();

  const handlePlayAll = () => {
    if (favorites.length > 0) {
      playTrack(favorites[0], favorites);
    }
  };

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="px-4 md:px-6 pt-6 md:pt-8 pb-6">
        <div className="flex items-end gap-6">
          <div className="w-[140px] h-[140px] md:w-[200px] md:h-[200px] rounded-lg bg-gradient-to-br from-purple-700 to-accent/80 flex items-center justify-center shadow-2xl shrink-0">
            <Heart className="w-16 h-16 md:w-20 md:h-20 text-white" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-widest text-muted mb-1">
              Playlist
            </p>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 leading-tight">
              Liked Songs
            </h1>
            <p className="text-sm text-muted">
              Keith Baje &middot; {favorites.length} song{favorites.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Actions */}
        {favorites.length > 0 && (
          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={handlePlayAll}
              className="w-12 h-12 rounded-full bg-accent hover:bg-accent-hover flex items-center justify-center hover:scale-105 transition-all shadow-lg shadow-accent/25"
              aria-label="Play all"
            >
              <Play className="w-5 h-5 text-black ml-0.5" fill="black" />
            </button>
          </div>
        )}
      </div>

      {/* Track List */}
      {favorites.length > 0 ? (
        <div className="px-4 md:px-6">
          <TrackList tracks={favorites} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mb-6">
            <Music className="w-10 h-10 text-muted/40" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Songs you like will appear here
          </h2>
          <p className="text-sm text-muted text-center max-w-sm">
            Save songs by tapping the heart icon. Your favorites are stored locally on this device.
          </p>
        </div>
      )}
    </div>
  );
}
