import { saveQuote } from '@/prisma-db/src/quippets/quote.db'
import { getUserByName } from '@/prisma-db/src/user'
import { QuippetContext } from '@/types'
import { parseQuote } from '@/util/openai'
import { last } from 'lodash'
import { Scenes } from 'telegraf'
import { message } from 'telegraf/filters'
import { replyAndLeave } from '../../util/telegraf'

export const NEW_QUOTE_SCENE = 'NEW_QUOTE_SCENE'
const MY_NAME = 'Blake'

export const newQuoteScene = new Scenes.BaseScene<QuippetContext>(NEW_QUOTE_SCENE)
newQuoteScene.enter(ctx => {
  return ctx.reply(
    `What is the quote?\n Please provide textual or image representation, and I will parse it for you 😀\n\nOr go /back`
  )
})

newQuoteScene.command('back', replyAndLeave('Cancelled quote creation.'))

newQuoteScene.on(message('text'), async ctx => {
  console.log('youve got mail')

  // ctx.session.quote.content = msg.text
  const quotee = ctx.message.text
  const content = ''
  const userId = (await getUserByName(MY_NAME))!.id

  if (!content) {
    return replyAndLeave('ERROR - Content is missing')(ctx)
  }

  await saveQuote({ content, quotee, userId })

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
