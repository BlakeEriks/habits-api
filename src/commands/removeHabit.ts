import { PrismaClient } from '@prisma/client'
import { Markup, Scenes } from 'telegraf'
import { message } from 'telegraf/filters'
import { HabitContext } from '../types'

const prisma = new PrismaClient()

const removeHabitScene = new Scenes.BaseScene<HabitContext>('removeHabit')
removeHabitScene.enter(async ctx => {
  if (ctx.habits.length === 0) return ctx.reply('You have no habits to remove.')

  const habitButtons = ctx.habits.map(habit => [habit.name])
  await ctx.reply(
    `Select a habit to remove:\n\nOr go /back`,
    Markup.keyboard(habitButtons).oneTime().resize()
  )
})
removeHabitScene.command('back', async ctx => {
  await ctx.reply('Cancelled habit removal.', Markup.removeKeyboard())
  return ctx.scene.leave()
})
removeHabitScene.on(message('text'), async ctx => {
  const selectedHabitName = ctx.message.text
  const habit = ctx.habits?.find(h => h.name === selectedHabitName)

  if (!habit) return ctx.reply('Habit not found or already deleted.')

  // Delete the habit using Prisma
  await prisma.habit.delete({
    where: { id: habit.id },
  })

  await ctx.reply(`Habit '${selectedHabitName}' has been deleted.`, Markup.removeKeyboard())
  return ctx.scene.leave()
})

export default removeHabitScene
