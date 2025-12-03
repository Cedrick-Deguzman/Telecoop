/*
  Warnings:

  - Added the required column `icon` to the `Plan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `plan` ADD COLUMN `icon` VARCHAR(191) NOT NULL;
