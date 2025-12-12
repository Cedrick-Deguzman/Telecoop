/*
  Warnings:

  - Added the required column `availablePorts` to the `Napbox` table without a default value. This is not possible if the table is not empty.
  - Added the required column `faultyPorts` to the `Napbox` table without a default value. This is not possible if the table is not empty.
  - Added the required column `occupiedPorts` to the `Napbox` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `napbox` ADD COLUMN `availablePorts` INTEGER NOT NULL,
    ADD COLUMN `faultyPorts` INTEGER NOT NULL,
    ADD COLUMN `occupiedPorts` INTEGER NOT NULL;
