-- CreateTable
CREATE TABLE `Animes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `link` VARCHAR(191) NOT NULL,
    `img` VARCHAR(191) NULL,
    `banner` TEXT NULL,
    `type` VARCHAR(191) NULL,
    `sinopsis` TEXT NULL,
    `genres` TEXT NULL,
    `score` DOUBLE NULL,
    `year` INTEGER NULL,
    `status` VARCHAR(191) NULL,
    `broadcast` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Animes_link_key`(`link`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
