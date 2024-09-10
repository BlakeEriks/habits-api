import axios from 'axios'

const BOTS = ['habit', 'quippet']

const command = process.argv[2]
const bot = process.argv[3]

if (!command) {
  throw new Error('Command is required')
}

if (!bot || !BOTS.includes(bot)) {
  throw new Error('Valid Bot is required')
}

const formatBotURL = (bot: string) => {
  return `${process.env.NETLIFY_SERVER_URL}/${bot}-bot`
}

async function setWebhook(botToken: string, webhookUrl: string) {
  console.log('Setting webhook for bot with URL:', webhookUrl)
  const response = await axios.post(
    `https://api.telegram.org/bot${botToken}/setWebhook?url=${webhookUrl}`
  )
  console.log(response.data)

  return response.data
}

async function getWebhookInfo(botToken: string) {
  const response = await axios.get(`https://api.telegram.org/bot${botToken}/getWebhookInfo`)
  console.log(response.data)

  return response.data
}

const botToken = process.env[`${bot.toUpperCase()}_BOT_TOKEN`]

if (!botToken) {
  throw new Error(`${bot.toUpperCase()}_BOT_TOKEN is required`)
}

if (command === 'get') {
  getWebhookInfo(botToken)
} else if (command === 'set') {
  const bot = process.argv[3]

  if (!process.env.NETLIFY_SERVER_URL) {
    throw new Error('NETLIFY_SERVER_URL is required')
  }
  const webhookUrl = formatBotURL(bot)
  setWebhook(botToken, webhookUrl)
}
