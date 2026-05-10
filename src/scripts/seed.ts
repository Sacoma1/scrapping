import { JikanAnime, ScrappedMissingAnimeEpisodes } from "../../interfaces.js";
import { prisma } from "../../prisma/db.js";
import { apiData } from "../services/jikanService.js";
import { animeClearedUrl } from "../utils/clearLink.js";
import { findEpisodes } from "../utils/missingEpisodes.js";

export const animeToDb = async (animeArray: JikanAnime[]) => {
  let index = 0;

  for (let anime of animeArray) {
    index++;
    const clearedUrl = animeClearedUrl(anime.link);

    const verifyAnime = await prisma.animes.findUnique({
      where: { link: clearedUrl },
    });

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

        const isMatch =
          animeTitle.title.toLowerCase().includes(anime.title.toLowerCase()) ||
          anime.title.toLowerCase().includes(animeTitle.title.toLowerCase());

        let updatedData;

        if (isMatch) {
          updatedData = { ...anime, ...animeTitle };
        } else {
          console.log(
            ` Discordancia: API dice "${animeTitle.title}" pero buscamos "${anime.title}"`,
          );
          updatedData = {
            ...anime,
            episodes: 0,
            genres: "",
            broadcast: "",
            status: anime.status || "N/A",
            year: anime.year || "N/A",
            score: anime.score || null,
          };
        }

        const upsertData = await prisma.animes.upsert({
          where: { link: clearedUrl },
          update: {
            status: updatedData.status || null,
            score: updatedData.score ?? null,
            episodes: updatedData.episodes || 0,
          },
          create: {
            title: anime.title,
            link: clearedUrl!,
            status: updatedData.status,
            year: updatedData.year ? Number(updatedData.year) : null,
            score: updatedData.score ?? null,
            broadcast: updatedData.broadcast || "",
            img: anime.img ?? "",
            sinopsis: anime.sinopsis,
            type: anime.type,
            episodes: updatedData.episodes || 0,
          },
        });

        if (upsertData.episodes && upsertData.episodes > 0) {
          console.log(
            `Creando ${upsertData.episodes} episodios para: ${upsertData.title}`,
          );

          const animeArray = Array.from(
            { length: upsertData.episodes },
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
        console.log(`Anime procesado ${index}: ${anime.title}`);
      }
    } catch (e: any) {
      console.error(`Error en anime ${index}: ${anime.title}`, e.message || e);
      continue;
    }

    const delay = Math.floor(Math.random() * 5000) + 3000;
    await new Promise((r) => setTimeout(r, delay));
  }

  // --- SEGUNDA FASE: SCRAPEO MANUAL ---
  const missingEpisode = await prisma.animes.findMany({
    where: { episodes: 0 },
  });

  if (missingEpisode.length > 0) {
    console.log(
      `Procesando ${missingEpisode.length} animes con scrapeo manual...`,
    );
    const animeEpisodes: ScrappedMissingAnimeEpisodes[] =
      await findEpisodes(missingEpisode);

    for (let anime of animeEpisodes) {
      console.log(
        `Actualizando ${anime.title}: ${anime.episodes} episodios detectados.`,
      );

      const updateEpisodes = await prisma.animes.update({
        where: { link: anime.link },
        data: { episodes: anime.episodes },
      });

      if (updateEpisodes.episodes && updateEpisodes.episodes > 0) {
        const updatedAnimeArray = Array.from(
          { length: updateEpisodes.episodes },
          (_, i) => ({
            number: i + 1,
            animeId: updateEpisodes.id,
          }),
        );

        const result = await prisma.episode.createMany({
          data: updatedAnimeArray,
          skipDuplicates: true,
        });
        console.log(
          `Insertados ${result.count} episodios para ${updateEpisodes.title}`,
        );
      }
    }
  }
};
