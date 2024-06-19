import { Config } from '@netlify/functions'
import habitBot from '../../src/habitBot'

export default async (event: Request) => {
  try {
    if (event.method !== 'POST') {
      return new Response('This endpoint only accepts POST requests', { status: 405 })
    }
    await habitBot.handleUpdate(await event.json())
    return new Response('Success')
  } catch (e) {
    console.error('Error processing update:', e)
    return new Response('Error processing update', { status: 500 })
  }
}

export const config: Config = {
  path: ['/habit-bot'],
}
