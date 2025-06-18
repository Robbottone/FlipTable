/*
  Warnings:

  - You are about to drop the column `menuId` on the `MenuItem` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "MenuItem" DROP CONSTRAINT "MenuItem_menuId_fkey";

-- AlterTable
ALTER TABLE "MenuItem" DROP COLUMN "menuId";

-- CreateTable
CREATE TABLE "MenuItemsOnMenus" (
    "menuId" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,

    CONSTRAINT "MenuItemsOnMenus_pkey" PRIMARY KEY ("menuId","menuItemId")
);

-- AddForeignKey
ALTER TABLE "MenuItemsOnMenus" ADD CONSTRAINT "MenuItemsOnMenus_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItemsOnMenus" ADD CONSTRAINT "MenuItemsOnMenus_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
