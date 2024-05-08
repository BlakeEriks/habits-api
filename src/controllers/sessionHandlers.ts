import { Prisma, PrismaClient, User, UserSession } from '@prisma/client'
import { Request, Response } from 'express'
import { setUserSession } from '../utils/database'

const prisma = new PrismaClient()

enum HabitDataType {
  NUMBER,
  BOOL,
  TIME,
}

export async function handleEmptySession(req: Request, res: Response, user: User) {
  const { text } = req.body

  if (text === 'help') {
    res.send('Available commands are: list, report, new')
  } else if (text === 'habit list') {
    const habits = await prisma.habit.findMany({
      where: { userId: user.id },
    })
    const habitStr = habits.map((habit, idx) => `${idx + 1}: ${habit.name}`).join('\n')
    res.send(`Habits you are tracking:\n${habitStr}`)
  } else if (text === 'habit new') {
    await setUserSession(user.id, 'NEW_HABIT:AWAITING_HABIT_NAME')
    res.send('What is the name of the habit you would like to track?')
  } else if (text === 'habit remove') {
    await setUserSession(user.id, 'HABIT_REMOVE:AWAITING_HABIT_NUMBER')
    res.send('Enter the number of the habit you would like to remove')
  } else {
    res.send('Unknown command. Type "help" for available commands.')
  }
}

export async function handleNewHabit(
  req: Request,
  res: Response,
  user: User,
  session: UserSession
) {
  const { text } = req.body

  switch (session.state) {
    case 'NEW_HABIT:AWAITING_HABIT_NAME':
      await setUserSession(user.id, 'NEW_HABIT:AWAITING_HABIT_DATA_TYPE', {
        ...(session.data as object),
        habitName: text,
      })
      res.send(`What type of data will this habit track? Options:
            1: Number (10 pushups),
            2: Binary (I took a cold shower today),
            3: Time (I woke up at 6am)
            0: Cancel`)
      break
    case 'NEW_HABIT:AWAITING_HABIT_DATA_TYPE':
      const { habitName } = session.data as any
      if (!HabitDataType[text - 1]) {
        res.send(`Invalid response. Valid Options: 
            1: Number (10 pushups),
            2: Binary (I took a cold shower today),
            3: Time (I woke up at 6am)`)
        return
      }

      const data: Prisma.HabitCreateInput = {
        user: {
          connect: {
            id: user.id,
          },
        },
        name: habitName,
        dataType: text,
      }

      await prisma.habit.create({ data })
      await setUserSession(user.id, 'INITIAL')
      res.send(`Habit '${habitName}' tracking setup complete!`)
      break
    default:
      await prisma.userSession.update({
        where: {
          userId: user.id,
        },
        data: {
          state: 'INITIAL',
          data: {},
        },
      })
      res.send('Unknown error. Try again.')
      break
  }
}

export async function handleRemoveHabit(
  req: Request,
  res: Response,
  user: User,
  session: UserSession
) {}
