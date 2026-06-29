import { NextRequest, NextResponse } from "next/server";

const MUSIC_API_BASE = "https://musicapi.x007.workers.dev";

// Try multiple search engines in order of reliability
const SEARCH_ENGINES = ["gaama", "seevn", "hunjama", "mtmusic", "wunk"];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const engine = searchParams.get("engine");

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
  }

  const engineList = engine ? [engine] : SEARCH_ENGINES;

  for (const searchEngine of engineList) {
    try {
      const response = await fetch(
        `${MUSIC_API_BASE}/search?q=${encodeURIComponent(query)}&searchEngine=${searchEngine}`,
        { signal: AbortSignal.timeout(10000) }
      );

      if (!response.ok) continue;

      const data = await response.json();

      if (data.status === 200 && Array.isArray(data.response) && data.response.length > 0) {
        // Transform to our Track format
        const tracks = data.response.map((item: { id: string; title: string; img: string }) => ({
          id: item.id,
          title: item.title,
          title_short: item.title,
          img: item.img || "",
          duration: 0,
          preview: "", // Will be fetched on demand via /api/stream
          artist: {
            name: extractArtist(item.title),
          },
          album: {
            title: "",
            cover: item.img || "",
            cover_small: item.img || "",
            cover_medium: item.img || "",
            cover_big: item.img || "",
            cover_xl: item.img || "",
          },
        }));

        return NextResponse.json({
          data: tracks,
          engine: searchEngine,
        });
      }
    } catch (error) {
      console.error(`Search failed with engine ${searchEngine}:`, error);
      continue;
    }
  }

  // All engines failed
  return NextResponse.json({ data: [], engine: null });
}

// Try to extract artist name from title like "Song Name - Artist Name" or "Song Name (Artist)"
function extractArtist(title: string): string {
  // Check for " - " separator (common format: "Title - Artist")
  if (title.includes(" - ")) {
    const parts = title.split(" - ");
    return parts[parts.length - 1].trim();
  }
  // Check for " by " separator
  if (title.toLowerCase().includes(" by ")) {
    const parts = title.toLowerCase().split(" by ");
    return title.substring(title.toLowerCase().indexOf(" by ") + 4).trim();
  }
  return "";
}
