import puppeteer from "puppeteer";

import { animeWithMissingEpisodes, JikanAnime } from "../../interfaces.js";

export const findEpisodes = async (animeArray: animeWithMissingEpisodes[]) => {
  let index = 0;
  let episodesData: any[] = [];
  console.log("iniciando navegador...");
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "usr/bin/chromium",

    args: ["--no-sandbox", "--disable-setuid-sandbox"],
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
  for (let anime of animeArray.slice(0, 4)) {
    index++;
    try {
      console.log(
        `DEBUG: Procesando anime "${anime.title}" con link: ${anime.link}`,
      );
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
      console.log(`acutualizando episodios para ${anime.title},`);

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
  console.log(episodesData);
  return episodesData;
};

export const tokeExtractor = async (anime: string, episode: number) => {
  let extractedToken = "";
  console.log("Iniciando el navegador...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  );
  await page.setViewport({ width: 1920, height: 1080 });

  const animeUrl = `https://animeav1.com/media/${anime}/${episode}`;

  page.on("request", (req) => {
    const url = req.url();
    if (url.includes("/m3u8/")) {
      const parts = url.split("/");
      const token = parts[parts.length - 1];
      if (token && token.length === 32) {
        extractedToken = token;
        console.log(`¡Token capturado!: ${extractedToken}`);
      }
    }
  });

  try {
    console.log(`Navegando a ${animeUrl}`);

    await page.goto(animeUrl, { waitUntil: "load", timeout: 30000 });

    await new Promise((r) => setTimeout(r, 7000));
  } catch (error: any) {
    console.error(`> Error de navegación en ${anime}:`, error.message);
  } finally {
    if (browser) {
      console.log(`Cerrando navegador de: ${anime}`);
      await browser.close();
    }
  }

  return extractedToken;
};
