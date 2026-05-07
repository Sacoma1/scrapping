/*
  Warnings:

  - You are about to drop the column `img` on the `Animes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Animes` DROP COLUMN `img`,
    ADD COLUMN `images` VARCHAR(191) NULL;
