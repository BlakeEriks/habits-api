import { Config } from '@netlify/functions'
import botHandleUpdate from '../../src/functions/bot-handle-update'
import quippetBot from '../../src/quippetBot'

export default botHandleUpdate(quippetBot)

export const config: Config = {
  path: ['/quippet-bot'],
}
