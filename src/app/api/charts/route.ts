import { NextResponse } from "next/server";

const MUSIC_API_BASE = "https://musicapi.x007.workers.dev";

// Popular search queries to simulate charts/trending
const TRENDING_QUERIES = [
  "top hits 2025",
  "trending songs",
  "popular music",
  "best songs",
];

const SEARCH_ENGINES = ["gaama", "seevn", "hunjama", "mtmusic", "wunk"];

export async function GET() {
  try {
    // Try to fetch trending songs using the music API
    for (const query of TRENDING_QUERIES) {
      for (const engine of SEARCH_ENGINES) {
        try {
          const response = await fetch(
            `${MUSIC_API_BASE}/search?q=${encodeURIComponent(query)}&searchEngine=${engine}`,
            { signal: AbortSignal.timeout(10000) }
          );

          if (!response.ok) continue;

          const data = await response.json();

          if (data.status === 200 && Array.isArray(data.response) && data.response.length > 0) {
            const tracks = data.response.map((item: { id: string; title: string; img: string }) => ({
              id: item.id,
              title: item.title,
              title_short: item.title,
              img: item.img || "",
              duration: 0,
              preview: "",
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
              tracks: { data: tracks },
              artists: { data: [] },
              engine,
            });
          }
        } catch {
          continue;
        }
      }
    }

    // Fallback: return empty data
    return NextResponse.json({
      tracks: { data: [] },
      artists: { data: [] },
      engine: null,
    });
  } catch (error) {
    console.error("Charts API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch charts" },
      { status: 500 }
    );
  }
}

function extractArtist(title: string): string {
  if (title.includes(" - ")) {
    const parts = title.split(" - ");
    return parts[parts.length - 1].trim();
  }
  if (title.toLowerCase().includes(" by ")) {
    return title.substring(title.toLowerCase().indexOf(" by ") + 4).trim();
  }
  return "";
}
