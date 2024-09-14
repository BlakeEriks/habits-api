import { HabitContext } from '@/types'
import { replyAndLeave } from '@/util/telegraf'
import { updateUser } from '@db/habits/user'
import moment from 'moment-timezone'
import { Markup, Scenes } from 'telegraf'
import { message } from 'telegraf/filters'

const TIMEZONE_OPTIONS = [
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'Europe/London',
  'Europe/Paris',
]

// Timezone Scene
export const SET_TIMEZONE_SCENE = 'SET_TIMEZONE_SCENE'
export const setTimezoneScene = new Scenes.BaseScene<HabitContext>(SET_TIMEZONE_SCENE)
setTimezoneScene.enter(async ctx => {
  const keyboardOptions = TIMEZONE_OPTIONS.map(zone => [zone])
  return ctx.reply(
    'Please enter your timezone in the format "Region/City".\n\nOr go /back',
    Markup.keyboard(keyboardOptions).oneTime().resize()
  )
})
setTimezoneScene.command('back', replyAndLeave('Cancelled timezone setup.'))

setTimezoneScene.on(message('text'), async ctx => {
  const timezone = ctx.message.text
  if (moment.tz.zone(timezone)) {
    await updateUser(ctx.user.id, { timezone })
    return replyAndLeave(`Timezone set to <b>${timezone}</b>.`)(ctx)
  } else {
    return ctx.reply('Invalid timezone selection.')
  }
})

export default setTimezoneScene
