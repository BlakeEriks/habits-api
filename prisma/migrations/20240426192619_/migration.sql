/*
  Warnings:

  - You are about to drop the column `description` on the `Habit` table. All the data in the column will be lost.
  - Added the required column `dataType` to the `Habit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Habit" DROP COLUMN "description",
ADD COLUMN     "dataType" TEXT NOT NULL;
