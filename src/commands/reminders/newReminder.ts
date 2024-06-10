import { PrismaClient } from '@prisma/client'
import { Markup, Scenes } from 'telegraf'
import { message } from 'telegraf/filters'
import { HabitContext } from '../../types'

const prisma = new PrismaClient()

const newReminderScene = new Scenes.BaseScene<HabitContext>('newReminder')

newReminderScene.enter(async ctx => {
  const { action } = ctx.scene as any
  if (action === 'set') {
    ctx.session.expecting = 'name'
    const habitButtons = ctx.habits.map(habit => [habit.name])
    await ctx.reply(
      `Which habit would you like to set a reminder for?\n\nOr go /back`,
      Markup.keyboard(habitButtons).oneTime().resize()
    )
  }
})

newReminderScene.command('back', async ctx => {
  await ctx.reply('Cancelled habit reminder.', Markup.removeKeyboard())
  return ctx.scene.leave()
})

newReminderScene.on(message('text'), async ctx => {
  const times = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0')
    return [`${hour}:00`, `${hour}:30`]
  }).flat()

  // Function to chunk the array into rows
  function chunkArray(array: string[], size: number) {
    const result = []
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size))
    }
    return result
  }

  const chunkedTimes = chunkArray(times, 4)

  switch (ctx.session.expecting) {
    case 'name':
      const habitIdx = ctx.habits?.findIndex(h => h.name === ctx.message.text)
      ctx.session.expecting = 'time'
      if (habitIdx === -1) {
        return ctx.reply('ERROR - Habit not found.')
      }
      ctx.session.currentHabit = habitIdx
      // Create an array of times at every hour and half hour
      return ctx.reply(
        'What time would you like to be reminded of this habit?',
        Markup.keyboard(chunkedTimes).oneTime().resize()
      )
    case 'time':
      const currentHabit = ctx.habits[ctx.session.currentHabit]
      if (!currentHabit) {
        return ctx.reply('ERROR - Habit not found.')
      }
      const time = ctx.message.text
      if (!times.includes(time)) {
        return ctx.reply('ERROR - Invalid time selection.')
      }
      try {
        await prisma.reminder.create({
          data: {
            time: ctx.message.text,
            habitId: currentHabit.id,
          },
        })
      } catch (e) {
        return ctx.reply('ERROR - Reminder already exists for this habit at this time.')
      }
      await ctx.reply(
        `Reminder for habit '${currentHabit.name}' setup complete!`,
        Markup.removeKeyboard()
      )
      return ctx.scene.leave()
    default:
      return ctx.reply('ERROR - Invalid response', Markup.removeKeyboard())
  }
})

export default newReminderScene
