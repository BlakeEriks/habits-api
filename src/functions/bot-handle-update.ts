import { Telegraf } from 'telegraf'

export default (bot: Telegraf) => async (event: Request) => {
  try {
    if (event.method !== 'POST') {
      return new Response('This endpoint only accepts POST requests', { status: 405 })
    }
    await bot.handleUpdate(await event.json())
    return new Response('Success')
  } catch (e) {
    console.error('Error processing update:', e)
    return new Response('Error processing update', { status: 500 })
  }
}
