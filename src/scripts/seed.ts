import { JikanAnime, ScrappedMissingAnimeEpisodes } from "../../interfaces.js";
import { prisma } from "../../prisma/db.js";

import { apiData } from "../services/jikanService.js";
import { animeClearedUrl } from "../utils/clearLink.js";
import { findEpisodes } from "../utils/missingEpisodes.js";

//funcion complementaria a index.ts, esta funcion sirve para crear, actualizar animes nuevos o actualizar los ya existentes

export const animeToDb = async (animeArray: JikanAnime[]) => {
  let index = 0;

  //Recorremos el array entregado en la funcion para poder acceder a los objetos y sus propiedades

  for (let anime of animeArray) {
    index++;
    //limpiamos el url antes de pasarlo a la db
    const clearedUrl = animeClearedUrl(anime.link);
    //verificamos si el anime ya existe dentro de la db
    const verifyAnime = await prisma.animes.findUnique({
      where: { link: clearedUrl },
    });
    //si el anime existe y tiene data los skippeamos
    if (verifyAnime?.episodes && verifyAnime.episodes > 0) {
      continue;
    }

    try {
      if (
        !anime.episodes &&
        !anime.status &&
        !anime.genres &&
        !anime.year &&
        !anime.broadcast &&
        !anime.score
      ) {
        const animeTitle = await apiData(clearedUrl);

        const updatedData = { ...anime, ...animeTitle };
        const upsertData = await prisma.animes.upsert({
          where: {
            link: clearedUrl,
          },
          update: {
            link: clearedUrl,
            status: updatedData.status,
            score: updatedData.score ?? null,
            episodes: updatedData.episodes,
            genres: updatedData.genres,
          },
          create: {
            title: anime.title,
            link: clearedUrl!,
            status: updatedData.status,
            year: updatedData.year ? Number(updatedData.year) : null,
            score: updatedData.score ?? null,
            broadcast: updatedData.broadcast ?? "",
            img: anime.img ?? "",
            sinopsis: anime.sinopsis,
            type: anime.type,
          },
        });

        if (upsertData.episodes && upsertData.episodes > 0) {
          console.log(
            `Creando ${upsertData.episodes} episodios para: ${upsertData.title}`,
          );

          const animeArray = Array.from(
            { length: updatedData.episodes },
            (_, i) => ({
              number: i + 1,
              animeId: upsertData.id,
            }),
          );
          await prisma.episode.createMany({
            data: animeArray,
            skipDuplicates: true,
          });
        }

        console.log(`Anime agregado exitosamente ${index}: ${anime.title}`);
      }
    } catch (e: any) {
      console.error(
        `No se puede agregar anime ${index}: ${anime.title}`,
        e.message || e,
      );
      continue;
    }

    const delay = Math.floor(Math.random() * 5000) + 3000;
    await new Promise((r) => setTimeout(r, delay));
  }

  const missingEpisode = await prisma.animes.findMany({
    where: { episodes: 0 },
  });

  const animeEpisodes: ScrappedMissingAnimeEpisodes[] =
    await findEpisodes(missingEpisode);

  for (let anime of animeEpisodes) {
    console.log(
      `Agregando episodios para: ${anime.title}, se crearon ${anime.episodes} episodios`,
    );
    const updateEpisodes = await prisma.animes.update({
      where: { link: anime.link },
      data: {
        episodes: anime.episodes,
      },
    });

    if (updateEpisodes.episodes && updateEpisodes.episodes > 0) {
      console.log(
        `Creando ${updateEpisodes.episodes} episodios para: ${updateEpisodes.title}`,
      );

      const udpatedanimeArray = Array.from(
        { length: updateEpisodes.episodes },
        (_, i) => ({
          number: i + 1,
          animeId: updateEpisodes.id,
        }),
      );
      const result = await prisma.episode.createMany({
        data: udpatedanimeArray,
        skipDuplicates: true,
      });
      console.log(
        `Resultado de creación: ${result.count} episodios insertados.`,
      );
    }
  }
};
