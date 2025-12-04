/*
  Warnings:

  - Added the required column `dueDate` to the `client` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `client` ADD COLUMN `dueDate` DATETIME(3) NOT NULL;
