// funcion para actualizar animes de una nueva temporada
import { JikanAnime, ScrappedMissingAnimeEpisodes } from "../../interfaces.js";
import { prisma } from "../../prisma/db.js";
import { apiData } from "../services/jikanService.js";
import { animeClearedUrl } from "../utils/clearLink.js";

import { tokeExtractor } from "./tokenExtractor.js";

export const newAnimetoDB = async (animeArray: JikanAnime[]) => {
  for (const newAnime of animeArray) {
    console.log("Procesando nuevos animes...");
    const clearedUrl = animeClearedUrl(newAnime.link);

    const verifyAnime = await prisma.animes.findUnique({
      where: { link: clearedUrl },
    });

    if (verifyAnime?.episodes && verifyAnime.episodes > 0) {
      continue;
    }

    const initialEpisode = 1;
    try {
      let updatedData: any = { ...newAnime };
      if (
        !newAnime.episodes &&
        !newAnime.status &&
        !newAnime.genres &&
        !newAnime.year &&
        !newAnime.broadcast &&
        !newAnime.score
      ) {
        const animeTitle = await apiData(clearedUrl);

        const isMatch =
          animeTitle.title
            .toLowerCase()
            .includes(newAnime.title.toLowerCase()) ||
          newAnime.title.toLowerCase().includes(animeTitle.title.toLowerCase());

        if (isMatch) {
          updatedData = { ...newAnime, ...animeTitle };
        } else {
          console.log(
            ` Discordancia: API dice "${animeTitle.title}" pero buscamos "${newAnime.title}"`,
          );
          updatedData = {
            ...newAnime,
            episodes: 0,
            genres: "",
            broadcast: null,
            status: newAnime.status || "N/A",
            year: newAnime.year || 0,
            score: newAnime.score || 0,
          };
        }
        const videoToken = await tokeExtractor(
          clearedUrl || "",
          initialEpisode,
        );

        await prisma.animes.upsert({
          where: { link: clearedUrl },
          update: {
            status: updatedData.status || null,
            score: updatedData.score ?? null,
            episodes: updatedData.episodes || 0,
          },
          create: {
            title: updatedData.title,
            link: clearedUrl!,
            status: updatedData.status,
            year: updatedData.year ? Number(updatedData.year) : null,
            score: updatedData.score ?? null,
            broadcast: updatedData.broadcast || null,
            img: updatedData.img ?? "",
            sinopsis: updatedData.sinopsis,
            type: updatedData.type,
            episodes: updatedData.episodes || 0,
            totalEpisodes: {
              create: {
                number: initialEpisode,
                videoToken: videoToken,
              },
            },
          },
        });
      }

      console.log(
        `Extrayendo primer episodio ${newAnime.title}, ${initialEpisode}`,
      );
    } catch (e: any) {
      console.error("error al registrar anime", e);
    }
  }
};
