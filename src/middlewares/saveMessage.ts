import { PrismaClient } from '@prisma/client'
import { MiddlewareFn } from 'telegraf'
import { HabitContext } from '../types'

const prisma = new PrismaClient()

// Example
// {
//   update_id: 768261164,
//   message: {
//     message_id: 8,
//     from: {
//       id: 7114372338,
//       is_bot: false,
//       first_name: 'Blake',
//       language_code: 'en'
//     },
//     chat: { id: 7114372338, first_name: 'Blake', type: 'private' },
//     date: 1715390421,
//     text: 'Hi!!!'
//   }
// }

// Middleware to attach user to request
// const saveMessage = async (req: Request, res: Response, next: NextFunction) => {
const saveMessage: MiddlewareFn<HabitContext> = async (ctx, next) => {
  // const { message_id, text, date } = req.body.message
  const { user, message } = ctx
  if (!message || !('text' in message)) return next()

  const created = new Date(message.date * 1000)

  try {
    await prisma.message.create({
      data: {
        text: message.text,
        created,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    })

    return next()
  } catch (error) {
    console.error('Error persisting message:', error)
  }
}

export default saveMessage
