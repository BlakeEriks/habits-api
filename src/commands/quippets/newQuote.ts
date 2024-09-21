import { QuippetContext } from '@/types'
import { parseQuote } from '@/util/openai'
import { replyAndLeave } from '@/util/telegraf'
import { last } from 'lodash'
import { saveQuote } from 'prisma-db'
import { Scenes } from 'telegraf'
import { message } from 'telegraf/filters'

export const NEW_QUOTE_SCENE = 'NEW_QUOTE_SCENE'

export const newQuoteScene = new Scenes.BaseScene<QuippetContext>(NEW_QUOTE_SCENE)
newQuoteScene.enter(ctx => {
  return ctx.reply(
    `What is the quote?\n Please provide textual or image representation, and I will parse it for you 😀\n\nOr go /back`
  )
})

newQuoteScene.command('back', replyAndLeave('Cancelled quote creation.'))

newQuoteScene.on(message('text'), async ctx => {
  const quote = await parseQuote({ text: ctx.message.text })
  await saveQuote({ ...quote, userId: ctx.user.id })
  return replyAndLeave(`Quote saved!`)(ctx)
})

newQuoteScene.on(message('photo'), async ctx => {
  const photo = last(ctx.message.photo)
  if (!photo) {
    return replyAndLeave('ERROR - Photo is missing')(ctx)
  }

  const fileUrl = await ctx.telegram.getFileLink(photo.file_id)
  const quote = await parseQuote({ imageURL: fileUrl.href })

  await saveQuote({ ...quote, userId: ctx.user.id })
  return replyAndLeave(`Quote saved!`)(ctx)
})

// newQuoteScene.on(message(''))
