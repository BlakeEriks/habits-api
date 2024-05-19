import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import { Markup, Scenes, Telegraf, session } from 'telegraf'
import { message } from 'telegraf/filters'
import attachUserToRequest from './middlewares/attachUserToRequest'
import saveMessage from './middlewares/saveMessage'
import { HabitContext } from './types'

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
`

// New Habit Scene
const newHabitScene = new Scenes.BaseScene<HabitContext>('newHabit')
newHabitScene.enter(ctx => {
  ctx.session.expecting = 'name'
  ctx.session.habit = {}
  return ctx.reply(`What is the name of the habit you would like to track?\n/back to cancel`)
})
newHabitScene.command('back', ctx => ctx.reply('Cancelled habit creation.'))
newHabitScene.on(message('text'), async ctx => {
  switch (ctx.session.expecting) {
    case 'name':
      ctx.session.habit.name = ctx.message.text
      ctx.session.expecting = 'dataType'
      return ctx.reply(
        'What type of data will this habit track? Options: number, bool, time',
        Markup.keyboard([['🔢 Number', '🔘 Binary', '⏰ Time']])
          .oneTime()
          .resize()
      )
    case 'dataType':
      ctx.session.habit.dataType = ctx.message.text
      await prisma.habit.create({
        data: {
          name: ctx.session.habit.name!,
          userId: ctx.user.id,
          dataType: ctx.session.habit.dataType,
        },
      })
      await ctx.reply(`Habit '${ctx.session.habit.name}' tracking setup complete!`)
      return ctx.scene.leave()
    default:
      return ctx.reply('ERROR - Invalid response')
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
    `Select a habit to remove:\n/back to cancel`,
    Markup.keyboard(habitButtons).oneTime().resize()
  )

  // Save the habits in the session for later reference
  ctx.session.habits = habits
})
removeHabitScene.command('back', ctx => {
  ctx.reply('Cancelled habit removal.')
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
  })

  // Remove the habit from the session
  ctx.session.habits = ctx.session.habits?.filter(h => h.id !== habit.id)

  await ctx.reply(`Habit '${selectedHabitName}' has been deleted.`)
  return ctx.scene.leave()
})

config()

if (!process.env.BOT_TOKEN) throw new Error('BOT_TOKEN is required')

const bot = new Telegraf<HabitContext>(process.env.BOT_TOKEN)

const stage = new Scenes.Stage<HabitContext>([newHabitScene, removeHabitScene])

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
  return ctx.reply(`Habits you are tracking:\n${habitStr}`)
})

bot.on(message('text'), async ctx => ctx.reply(DEFAULT_MESSAGE))

bot.launch()
