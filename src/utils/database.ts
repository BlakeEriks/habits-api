// utils/database.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getSession(userId: number) {
  return prisma.userSession.findFirst({
    where: { userId },
  })
}

export function setUserSession(userId: number, state: string, data: object = {}) {
  return prisma.userSession.upsert({
    where: { userId },
    create: {
      userId,
      state,
      data,
    },
    update: {
      state,
      data,
    },
  })
}

export function clearUserSession(userId: number) {
  return prisma.userSession.delete({
    where: { userId },
  })
}
