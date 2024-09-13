import habitBot from './habitBot'
import quippetBot from './quippetBot'

const bots = {
  habitBot,
  quippetBot,
}

// Get bot from arg
const bot = process.argv[2] as keyof typeof bots

// If bot not key of bots, throw error
if (!bots[bot]) {
  throw new Error(`Invalid bot name: ${bot}`)
}

bots[bot].launch()
