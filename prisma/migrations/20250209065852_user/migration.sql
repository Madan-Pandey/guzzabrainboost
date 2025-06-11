-- CreateTable
CREATE TABLE `levels` (
    `levelId` INTEGER NOT NULL,
    `levelName` VARCHAR(30) NULL,
    `levelNumber` INTEGER NULL,

    PRIMARY KEY (`levelId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `playerId` INTEGER NOT NULL AUTO_INCREMENT,
    `userName` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `User_userName_key`(`userName`),
    PRIMARY KEY (`playerId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
