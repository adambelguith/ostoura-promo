-- AlterTable
ALTER TABLE `product` ADD COLUMN `remise_gros` JSON NULL,
    ADD COLUMN `remise_prodique` JSON NULL,
    ADD COLUMN `variants` JSON NULL;
