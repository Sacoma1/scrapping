interface Genre {
  mal_id: number;
  type: string;
  name: string;
  url: string;
}

export interface JikanAnime {
  title: string;
  genres: Genre[];
  img: string;
  status: string;
  year?: number;
  score?: number;
  broadcast?: {
    string: string;
  };
  link?: string;
  sinopsis: string;
  type: string;
  episodes?: number;
}

export interface JikanResponse {
  data: JikanAnime[];
}

export interface AnimeLink {
  link: string;
  id: number;
  title: string;
  episodes: number | null;
}

export interface anime {
  title: string;
  genres: string;
  img: string;
  status: string;
  year?: number;
  score?: number;
  broadcast?: {
    string: string;
  };
  link?: string;
  sinopsis: string;
  type: string;
  episodes?: number;
}

export interface animeWithMissingEpisodes {
  title: string;
  link: string;
}

export interface ScrappedMissingAnimeEpisodes {
  title: string;
  link: string;
  episodes: number | null;
  id: number | 0;
}

export interface UpdateAnime {
  id: number;
  episodes: number;
  title: string;
}
