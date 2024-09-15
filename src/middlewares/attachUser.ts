import { HabitContext, QuippetContext } from '@/types'
import { PrismaClient } from '@prisma/client'
import { MiddlewareFn } from 'telegraf'

const prisma = new PrismaClient()

// Middleware to attach user to request
const attachUser: MiddlewareFn<HabitContext | QuippetContext> = async (ctx, next) => {
  if (!ctx.message) return await next()

  const { id, first_name: name } = ctx.message.from

  try {
    let user = await prisma.user.findFirst({
      where: { telegramId: id },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          telegramId: id,
          name,
        },
      })
      console.log('User created for: ', name, ', ', id)
    }

    // Attach user to the request object
    ctx.user = user
    return next()
  } catch (error) {
    console.error('Error attaching user to request:', error)
  }
}

export default attachUser
