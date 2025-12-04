/*
  Warnings:

  - You are about to drop the column `date` on the `payment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `payment` DROP COLUMN `date`,
    ADD COLUMN `method` ENUM('cash', 'gcash', 'bank') NULL,
    ADD COLUMN `paymentDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateTable
CREATE TABLE `Invoice` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clientId` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `billingDate` DATETIME(3) NOT NULL,
    `dueDate` DATETIME(3) NOT NULL,
    `status` ENUM('paid', 'pending', 'overdue') NOT NULL DEFAULT 'pending',
    `paidDate` DATETIME(3) NULL,
    `paymentMethod` ENUM('cash', 'gcash', 'bank') NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Invoice_clientId_idx`(`clientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
