-- CreateTable
CREATE TABLE `Category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name_fr` VARCHAR(191) NOT NULL,
    `name_ar` VARCHAR(191) NOT NULL,
    `description_fr` VARCHAR(191) NULL,
    `description_ar` VARCHAR(191) NULL,
    `name_url` VARCHAR(191) NOT NULL,
    `id_fathercategory` INTEGER NULL,
    `images` JSON NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `sellerId` INTEGER NOT NULL,
    `adminId` INTEGER NULL,
    `adminMessage` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name_fr` VARCHAR(191) NOT NULL,
    `name_ar` VARCHAR(191) NOT NULL,
    `name_url` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `images` JSON NULL,
    `categoryId` INTEGER NOT NULL,
    `price` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `quantity_endommage` INTEGER NOT NULL,
    `quantity_notification` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `sellerId` INTEGER NOT NULL,
    `adminId` INTEGER NULL,
    `adminMessage` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
