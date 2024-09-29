import { QUOTE_COMMANDS, QUOTE_SCENES } from '@/commands/quippets'
import attachUser from '@/middlewares/attachUser'
import { QuippetContext } from '@/types'
import { Markup, Scenes, session, Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'

const commandGroups = [
  { name: 'Quotes', commands: QUOTE_COMMANDS },
  // { name: 'Reminders', commands: REMINDER_COMMANDS },
  // { name: 'Timezone', commands: TIMEZONE_COMMANDS },
]

const availableCommands = commandGroups.map(group => {
  return `${group.name}:\n${group.commands
    .map(({ name, description }) => `  /${name} - ${description}`)
    .join('\n')}`
})

const DEFAULT_MESSAGE = `
🤖 Beep Boop! 

I am the quippet bot!
I can help you collect neat quotes you find out in the world.

Available commands:

${availableCommands.join('\n\n')}
`

if (!process.env.QUIPPET_BOT_TOKEN) {
  throw new Error('QUIPPET_BOT_TOKEN is required')
}

const quippetBot = new Telegraf<QuippetContext>(process.env.QUIPPET_BOT_TOKEN)

// quippetBot.command('new', async ctx => {
//   ctx.reply('What is the quote?')
// })

const stage = new Scenes.Stage<QuippetContext>([
  ...QUOTE_SCENES,
  // ...REMINDER_SCENES,
  // ...TIMEZONE_SCENES,
])

quippetBot.use(Telegraf.log())
quippetBot.use(session())
quippetBot.use(attachUser)
// quippetBot.use(attachHabits)
// quippetBot.use(saveMessage)
quippetBot.use(stage.middleware())

const allCommands = commandGroups.flatMap(({ commands }) => commands)
for (const { name, action } of allCommands) {
  quippetBot.command(name, action as any)
}

// Default
quippetBot.on(message('text'), async ctx => ctx.reply(DEFAULT_MESSAGE, Markup.removeKeyboard()))

export { quippetBot }
