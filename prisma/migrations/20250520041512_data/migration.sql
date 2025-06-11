/*
  Warnings:

  - You are about to drop the column `UploadRequired` on the `milestone` table. All the data in the column will be lost.
  - You are about to drop the column `Temp_Score` on the `player` table. All the data in the column will be lost.
  - You are about to drop the column `user_Id` on the `player` table. All the data in the column will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `Milestone_Button_CTA` to the `milestone` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Milestone_Link` to the `milestone` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Milestone_reward_message` to the `milestone` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `player` DROP FOREIGN KEY `Player_user_Id_fkey`;

-- DropIndex
DROP INDEX `Player_user_Id_key` ON `player`;

-- AlterTable
ALTER TABLE `milestone` DROP COLUMN `UploadRequired`,
    ADD COLUMN `Milestone_Button_CTA` VARCHAR(191) NOT NULL,
    ADD COLUMN `Milestone_Link` VARCHAR(191) NOT NULL,
    ADD COLUMN `Milestone_reward_message` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `player` DROP COLUMN `Temp_Score`,
    DROP COLUMN `user_Id`;

-- DropTable
DROP TABLE `user`;
