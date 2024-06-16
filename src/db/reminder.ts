import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type CreateReminder = {
  habitId: number
  time: string
}

export const createReminder = async ({ habitId, time }: CreateReminder) =>
  prisma.reminder.create({ data: { habitId, time } })
