"use client";

import { usePlayer } from "@/context/PlayerContext";
import Image from "next/image";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Heart,
  Loader2,
} from "lucide-react";
import { useCallback, useState } from "react";

const DEFAULT_COVER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 56 56'%3E%3Crect width='56' height='56' fill='%23282828'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23535353' font-size='20'%3E♪%3C/text%3E%3C/svg%3E";

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds === 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function Player() {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    togglePlay,
    nextTrack,
    prevTrack,
    volume,
    setVolume,
    currentTime,
    duration,
    seekTo,
    toggleFavorite,
    isFavorite,
  } = usePlayer();

  const [prevVolume, setPrevVolume] = useState(0.7);

  const handleSeek = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      seekTo(parseFloat(e.target.value));
    },
    [seekTo]
  );

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setVolume(parseFloat(e.target.value));
    },
    [setVolume]
  );

  const toggleMute = useCallback(() => {
    if (volume > 0) {
      setPrevVolume(volume);
      setVolume(0);
    } else {
      setVolume(prevVolume);
    }
  }, [volume, prevVolume, setVolume]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!currentTrack) {
    return null;
  }

  const trackIsFav = isFavorite(currentTrack.id);
  const coverImg = currentTrack.album?.cover_medium || currentTrack.img || DEFAULT_COVER;
  const coverImgSmall = currentTrack.album?.cover_small || currentTrack.img || DEFAULT_COVER;

  return (
    <>
      {/* Desktop Player */}
      <div className="hidden md:flex fixed bottom-0 left-0 right-0 h-[80px] bg-player-bg border-t border-white/5 z-50 items-center px-4">
        {/* Track Info - Left */}
        <div className="flex items-center gap-3 w-[280px] min-w-[180px]">
          <div className="w-14 h-14 rounded-md overflow-hidden bg-surface shrink-0 shadow-lg">
            <Image
              src={coverImg}
              alt={currentTrack.title}
              width={56}
              height={56}
              className="object-cover w-full h-full"
              unoptimized
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {currentTrack.title_short || currentTrack.title}
            </p>
            <p className="text-xs text-muted truncate">
              {currentTrack.artist?.name || "Unknown Artist"}
            </p>
          </div>
          <button
            onClick={() => toggleFavorite(currentTrack)}
            className="ml-2 shrink-0 transition-colors"
            aria-label={trackIsFav ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                trackIsFav
                  ? "text-accent fill-accent"
                  : "text-muted hover:text-white"
              }`}
            />
          </button>
        </div>

        {/* Controls - Center */}
        <div className="flex-1 flex flex-col items-center max-w-[600px] mx-auto">
          <div className="flex items-center gap-5 mb-1.5">
            <button
              onClick={prevTrack}
              className="text-muted hover:text-white transition-colors"
              aria-label="Previous track"
            >
              <SkipBack className="w-4 h-4" fill="currentColor" />
            </button>
            <button
              onClick={togglePlay}
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform"
              aria-label={isPlaying ? "Pause" : "Play"}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 text-black animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4 text-black" fill="black" />
              ) : (
                <Play className="w-4 h-4 text-black ml-0.5" fill="black" />
              )}
            </button>
            <button
              onClick={nextTrack}
              className="text-muted hover:text-white transition-colors"
              aria-label="Next track"
            >
              <SkipForward className="w-4 h-4" fill="currentColor" />
            </button>
          </div>

          <div className="flex items-center gap-2 w-full">
            <span className="text-[11px] text-muted w-10 text-right tabular-nums">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="progress-bar flex-1 w-full h-1 cursor-pointer"
              style={{ "--progress": `${progressPercent}%` } as React.CSSProperties}
            />
            <span className="text-[11px] text-muted w-10 tabular-nums">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume - Right */}
        <div className="flex items-center gap-2 w-[180px] justify-end">
          <button
            onClick={toggleMute}
            className="text-muted hover:text-white transition-colors"
            aria-label={volume === 0 ? "Unmute" : "Mute"}
          >
            {volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={handleVolumeChange}
            className="volume-bar w-24 h-1 cursor-pointer"
            style={{ "--progress": `${volume * 100}%` } as React.CSSProperties}
          />
        </div>
      </div>

      {/* Mobile Player */}
      <div className="md:hidden fixed bottom-[52px] left-0 right-0 z-40">
        {/* Progress bar on top of mobile player */}
        <div className="w-full h-0.5 bg-white/10">
          <div
            className="h-full bg-accent transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center gap-3 px-3 py-2 bg-surface/95 backdrop-blur-xl border-t border-white/5">
          <div className="w-10 h-10 rounded overflow-hidden bg-surface-hover shrink-0">
            <Image
              src={coverImgSmall}
              alt={currentTrack.title}
              width={40}
              height={40}
              className="object-cover w-full h-full"
              unoptimized
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">
              {currentTrack.title_short || currentTrack.title}
            </p>
            <p className="text-xs text-muted truncate">
              {currentTrack.artist?.name || "Unknown Artist"}
            </p>
          </div>
          <button
            onClick={() => toggleFavorite(currentTrack)}
            className="shrink-0 p-1.5"
            aria-label={trackIsFav ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={`w-5 h-5 ${
                trackIsFav
                  ? "text-accent fill-accent"
                  : "text-muted"
              }`}
            />
          </button>
          <button
            onClick={togglePlay}
            className="shrink-0 p-1.5"
            aria-label={isPlaying ? "Pause" : "Play"}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-6 h-6 text-white" fill="white" />
            ) : (
              <Play className="w-6 h-6 text-white" fill="white" />
            )}
          </button>
        </div>
      </div>
    </>
  );
}
