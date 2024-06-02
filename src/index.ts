import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import { Scenes, Telegraf, session } from 'telegraf'
import { message } from 'telegraf/filters'
import attachHabits from './middlewares/applyHabits'
import attachUser from './middlewares/attachUser'
import saveMessage from './middlewares/saveMessage'
import newHabitScene from './scenes/newHabitScene'
import logHabitScene from './scenes/recordHabitScene'
import removeHabitScene from './scenes/removeHabitScene'
import timezoneScene from './scenes/timezoneScene'
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

- /new -  Create a new habit to track
- /list - List the habits you are tracking
- /remove - Remove a habit you are tracking
- /log - Log your habit data for today
- /tz - Set your timezone
`

if (!process.env.BOT_TOKEN) throw new Error('BOT_TOKEN is required')

const bot = new Telegraf<HabitContext>(process.env.BOT_TOKEN)

const stage = new Scenes.Stage<HabitContext>([
  newHabitScene,
  removeHabitScene,
  logHabitScene,
  timezoneScene,
])

bot.use(Telegraf.log())
bot.use(session())
bot.use(attachUser)
bot.use(attachHabits)
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
bot.command('tz', ctx => ctx.scene.enter('timezone'))

bot.on(message('text'), async ctx => ctx.reply(DEFAULT_MESSAGE))

bot.launch()
