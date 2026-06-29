import { NextRequest, NextResponse } from "next/server";

const MUSIC_API_BASE = "https://musicapi.x007.workers.dev";

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
    const response = await fetch(
      `${MUSIC_API_BASE}/fetch?id=${encodeURIComponent(id)}`,
      { signal: AbortSignal.timeout(15000) }
    );

    if (!response.ok) {
      throw new Error(`Fetch failed with status ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 200 && data.response) {
      return NextResponse.json({
        url: data.response,
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
