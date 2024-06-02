import { Habit, PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import { Markup, Scenes, Telegraf, session } from 'telegraf'
import { message } from 'telegraf/filters'
import attachUserToRequest from './middlewares/attachUserToRequest'
import saveMessage from './middlewares/saveMessage'
import { HabitContext } from './types'

config()

const prisma = new PrismaClient()

// Example
// {
//   update_id: 768261164,
//   message: {
//     message_id: 8,
//     from: {
//       id: 7114372338,
//       is_bot: false,
//       first_name: 'Blake',
//       language_code: 'en'
//     },
//     chat: { id: 7114372338, first_name: 'Blake', type: 'private' },
//     date: 1715390421,
//     text: 'Hi!!!'
//   }
// }

const DEFAULT_MESSAGE = `
🤖 Beep Boop! 

I am the habit tracking bot!
I can help you stay accountable to your habits.

Available commands:

- /new  Create a new habit to track
- /list List the habits you are tracking
- /remove Remove a habit you are tracking
- /log Log your habit data for today
`

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
  return ctx.reply(`What is the name of the habit you would like to track?\n\n/back to cancel`)
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

// Remove Habit Scene
const removeHabitScene = new Scenes.BaseScene<HabitContext>('removeHabit')
removeHabitScene.enter(async ctx => {
  const userId = ctx.user.id
  const habits = await prisma.habit.findMany({
    where: { userId: userId },
  })

  if (habits.length === 0) {
    return ctx.reply('You have no habits to remove.')
  }

  const habitButtons = habits.map(habit => [habit.name])
  await ctx.reply(
    `Select a habit to remove:\n\n/back to cancel`,
    Markup.keyboard(habitButtons).oneTime().resize()
  )

  // Save the habits in the session for later reference
  ctx.session.habits = habits
})
removeHabitScene.command('back', async ctx => {
  await ctx.reply('Cancelled habit removal.', Markup.removeKeyboard())
  return ctx.scene.leave()
})
removeHabitScene.on(message('text'), async ctx => {
  const selectedHabitName = ctx.message.text
  const habit = ctx.session.habits?.find(h => h.name === selectedHabitName)

  if (!habit) {
    return ctx.reply('Habit not found or already deleted.')
  }

  // Delete the habit using Prisma
  await prisma.habit.delete({
    where: { id: habit.id },
    include: { habitLogs: true },
  })

  // Remove the habit from the session
  ctx.session.habits = ctx.session.habits?.filter(h => h.id !== habit.id)

  await ctx.reply(`Habit '${selectedHabitName}' has been deleted.`, Markup.removeKeyboard())
  return ctx.scene.leave()
})

// Fill Habit Data Scene
const logHabitScene = new Scenes.BaseScene<HabitContext>('logHabit')
logHabitScene.enter(async ctx => {
  const habits = await prisma.habit.findMany({
    where: { userId: ctx.user.id },
  })

  if (habits.length === 0) {
    return ctx.reply('You have no habits to log.')
  }

  ctx.session.habits = habits
  ctx.session.currentHabit = 0
  promptForHabitData(ctx)
})

logHabitScene.command('back', async ctx => {
  await ctx.reply('Cancelled habit logging.', Markup.removeKeyboard())
  return ctx.scene.leave()
})

logHabitScene.on(message('text'), async ctx => {
  const currentHabit = ctx.session.habits![ctx.session.currentHabit]
  const { text } = ctx.message

  switch (currentHabit.dataType) {
    case 'bool':
      if (['👍', '👎'].includes(text)) {
        const value = text === '👍' ? 'yes' : 'no'
        await saveHabitData(ctx, currentHabit, value)
        proceedToNextHabit(ctx)
      } else {
        await ctx.reply('Please reply with 👍 or 👎.')
      }
      break
    case 'number':
      if (!isNaN(Number(text))) {
        await saveHabitData(ctx, currentHabit, text)
        proceedToNextHabit(ctx)
      } else {
        await ctx.reply('Please enter a valid number.')
      }
      break
    case 'time':
      if (isValidTime(text)) {
        await saveHabitData(ctx, currentHabit, text)
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
  const currentHabit = ctx.session.habits[ctx.session.currentHabit]
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
  if (ctx.session.currentHabit! < ctx.session.habits!.length) {
    promptForHabitData(ctx)
  } else {
    ctx.reply('All habit data has been filled out. Thank you!', Markup.removeKeyboard())
    ctx.scene.leave()
  }
}

async function saveHabitData(ctx: HabitContext, habit: Habit, value: string) {
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

if (!process.env.BOT_TOKEN) throw new Error('BOT_TOKEN is required')

const bot = new Telegraf<HabitContext>(process.env.BOT_TOKEN)

const stage = new Scenes.Stage<HabitContext>([newHabitScene, removeHabitScene, logHabitScene])

bot.use(Telegraf.log())
bot.use(session())
bot.use(attachUserToRequest)
bot.use(saveMessage)
bot.use(stage.middleware())

bot.command('new', ctx => ctx.scene.enter('newHabit'))
bot.command('remove', ctx => ctx.scene.enter('removeHabit'))
bot.command('list', async ctx => {
  const habits = await prisma.habit.findMany({
    where: { userId: ctx.user.id },
  })

  if (!habits.length) {
    return ctx.reply('You are not tracking any habits yet. Use /new to start tracking a habit.')
  }

  const habitStr = habits.map((habit, idx) => `${idx + 1}: ${habit.name}`).join('\n')
  return ctx.reply(`Here's a list of the habits you are tracking:\n\n${habitStr}`)
})
bot.command('log', ctx => ctx.scene.enter('logHabit'))

bot.on(message('text'), async ctx => ctx.reply(DEFAULT_MESSAGE))

bot.launch()
