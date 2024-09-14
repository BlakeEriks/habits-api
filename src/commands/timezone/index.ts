import { HabitCommand } from '../../types'
import { enterScene } from '../../util/telegraf'
import getTimezone from './getTimezone'
import setTimezoneScene, { SET_TIMEZONE_SCENE } from './setTimezone'

export const TIMEZONE_SCENES = [setTimezoneScene]

export const TIMEZONE_COMMANDS: HabitCommand[] = [
  {
    name: 'set_timezone',
    description: 'Set your timezone',
    action: enterScene(SET_TIMEZONE_SCENE),
  },
  {
    name: 'get_timezone',
    description: 'Get your current timezone',
    action: getTimezone,
  },
]
