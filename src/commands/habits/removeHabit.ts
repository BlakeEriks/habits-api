import { HabitContext } from '@/types'
import { replyAndLeave } from '@/util/telegraf'
import { deleteHabit } from '@db/habits/habit'
import { Markup, Scenes } from 'telegraf'
import { message } from 'telegraf/filters'

export const REMOVE_HABIT_SCENE = 'REMOVE_HABIT_SCENE'
const removeHabitScene = new Scenes.BaseScene<HabitContext>(REMOVE_HABIT_SCENE)
removeHabitScene.enter(ctx => {
  if (ctx.habits.length === 0) return replyAndLeave('You have no habits to remove.')(ctx)

  const habitButtons = ctx.habits.map(habit => [habit.name])
  return ctx.reply(
    `Select a habit to remove:\n\nOr go /back`,
    Markup.keyboard(habitButtons).oneTime().resize()
  )
})
removeHabitScene.command('back', replyAndLeave('Cancelled habit removal.'))
removeHabitScene.on(message('text'), async ctx => {
  const selectedHabitName = ctx.message.text
  const habit = ctx.habits?.find(h => h.name === selectedHabitName)

  if (!habit) return ctx.reply('Habit not found or already deleted.')

  // Delete the habit using Prisma
  await deleteHabit(habit.id)

  await ctx.reply(`Habit '${selectedHabitName}' has been deleted.`, Markup.removeKeyboard())
  return ctx.scene.leave()
})

export default removeHabitScene
