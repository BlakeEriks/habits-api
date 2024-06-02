import { Habit, PrismaClient } from '@prisma/client'
import { Markup, Scenes } from 'telegraf'
import { message } from 'telegraf/filters'
import { HabitContext } from '../types'

const prisma = new PrismaClient()

// Fill Habit Data Scene
const logHabitScene = new Scenes.BaseScene<HabitContext>('logHabit')
logHabitScene.enter(async ctx => {
  if (ctx.habits.length === 0) {
    return ctx.reply('You have no habits to log.')
  }
  ctx.session.currentHabit = 0
  promptForHabitData(ctx)
})

logHabitScene.command('back', async ctx => {
  await ctx.reply('Cancelled habit logging.', Markup.removeKeyboard())
  return ctx.scene.leave()
})

logHabitScene.on(message('text'), async ctx => {
  const currentHabit = ctx.habits[ctx.session.currentHabit]
  const { text } = ctx.message

  switch (currentHabit.dataType) {
    case 'bool':
      if (['👍', '👎'].includes(text)) {
        const value = text === '👍' ? 'yes' : 'no'
        await saveHabitData(currentHabit, value)
        proceedToNextHabit(ctx)
      } else {
        await ctx.reply('Please reply with 👍 or 👎.')
      }
      break
    case 'number':
      if (!isNaN(Number(text))) {
        await saveHabitData(currentHabit, text)
        proceedToNextHabit(ctx)
      } else {
        await ctx.reply('Please enter a valid number.')
      }
      break
    case 'time':
      if (isValidTime(text)) {
        await saveHabitData(currentHabit, text)
        proceedToNextHabit(ctx)
      } else {
        await ctx.reply('Please enter a valid time in HH:MM format.')
      }
      break
    default:
      await ctx.reply('ERROR - Invalid data type.')
  }
})

function promptForHabitData(ctx: HabitContext) {
  const currentHabit = ctx.habits[ctx.session.currentHabit]
  let promptMessage = `Please provide data for the habit: ${currentHabit.name}\n`

  switch (currentHabit.dataType) {
    case 'bool':
      promptMessage += 'Did you complete this habit today?'
      return ctx.reply(
        promptMessage,
        Markup.keyboard([['👍', '👎']])
          .oneTime()
          .resize()
      )
    case 'number':
      promptMessage += 'Enter the value for this habit (number):'
      break
    case 'time':
      promptMessage += 'Enter the time for this habit (HH:MM):'
      break
  }

  return ctx.reply(promptMessage, Markup.removeKeyboard())
}

function proceedToNextHabit(ctx: HabitContext) {
  ctx.session.currentHabit++
  if (ctx.session.currentHabit! < ctx.habits!.length) {
    promptForHabitData(ctx)
  } else {
    ctx.reply('All habit data has been filled out. Thank you!', Markup.removeKeyboard())
    ctx.scene.leave()
  }
}

async function saveHabitData(habit: Habit, value: string) {
  await prisma.habitLog.create({
    data: {
      habitId: habit.id,
      value,
      date: new Date(),
    },
  })
}

function isValidTime(time: string): boolean {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  return timeRegex.test(time)
}

export default logHabitScene
