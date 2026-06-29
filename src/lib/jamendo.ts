import { Track } from "@/lib/types";

export const JAMENDO_API_BASE = "https://api.jamendo.com/v3.0";

export function getJamendoClientId(): string {
  return process.env.JAMENDO_CLIENT_ID || "2eba4ebe";
}

// Raw shape of a track returned by the Jamendo API (only the fields we use)
export interface JamendoTrack {
  id: string;
  name: string;
  duration: number;
  artist_name: string;
  album_name: string;
  album_image: string;
  image: string;
  audio: string;
  audiodownload: string;
}

// Build a Jamendo API URL with the client_id and shared defaults applied.
export function jamendoUrl(
  path: string,
  params: Record<string, string | number | undefined>
): string {
  const url = new URL(`${JAMENDO_API_BASE}/${path}`);
  url.searchParams.set("client_id", getJamendoClientId());
  url.searchParams.set("format", "json");
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

// Map a Jamendo track into the app's internal Track shape.
export function mapJamendoTrack(item: JamendoTrack): Track {
  const cover = item.album_image || item.image || "";
  return {
    id: String(item.id),
    title: item.name,
    title_short: item.name,
    img: cover,
    duration: item.duration || 0,
    // Jamendo returns a full-length streamable audio URL directly.
    preview: item.audio || "",
    artist: {
      name: item.artist_name || "",
    },
    album: {
      title: item.album_name || "",
      cover,
      cover_small: cover,
      cover_medium: cover,
      cover_big: cover,
      cover_xl: cover,
    },
  };
}
