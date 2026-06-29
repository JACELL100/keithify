"use client";

import Link from "next/link";
import { Music } from "lucide-react";

export default function MobileHeader() {
  return (
    <header className="md:hidden sticky top-0 z-30 flex items-center px-4 h-14 bg-sidebar-bg/95 backdrop-blur-xl border-b border-white/5">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
          <Music className="w-5 h-5 text-black" strokeWidth={2.5} />
        </div>
        <span className="text-xl font-bold tracking-tight text-white group-hover:text-accent transition-colors">
          Keithify
        </span>
      </Link>
    </header>
  );
}
