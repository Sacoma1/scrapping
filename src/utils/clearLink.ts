export const animeClearedUrl = (link: string | undefined) =>
  link?.replace("/media/", "") || undefined;
