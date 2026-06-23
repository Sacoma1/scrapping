FROM ghcr.io/puppeteer/puppeteer:latest

USER root
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Generar Prisma
RUN DATABASE_URL="mysql://user:pass@localhost:3306/db" npx prisma generate

# ESTA ES LA CLAVE: Definir la ruta donde la imagen de Puppeteer instala Chrome
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
RUN find /usr/bin -name "google-chrome*" -o -name "chromium*" > /chrome_path.txt

CMD ["npx", "tsx", "src/scripts/updateAnimeEpisodes.ts"]