-- AlterTable
ALTER TABLE `invoice` ADD COLUMN `referenceNumber` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `payment` ADD COLUMN `referenceNumber` VARCHAR(191) NULL;
