import { NextResponse } from "next/server";
import {
  jamendoUrl,
  mapJamendoTrack,
  filterPlayableTracks,
  JamendoTrack,
} from "@/lib/jamendo";

export async function GET() {
  try {
    // Use Jamendo's "popularity this week" ordering to simulate trending charts.
    const url = jamendoUrl("tracks", {
      limit: 50,
      audioformat: "mp32",
      include: "musicinfo",
      order: "popularity_week",
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
      return NextResponse.json({
        tracks: { data: tracks },
        artists: { data: [] },
        engine: "jamendo",
      });
    }

    return NextResponse.json({
      tracks: { data: [] },
      artists: { data: [] },
      engine: null,
    });
  } catch (error) {
    console.error("Charts API error:", error);
    return NextResponse.json(
      { tracks: { data: [] }, artists: { data: [] }, engine: null },
      { status: 200 }
    );
  }
}
