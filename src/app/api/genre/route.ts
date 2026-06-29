import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  if (!id) {
    // Return list of genres
    try {
      const response = await fetch("https://api.deezer.com/genre", {
        next: { revalidate: 86400 },
      });
      if (!response.ok) throw new Error("Failed to fetch genres");
      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      console.error("Genre API error:", error);
      return NextResponse.json({ error: "Failed to fetch genres" }, { status: 500 });
    }
  }

  // Return artists for a specific genre
  try {
    const response = await fetch(
      `https://api.deezer.com/genre/${id}/artists`,
      { next: { revalidate: 3600 } }
    );
    if (!response.ok) throw new Error("Failed to fetch genre artists");
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Genre API error:", error);
    return NextResponse.json({ error: "Failed to fetch genre data" }, { status: 500 });
  }
}
