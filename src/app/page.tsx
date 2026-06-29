"use client";

import { useEffect, useState } from "react";
import { Track } from "@/lib/types";
import TrackList from "@/components/TrackList";
import { usePlayer } from "@/context/PlayerContext";
import Image from "next/image";
import { Play, TrendingUp, Disc3, Loader2 } from "lucide-react";

const DEFAULT_COVER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23282828'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23535353' font-size='60'%3E♪%3C/text%3E%3C/svg%3E";

interface ChartData {
  tracks: { data: Track[] };
}

export default function HomePage() {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const { playTrack } = usePlayer();

  useEffect(() => {
    async function fetchCharts() {
      try {
        const res = await fetch("/api/charts");
        const data = await res.json();
        setChartData(data);
      } catch (error) {
        console.error("Failed to fetch charts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCharts();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
        <p className="text-muted text-sm">Loading trending music...</p>
      </div>
    );
  }

  const tracks = chartData?.tracks?.data || [];
  const heroTrack = tracks[0];

  return (
    <div className="pb-8">
      {/* Hero Section */}
      {heroTrack && (
        <div className="relative overflow-hidden rounded-b-2xl md:rounded-2xl md:mx-6 md:mt-4">
          <div className="absolute inset-0">
            <Image
              src={heroTrack.album?.cover_xl || heroTrack.album?.cover_big || heroTrack.img || DEFAULT_COVER}
              alt=""
              fill
              className="object-cover blur-2xl scale-110 opacity-40"
              priority
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          </div>
          <div className="relative px-6 pt-16 pb-8 md:px-10 md:pt-20 md:pb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3 flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5" />
              Trending Now
            </p>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 leading-tight">
              {heroTrack.title_short || heroTrack.title}
            </h1>
            <p className="text-base md:text-lg text-muted mb-6">
              {heroTrack.artist?.name || ""}
            </p>
            <button
              onClick={() => playTrack(heroTrack, tracks)}
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-black font-semibold px-6 py-3 rounded-full transition-all hover:scale-105 shadow-lg shadow-accent/25"
            >
              <Play className="w-5 h-5" fill="black" />
              Play
            </button>
          </div>
        </div>
      )}

      {/* Quick Picks */}
      {tracks.length > 0 && (
        <section className="px-4 md:px-6 mt-10">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-5 flex items-center gap-2">
            <Disc3 className="w-5 h-5 text-accent" />
            Top Charts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {tracks.slice(0, 6).map((track) => (
              <QuickPickCard key={track.id} track={track} tracks={tracks} />
            ))}
          </div>
        </section>
      )}

      {/* Full Track List */}
      {tracks.length > 0 && (
        <section className="px-4 md:px-6 mt-10">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-5 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            Trending Tracks
          </h2>
          <TrackList tracks={tracks.slice(0, 30)} />
        </section>
      )}

      {/* Empty state */}
      {tracks.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <Disc3 className="w-16 h-16 text-muted/30 mb-4" />
          <p className="text-lg font-medium text-white mb-1">
            No trending tracks available
          </p>
          <p className="text-sm text-muted text-center">
            Try searching for your favorite songs
          </p>
        </div>
      )}

      {/* Greeting footer */}
      <div className="px-6 mt-16 mb-4 text-center">
        <p className="text-xs text-muted/40">Made with care for Keith Baje</p>
      </div>
    </div>
  );
}

function QuickPickCard({
  track,
  tracks,
}: {
  track: Track;
  tracks: Track[];
}) {
  const { playTrack, currentTrack, isPlaying, isLoading, togglePlay } = usePlayer();
  const isActive = currentTrack?.id === track.id;
  const isCurrentLoading = isActive && isLoading;

  const handleClick = () => {
    if (isActive) {
      togglePlay();
    } else {
      playTrack(track, tracks);
    }
  };

  const coverImg = track.album?.cover_medium || track.img || DEFAULT_COVER;

  return (
    <div
      onClick={handleClick}
      className={`flex items-center gap-3 bg-white/5 hover:bg-white/10 rounded-md overflow-hidden cursor-pointer group transition-colors ${
        isActive ? "bg-white/10" : ""
      }`}
    >
      <div className="w-16 h-16 shrink-0 relative">
        <Image
          src={coverImg}
          alt={track.title}
          width={64}
          height={64}
          className="object-cover w-full h-full"
          unoptimized
        />
      </div>
      <div className="min-w-0 flex-1 pr-2">
        <p
          className={`text-sm font-semibold truncate ${
            isActive ? "text-accent" : "text-white"
          }`}
        >
          {track.title_short || track.title}
        </p>
        <p className="text-xs text-muted truncate">{track.artist?.name || ""}</p>
      </div>
      <div className="pr-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shadow-lg">
          {isCurrentLoading ? (
            <Loader2 className="w-4 h-4 text-black animate-spin" />
          ) : isActive && isPlaying ? (
            <span className="w-2.5 h-2.5 border-l-2 border-r-2 border-black" />
          ) : (
            <Play className="w-4 h-4 text-black ml-0.5" fill="black" />
          )}
        </div>
      </div>
    </div>
  );
}
