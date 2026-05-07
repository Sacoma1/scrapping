import { anime, JikanAnime } from "../../interfaces.js";
import { prisma } from "../../prisma/db.js";
import process from "process";

async function main() {
  console.log("🚀 Iniciando inyección masiva de Animes y Episodios...");

  const animesToInyect: anime[] = [
    {
      title: "Bleach",
      link: "bleach",
      type: "TV anime",
      sinopsis: "Ichigo Kurosaki es un estudiante de secundaria ordinario...",
      genres: "Action",
      score: 7.99,
      year: 2004,
      status: "Finished Airing",
      img: "https://myanimelist.net/images/anime/1541/147774.jpg",
      episodes: 366, // Usaremos esto para el bucle
    },
    {
      title: "Naruto",
      link: "naruto",
      type: "TV anime",
      sinopsis: "Momentos antes del nacimiento de Naruto Uzumaki...",
      genres: "Action, Adventure, Fantasy",
      score: 7.8,
      year: 2002,
      status: "Finished Airing",
      img: "https://myanimelist.net/images/anime/1141/142503.jpg",
      episodes: 220,
    },
    {
      title: "One Piece",
      link: "one-piece",
      type: "TV Anime",
      sinopsis:
        "Apenas sobreviviendo en un barril tras pasar por un terrible remolino en el mar, el despreocupado Monkey D. Luffy termina a bordo de un barco bajo ataque de temibles piratas. A pesar de parecer un adolescente ingenuo, no se le debe subestimar. Inigualable en combate, Luffy es un pirata que persigue resueltamente el codiciado tesoro de One Piece y el título de Rey de los Piratas que lo acompaña. El difunto Rey de los Piratas, Gol D. Roger, agitou al mundo antes de su muerte al revelar la ubicación de su tesoro y desafiar a todos a conseguirlo. Desde entonces, innumerables poderosos piratas han navegado por mares peligrosos en busca del preciado One Piece, solo para nunca regresar. Aunque Luffy carece de una tripulación y de un barco adecuado, posee una habilidad sobrehumana y un espíritu indomable que lo convierten no solo en un formidable adversario, sino también en una inspiración para muchos. Mientras enfrenta numerosos desafíos con una gran sonrisa en su rostro, Luffy reúne compañeros únicos para unirse a él en su ambicioso empeño, abrazando juntos los peligros y maravillas en su aventura única en la vida.",
      genres: "Action, Adventure, Fantasy, Shounen",
      score: 8.73,
      year: 1999,
      status: "Currently Airing",
      img: "https://myanimelist.net/images/anime/1244/138851.jpg",
      episodes: 1159,
    },
    {
      title: "Naruto Shippuden",
      link: "naruto-shippuuden",
      type: "TV Anime",
      sinopsis:
        "Han pasado dos años y medio desde que Naruto Uzumaki dejó Konohagakure, la Aldea Oculta de la Hoja, para un intenso entrenamiento tras los eventos que alimentaron su deseo de ser más fuerte. Ahora, Akatsuki, la misteriosa organización de ninjas renegados de élite, está acercándose a su gran plan que puede amenazar la seguridad de todo el mundo shinobi. Aunque Naruto es mayor y acontecimientos siniestros se ciernen en el horizonte, ha cambiado poco en personalidad—sigue siendo revoltoso y niño—aunque ahora es mucho más confiado y posee una determinación aún mayor para proteger a sus amigos y su hogar. Pase lo que pase, Naruto continuará luchando por lo que es importante para él, incluso a expensas de su propio cuerpo, en la continuación de la saga sobre el chico que desea convertirse en Hokage.",
      genres: "Action, Adventure, Fantasy, Shounen, Artes Marciales",
      score: 8.28,
      year: 2007,
      status: "Finished Airing",
      img: "https://myanimelist.net/images/anime/1565/111305.jpg",
      episodes: 500,
    },
  ];

  for (const item of animesToInyect) {
    try {
      const result = await prisma.animes.upsert({
        where: { link: item.link },
        update: {
          title: item.title,
          score: item.score,
          status: item.status,
          episodes: item.episodes, // <--- Aquí pasamos el INT directo
        },
        create: {
          title: item.title,
          link: item.link ?? "",
          type: item.type,
          sinopsis: item.sinopsis,
          genres: item.genres,
          score: item.score,
          year: item.year,
          status: item.status,
          img: item.img,
          episodes: item.episodes, // <--- Aquí también el INT
        },
      });

      if (item.episodes && item.episodes > 0) {
        console.log(`Creando episodios ${item.episodes} para ${item.title} `);

        const animeArray = Array.from({ length: item.episodes }, (_, i) => ({
          number: i + 1,
          animeId: result.id,
        }));
        await prisma.episode.createMany({
          data: animeArray,
          skipDuplicates: true,
        });
      }

      console.log(`✅ ${result.title} con ${item.episodes} episodios listos.`);
    } catch (error) {
      console.error(`❌ Error inyectando ${item.title}:`, error);
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
