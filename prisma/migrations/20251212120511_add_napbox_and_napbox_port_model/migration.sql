-- CreateTable
CREATE TABLE `Napbox` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `totalPorts` INTEGER NOT NULL,
    `installDate` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NapboxPort` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `portNumber` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `napboxId` INTEGER NOT NULL,
    `clientId` INTEGER NULL,
    `connectedSince` DATETIME(3) NULL,

    UNIQUE INDEX `NapboxPort_clientId_key`(`clientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `NapboxPort` ADD CONSTRAINT `NapboxPort_napboxId_fkey` FOREIGN KEY (`napboxId`) REFERENCES `Napbox`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NapboxPort` ADD CONSTRAINT `NapboxPort_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
