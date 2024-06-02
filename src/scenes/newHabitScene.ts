import { PrismaClient } from '@prisma/client'
import { Markup, Scenes } from 'telegraf'
import { message } from 'telegraf/filters'
import { HabitContext } from '../types'

const prisma = new PrismaClient()

const HABIT_DATA_TYPES = [
  {
    id: 'number',
    name: 'Number',
    emoji: '🔢',
  },
  {
    id: 'bool',
    name: 'Yes/No',
    emoji: '🔘',
  },
  {
    id: 'time',
    name: 'Time',
    emoji: '⏰',
  },
]

// New Habit Scene
const newHabitScene = new Scenes.BaseScene<HabitContext>('newHabit')
newHabitScene.enter(ctx => {
  ctx.session.expecting = 'name'
  ctx.session.habit = {}
  return ctx.reply(`What is the name of the habit you would like to track?\n\nOr go /back`)
})
newHabitScene.command('back', async ctx => {
  await ctx.reply('Cancelled habit creation.', Markup.removeKeyboard())
  return ctx.scene.leave()
})
newHabitScene.on(message('text'), async ctx => {
  switch (ctx.session.expecting) {
    case 'name':
      ctx.session.habit.name = ctx.message.text
      ctx.session.expecting = 'dataType'
      return ctx.reply(
        'What type of data will this habit track? Options: number, bool, time',
        Markup.keyboard([HABIT_DATA_TYPES.map(type => type.emoji + ' ' + type.name)])
          .oneTime()
          .resize()
      )
    case 'dataType':
      ctx.session.habit.dataType = HABIT_DATA_TYPES.find(
        type => type.emoji + ' ' + type.name === ctx.message.text
      )!.id
      await prisma.habit.create({
        data: {
          name: ctx.session.habit.name!,
          userId: ctx.user.id,
          dataType: ctx.session.habit.dataType,
        },
      })
      await ctx.reply(
        `Habit '${ctx.session.habit.name}' tracking setup complete!`,
        Markup.removeKeyboard()
      )
      return ctx.scene.leave()
    default:
      return ctx.reply('ERROR - Invalid response', Markup.removeKeyboard())
  }
})

export default newHabitScene
