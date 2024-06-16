import { Config } from '@netlify/functions'
import habitBot from '../../src/habitBot'

export default async event => {
  try {
    await habitBot.handleUpdate(JSON.parse(event.body))
    return new Response('OK')
  } catch (e) {
    return new Response('This endpoint is meant for bot and telegram communication', {
      status: 500,
    })
  }
}

export const config: Config = {
  path: ['/habit-bot'],
}
