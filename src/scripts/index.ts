import puppeteer from "puppeteer";

import { animeToDb } from "./seed.js";

//funcion para agregar anime bajo demanda que no se encuntren en la db

export async function openWebPage(): Promise<void> {
  console.log("iniciando navegador...");
  const browser = await puppeteer.launch({
    headless: true,

    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  );

  console.log("cambiando tamano de pantalla ");
  await page.setViewport({ width: 1920, height: 1080 });

  const pages = 4;
  const animesData: any[] = [];

  console.log(`procesando pagina`);
  try {
    await page.goto(`https://animeav1.com/catalogo?search=gintama`, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    await page.waitForSelector("article.group\\/item", { timeout: 10000 });

    const animes = await page.evaluate(() => {
      const items = document.querySelectorAll("article.group\\/item");

      return Array.from(items).map((i) => {
        return {
          title: i.querySelector("h3")?.textContent?.trim(),
          link: i.querySelector('a[href^="/media/"]')?.getAttribute("href"),
          img: i.querySelector("img")?.getAttribute("src"),
          type: i.querySelector(".text-subs")?.textContent?.trim(),
          sinopsis: i.querySelector("p.line-clamp-6")?.textContent?.trim(),
        };
      });
    });

    animesData.push(...animes);
    console.log(`pagina completada, (+${animes.length} animes)`);
  } catch (e: any) {
    console.error(
      `Ha habido un error al extraer la informacion en la pagina , continunado con la siguiente`,
      e,
    );
  }
  const delay = Math.floor(Math.random() * 5000) + 3000;
  await new Promise((r) => setTimeout(r, delay));

  console.log(
    "tu objeto tiene esta cantidad de animes" + " " + animesData.length,
  );

  try {
    await animeToDb(animesData);
  } catch (e: any) {
    console.error("No se pude agregar anime a la db ");
  }

  console.log("cerrando navegador");

  await browser.close();
}

openWebPage();
