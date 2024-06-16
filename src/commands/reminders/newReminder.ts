import { PrismaClient } from '@prisma/client'
import moment from 'moment-timezone'
import { Markup, Scenes } from 'telegraf'
import { message } from 'telegraf/filters'
import { createReminder } from '../../db/reminder'
import { HabitContext } from '../../types'
import { replyAndLeave } from '../utils'

const prisma = new PrismaClient()

const newReminderScene = new Scenes.BaseScene<HabitContext>('newReminder')

newReminderScene.enter(async ctx => {
  ctx.session.expecting = 'name'
  const habitButtons = ctx.habits.map(habit => [habit.name])
  await ctx.reply(
    `Which habit would you like to set a reminder for?\n\nOr go /back`,
    Markup.keyboard(habitButtons).oneTime().resize()
  )
})

newReminderScene.command('back', async ctx => {
  await ctx.reply('Cancelled habit reminder.', Markup.removeKeyboard())
  return ctx.scene.leave()
})

newReminderScene.on(message('text'), async ctx => {
  const times = Array.from({ length: 12 }, (_, i) => {
    const hourOne = (i * 2).toString().padStart(2, '0')
    const hourTwo = (i * 2 + 1).toString().padStart(2, '0')
    return [`${hourOne}:00`, `${hourTwo}:00`]
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
      if (habitIdx === -1) {
        return ctx.reply('ERROR - Habit not found.')
      }
      ctx.session.expecting = 'time'
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

      // Parse the time using moment and convert it to UTC
      const UTCTime = moment.tz(time, 'HH:mm', ctx.user.timezone).utc().format('HH:mm')

      try {
        await createReminder({ habitId: currentHabit.id, time: UTCTime })
      } catch (e) {
        return ctx.reply('ERROR - Reminder already exists for this habit at this time.')
      }
      return replyAndLeave(`Reminder for habit '${currentHabit.name}' setup complete!`)(ctx)
    default:
      return ctx.reply('', Markup.removeKeyboard())
  }
})

export default newReminderScene
