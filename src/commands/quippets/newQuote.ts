import { saveQuote } from '@/prisma-quippet/src/quote.db'
import { QuippetContext } from '@/types'
import { Markup, Scenes } from 'telegraf'
import { message } from 'telegraf/filters'
import { replyAndLeave } from '../utils'

export const NEW_QUOTE_SCENE = 'NEW_QUOTE_SCENE'
enum NEW_QUOTE_FIELDS {
  CONTENT = 'content',
  QUOTEE = 'quotee',
}
export const newQuoteScene = new Scenes.BaseScene<QuippetContext>(NEW_QUOTE_SCENE)
newQuoteScene.enter(ctx => {
  ctx.session.expecting = NEW_QUOTE_FIELDS.CONTENT
  ctx.session.quote = {}
  return ctx.reply(`What is the quote?\n\nOr go /back`)
})
newQuoteScene.command('back', replyAndLeave('Cancelled habit creation.'))
newQuoteScene.on(message('text'), async ctx => {
  switch (ctx.session.expecting) {
    case NEW_QUOTE_FIELDS.CONTENT:
      ctx.session.quote.content = ctx.message.text
      ctx.session.expecting = 'quotee'
      return ctx.reply('Who is the quotee?')
    case NEW_QUOTE_FIELDS.QUOTEE:
      const quotee = ctx.message.text
      const content = ctx.session.quote.content
      const userId = ctx.user.id

      if (!content) {
        return replyAndLeave('ERROR - Content is missing')(ctx)
      }

      await saveQuote({ content, quotee, userId })

      return replyAndLeave(`Quote saved!`)(ctx)
    default:
      return ctx.reply('ERROR - Invalid response', Markup.removeKeyboard())
  }
})
