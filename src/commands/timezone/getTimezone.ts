import { Markup } from 'telegraf'
import { HabitContext } from '../../types'

const getTimezone = (ctx: HabitContext) =>
  ctx.replyWithHTML(
    `Your current timezone is set to <b>${ctx.user.timezone}</b>`,
    Markup.removeKeyboard()
  )

export default getTimezone
