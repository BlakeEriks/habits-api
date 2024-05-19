import axios from 'axios'

export async function sendMessage(chatId: bigint, text: string) {
  try {
    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`
    await axios.get(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        chat_id: chatId,
        text,
        reply_markup: JSON.stringify(keyboard),
      },
    })
    console.log('Message sent:', text)
  } catch (error) {
    console.error('Error sending message:', error)
  }
}

const keyboard = {
  keyboard: [['Yes', 'No'], ['Maybe']],
  resize_keyboard: true,
  one_time_keyboard: true,
}
