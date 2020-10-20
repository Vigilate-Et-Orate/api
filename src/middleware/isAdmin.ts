import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import {
  InvalidTokenError,
  UnauthorizedAdminError,
} from '../Error/UnauthorizedError'

import UsersModel from '../db/models/UsersModel'

const isAdmin = async (
  req: Request,
  res: Response,
  next: () => void
): Promise<void> => {
  const { authorization } = req.headers
  const { token } = req.query

  try {
    if (!authorization && !token) throw new UnauthorizedAdminError()
    const decoded = authorization
      ? jwt.decode(authorization)
      : jwt.decode(token as string)
    if (!decoded) throw new InvalidTokenError()
    const userId = typeof decoded === 'string' ? decoded : decoded.id
    const user = await UsersModel.findById(userId)
    if (!user || !user.admin) throw new UnauthorizedAdminError()
    req.params.userId = userId
  } catch (e) {
    res.status(e.getStatusCode()).json({ error: e.message })
    return
  }
  next()
}

export default isAdmin
