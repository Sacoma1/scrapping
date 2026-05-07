import { prisma } from "../../prisma/db.js";
import { tokeExtractor } from "../scripts/tokenExtractor.js";

export const animeToketoDB = async () => {
  let index = 0;
  console.log("conectando a base de datos...");
  try {
    const videoToken = await prisma.episode.findMany({
      where: { videoToken: null },

      include: { anime: true },
    });

    for (let episode of videoToken) {
      index++;
      try {
        console.log(
          `Extrayendo token del anime #${index}: ${episode.anime.title}`,
        );
        const animeToken = await tokeExtractor(
          episode.anime.link,
          episode.number,
        );
        console.log(animeToken);
        const updateToken = await prisma.episode.update({
          where: { id: episode.id },
          data: { videoToken: animeToken },
        });
      } catch (e: any) {
        console.error(
          `Hubo un problema con el siguiente anime ${index}: ${episode.anime.title} continuando con el siguiente`,
        );
        continue;
      }
    }
  } catch (e: any) {
    console.error("Hubo un error al conectarse a la base de datos", e);
  }
};

animeToketoDB();
