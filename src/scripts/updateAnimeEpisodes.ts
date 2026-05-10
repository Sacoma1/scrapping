import { prisma } from "../../prisma/db.js";
import { Bot } from "grammy";
import "dotenv/config";
import { ScrappedMissingAnimeEpisodes } from "../../interfaces.js";
import { findEpisodes } from "../utils/missingEpisodes.js";
import { tokeExtractor } from "./tokenExtractor.js";

const updateAiringAnimes = async () => {
  console.log(" Iniciando actualización de animes en emisión...");

  const bot = new Bot(process.env.TELEGRAM_API || "");
  const chatId = process.env.TELEGRAM_CHAT_ID;

  try {
    //
    const animesOnAir = await prisma.animes.findMany({
      where: { status: "Currently Airing" },
    });
    console.log(
      "Se encontraron: " + "" + animesOnAir.length + " Animes para actulizar",
    );
    if (chatId) {
      await bot.api.sendMessage(
        process.env.TELEGRAM_CHAT_ID || "",
        `Se encontraron ${animesOnAir.length} animes para actualizar `,
      );
    }

    const updatedEpisodes: ScrappedMissingAnimeEpisodes[] =
      await findEpisodes(animesOnAir);

    for (let episode of updatedEpisodes) {
      const realStatus = episode.status;
      const currenNumber = episode.episodes || 0;
      const title = episode.title;
      const targetStatus =
        episode.status === "En emisión"
          ? "Currently Airing"
          : "Finished Airing";

      await bot.api.sendMessage(
        process.env.TELEGRAM_CHAT_ID || "",
        `Comenzando con la actualizacion de ${episode.title}, con la cantidad de episodios de ${episode.episodes}, status: ${episode.status} `,
      );

      try {
        const existingEpisode = await prisma.episode.findFirst({
          where: {
            number: episode.episodes || 0,
            anime: {
              link: episode.link,
            },
          },
        });
        console.log(existingEpisode);

        if (existingEpisode) {
          console.log(
            `El episodio ${episode.episodes} del anime ${episode.title} ya existe en la base de datos`,
          );
          continue;
        }

        if (chatId) {
          await bot.api.sendMessage(
            process.env.TELEGRAM_CHAT_ID || "",
            `El episodios ${episode.episodes} del anime ${episode.title}`,
          );
        }

        console.log("Comenzando extraccion de token");
        const extractedToken = await tokeExtractor(
          episode.link,
          episode.episodes,
        );
        console.log(`Extrayendo token de ${title}, episodio: ${currenNumber}`);

        if (chatId) {
          await bot.api.sendMessage(
            process.env.TELEGRAM_CHAT_ID || "",
            `comenzando extraccion de token de ${episode.title}, capitulo: ${episode.episodes}`,
          );
        }

        await prisma.animes.update({
          where: { link: episode.link },
          data: {
            episodes: currenNumber,
            status: targetStatus,
            totalEpisodes: {
              create: {
                number: currenNumber,
                videoToken: extractedToken,
              },
            },
          },
        });
        if (chatId) {
          await bot.api.sendMessage(
            process.env.TELEGRAM_CHAT_ID || "",
            `Se han actualizado  ${animesOnAir.length} animes`,
          );
        }
      } catch (e: any) {
        console.error(
          `Hubo un problema al actualizar los capitulos de este anime ${title}, ${e}`,
        );
      }
    }
  } catch (e: any) {
    console.error(" Error en el cron de actualización:", e);
    if (chatId)
      console.log(
        bot.api.sendMessage(chatId, `Error en el scrapper: ${e.message}`),
      );
  } finally {
    await prisma.$disconnect();
  }
};

updateAiringAnimes();
