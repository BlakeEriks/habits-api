import { PrismaClient } from '@prisma/client'
import { NextFunction, Request, Response } from 'express'

const prisma = new PrismaClient()

// Middleware to attach user to request
const attachUserToRequest = async (req: Request, res: Response, next: NextFunction) => {
  const { number } = req.body
  if (!number) {
    return res.status(400).send('Phone number is required')
  }

  try {
    let user = await prisma.user.findUnique({
      where: { phone_number: number },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone_number: number,
          name: '',
        },
      })
      console.log('User created for number:', number)
    }

    // Attach user to the request object
    ;(req as any).user = user

    next()
  } catch (error) {
    res.status(500).send('Failed to retrieve or create user')
    console.error('Error attaching user to request:', error)
  }
}

export default attachUserToRequest
