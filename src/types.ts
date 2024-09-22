import { Habit, Prisma, Quote, Reminder, User } from 'prisma-db'
import { Context, Scenes } from 'telegraf'

/* Habit types */
type HabitWithReminders = Prisma.HabitGetPayload<{
  include: { reminders: true }
}>

export enum HabitDataType {
  NUMBER = 'number',
  BOOL = 'bool',
  TIME = 'time',
}

interface HabitSession extends Scenes.SceneSession {
  expecting: keyof Habit | keyof Reminder
  habit: Partial<Habit>
  currentHabit: number
  habitLogs: Prisma.HabitLogCreateManyInput[]
}

export interface HabitContext extends Context {
  user: User
  habits: HabitWithReminders[]
  session: HabitSession
  scene: Scenes.SceneContextScene<HabitContext>
}

export interface HabitCommand {
  name: string
  description: string
  action: (ctx: HabitContext) => void
}

/* Quippet types */
interface QuippetSession extends Scenes.SceneSession {
  expecting: keyof Quote
  // quote: Partial<Quote>
}

export interface QuippetContext extends Context {
  user: User
  session: QuippetSession
  scene: Scenes.SceneContextScene<QuippetContext>
}

export interface QuippetCommand {
  name: string
  description: string
  action: (ctx: QuippetContext) => void
}
