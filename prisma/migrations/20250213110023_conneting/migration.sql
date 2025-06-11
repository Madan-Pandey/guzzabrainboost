/*
  Warnings:

  - You are about to drop the column `Player_Id` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_Id]` on the table `Player` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_Id` to the `Player` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_Player_Id_fkey`;

-- DropIndex
DROP INDEX `User_Player_Id_key` ON `user`;

-- AlterTable
ALTER TABLE `player` ADD COLUMN `user_Id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `Player_Id`,
    ADD COLUMN `Password` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Player_user_Id_key` ON `Player`(`user_Id`);

-- AddForeignKey
ALTER TABLE `Player` ADD CONSTRAINT `Player_user_Id_fkey` FOREIGN KEY (`user_Id`) REFERENCES `User`(`User_Id`) ON DELETE RESTRICT ON UPDATE CASCADE;
