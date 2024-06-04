import habitBot from '../../src/habitBot'

exports.handler = async event => {
  try {
    await habitBot.handleUpdate(JSON.parse(event.body))
    return {
      statusCode: 200,
      body: '',
    }
  } catch (e) {
    console.error('error in handler:', e)
    return { statusCode: 400, body: 'This endpoint is meant for bot and telegram communication' }
  }
}
