"use client";

import { PlayerProvider, usePlayer } from "@/context/PlayerContext";
import Sidebar from "@/components/Sidebar";
import Player from "@/components/Player";
import MobileNav from "@/components/MobileNav";
import MobileHeader from "@/components/MobileHeader";

function AppContent({ children }: { children: React.ReactNode }) {
  const { currentTrack } = usePlayer();
  const hasTrack = !!currentTrack;

  return (
    <div className="h-screen flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main content area */}
        <main
          className={`flex-1 overflow-y-auto bg-background ${
            hasTrack ? "pb-[160px] md:pb-[80px]" : "pb-[60px] md:pb-0"
          }`}
        >
          {/* Mobile top header with logo */}
          <MobileHeader />
          {children}
        </main>
      </div>

      {/* Player */}
      <Player />

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <PlayerProvider>
      <AppContent>{children}</AppContent>
    </PlayerProvider>
  );
}
