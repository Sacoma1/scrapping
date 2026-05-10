
FROM ghcr.io/puppeteer/puppeteer:latest


USER root


WORKDIR /app


COPY package*.json ./


RUN npm install


COPY . .


RUN DATABASE_URL="mysql://user:pass@localhost:3306/db" npx prisma generate



CMD ["npx", "tsx", "src/scripts/updateAnimeEpisodes.ts"]