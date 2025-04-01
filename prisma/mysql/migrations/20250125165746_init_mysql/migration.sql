/*
  Warnings:

  - You are about to alter the column `price` on the `product` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Double`.
  - Made the column `description` on table `product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `images` on table `product` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `product` MODIFY `description` VARCHAR(191) NOT NULL,
    MODIFY `images` JSON NOT NULL,
    MODIFY `price` DOUBLE NOT NULL,
    MODIFY `quantity_endommage` INTEGER NULL,
    MODIFY `quantity_notification` INTEGER NULL;
