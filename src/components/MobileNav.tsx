"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Heart } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/library", label: "Library", icon: Heart },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black via-black/95 to-black/80 backdrop-blur-xl border-t border-white/5">
      <ul className="flex items-center justify-around px-2 py-2 pb-[env(safe-area-inset-bottom,8px)]">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-lg transition-colors ${
                  isActive ? "text-white" : "text-muted"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 ${isActive ? "text-accent" : ""}`}
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
