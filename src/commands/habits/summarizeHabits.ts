import { getHabitLogsSince } from '../../db/habitLog'
import { HabitContext, HabitDataType } from '../../types'

const habitSummary = async (ctx: HabitContext) => {
  if (!ctx.habits.length) {
    return ctx.reply('You are not tracking any habits yet. Use /new to start tracking a habit.')
  }

  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const habitLogs = await getHabitLogsSince(ctx.user.id, oneWeekAgo)

  if (!habitLogs.length) {
    return ctx.reply('You have not logged any habits in the past week.')
  }

  let summary: string[] = []
  for (const habit of ctx.habits) {
    const habitLogsForHabit = habitLogs.filter(log => log.habitId === habit.id)

    if (habit.dataType === HabitDataType.BOOL) {
      const count = habitLogsForHabit.reduce(
        (acc, habitLog) => +(habitLog.value === 'yes') + acc,
        0
      )
      summary.push(`[${habit.name}] Total: ${count} / 7`)
    } else if (habit.dataType === HabitDataType.NUMBER) {
      const sum = habitLogsForHabit.reduce((acc, habitLog) => Number(habitLog.value) + acc, 0)
      summary.push(`[${habit.name}] Total: ${sum}, Avg: ${(sum / 7).toFixed(1)}`)
    } else if (habit.dataType === HabitDataType.TIME) {
      const avg = averageTime(habitLogsForHabit.map(habitLog => habitLog.value))
      summary.push(`[${habit.name}] Avg: ${avg}`)
    } else {
      throw new Error(`Invalid data type detected for habit ${habit.name}`)
    }
  }

  return ctx.reply(`Here's your habit summary for the last 7 days:\n\n${summary.join('\n')}`)
}

function timeStringToMinutes(timeString: string) {
  const [hours, minutes] = timeString.split(':').map(Number)
  return hours * 60 + minutes
}

function minutesToTimeString(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

function averageTime(times: string[]) {
  const totalMinutes = times.reduce((sum, time) => sum + timeStringToMinutes(time), 0)
  const averageMinutes = totalMinutes / times.length
  return minutesToTimeString(Math.round(averageMinutes))
}

export default habitSummary
