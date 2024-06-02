import { PrismaClient } from '@prisma/client'
import moment from 'moment-timezone'
import { Markup, Scenes } from 'telegraf'
import { message } from 'telegraf/filters'
import { HabitContext } from '../types'

const prisma = new PrismaClient()

const TIMEZONE_OPTIONS = [
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'Europe/London',
  'Europe/Paris',
]

// Timezone Scene
const timezoneScene = new Scenes.BaseScene<HabitContext>('timezone')
timezoneScene.enter(ctx => {
  const keyboardOptions = TIMEZONE_OPTIONS.map(zone => [zone])
  return ctx.reply(
    'Please enter your timezone in the format "Region/City".\n\nOr go /back',
    Markup.keyboard(keyboardOptions).oneTime().resize()
  )
})
timezoneScene.command('back', async ctx => {
  await ctx.reply('Cancelled timezone setup.', Markup.removeKeyboard())
  return ctx.scene.leave()
})
timezoneScene.on(message('text'), async ctx => {
  const timezone = ctx.message.text
  if (moment.tz.zone(timezone)) {
    await prisma.user.update({
      where: { id: ctx.user.id },
      data: { timezone },
    })
    await ctx.reply(`Timezone set to ${timezone}.`, Markup.removeKeyboard())
    return ctx.scene.leave()
  } else {
    return ctx.reply('Invalid timezone selection.')
  }
})

export default timezoneScene
