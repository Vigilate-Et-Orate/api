import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import Prometheus from 'prom-client'

import UsersModel from '../db/models/UsersModel'
import { UnauthorizedAccessError } from '../Error/UnauthorizedError'
import { DbNotFoundError } from '../Error/DataBaseError'
import { MissingParamError, WrongPwdError } from '../Error/BadRequestError'

const getUserCount = new Prometheus.Counter({
  name: 'get_user',
  help: 'Get current user informations',
})

const updateUserCount = new Prometheus.Counter({
  name: 'update_user',
  help: 'Update current user',
})

const updatePwdCount = new Prometheus.Counter({
  name: 'update_pwd_user',
  help: 'Update current user pwd',
})

class UserController {
  async update(req: Request, res: Response): Promise<void> {
    try {
      updateUserCount.inc()
      const { userId } = req.params
      const { email, firstname, lastname } = req.body

      if (!userId) throw new UnauthorizedAccessError()
      const user = await UsersModel.findById(userId)
      if (!user) throw new DbNotFoundError('User')

      const updates = {
        email: email && user?.email !== email ? email : user.email,
        firstname:
          firstname && user?.firstname !== firstname
            ? firstname
            : user.firstname,
        lastname:
          lastname && user?.lastname !== lastname ? lastname : user.lastname,
      }
      await UsersModel.findByIdAndUpdate(userId, updates)
      res.send(updates)
    } catch (e) {
      res.status(e.getStatusCode()).json({ error: e.message })
    }
  }

  async retrieve(req: Request, res: Response): Promise<void> {
    try {
      getUserCount.inc()
      const { userId } = req.params

      if (!userId) throw new UnauthorizedAccessError()
      const user = await UsersModel.findOne({ _id: userId })
      if (!user) throw new DbNotFoundError('User')

      res.json({
        user: {
          id: user._id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
        },
      })
    } catch (e) {
      res.status(e.getStatusCode()).json({ error: e.message })
    }
  }

  async updatePwd(req: Request, res: Response): Promise<void> {
    try {
      updatePwdCount.inc()
      const { password, oldPassword } = req.body
      const { userId } = req.params

      if (!userId) throw new UnauthorizedAccessError()
      if (!password || !oldPassword) throw new MissingParamError()
      const user = await UsersModel.findById(userId)
      if (!user) throw new DbNotFoundError('User')
      if (!user.password) throw new WrongPwdError()
      if (!bcrypt.compareSync(oldPassword, user.password))
        throw new WrongPwdError()
      const newPwd = {
        password:
          password && user?.password !== password ? password : user?.password,
      }
      await UsersModel.findByIdAndUpdate(userId, newPwd)

      res.json({ success: true })
    } catch (e) {
      res.status(e.getStatusCode()).json({ error: e.message })
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params

      if (!userId) throw new UnauthorizedAccessError()
      const user = await UsersModel.findByIdAndDelete(userId)
      if (!user) throw new DbNotFoundError('User')

      res.json(user)
    } catch (e) {
      res.status(e.getStatusCode()).json({ error: e.message })
    }
  }
}

export default new UserController()
