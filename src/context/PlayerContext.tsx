"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { Track } from "@/lib/types";

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  currentIndex: number;
  volume: number;
  currentTime: number;
  duration: number;
  favorites: Track[];
  isLoading: boolean;
}

interface PlayerContextType extends PlayerState {
  playTrack: (track: Track, trackList?: Track[]) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (volume: number) => void;
  seekTo: (time: number) => void;
  toggleFavorite: (track: Track) => void;
  isFavorite: (trackId: string) => boolean;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

// Cache for fetched stream URLs
const streamUrlCache = new Map<string, string>();

async function fetchStreamUrl(trackId: string): Promise<string | null> {
  // Check cache first
  if (streamUrlCache.has(trackId)) {
    return streamUrlCache.get(trackId)!;
  }

  try {
    const res = await fetch(`/api/stream?id=${encodeURIComponent(trackId)}`);
    const data = await res.json();

    if (data.url) {
      streamUrlCache.set(trackId, data.url);
      return data.url;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch stream URL:", error);
    return null;
  }
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<PlayerState>({
    currentTrack: null,
    isPlaying: false,
    queue: [],
    currentIndex: -1,
    volume: 0.7,
    currentTime: 0,
    duration: 0,
    favorites: [],
    isLoading: false,
  });

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("keithify-favorites");
      if (saved) {
        const parsed = JSON.parse(saved);
        setState((prev) => ({ ...prev, favorites: parsed }));
      }
    } catch {
      // ignore
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        "keithify-favorites",
        JSON.stringify(state.favorites)
      );
    } catch {
      // ignore
    }
  }, [state.favorites]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setState((prev) => ({
        ...prev,
        currentTime: audio.currentTime,
        duration: audio.duration || 0,
      }));
    };

    const handleEnded = () => {
      // Auto-play next track
      setState((prev) => {
        if (prev.currentIndex < prev.queue.length - 1) {
          const nextIndex = prev.currentIndex + 1;
          const nextTrack = prev.queue[nextIndex];

          // Fetch stream URL for next track
          fetchStreamUrl(nextTrack.id).then((url) => {
            if (url) {
              audio.src = url;
              audio.play().catch(() => {});
            }
          });

          return {
            ...prev,
            currentTrack: nextTrack,
            currentIndex: nextIndex,
            isPlaying: true,
            isLoading: true,
          };
        }
        return { ...prev, isPlaying: false };
      });
    };

    const handleLoadedMetadata = () => {
      setState((prev) => ({
        ...prev,
        duration: audio.duration || 0,
        isLoading: false,
      }));
    };

    const handleCanPlay = () => {
      setState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    };

    const handleError = () => {
      console.error("Audio playback error");
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isPlaying: false,
      }));
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleError);
    };
  }, []);

  const playTrack = useCallback(
    async (track: Track, trackList?: Track[]) => {
      const audio = audioRef.current;
      if (!audio) return;

      const newQueue = trackList || [track];
      const newIndex = trackList
        ? trackList.findIndex((t) => t.id === track.id)
        : 0;

      setState((prev) => ({
        ...prev,
        currentTrack: track,
        queue: newQueue,
        currentIndex: newIndex >= 0 ? newIndex : 0,
        isPlaying: true,
        isLoading: true,
      }));

      // Fetch the stream URL
      const streamUrl = await fetchStreamUrl(track.id);

      if (streamUrl) {
        // Check if it's an HLS stream
        if (streamUrl.endsWith(".m3u8")) {
          // For HLS streams, try using the URL directly
          // Most modern browsers don't support HLS natively except Safari
          // We'll try it and fall back if it fails
          audio.src = streamUrl;
        } else {
          audio.src = streamUrl;
        }
        audio.volume = state.volume;
        try {
          await audio.play();
          setState((prev) => ({ ...prev, isLoading: false }));
        } catch (err) {
          console.error("Playback failed:", err);
          setState((prev) => ({ ...prev, isLoading: false, isPlaying: false }));
        }
      } else {
        console.error("Could not fetch stream URL for track:", track.title);
        setState((prev) => ({ ...prev, isLoading: false, isPlaying: false }));
      }
    },
    [state.volume]
  );

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !state.currentTrack) return;

    if (state.isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }

    setState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, [state.isPlaying, state.currentTrack]);

  const nextTrack = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || state.queue.length === 0) return;

    const nextIndex =
      state.currentIndex < state.queue.length - 1
        ? state.currentIndex + 1
        : 0;
    const track = state.queue[nextIndex];

    setState((prev) => ({
      ...prev,
      currentTrack: track,
      currentIndex: nextIndex,
      isPlaying: true,
      isLoading: true,
    }));

    const streamUrl = await fetchStreamUrl(track.id);
    if (streamUrl) {
      audio.src = streamUrl;
      audio.volume = state.volume;
      try {
        await audio.play();
      } catch {
        // ignore
      }
    }

    setState((prev) => ({ ...prev, isLoading: false }));
  }, [state.queue, state.currentIndex, state.volume]);

  const prevTrack = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || state.queue.length === 0) return;

    const prevIndex =
      state.currentIndex > 0
        ? state.currentIndex - 1
        : state.queue.length - 1;
    const track = state.queue[prevIndex];

    setState((prev) => ({
      ...prev,
      currentTrack: track,
      currentIndex: prevIndex,
      isPlaying: true,
      isLoading: true,
    }));

    const streamUrl = await fetchStreamUrl(track.id);
    if (streamUrl) {
      audio.src = streamUrl;
      audio.volume = state.volume;
      try {
        await audio.play();
      } catch {
        // ignore
      }
    }

    setState((prev) => ({ ...prev, isLoading: false }));
  }, [state.queue, state.currentIndex, state.volume]);

  const setVolume = useCallback((volume: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
    }
    setState((prev) => ({ ...prev, volume }));
  }, []);

  const seekTo = useCallback((time: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
    }
  }, []);

  const toggleFavorite = useCallback((track: Track) => {
    setState((prev) => {
      const exists = prev.favorites.some((f) => f.id === track.id);
      const newFavorites = exists
        ? prev.favorites.filter((f) => f.id !== track.id)
        : [...prev.favorites, track];
      return { ...prev, favorites: newFavorites };
    });
  }, []);

  const isFavorite = useCallback(
    (trackId: string) => {
      return state.favorites.some((f) => f.id === trackId);
    },
    [state.favorites]
  );

  return (
    <PlayerContext.Provider
      value={{
        ...state,
        playTrack,
        togglePlay,
        nextTrack,
        prevTrack,
        setVolume,
        seekTo,
        toggleFavorite,
        isFavorite,
        audioRef,
      }}
    >
      <audio ref={audioRef} preload="auto" crossOrigin="anonymous" />
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
