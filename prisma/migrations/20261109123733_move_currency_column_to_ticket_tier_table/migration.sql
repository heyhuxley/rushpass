/*
  Warnings:

  - You are about to drop the column `currency` on the `orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `orders` DROP COLUMN `currency`;

-- AlterTable
ALTER TABLE `ticket_tiers` ADD COLUMN `currency` ENUM('NGN', 'USD') NOT NULL DEFAULT 'NGN';
