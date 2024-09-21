import botHandleUpdate from '@/functions/bot-handle-update.js'
import { Config } from '@netlify/functions'
import habitBot from '../../src/habitBot.js'

// @ts-ignore
export default botHandleUpdate(habitBot)

export const config: Config = {
  path: ['/habit-bot'],
}
