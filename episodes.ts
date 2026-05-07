import { prisma } from "./prisma/db";

const totalEpisodios = await prisma.episode.count();
console.log(totalEpisodios);
