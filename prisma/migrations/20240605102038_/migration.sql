/*
  Warnings:

  - A unique constraint covering the columns `[habitId,time]` on the table `Reminder` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Reminder_habitId_time_key" ON "Reminder"("habitId", "time");
