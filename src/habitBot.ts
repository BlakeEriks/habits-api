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
- /remind - Set a reminder for your habits
`

if (!process.env.BOT_TOKEN) throw new Error('BOT_TOKEN is required')

const habitBot = new Telegraf<HabitContext>(process.env.BOT_TOKEN)

const stage = new Scenes.Stage<HabitContext>([
  newHabitScene,
  removeHabitScene,
  logHabitScene,
  timezoneScene,
])

habitBot.use(Telegraf.log())
habitBot.use(session())
habitBot.use(attachUser)
habitBot.use(attachHabits)
habitBot.use(saveMessage)
habitBot.use(stage.middleware())

habitBot.command('new', ctx => ctx.scene.enter('newHabit'))
habitBot.command('remove', ctx => ctx.scene.enter('removeHabit'))
habitBot.command('log', ctx => ctx.scene.enter('logHabit'))
habitBot.command('tz', ctx => ctx.scene.enter('timezone'))
habitBot.command('remind', ctx => ctx.reply('Not implemented yet.'))
habitBot.command('list', listHabits)
habitBot.on(message('text'), async ctx => ctx.reply(DEFAULT_MESSAGE))

export default habitBot
