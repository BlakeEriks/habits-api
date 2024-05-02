import { PrismaClient } from '@prisma/client'
import request from 'supertest'
import app from '../src/index'

const prisma = new PrismaClient()

beforeAll(async () => {
  // Clear test data before each test
  await prisma.habitLog.deleteMany()
  await prisma.habit.deleteMany()
  await prisma.userSession.deleteMany()
  await prisma.user.deleteMany()
})

afterAll(async () => {
  // Disconnect Prisma after all tests are done
  await prisma.$disconnect()
})

describe('POST /api', () => {
  it('responds to the help command', async () => {
    const response = await request(app)
      .post('/api')
      .send({ number: '1234567890', text: 'help' })
      .expect(200)

    expect(response.text).toBe('Available commands are: list, report, new')
  })

  it('handles unknown commands', async () => {
    const response = await request(app)
      .post('/api')
      .send({ number: '1234567890', text: 'random' })
      .expect(200)

    expect(response.text).toBe('Unknown command. Type "help" for available commands.')
  })

  it('can create new habits', async () => {
    let response = await request(app)
      .post('/api')
      .send({ number: '1234567890', text: 'track' })
      .expect(200)

    expect(response.text).toBe('What is the name of the habit you would like to track?')

    response = await request(app)
      .post('/api')
      .send({ number: '1234567890', text: 'Pushups' })
      .expect(200)

    expect(response.text).toBe(
      'How often do you want to track this habit? Options: 1 -> Every day. 2 -> Every other day, etc'
    )

    response = await request(app).post('/api').send({ number: '1234567890', text: '1' }).expect(200)

    expect(response.text).toBe(
      'What type of data will this habit track? Options: number, bool, time'
    )

    response = await request(app)
      .post('/api')
      .send({ number: '1234567890', text: 'number' })
      .expect(200)

    expect(response.text).toBe("Habit 'Pushups' tracking setup complete!")

    const habit = await prisma.habit.findFirst({
      where: {
        name: 'Pushups',
      },
    })

    expect(habit).toEqual(
      expect.objectContaining({
        frequency: '1',
        name: 'Pushups',
        dataType: 'number',
      })
    )
  })
})
