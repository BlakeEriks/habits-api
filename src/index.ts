import { config } from 'dotenv'
import { Scenes, Telegraf, session } from 'telegraf'
import { message } from 'telegraf/filters'
import listHabits from './commands/listHabits'
import logHabitScene from './commands/logHabit'
import newHabitScene from './commands/newHabit'
import removeHabitScene from './commands/removeHabit'
import timezoneScene from './commands/setTimezone'
import attachHabits from './middlewares/applyHabits'
import attachUser from './middlewares/attachUser'
import saveMessage from './middlewares/saveMessage'
import { HabitContext } from './types'

config()

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
bot.command('log', ctx => ctx.scene.enter('logHabit'))
bot.command('tz', ctx => ctx.scene.enter('timezone'))
bot.command('list', listHabits)
bot.on(message('text'), async ctx => ctx.reply(DEFAULT_MESSAGE))

bot.launch()
