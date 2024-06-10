import { Habit, Prisma, User } from '@prisma/client'
import { Context, Scenes } from 'telegraf'

type HabitWithReminders = Prisma.HabitGetPayload<{
  include: { reminders: true }
}>

interface HabitSession extends Scenes.SceneSession {
  expecting: string
  habit: Partial<Habit>
  currentHabit: number
  action: string
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
