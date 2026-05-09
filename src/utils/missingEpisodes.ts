import puppeteer from "puppeteer";
import { prisma } from "../../prisma/db.js";
import { animeWithMissingEpisodes, JikanAnime } from "../../interfaces.js";
import { link } from "node:fs";

export const findEpisodes = async (animeArray: animeWithMissingEpisodes[]) => {
  let index = 0;
  let episodesData: any[] = [];
  console.log("iniciando navegador...");
  const browser = await puppeteer.launch({
    headless: true,

    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--single-process",
      "--no-zygote",
      "--disable-gpu",
    ],
  });
  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  );

  console.log("cambiando tamano de pantalla ");
  await page.setViewport({ width: 1920, height: 1080 });

  // const animesWithNoEpisodes = await prisma.animes.findMany({
  //   where: { episodes: 0 },
  // });
  for (let anime of animeArray) {
    index++;
    try {
      await page.goto(`https://animeav1.com/media/${anime.link}`, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      await page.waitForSelector(".group\\/item.text-body.relative", {
        timeout: 10000,
      });
      const episodes = await page.evaluate(() => {
        const episode = document.querySelectorAll(
          ".group\\/item.text-body.relative",
        );
        return Array.from(episode).map((e) => {
          return {
            episodes: e
              .querySelector('a[href^="/media/"]')
              ?.getAttribute("href"),
          };
        });
      });
      console.log(`Agregando episodios para ${anime.title}`);

      const numberOfEpisodes = {
        title: anime.title,
        episodes: episodes.length,
        link: anime.link,
      };

      episodesData.push(numberOfEpisodes);
    } catch (e: any) {
      console.error("Error extrayendo los episodios", e);
    }
    const delay = Math.floor(Math.random() * 5000) + 3000;
    await new Promise((r) => setTimeout(r, delay));
  }
  await browser.close();
  return episodesData;
};
