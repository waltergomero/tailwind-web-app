/*
  Warnings:

  - The `parent_category_id` column on the `Category` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Category" DROP COLUMN "parent_category_id",
ADD COLUMN     "parent_category_id" UUID;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parent_category_id_fkey" FOREIGN KEY ("parent_category_id") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
