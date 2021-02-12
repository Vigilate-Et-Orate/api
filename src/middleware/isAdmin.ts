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
    if (typeof decoded !== 'string') {
      req.params.userId = decoded._id ? decoded._id : decoded.id
      const user = await UsersModel.findById(
        decoded.id ? decoded.id : decoded._id
      )
      if (!user || !user.admin) throw new UnauthorizedAdminError()
    } else {
      const user = await UsersModel.findById(decoded)
      if (!user || !user.admin) throw new UnauthorizedAdminError()
      req.params.userId = decoded
    }
  } catch (e) {
    res.status(e.getStatusCode()).json({ error: e.message })
    return
  }
  next()
}

export default isAdmin
