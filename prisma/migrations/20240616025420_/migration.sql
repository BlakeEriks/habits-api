/*
  Warnings:

  - A unique constraint covering the columns `[date]` on the table `HabitLog` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "HabitLog_date_key" ON "HabitLog"("date");
