import { Context, Markup } from 'telegraf'

interface ContextWithScene extends Context {
  scene: any
}

export const enterScene = (sceneName: string) => (ctx: ContextWithScene) =>
  ctx.scene.enter(sceneName)

export const replyAndLeave = (message: string) => async (ctx: any) => {
  await ctx.replyWithHTML(message, Markup.removeKeyboard())
  return ctx.scene.leave()
}
