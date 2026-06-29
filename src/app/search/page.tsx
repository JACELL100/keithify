"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Track } from "@/lib/types";
import TrackList from "@/components/TrackList";
import { Search, X, Loader2 } from "lucide-react";

const BROWSE_CATEGORIES = [
  { name: "Pop", query: "pop hits", color: "from-pink-500 to-rose-600" },
  { name: "Hip-Hop", query: "hip hop", color: "from-orange-500 to-amber-600" },
  { name: "Rock", query: "rock classics", color: "from-red-600 to-red-800" },
  { name: "R&B", query: "r&b soul", color: "from-purple-500 to-violet-700" },
  { name: "Electronic", query: "electronic dance", color: "from-cyan-500 to-blue-600" },
  { name: "Jazz", query: "jazz classics", color: "from-amber-600 to-yellow-700" },
  { name: "Classical", query: "classical music", color: "from-emerald-600 to-green-800" },
  { name: "Latin", query: "latin hits", color: "from-rose-500 to-pink-700" },
  { name: "Afrobeats", query: "afrobeats", color: "from-green-500 to-emerald-700" },
  { name: "Country", query: "country music", color: "from-yellow-600 to-orange-700" },
  { name: "Indie", query: "indie alternative", color: "from-indigo-500 to-purple-700" },
  { name: "Chill", query: "chill vibes lofi", color: "from-teal-500 to-cyan-700" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const searchTracks = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      const tracks = data.data || [];
      setResults(tracks);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchTracks(value);
    }, 400);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  const handleCategoryClick = (categoryQuery: string, categoryName: string) => {
    setQuery(categoryName);
    searchTracks(categoryQuery);
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="pb-8">
      {/* Search Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl px-4 md:px-6 pt-4 pb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Search
        </h1>
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="What do you want to listen to?"
            className="w-full bg-white/10 text-white placeholder:text-muted/60 rounded-full py-3 pl-12 pr-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/50 focus:bg-white/15 transition-all"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </div>
      )}

      {/* Search Results */}
      {!loading && hasSearched && results.length > 0 && (
        <div className="px-4 md:px-6 mt-4">
          <p className="text-sm text-muted mb-4">
            {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
          </p>
          <TrackList tracks={results} />
        </div>
      )}

      {/* No Results */}
      {!loading && hasSearched && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <Search className="w-16 h-16 text-muted/30 mb-4" />
          <p className="text-lg font-medium text-white mb-1">
            No results found
          </p>
          <p className="text-sm text-muted text-center">
            Try different keywords or check the spelling
          </p>
        </div>
      )}

      {/* Browse Categories */}
      {!hasSearched && !loading && (
        <div className="px-4 md:px-6 mt-2">
          <h2 className="text-xl font-bold text-white mb-4">
            Browse All
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {BROWSE_CATEGORIES.map((category) => (
              <button
                key={category.name}
                onClick={() =>
                  handleCategoryClick(category.query, category.name)
                }
                className={`relative overflow-hidden rounded-lg h-24 md:h-28 bg-gradient-to-br ${category.color} p-4 text-left hover:scale-[1.02] transition-transform shadow-lg`}
              >
                <span className="text-base md:text-lg font-bold text-white">
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
