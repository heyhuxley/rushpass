-- AlterTable
ALTER TABLE `orders` ADD COLUMN `currency` ENUM('NGN', 'USD') NOT NULL DEFAULT 'NGN';
