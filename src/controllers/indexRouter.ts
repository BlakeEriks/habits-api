import { Router } from 'express'
import attachUserToRequest from '../middlewares/attachUserToRequest'
import saveMessage from '../middlewares/saveMessage'
import { clearUserSession, getSession } from '../utils/database'
import { handleEmptySession, handleNewHabit, handleRemoveHabit } from './sessionHandlers'

const baseRouter = Router()

baseRouter.get('/', (req, res) => {
  res.send('Hello World')
})

baseRouter.post('/', attachUserToRequest, saveMessage, async (req, res) => {
  console.log(req.body)
  console.log((req as any).user)

  const { user, message } = req as any
  const session = await getSession(user.id)

  if (!session || session.state === 'INITIAL') {
    handleEmptySession(user, message)
  } else if (session.state.startsWith('HABIT_REMOVE')) {
    handleRemoveHabit(req, res, user, session)
  } else if (session.state.startsWith('NEW_HABIT')) {
    handleNewHabit(user, session, message)
  } else {
    console.log('Unhandled session state:', session.state)
    clearUserSession(user.id)
  }

  res.sendStatus(200)
})

export { baseRouter }
