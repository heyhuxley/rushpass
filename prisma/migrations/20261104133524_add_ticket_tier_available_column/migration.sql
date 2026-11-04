/*
  Warnings:

  - Added the required column `available` to the `ticket_tiers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ticket_tiers` ADD COLUMN `available` INTEGER NOT NULL;
