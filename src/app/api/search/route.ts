import { NextRequest, NextResponse } from "next/server";
import { jamendoUrl, mapJamendoTrack, JamendoTrack } from "@/lib/jamendo";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 }
    );
  }

  try {
    const url = jamendoUrl("tracks", {
      limit: 50,
      search: query,
      audioformat: "mp32",
      include: "musicinfo",
      // Prioritise popular, relevant results
      order: "popularity_total",
    });

    const response = await fetch(url, {
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`Jamendo request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (data?.headers?.status === "success" && Array.isArray(data.results)) {
      const tracks = (data.results as JamendoTrack[]).map(mapJamendoTrack);
      return NextResponse.json({ data: tracks, engine: "jamendo" });
    }

    return NextResponse.json({ data: [], engine: null });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ data: [], engine: null });
  }
}
