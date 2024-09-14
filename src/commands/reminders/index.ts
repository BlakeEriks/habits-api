import { HabitCommand } from '../../types'
import { enterScene } from '../../util/telegraf'
import listReminders from './listReminders'
import newReminderScene, { NEW_REMINDER_SCENE } from './newReminder'

export const REMINDER_SCENES = [newReminderScene]

export const REMINDER_COMMANDS: HabitCommand[] = [
  {
    name: 'list_reminders',
    description: 'List all of your reminders',
    action: listReminders,
  },
  {
    name: 'new_reminder',
    description: 'Create a new reminder',
    action: enterScene(NEW_REMINDER_SCENE),
  },
]
