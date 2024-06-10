import { HabitContext } from '../../types'

const listReminders = async (ctx: HabitContext) => {
  const habitsWithReminders = ctx.habits.filter(({ reminders }) => reminders.length)

  if (!habitsWithReminders) {
    return ctx.reply('You do not have any reminders set. Use /new_reminder to set a new reminder.')
  }

  let result = ''
  for (const habit of habitsWithReminders) {
    result += `${habit.name}:\n`
    for (const reminder of habit.reminders) {
      result += `  - ${reminder.time}\n`
    }
  }

  return ctx.reply(`Here's a list of your reminders:\n\n${result}`)
}

export default listReminders
