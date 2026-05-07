/*
  Warnings:

  - You are about to drop the column `episodesCount` on the `Animes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Animes` DROP COLUMN `episodesCount`,
    ADD COLUMN `episodes` INTEGER NULL;
