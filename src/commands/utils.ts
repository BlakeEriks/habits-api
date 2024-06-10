import { Markup } from 'telegraf'
import { HabitContext } from '../types'

export const enterScene = (sceneName: string) => (ctx: HabitContext) => ctx.scene.enter(sceneName)

export const replyAndLeave = (message: string) => async (ctx: HabitContext) => {
  await ctx.replyWithHTML(message, Markup.removeKeyboard())
  return ctx.scene.leave()
}
