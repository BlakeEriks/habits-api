import axios from 'axios'
import { config } from 'dotenv'

config()

const command = process.argv[2]
const bot = process.argv[3]

if (!command) {
  throw new Error('Command is required')
}

if (!bot) {
  throw new Error('Bot is required')
}

const BOT_TOKEN = process.env[`${bot.toUpperCase()}_BOT_TOKEN`]

if (!BOT_TOKEN) {
  throw new Error('BOT_TOKEN is required')
}

async function setWebhook(webhookUrl: string) {
  console.log('Setting webhook for bot with URL:', webhookUrl)
  const response = await axios.post(
    `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${webhookUrl}`
  )
  console.log(response.data)

  return response.data
}

async function getWebhookInfo() {
  const response = await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`)
  console.log(response.data)

  return response.data
}

if (command === 'get') {
  getWebhookInfo()
} else if (command === 'set') {
  setWebhook(`${process.env.NETLIFY_SERVER_URL}/${bot}-bot`)
}
