/*
  Warnings:

  - Added the required column `UnlockingLevel` to the `milestone` table without a default value. This is not possible if the table is not empty.
  - Added the required column `UploadRequired` to the `milestone` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `milestone` ADD COLUMN `UnlockingLevel` INTEGER NOT NULL,
    ADD COLUMN `UploadRequired` BOOLEAN NOT NULL;
