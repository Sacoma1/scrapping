# 1. Usamos una imagen base que ya tiene Node y las librerías para Puppeteer
FROM ghcr.io/puppeteer/puppeteer:latest

# 2. Nos cambiamos a usuario root para tener permisos de mover archivos
USER root

# 3. Creamos la carpeta donde vivirá tu app dentro del contenedor
WORKDIR /app

# 4. Copiamos los archivos de dependencias
# Lo hacemos antes que el resto del código para que el "build" sea más rápido
COPY package*.json ./

# 5. Instalamos tus librerías (prisma, grammy, puppeteer, etc.)
RUN npm install

# 6. Copiamos todo tu código (src, prisma, etc.) al contenedor
COPY . .

# 7. Generamos el cliente de Prisma para que pueda hablar con TiDB
RUN npx prisma generate

# 8. Saltamos el sandbox de Chrome (necesario para Linux/Docker)
# ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
# ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# 9. El comando que arranca tu script de actualización
CMD ["npx", "tsx", "src/scripts/updateAnimeEpisodes.ts"]