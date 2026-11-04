/*
  Warnings:

  - Added the required column `unit_price` to the `order_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `order_items` ADD COLUMN `unit_price` DECIMAL(10, 2) NOT NULL;
