import { prisma } from "../../prisma/db.js";
import { tokeExtractor } from "../scripts/tokenExtractor.js";
import { createEpisodes } from "./createEpisodes.js";

export const missingAnimeToken = async () => {
  const missingToken = await prisma.episode.findMany({
    where: { videoToken: "" },
    include: { anime: true },
  });
  let index = 0;

  for (let animes of missingToken) {
    index++;
    console.log(
      `detectado!!! anime sin token, #${index} anime: ${animes.anime.title} falta capitulo: ${animes.number}`,
    );

    // await createEpisodes(animes.number, animes.anime.link);
  }
};

missingAnimeToken();
