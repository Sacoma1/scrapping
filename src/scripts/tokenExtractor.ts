import puppeteer from "puppeteer";
import { execSync } from "child_process";

export const tokeExtractor = async (anime: string, episode: number | null) => {
  let extractedToken = "";
  console.log("Iniciando el navegador...");
  const browser = await puppeteer.launch({
    headless: true,
    // Usamos la ruta estándar de Nixpacks en Railway
    executablePath:
      process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--single-process",
      "--no-zygote",
      "--disable-gpu",
      "--hide-scrollbars",
      "--disable-extensions",
      "--disable-infobars",
      "--disable-background-networking",
    ],
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
