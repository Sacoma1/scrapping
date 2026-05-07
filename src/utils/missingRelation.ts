import { prisma } from "../../prisma/db.js";
export const repairMissingEpisodes = async () => {
  console.log(
    "Iniciando modo mantenimiento: Vinculando episodios huérfanos...",
  );

  // 1. Buscamos animes que tienen un número de episodios pero CERO registros vinculados
  const orphans = await prisma.animes.findMany({
    where: {
      AND: [
        { episodes: { gt: 0 } }, // Tiene episodios registrados (ej. 12)
        { totalEpisodes: { none: {} } }, // PERO la relación está vacía
      ],
    },
  });

  console.log(`Se encontraron ${orphans.length} animes desincronizados.`);

  for (const anime of orphans) {
    console.log(`Reparando: ${anime.title} (${anime.episodes} episodios)`);

    // 2. Creamos el arreglo basado en el número que YA tenemos en la DB
    const episodesData = Array.from({ length: anime.episodes! }, (_, i) => ({
      number: i + 1,
      animeId: anime.id,
      // videoToken: null // Por ahora queda nulo como en tu lógica original
    }));

    // 3. Insertamos masivamente
    const result = await prisma.episode.createMany({
      data: episodesData,
      skipDuplicates: true,
    });

    console.log(`✅ Vinculados ${result.count} episodios a ${anime.title}`);
  }

  console.log("Mantenimiento finalizado. Todo sincronizado.");
};

repairMissingEpisodes();
