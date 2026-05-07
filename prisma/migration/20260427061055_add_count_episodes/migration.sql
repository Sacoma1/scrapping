/*
  Warnings:

  - You are about to drop the column `videoLastUpdated` on the `Animes` table. All the data in the column will be lost.
  - You are about to drop the column `videoUrl` on the `Animes` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[number,animeId]` on the table `Episode` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updateAt` to the `Episode` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Animes` DROP COLUMN `videoLastUpdated`,
    DROP COLUMN `videoUrl`,
    ADD COLUMN `episodesCount` INTEGER NULL;

-- AlterTable
ALTER TABLE `Episode` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updateAt` DATETIME(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Episode_number_animeId_key` ON `Episode`(`number`, `animeId`);
