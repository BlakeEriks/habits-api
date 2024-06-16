import { Config, Handler } from '@netlify/functions'
import habitBot from '../../src/habitBot'

const handler: Handler = async event => {
  try {
    if (event.httpMethod !== 'POST' || !event.body) {
      return {
        statusCode: 405,
        body: JSON.stringify({
          message: 'This endpoint only accepts POST requests',
        }),
      }
    }
    await habitBot.handleUpdate(JSON.parse(event.body))
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Success' }),
    }
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'This endpoint is meant for bot and telegram communication',
      }),
    }
  }
}

export const config: Config = {
  path: ['/habit-bot'],
}

export { handler as default }
