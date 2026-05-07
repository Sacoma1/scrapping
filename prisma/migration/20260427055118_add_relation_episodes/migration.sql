-- CreateTable
CREATE TABLE `Episode` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `number` INTEGER NOT NULL,
    `videoToken` VARCHAR(191) NULL,
    `animeId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Episode` ADD CONSTRAINT `Episode_animeId_fkey` FOREIGN KEY (`animeId`) REFERENCES `Animes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
