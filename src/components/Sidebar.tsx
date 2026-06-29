"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Heart, Music } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/library", label: "Your Library", icon: Heart },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-[240px] bg-sidebar-bg h-full shrink-0">
      {/* Logo */}
      <div className="px-6 pt-6 pb-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <Music className="w-5 h-5 text-black" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-accent transition-colors">
            Keithify
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="px-3 mt-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-4 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "text-white bg-surface-hover"
                      : "text-muted hover:text-white"
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 ${isActive ? "text-white" : ""}`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Divider */}
      <div className="mx-6 mt-6 mb-4 border-t border-border" />

      {/* Info */}
      <div className="px-6 mt-auto pb-4">
        <p className="text-xs text-muted/60 leading-relaxed">
          Made for Keith Baje
        </p>
        <p className="text-[10px] text-muted/40 mt-1">
          Powered by Deezer API
        </p>
      </div>
    </aside>
  );
}
