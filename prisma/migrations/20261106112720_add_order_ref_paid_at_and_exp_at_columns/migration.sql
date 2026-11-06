/*
  Warnings:

  - Added the required column `expires_at` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `orders` ADD COLUMN `expires_at` DATETIME(3) NOT NULL,
    ADD COLUMN `paid_at` DATETIME(3) NULL,
    ADD COLUMN `reference` VARCHAR(30) NULL;
