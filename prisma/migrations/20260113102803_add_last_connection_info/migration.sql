-- DropForeignKey
ALTER TABLE `invoice` DROP FOREIGN KEY `Invoice_clientId_fkey`;

-- DropForeignKey
ALTER TABLE `napboxport` DROP FOREIGN KEY `NapboxPort_clientId_fkey`;

-- DropForeignKey
ALTER TABLE `napboxport` DROP FOREIGN KEY `NapboxPort_napboxId_fkey`;

-- AlterTable
ALTER TABLE `client` ADD COLUMN `lastNapboxId` INTEGER NULL,
    ADD COLUMN `lastPortNumber` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `invoice` ADD CONSTRAINT `invoice_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `napboxport` ADD CONSTRAINT `napboxport_napboxId_fkey` FOREIGN KEY (`napboxId`) REFERENCES `napbox`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `napboxport` ADD CONSTRAINT `napboxport_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

