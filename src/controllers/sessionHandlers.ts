import { Message, Prisma, PrismaClient, User, UserSession } from '@prisma/client'
import { Request, Response } from 'express'
import { get } from 'lodash'
import { clearUserSession, setUserSession } from '../utils/database'
import { sendMessage } from '../utils/telegram'

const prisma = new PrismaClient()

enum HabitDataType {
  NUMBER,
  BOOL,
  TIME,
}

const DEFAULT_MESSAGE = `
I am the habit tracking bot! I can help you stay accountable to the habits you want to build.

Available commands:

- /new: Create a new habit to track
- /list: List the habits you are tracking
- /remove: Remove a habit you are tracking
`

export async function handleEmptySession(user: User, { text }: Message) {
  if (text === '/list') {
    const habits = await prisma.habit.findMany({
      where: { userId: user.id },
    })
    if (!habits.length) {
      return sendMessage(
        user.telegramId,
        'You are not tracking any habits yet. Use /new to start tracking a habit.'
      )
    }

    const habitStr = habits.map((habit, idx) => `${idx + 1}: ${habit.name}`).join('\n')
    sendMessage(user.telegramId, `Habits you are tracking:\n${habitStr}`)
  } else if (text === '/new') {
    await setUserSession(user.id, 'NEW_HABIT:AWAITING_HABIT_NAME')
    sendMessage(user.telegramId, 'What is the name of the habit you would like to track?')
  } else if (text === '/remove') {
    await setUserSession(user.id, 'HABIT_REMOVE:AWAITING_HABIT_NUMBER')
    sendMessage(user.telegramId, 'Enter the number of the habit you would like to remove')
  } else {
    sendMessage(user.telegramId, DEFAULT_MESSAGE)
  }
}

export async function handleNewHabit(user: User, session: UserSession, { text }: Message) {
  switch (session.state) {
    case 'NEW_HABIT:AWAITING_HABIT_NAME':
      await setUserSession(user.id, 'NEW_HABIT:AWAITING_HABIT_DATA_TYPE', {
        ...(session.data as object),
        habitName: text,
      })
      sendMessage(
        user.telegramId,
        `What type of data will this habit track? Options:
            1: Number (10 pushups),
            2: Binary (I took a cold shower today),
            3: Time (I woke up at 6am)
            0: Cancel`
      )
      break
    case 'NEW_HABIT:AWAITING_HABIT_DATA_TYPE':
      const habitName = get(session.data, 'habitName')!
      if (!HabitDataType[parseInt(text) - 1]) {
        sendMessage(
          user.telegramId,
          `Invalid response. Valid Options: 
            1: Number (10 pushups),
            2: Binary (I took a cold shower today),
            3: Time (I woke up at 6am)`
        )

        return
      }

      const data: Prisma.HabitCreateInput = {
        name: habitName,
        dataType: text,
        user: {
          connect: {
            id: user.id,
          },
        },
      }

      await prisma.habit.create({ data })
      await setUserSession(user.id, 'INITIAL')
      sendMessage(user.telegramId, `Habit '${habitName}' tracking setup complete!`)
      break
    default:
      await clearUserSession(user.id)
      break
  }
}

export async function handleRemoveHabit(
  req: Request,
  res: Response,
  user: User,
  session: UserSession
) {}
