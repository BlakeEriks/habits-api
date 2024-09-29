import { Config } from '@netlify/functions'
import botHandleUpdate from '../../src/functions/bot-handle-update.js'
import habitBot from '../../src/habitBot.js'

// @ts-ignore
export default botHandleUpdate(habitBot)

export const config: Config = {
  path: ['/habit-bot'],
}
