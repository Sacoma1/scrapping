import { ScrappedMissingAnimeEpisodes } from "../../interfaces.js";
import { prisma } from "../../prisma/db.js";
import { findEpisodes } from "../utils/missingEpisodes.js";
import { tokeExtractor } from "./tokenExtractor.js";

const animesOnAir = async () => {
  console.log("Conectando a base de datos ");
  const animesOnAir = await prisma.animes.findMany({
    where: { status: "Currently airing" },
    include: { totalEpisodes: true },
  });
  // console.log(animesOnAir);

  const updatedEpisodes: ScrappedMissingAnimeEpisodes[] = await findEpisodes(
    animesOnAir.slice(0, 3),
  );

  for (let episode of updatedEpisodes.slice(0, 5)) {
    try {
      // 1. Actualizamos el contador en el Anime
      const episodeNumber = episode.episodes || 0;
      const updateanimeEpisode = await prisma.animes.update({
        where: { link: episode.link },
        data: { episodes: episodeNumber },
      });

      console.log(
        `Actualizado: ${episode.title} ahora tiene ${episodeNumber} episodios.`,
      );

      // 2. Creamos los episodios que falten (skipDuplicates evita borrar/duplicar)
      const episodeArray = Array.from({ length: episodeNumber }, (_, i) => ({
        number: i + 1,
        animeId: updateanimeEpisode.id,
      }));

      await prisma.episode.createMany({
        data: episodeArray,
        skipDuplicates: true,
      });

      // 3. Extraemos el token (solo para el episodio nuevo)
      const extractedToken = await tokeExtractor(episode.title, episodeNumber);

      // 4. ACTUALIZACIÓN QUIRÚRGICA:
      // Usamos updateMany con filtro doble para que solo afecte al episodio actual
      // y no toque los tokens de los episodios anteriores.
      await prisma.episode.updateMany({
        where: {
          animeId: updateanimeEpisode.id,
          number: episodeNumber, // <--- AQUÍ está el secreto: solo el último
        },
        data: {
          videoToken: extractedToken,
        },
      });
    } catch (e: any) {
      console.error(
        `Hubo un problema para actualizar el anime ${episode.title}, ${e}`,
      );
    }
  }
};

animesOnAir();
