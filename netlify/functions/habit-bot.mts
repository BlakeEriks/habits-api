import { Config, HandlerResponse } from '@netlify/functions'
import habitBot from '../../src/habitBot'

export default async event => {
  try {
    if (event.httpMethod !== 'POST' || !event.body) {
      return new Response('This endpoint only accepts POST requests')
    }
    await habitBot.handleUpdate(JSON.parse(event.body))
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Success' }),
    } as HandlerResponse
  } catch (e) {
    console.error('Error processing update:', e)
    return new Response('Error processing update', { status: 500 })
  }
}

export const config: Config = {
  path: ['/habit-bot'],
}
