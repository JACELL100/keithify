"use client";

import { Track } from "@/lib/types";
import { usePlayer } from "@/context/PlayerContext";
import Image from "next/image";
import { Play, Pause, Heart, Clock, Loader2 } from "lucide-react";

interface TrackListProps {
  tracks: Track[];
  showIndex?: boolean;
  showAlbum?: boolean;
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds === 0) return "";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const DEFAULT_COVER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23282828'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23535353' font-size='16'%3E♪%3C/text%3E%3C/svg%3E";

export default function TrackList({
  tracks,
  showIndex = true,
  showAlbum = true,
}: TrackListProps) {
  const {
    playTrack,
    currentTrack,
    isPlaying,
    isLoading,
    togglePlay,
    toggleFavorite,
    isFavorite,
  } = usePlayer();

  const handlePlay = (track: Track) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playTrack(track, tracks);
    }
  };

  return (
    <div className="w-full">
      {/* Header row - desktop only */}
      {showIndex && (
        <div className="hidden md:grid grid-cols-[40px_1fr_1fr_80px_40px] gap-4 px-4 py-2 text-xs text-muted font-medium uppercase tracking-wider border-b border-white/5 mb-2">
          <span className="text-center">#</span>
          <span>Title</span>
          <span>{showAlbum ? "Album" : ""}</span>
          <span className="flex justify-end">
            <Clock className="w-4 h-4" />
          </span>
          <span></span>
        </div>
      )}

      {/* Track rows */}
      <div className="space-y-0.5">
        {tracks.map((track, index) => {
          const isActive = currentTrack?.id === track.id;
          const isCurrentPlaying = isActive && isPlaying;
          const isCurrentLoading = isActive && isLoading;
          const trackFav = isFavorite(track.id);
          const coverImg = track.album?.cover_small || track.img || DEFAULT_COVER;

          return (
            <div
              key={`${track.id}-${index}`}
              className={`group grid grid-cols-[auto_1fr_auto] md:grid-cols-[40px_1fr_1fr_80px_40px] gap-3 md:gap-4 px-3 md:px-4 py-2 rounded-md transition-colors cursor-pointer ${
                isActive
                  ? "bg-white/10"
                  : "hover:bg-white/5"
              }`}
              onClick={() => handlePlay(track)}
            >
              {/* Index / Play indicator - desktop */}
              {showIndex && (
                <div className="hidden md:flex items-center justify-center">
                  <span
                    className={`text-sm tabular-nums ${
                      isActive ? "text-accent" : "text-muted group-hover:hidden"
                    } ${isActive ? "" : "group-hover:hidden"}`}
                  >
                    {isCurrentLoading ? (
                      <Loader2 className="w-4 h-4 text-accent animate-spin" />
                    ) : isActive ? (
                      isCurrentPlaying ? (
                        <span className="flex gap-0.5 items-end h-3">
                          <span className="w-0.5 bg-accent animate-pulse" style={{ height: "8px", animationDelay: "0ms" }} />
                          <span className="w-0.5 bg-accent animate-pulse" style={{ height: "12px", animationDelay: "150ms" }} />
                          <span className="w-0.5 bg-accent animate-pulse" style={{ height: "6px", animationDelay: "300ms" }} />
                          <span className="w-0.5 bg-accent animate-pulse" style={{ height: "10px", animationDelay: "75ms" }} />
                        </span>
                      ) : (
                        <span className="text-accent">{index + 1}</span>
                      )
                    ) : (
                      index + 1
                    )}
                  </span>
                  {!isActive && (
                    <Play className="w-4 h-4 text-white hidden group-hover:block" fill="white" />
                  )}
                </div>
              )}

              {/* Track info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded overflow-hidden bg-surface-hover shrink-0 relative group/img">
                  <Image
                    src={coverImg}
                    alt={track.title}
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/img:opacity-100 md:hidden transition-opacity">
                    {isCurrentLoading ? (
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : isCurrentPlaying ? (
                      <Pause className="w-4 h-4 text-white" fill="white" />
                    ) : (
                      <Play className="w-4 h-4 text-white" fill="white" />
                    )}
                  </div>
                </div>
                <div className="min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${
                      isActive ? "text-accent" : "text-white"
                    }`}
                  >
                    {track.title_short || track.title}
                  </p>
                  <p className="text-xs text-muted truncate">
                    {track.artist?.name || "Unknown Artist"}
                  </p>
                </div>
              </div>

              {/* Album - desktop only */}
              {showAlbum && (
                <div className="hidden md:flex items-center">
                  <p className="text-sm text-muted truncate hover:text-white transition-colors">
                    {track.album?.title || ""}
                  </p>
                </div>
              )}
              {!showAlbum && <div className="hidden md:block" />}

              {/* Duration - desktop */}
              <div className="hidden md:flex items-center justify-end">
                <span className="text-sm text-muted tabular-nums">
                  {track.duration ? formatDuration(track.duration) : ""}
                </span>
              </div>

              {/* Favorite */}
              <div className="flex items-center justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(track);
                  }}
                  className="p-1 transition-colors"
                  aria-label={trackFav ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      trackFav
                        ? "text-accent fill-accent"
                        : "text-transparent group-hover:text-muted hover:!text-white"
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
