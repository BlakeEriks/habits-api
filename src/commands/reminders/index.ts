import { Command } from '../../types'
import { enterScene } from '../utils'
import listReminders from './listReminders'
import newReminderScene from './newReminder'

export const REMINDER_SCENES = [newReminderScene]

export const REMINDER_COMMANDS: Command[] = [
  {
    name: 'list_reminders',
    description: 'List all of your reminders',
    action: listReminders,
  },
  {
    name: 'new_reminder',
    description: 'Create a new reminder',
    action: enterScene('newReminder'),
  },
]
