import axios from 'axios'
import dotenv from 'dotenv'
import ngrok from 'ngrok'

dotenv.config()

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const LOCAL_PORT = 8000

console.log('Starting ngrok...')

ngrok
  .connect(LOCAL_PORT)
  .then(ngrokUrl => {
    console.log(`ngrok tunnel set up: ${ngrokUrl}`)
    return setWebhook(ngrokUrl)
  })
  .then(response => {
    console.log('Webhook set successfully:', response)
    console.log('Press Ctrl+C to quit.') // Instruct the user to manually terminate the script
  })
  .catch(error => {
    console.error('Error setting webhook:', error)
    process.exit(1) // Exit with error code
  })

async function setWebhook(webhookUrl: string) {
  console.log('Setting webhook for bot with URL:', webhookUrl)

  const response = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: webhookUrl }),
  })
  return response.data
}

// Keep the process alive
process.stdin.resume()
