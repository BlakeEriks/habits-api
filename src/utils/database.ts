// utils/database.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

export async function getUserByPhoneNumber(phoneNumber: string) {
  return prisma.user.findUnique({
    where: { phone_number: phoneNumber },
  });
}

export async function createUser(phoneNumber: string) {
  return prisma.user.create({
    data: {
      phone_number: phoneNumber,
      name: '',
    },
  });
}

export async function getSession(userId: number) {
  return prisma.userSession.findFirst({
    where: { userId },
  });
}

export function setUserSession(userId: number, state: string, data: any = {}) {
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
  });
}
