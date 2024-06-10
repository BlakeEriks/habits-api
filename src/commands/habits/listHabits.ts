import { HabitContext } from '../../types'

const listHabits = async (ctx: HabitContext) => {
  if (!ctx.habits.length) {
    return ctx.reply('You are not tracking any habits yet. Use /new to start tracking a habit.')
  }

  const habitStr = ctx.habits.map((habit, idx) => `${idx + 1}: ${habit.name}`).join('\n')
  return ctx.reply(`Here's a list of the habits you are tracking:\n\n${habitStr}`)
}

export default listHabits
