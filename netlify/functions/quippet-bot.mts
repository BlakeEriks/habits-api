import { Config } from '@netlify/functions'
import botHandleUpdate from '../../src/functions/bot-handle-update.js'
import quippetBot from '../../src/quippetBot.js'

// @ts-ignore
export default botHandleUpdate(quippetBot)

export const config: Config = {
  path: ['/quippet-bot'],
}
