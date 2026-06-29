import { NextRequest, NextResponse } from "next/server";
import { jamendoUrl, JamendoTrack } from "@/lib/jamendo";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Song ID is required" },
      { status: 400 }
    );
  }

  try {
    // Look up the track by id and return its full-length streaming URL.
    const url = jamendoUrl("tracks", {
      id,
      audioformat: "mp32",
    });

    const response = await fetch(url, {
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`Jamendo request failed with status ${response.status}`);
    }

    const data = await response.json();
    const track: JamendoTrack | undefined = data?.results?.[0];

    if (data?.headers?.status === "success" && track?.audio) {
      return NextResponse.json({
        url: track.audio,
        message: "success",
      });
    }

    return NextResponse.json(
      { error: "Failed to fetch stream URL", url: null },
      { status: 404 }
    );
  } catch (error) {
    console.error("Stream API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stream URL" },
      { status: 500 }
    );
  }
}
