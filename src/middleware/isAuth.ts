import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { UnauthorizedAccessError } from '../Error/UnauthorizedError'

const isAuth = (req: Request, res: Response, next: () => void): void => {
  const { authorization } = req.headers
  const { token } = req.query

  if (!authorization && !token) {
    const e = new UnauthorizedAccessError()
    res.status(e.getStatusCode()).json({ error: e.message })
    throw e
  }

  const decoded = authorization
    ? jwt.decode(authorization)
    : jwt.decode(token as string)
  if (!decoded) {
    res.status(500)
    return next()
  }
  req.params.userId = typeof decoded === 'string' ? decoded : decoded.id
  next()
}

export default isAuth
