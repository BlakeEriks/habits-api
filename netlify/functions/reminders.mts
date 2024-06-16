import { Config } from '@netlify/functions'
import { PrismaClient } from '@prisma/client'
import { config as configDotenv } from 'dotenv'
import habitBot from '../../src/habitBot'

configDotenv()

const prisma = new PrismaClient()

export default async (req: Request) => {
  const { next_run } = await req.json()

  console.log('Received event! Next invocation at:', next_run)

  try {
    const now = new Date()
    const currentHour = now.getUTCHours()
    const reminders = await prisma.reminder.findMany({
      where: {
        time: {
          startsWith: currentHour.toString().padStart(2, '0') + ':',
        },
      },
      include: {
        habit: {
          include: {
            user: true,
          },
        },
      },
    })

    console.log(`Sending ${reminders.length} reminders...`)

    for (const reminder of reminders) {
      const message = `⏰ Reminder: It's time to log your habit: ${reminder.habit.name}`
      await habitBot.telegram.sendMessage(reminder.habit.user.telegramId.toString(), message)
    }

    return new Response('Reminders sent successfully!', { status: 200 })
  } catch (error) {
    console.error('Error sending reminders:', error)
    return new Response('Failed to send reminders.', { status: 500 })
  }
}

export const config: Config = {
  schedule: '@hourly',
}
