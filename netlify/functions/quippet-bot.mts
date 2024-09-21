import botHandleUpdate from '@/functions/bot-handle-update.js'
import quippetBot from '@/quippetBot.js'
import { Config } from '@netlify/functions'

// @ts-ignore
export default botHandleUpdate(quippetBot)

export const config: Config = {
  path: ['/quippet-bot'],
}
