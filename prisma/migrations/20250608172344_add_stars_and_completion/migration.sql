-- AlterTable
ALTER TABLE `level_score` ADD COLUMN `completion_percentage` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `stars` INTEGER NOT NULL DEFAULT 0;
