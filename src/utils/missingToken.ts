import { prisma } from "../../prisma/db.js";

export const missingAnimeToken = async () => {
  const animesOnAir = await prisma.episode.findMany({
    where: { videoToken: "" },
  });
};
