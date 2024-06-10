import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const deleteHabit = (id: number) =>
  prisma.habit.delete({
    where: { id },
  })
