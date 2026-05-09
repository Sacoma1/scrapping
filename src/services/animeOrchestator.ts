import { ProcessedData } from "../../interfaces.js";
import { animeClearedUrl } from "../utils/clearLink.js";
import { apiData } from "./jikanService.js";
import { prisma } from "../../prisma/db.js";
import { tokeExtractor, findEpisodes } from "./scrapperService.js"; // Asegúrate de importar tu extractor

export const processAnime = async (anime: any) => {
  const clearedUrl = animeClearedUrl(anime.link) || "";

  let updateData: any;

  if (!anime.episodes || !anime.genres || !anime.status) {
    const newData = (await apiData(clearedUrl)) as ProcessedData;

    const isMatch =
      newData.title.toLowerCase().includes(anime.title.toLowerCase()) ||
      anime.title.toLowerCase().includes(newData.title.toLowerCase());

    if (isMatch) {
      updateData = {
        ...anime,
        ...newData,
        genres: newData.genres,
        broadcast: newData.broadcast,
      };
    } else {
      console.log(
        ` Discordancia: API dice "${newData.title}" pero buscamos "${anime.title}"`,
      );
      updateData = {
        ...anime,
        episodes: 0,
        genres: "",
        broadcast: "",
        status: anime.status || "N/A",
        score: anime.score || null,
      };
    }
  } else {
    updateData = { ...anime };
  }

  let realEpisodeCount = updateData.episode || 0;

  try {
    // findEpisodes originalmente recibía un array, si la tuya recibe un array, se lo pasamos así
    const scrapedInfo = await findEpisodes([
      { link: clearedUrl, title: anime.title },
    ]);

    if (scrapedInfo && scrapedInfo.length > 0 && scrapedInfo[0].episodes) {
      // Nos quedamos con el número mayor (por si Jikan se atrasó)
      realEpisodeCount = Math.max(realEpisodeCount, scrapedInfo[0].episodes);
      console.log(
        `Scraper detectó ${realEpisodeCount} episodios en la web para ${anime.title}`,
      );
    }
  } catch (error: any) {
    console.log(
      `No se pudo verificar la web para los episodios de ${anime.title}:`,
      error.message,
    );
  }

  // 2. ACTUALIZACIÓN O CREACIÓN EN DB
  const upsertData = await prisma.animes.upsert({
    where: { link: clearedUrl },
    update: {
      status: updateData.status || null,
      score: updateData.score ?? null,
      episodes: updateData.episodes || 0,
      genres: updateData.genres,
    },
    create: {
      title: anime.title,
      link: clearedUrl,
      status: updateData.status,
      year: updateData.year ? Number(updateData.year) : null,
      score: updateData.score ?? null,
      broadcast: updateData.broadcast || "",
      img: anime.img ?? "",
      sinopsis: anime.sinopsis,
      type: anime.type,
      episodes: updateData.episodes || 0,
    },
  });

  // 3. CREAR CASCARONES (Si faltan)
  await ensureEpisodesExist(upsertData.id, upsertData.episodes ?? 0);

  // 4. EXTRACCIÓN DE TOKENS (Paso final)
  // Buscamos episodios de ESTE anime que no tengan token
  const pendingEpisodes = await prisma.episode.findMany({
    where: {
      animeId: upsertData.id,
      videoToken: null,
    },
    orderBy: { number: "asc" },
  });

  if (pendingEpisodes.length > 0) {
    console.log(
      ` Buscando tokens para ${pendingEpisodes.length} episodios de ${upsertData.title}...`,
    );
    for (let ep of pendingEpisodes) {
      const token = await tokeExtractor(clearedUrl, ep.number);

      if (token) {
        await prisma.episode.update({
          where: { id: ep.id },
          data: { videoToken: token },
        });
        console.log(`Token guardado para el episodio ${ep.number}`);
      } else {
        console.log(`No se encontro token para el episodio ${ep.number}`);
      }

      console.log(`Guardando token...`);
    }
    // Enviamos el link limpio y la lista de episodios pendientes al scraper
  }

  console.log(`✅ Proceso completado para: ${upsertData.title}`);
};

// Función auxiliar (Fuera para no ensuciar el orquestador)
const ensureEpisodesExist = async (animeId: number, totalEpisodes: number) => {
  if (totalEpisodes <= 0) return;

  const currentCount = await prisma.episode.count({ where: { animeId } });

  if (currentCount < totalEpisodes) {
    console.log(
      ` Creando ${totalEpisodes - currentCount} episodios faltantes para ID: ${animeId}`,
    );
    const missingArray = Array.from(
      { length: totalEpisodes - currentCount },
      (_, i) => ({
        number: currentCount + i + 1,
        animeId: animeId,
      }),
    );

    await prisma.episode.createMany({
      data: missingArray,
      skipDuplicates: true,
    });
  }
};
