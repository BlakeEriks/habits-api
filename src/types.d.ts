import { Habit, Prisma, Reminder, User } from '@prisma/client'
import { Context, Scenes } from 'telegraf'

type HabitWithReminders = Prisma.HabitGetPayload<{
  include: { reminders: true }
}>

interface HabitSession extends Scenes.SceneSession {
  expecting: keyof Habit | keyof Reminder
  habit: Partial<Habit>
  currentHabit: number
  habitLogs: Prisma.HabitLogCreateManyInput[]
}

interface HabitContext extends Context {
  user: User
  habits: HabitWithReminders[]
  session: HabitSession
  scene: Scenes.SceneContextScene<HabitContext>
}

interface Command {
  name: string
  description: string
  action: (ctx: HabitContext) => void
}
