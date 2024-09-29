import { Config } from '@netlify/functions'
import { getAllUsers, sampleQuotesByUser } from 'prisma-db'
import { quippetBot } from '../../src/quippetBot.js'

const QUOTE_SAMPLE_SIZE = 3
type Quote = Awaited<ReturnType<typeof sampleQuotesByUser>>[number]

const formatQuote = (quote: Quote) => {
  return `"${quote.content}"\n\n- ${quote.quotee}`
}

export default async (event: Request) => {
  try {
    console.log('Received event')

    const allUsers = await getAllUsers()
    console.log(allUsers)
    for (const user of allUsers) {
      if (!user.telegramId) {
        console.log('Skipping user without telegramId:', user)
        continue
      }

      console.log('Sending message to user:', user)
      const quotes = await sampleQuotesByUser(user.id, QUOTE_SAMPLE_SIZE)
      const quotesMessage = quotes.map(formatQuote).join('\n\n---\n\n')
      // @ts-ignore
      await quippetBot.telegram.sendMessage(user.telegramId.toString(), quotesMessage)
    }

    if (event.method !== 'POST') {
      return new Response('This endpoint only accepts POST requests', { status: 405 })
    }
    return new Response('Success')
  } catch (e) {
    console.error('Error processing update:', e)
    return new Response('Error processing update: ' + e, { status: 500 })
  }
}

export const config: Config = {
  path: ['/daily-quote'],
}
