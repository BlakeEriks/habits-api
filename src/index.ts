import { PrismaClient } from '@prisma/client'
import cors from 'cors'
import express from 'express'
import morgan from 'morgan'
import { baseRouter } from './controllers/indexRouter'

const prisma = new PrismaClient()

const app = express()

app.use(morgan('tiny'))
app.use(express.json())
app.use(cors({ origin: '*' }))

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
