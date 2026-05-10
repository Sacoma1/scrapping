import { AnimeDataProcessed, JikanResponse } from "../../interfaces.js";

export const apiData = async (
  index: string | undefined,
): Promise<AnimeDataProcessed> => {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime?q=${index}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
      },
    });
    const data: JikanResponse = await res.json();

    if (!data.data) {
      console.log("No se encontro el anime consultado ");
    }
    if (!data.data || data.data.length === 0) {
      console.error(`No se encontro informacion para: ${index}`);
      throw new Error("Anime no encontrado en jikan");
    }
    const anime = data.data[0];

    // Aplanamos aquí mismo
    const genres = anime.genres.map((g) => g.name);
    const status = anime.status;
    const year = anime.year || 0;
    const score = anime.score || null;
    const broadcast = anime.broadcast || "N/A";
    const episodes = anime.episodes || 0;
    const title = anime.title || "";

    return {
      genres: genres.join(" ,") || "",
      status: status,
      year: year,
      score: score,
      broadcast: broadcast,
      episodes: episodes,
      title: title,
    };
  } catch (e: any) {
    console.error("no se pudo cargar la infomacion de la api de Jikan", e);
    throw e;
  }
};
