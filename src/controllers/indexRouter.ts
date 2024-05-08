import { Router } from 'express'
import attachUserToRequest from '../middlewares/attachUserToRequest'
import { getSession } from '../utils/database'
import { handleEmptySession, handleNewHabit, handleRemoveHabit } from './sessionHandlers'

const baseRouter = Router()

baseRouter.post('/', attachUserToRequest, async (req, res) => {
  const user = (req as any).user // Now you can use user directly
  const session = await getSession(user.id)

  if (!session || session.state === 'INITIAL') {
    handleEmptySession(req, res, user)
  } else if (session.state.startsWith('HABIT_REMOVE')) {
    handleRemoveHabit(req, res, user, session)
  } else if (session.state.startsWith('NEW_HABIT')) {
    handleNewHabit(req, res, user, session)
  }
})

export { baseRouter }
