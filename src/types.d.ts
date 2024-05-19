import { Habit, User } from '@prisma/client'
import { Context, Scenes } from 'telegraf'

interface HabitSession extends Scenes.SceneSession {
  expecting: string
  habit: Partial<Habit>
  habits: Habit[]
}

interface HabitContext extends Context {
  user: User
  session: HabitSession
  scene: Scenes.SceneContextScene<HabitContext>
}
