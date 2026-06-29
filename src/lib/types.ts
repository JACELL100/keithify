export interface Track {
  id: string;
  title: string;
  title_short: string;
  img: string;
  duration: number;
  preview: string; // audio URL - fetched on demand
  artist: {
    name: string;
  };
  album: {
    title: string;
    cover: string;
    cover_small: string;
    cover_medium: string;
    cover_big: string;
    cover_xl: string;
  };
}

export interface Artist {
  id: string;
  name: string;
  picture: string;
  picture_medium: string;
}



