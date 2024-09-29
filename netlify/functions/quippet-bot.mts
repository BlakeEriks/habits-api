import { Config } from '@netlify/functions'
import quippetBot from '../../src/quippetBot'

export default async (event: Request) => {
  try {
    if (event.method !== 'POST') {
      return new Response('This endpoint only accepts POST requests', { status: 405 })
    }
    await quippetBot.handleUpdate(await event.json())
    return new Response('Success')
  } catch (e) {
    console.error('Error processing update:', e)
    return new Response('Error processing update ' + e, { status: 500 })
  }
}

export const config: Config = {
  path: ['/quippet-bot'],
}
