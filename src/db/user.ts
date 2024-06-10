import { PrismaClient, User } from '@prisma/client'

const prisma = new PrismaClient()

export const updateUser = (id: number, data: Partial<User>) =>
  prisma.user.update({
    where: { id },
    data,
  })
