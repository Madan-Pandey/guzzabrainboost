/*
  Warnings:

  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `name` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `playerId` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `userName` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `levels` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[Player_Id]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `Player_Id` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `User_Id` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `User_userName_key` ON `user`;

-- AlterTable
ALTER TABLE `user` DROP PRIMARY KEY,
    DROP COLUMN `name`,
    DROP COLUMN `playerId`,
    DROP COLUMN `userName`,
    ADD COLUMN `Player_Id` INTEGER NOT NULL,
    ADD COLUMN `User_Id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `Username` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`User_Id`);

-- DropTable
DROP TABLE `levels`;

-- CreateTable
CREATE TABLE `Player` (
    `Player_ID` INTEGER NOT NULL AUTO_INCREMENT,
    `Player_name` VARCHAR(191) NOT NULL,
    `Playerpoint` INTEGER NOT NULL,
    `streak` INTEGER NOT NULL,
    `lastLogin` DATETIME(3) NOT NULL,
    `Level_Id` INTEGER NULL,
    `Milestone_Id` INTEGER NULL,
    `Temp_Score` INTEGER NOT NULL DEFAULT -1,

    PRIMARY KEY (`Player_ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Level` (
    `Level_Id` INTEGER NOT NULL AUTO_INCREMENT,
    `Level_Title` VARCHAR(191) NOT NULL,
    `Level_number` INTEGER NOT NULL,

    PRIMARY KEY (`Level_Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Milestone` (
    `Milestone_Id` INTEGER NOT NULL AUTO_INCREMENT,
    `Milestone_Title` VARCHAR(191) NOT NULL,
    `Milestone_description` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`Milestone_Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `User_Player_Id_key` ON `User`(`Player_Id`);

-- AddForeignKey
ALTER TABLE `Player` ADD CONSTRAINT `Player_Level_Id_fkey` FOREIGN KEY (`Level_Id`) REFERENCES `Level`(`Level_Id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Player` ADD CONSTRAINT `Player_Milestone_Id_fkey` FOREIGN KEY (`Milestone_Id`) REFERENCES `Milestone`(`Milestone_Id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_Player_Id_fkey` FOREIGN KEY (`Player_Id`) REFERENCES `Player`(`Player_ID`) ON DELETE RESTRICT ON UPDATE CASCADE;
