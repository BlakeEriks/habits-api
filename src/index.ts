import { Prisma, PrismaClient } from '@prisma/client'
import cors from 'cors'
import express from 'express'
import morgan from 'morgan'

const prisma = new PrismaClient()

const app = express()

app.use(morgan('tiny'))
app.use(express.json())
app.use(cors({ origin: '*' }))

const baseRouter = express.Router()

baseRouter.post('/', async (req, res) => {
  const { number, text } = req.body

  // Check if the number exists in the database
  let user = await prisma.user.findUnique({
    where: {
      phone_number: number,
    },
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        phone_number: number,
        name: '',
      },
    })
    console.log('User created for number: ', number)
  }

  const session = await prisma.userSession.findFirst({
    where: {
      userId: user.id,
    },
  })

  if (!session || session.state === 'INITIAL') {
    if (text === 'help') {
      res.send('Available commands are: list, report, new')
    } else if (text === 'list') {
      res.send('List of items')
    } else if (text === 'track') {
      await prisma.userSession.upsert({
        where: {
          userId: user.id,
        },
        create: {
          userId: user.id,
          state: 'NEW_HABIT:AWAITING_HABIT_NAME',
          data: {},
        },
        update: {
          state: 'NEW_HABIT:AWAITING_HABIT_NAME',
          data: {},
        },
      })
      res.send('What is the name of the habit you would like to track?')
    } else {
      res.send('Unknown command. Type "help" for available commands.')
    }
  } else {
    switch (session.state) {
      case 'NEW_HABIT:AWAITING_HABIT_NAME':
        await prisma.userSession.update({
          where: {
            userId: user.id,
          },
          data: {
            state: 'NEW_HABIT:AWAITING_HABIT_FREQUENCY',
            data: { ...(session.data as object), habitName: text },
          },
        })
        res.send(
          'How often do you want to track this habit? Options: 1 -> Every day. 2 -> Every other day, etc'
        )
        break
      case 'NEW_HABIT:AWAITING_HABIT_FREQUENCY':
        await prisma.userSession.update({
          where: {
            userId: user.id,
          },
          data: {
            state: 'NEW_HABIT:AWAITING_HABIT_DATA_TYPE',
            data: { ...(session.data as object), frequency: text },
          },
        })
        res.send('What type of data will this habit track? Options: number, bool, time')
        break
      case 'NEW_HABIT:AWAITING_HABIT_DATA_TYPE':
        const { habitName, frequency } = session.data as any
        const data: Prisma.HabitCreateInput = {
          user: {
            connect: {
              id: user.id,
            },
          },
          name: habitName,
          frequency,
          dataType: text,
        }

        await prisma.habit.create({ data })

        await prisma.userSession.update({
          where: {
            userId: user.id,
          },
          data: {
            state: 'INITIAL',
            data: {},
          },
        })
        res.send(`Habit '${habitName}' tracking setup complete!`)
        break
      default:
        res.send('Error in session state.')
        break
    }
  }
})

app.use('/api', baseRouter)

if (require.main === module) {
  app.listen(8000, () =>
    console.log(`
      🚀 Server ready at: http://localhost:8000
      ⭐️ See sample requests: http://pris.ly/e/ts/rest-express#3-using-the-rest-api
    `)
  )
}

export default app
