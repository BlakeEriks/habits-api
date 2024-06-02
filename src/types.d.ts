import { Habit, User } from '@prisma/client'
import { Context, Scenes } from 'telegraf'

interface HabitSession extends Scenes.SceneSession {
  expecting: string
  habit: Partial<Habit>
  currentHabit: number
}

interface HabitContext extends Context {
  user: User
  habits: Habit[]
  session: HabitSession
  scene: Scenes.SceneContextScene<HabitContext>
}
