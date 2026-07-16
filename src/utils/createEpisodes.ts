import { tokeExtractor } from "../scripts/tokenExtractor.js";

export const createEpisodes = async (episodes: number, link: string | "") => {
  const episodesData = [];
  for (let i = 1; i <= episodes; i++) {
    const videoToken = await tokeExtractor(link, i);

    episodesData.push({
      number: i,
      videoToken: videoToken,
    });
  }
  console.log(episodesData);
  return episodesData;
};
