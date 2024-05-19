import { config } from 'dotenv'
import { Scenes, session, Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'

config()

// Handler factories
const { enter, leave } = Scenes.Stage

// Greeter scene
const greeterScene = new Scenes.BaseScene<Scenes.SceneContext>('greeter')
greeterScene.enter(ctx => ctx.reply('Hi'))
greeterScene.leave(ctx => ctx.reply('Bye'))
greeterScene.hears('hi', enter<Scenes.SceneContext>('greeter'))
greeterScene.on('message', ctx => ctx.replyWithMarkdownV2('Send `hi`'))

// Echo scene
const echoScene = new Scenes.BaseScene<Scenes.SceneContext>('echo')
echoScene.enter(ctx => ctx.reply('echo scene'))
echoScene.leave(ctx => ctx.reply('exiting echo scene'))
echoScene.command('back', leave<Scenes.SceneContext>())
echoScene.on(message('text'), ctx => ctx.reply(ctx.message.text))
echoScene.on('message', ctx => ctx.reply('Only text messages please'))

const bot = new Telegraf<Scenes.SceneContext>(process.env.BOT_TOKEN!)

const stage = new Scenes.Stage<Scenes.SceneContext>([greeterScene, echoScene], {
  ttl: 180,
})
bot.use(session())
bot.use(stage.middleware())
bot.command('greeter', ctx => ctx.scene.enter('greeter'))
bot.command('echo', ctx => ctx.scene.enter('echo'))
bot.on('message', ctx => ctx.reply('Try /echo or /greeter'))

bot.launch()
