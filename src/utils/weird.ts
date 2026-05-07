import { prisma } from "../../prisma/db.js";
const weirdEpisodes = await prisma.episode.findMany({
  where: {
    animeId: 6,
  },
  select: {
    number: true,
    videoToken: true,
  },
});

// Esto te dirá exactamente qué hay, rodeado de corchetes para ver espacios
weirdEpisodes.forEach((ep) => {
  console.log(
    `Cap ${ep.number}: [${ep.videoToken}] - Largo: ${ep.videoToken?.length}`,
  );
});
