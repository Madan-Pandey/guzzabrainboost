/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `player` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `player` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `player` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `email` VARCHAR(191) NOT NULL,
    MODIFY `Player_name` VARCHAR(191) NULL,
    MODIFY `Playerpoint` INTEGER NULL DEFAULT 0,
    MODIFY `streak` INTEGER NULL DEFAULT 0,
    MODIFY `lastLogin` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateTable
CREATE TABLE `player_history` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `player_id` INTEGER NOT NULL,
    `level_completed` INTEGER NOT NULL,
    `score_gained` INTEGER NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `player_history_player_id_idx`(`player_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `level_score` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `player_id` INTEGER NOT NULL,
    `level_number` INTEGER NOT NULL,
    `highest_score` INTEGER NOT NULL DEFAULT 0,
    `latest_score` INTEGER NOT NULL DEFAULT 0,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `level_score_player_id_idx`(`player_id`),
    UNIQUE INDEX `level_score_player_id_level_number_key`(`player_id`, `level_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `player_email_key` ON `player`(`email`);

-- AddForeignKey
ALTER TABLE `player_history` ADD CONSTRAINT `player_history_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `player`(`Player_ID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `level_score` ADD CONSTRAINT `level_score_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `player`(`Player_ID`) ON DELETE RESTRICT ON UPDATE CASCADE;
