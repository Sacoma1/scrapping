/*
  Warnings:

  - You are about to drop the column `images` on the `Animes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Animes` DROP COLUMN `images`,
    ADD COLUMN `img` VARCHAR(191) NULL;
