import { NextRequest, NextResponse } from "next/server";
import {
  jamendoUrl,
  mapJamendoTrack,
  filterPlayableTracks,
  JamendoTrack,
} from "@/lib/jamendo";

// A curated list of Jamendo genre tags to browse by.
const GENRES = [
  { id: "pop", name: "Pop" },
  { id: "rock", name: "Rock" },
  { id: "electronic", name: "Electronic" },
  { id: "hiphop", name: "Hip-Hop" },
  { id: "jazz", name: "Jazz" },
  { id: "classical", name: "Classical" },
  { id: "lounge", name: "Lounge" },
  { id: "metal", name: "Metal" },
  { id: "folk", name: "Folk" },
  { id: "world", name: "World" },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  // Return the list of available genres
  if (!id) {
    return NextResponse.json({
      data: GENRES.map((g) => ({
        id: g.id,
        name: g.name,
        picture: "",
        picture_medium: "",
      })),
    });
  }

  // Return tracks for a specific genre tag
  try {
    const url = jamendoUrl("tracks", {
      limit: 50,
      tags: id,
      audioformat: "mp32",
      include: "musicinfo",
      order: "popularity_month",
    });

    const response = await fetch(url, {
      signal: AbortSignal.timeout(15000),
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Jamendo request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (data?.headers?.status === "success" && Array.isArray(data.results)) {
      const tracks = filterPlayableTracks(
        (data.results as JamendoTrack[]).map(mapJamendoTrack)
      );
      return NextResponse.json({ data: tracks });
    }

    return NextResponse.json({ data: [] });
  } catch (error) {
    console.error("Genre API error:", error);
    return NextResponse.json({ data: [] }, { status: 200 });
  }
}
