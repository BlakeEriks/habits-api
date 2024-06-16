import { Config } from '@netlify/functions'
import { PrismaClient, User } from '@prisma/client'
import moment from 'moment-timezone'
import { getLatestHabitLog } from '../../src/db/habitLog'
import { getAllUsers } from '../../src/db/user'
import habitBot from '../../src/habitBot'

const NOTIFICATION_HOUR = 9

const prisma = new PrismaClient()

const REMINDER_MESSAGES = [
  'Time to log your habits! /log_habits',
  'Have you logged your habits today? /log_habits',
  "Don't forget to log your habits today! /log_habits",
  "It's getting late, but not too late to log your habits!! /log_habits",
]

const getUserLocalTime = (user: User) => moment.tz(new Date(), user.timezone)

const getHasLoggedToday = async (user: User) => {
  const userTime = getUserLocalTime(user)
  const latestHabitLog = await getLatestHabitLog(user.id)
  if (!latestHabitLog) return true

  return (
    latestHabitLog.date.getDate() === userTime.date() &&
    latestHabitLog.date.getMonth() === userTime.month() &&
    latestHabitLog.date.getFullYear() === userTime.year()
  )
}

const pingUsersToLogHabits = async () => {
  for (const user of await getAllUsers()) {
    const userTime = getUserLocalTime(user)
    const hasLoggedToday = await getHasLoggedToday(user)

    if (!hasLoggedToday && userTime.hour() >= NOTIFICATION_HOUR) {
      const message = REMINDER_MESSAGES[userTime.hour() - NOTIFICATION_HOUR]
      await habitBot.telegram.sendMessage(user.telegramId.toString(), message)
    }
  }
}

export default async (req: Request) => {
  const { next_run } = await req.json()

  console.log('Received event! Next invocation at:', next_run)

  try {
    await pingUsersToLogHabits()
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
