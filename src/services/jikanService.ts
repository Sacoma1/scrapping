import { JikanResponse } from "../../interfaces.js";

export const apiData = async (index: string | undefined) => {
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

    const genres = data.data[0]?.genres.map((g) => g.name);
    const status = data.data[0]?.status;
    const year = data.data[0]?.year || "N/A";
    const score = data.data[0]?.score;
    const broadcast = data.data[0]?.broadcast?.string || "N/A";
    const episodes = data.data[0]?.episodes || 0;

    return {
      genres: genres.join(","),
      status: status,
      year: year,
      score: score,
      broadcast: broadcast,
      episodes: episodes,
    };
  } catch (e: any) {
    console.error("no se pudo cargar la infomacion de la api de Jikan", e);
    throw e;
  }
};
