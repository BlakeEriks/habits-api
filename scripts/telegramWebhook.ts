import axios from 'axios'

const command = process.argv[2]

if (!command) {
  throw new Error('Command is required')
}

if (!process.env.BOT_TOKEN) {
  throw new Error('BOT_TOKEN is required')
}

async function setWebhook(webhookUrl: string) {
  console.log('Setting webhook for bot with URL:', webhookUrl)
  const response = await axios.post(
    `https://api.telegram.org/bot${process.env.BOT_TOKEN}/setWebhook?url=${webhookUrl}`
  )
  console.log(response.data)

  return response.data
}

async function getWebhookInfo() {
  const response = await axios.get(
    `https://api.telegram.org/bot${process.env.BOT_TOKEN}/getWebhookInfo`
  )
  console.log(response.data)

  return response.data
}

if (command === 'get') {
  getWebhookInfo()
} else if (command === 'set') {
  const bot = process.argv[3]

  if (!process.env.NETLIFY_SERVER_URL || !bot) {
    throw new Error('NETLIFY_SERVER_URL and bot are required')
  }
  setWebhook(`${process.env.NETLIFY_SERVER_URL}/${bot}-bot`)
}
