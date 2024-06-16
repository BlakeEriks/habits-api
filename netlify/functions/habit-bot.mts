import { Config } from '@netlify/functions'
import habitBot from '../../src/habitBot'

export default async (req: Request) => {
  try {
    return habitBot.handleUpdate(JSON.parse(await req.json()))
  } catch (e) {
    return new Response('This endpoint is meant for bot and telegram communication', {
      status: 500,
    })
  }
}

export const config: Config = {
  path: ['/habit-bot'],
}
