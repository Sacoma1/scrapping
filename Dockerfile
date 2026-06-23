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

RUN echo "BUSCANDO CHROME..." && find / -name "*chrome*" -executable -type f 2>/dev/null

CMD ["npx", "tsx", "src/scripts/updateAnimeEpisodes.ts"]