import { HabitCommand } from '@/types'
import { enterScene } from '@/util/telegraf'
import listHabits from './listHabits'
import logHabitScene, { LOG_HABIT_SCENE } from './logHabit'
import { NEW_HABIT_SCENE, newHabitScene } from './newHabit'
import removeHabitScene, { REMOVE_HABIT_SCENE } from './removeHabit'
import habitSummary from './summarizeHabits'

export const HABIT_SCENES = [newHabitScene, removeHabitScene, logHabitScene]

export const HABIT_COMMANDS: HabitCommand[] = [
  {
    name: 'list_habits',
    description: 'List the habits you are tracking',
    action: listHabits,
  },
  {
    name: 'new_habit',
    description: 'Create a new habit to track',
    action: enterScene(NEW_HABIT_SCENE),
  },
  {
    name: 'remove_habit',
    description: 'Remove a habit you are tracking',
    action: enterScene(REMOVE_HABIT_SCENE),
  },
  {
    name: 'log_habits',
    description: 'Log your habit data for today',
    action: enterScene(LOG_HABIT_SCENE),
  },
  {
    name: 'habit_summary',
    description: 'Check your recent habit performance',
    action: habitSummary,
  },
]
