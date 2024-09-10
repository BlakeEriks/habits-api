import { Markup, session, Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import attachHabits from './middlewares/attachHabits'
import attachUser from './middlewares/attachUser'
import saveMessage from './middlewares/saveMessage'
import { HabitContext } from './types'

// const commandGroups = [
//   { name: 'Habits', commands: HABIT_COMMANDS },
//   { name: 'Reminders', commands: REMINDER_COMMANDS },
//   { name: 'Timezone', commands: TIMEZONE_COMMANDS },
// ]

// const availableCommands = commandGroups.map(group => {
//   return `${group.name}:\n${group.commands
//     .map(({ name, description }) => `  /${name} - ${description}`)
//     .join('\n')}`
// })

const DEFAULT_MESSAGE = `
🤖 Beep Boop! 

I am the quote bot!
I can help you collect neat quotes you find out in the world.

Available commands:

`
// ${availableCommands.join('\n\n')}

if (!process.env.QUIPPET_BOT_TOKEN) {
  throw new Error('QUIPPET_BOT_TOKEN is required')
}

const quippetBot = new Telegraf<HabitContext>(process.env.QUIPPET_BOT_TOKEN)

// const stage = new Scenes.Stage<HabitContext>([
//   ...HABIT_SCENES,
//   ...REMINDER_SCENES,
//   ...TIMEZONE_SCENES,
// ])

quippetBot.use(Telegraf.log())
quippetBot.use(session())
// quippetBot.use(attachUser)
// quippetBot.use(attachHabits)
// quippetBot.use(saveMessage)
// habitBot.use(stage.middleware())

// const allCommands = commandGroups.flatMap(({ commands }) => commands)
// for (const { name, action } of allCommands) {
//   habitBot.command(name, action)
// }

// Default
quippetBot.on(message('text'), async ctx => ctx.reply(DEFAULT_MESSAGE, Markup.removeKeyboard()))

export default quippetBot
