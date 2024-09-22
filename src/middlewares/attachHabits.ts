import { PrismaClient } from 'prisma-db'
import { MiddlewareFn } from 'telegraf'
import { HabitContext } from '../types'

const prisma = new PrismaClient()

// Middleware to attach user to request
const attachHabits: MiddlewareFn<HabitContext> = async (ctx, next) => {
  if (!ctx.user) return await next()

  try {
    ctx.habits = await prisma.habit.findMany({
      where: { userId: ctx.user.id },
      include: { reminders: true },
    })
    return next()
  } catch (error) {
    console.error('Error attaching habits to request:', error)
  }
}

export default attachHabits
