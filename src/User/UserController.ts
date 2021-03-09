import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import * as fireadmin from 'firebase-admin'

import UsersModel from '../db/models/UsersModel'
import { UnauthorizedAccessError } from '../Error/UnauthorizedError'
import { DbNotFoundError } from '../Error/DataBaseError'
import { MissingParamError, WrongPwdError } from '../Error/BadRequestError'

let fauth: fireadmin.auth.Auth
if (process.env.NODE_ENV !== 'test') {
  const serviceAdmin = require('../../config/vigilate-et-orate-firebase-admin.json')
  const fire = fireadmin.initializeApp({
    credential: fireadmin.credential.cert(
      serviceAdmin as fireadmin.ServiceAccount
    ),
    databaseURL: 'https://vigilate-et-orate.firebaseio.com',
  })
  fauth = fire.auth()
}

class UserController {
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { userId, id } = req.params
      const { email, firstname, lastname } = req.body

      if (!id && !userId) throw new MissingParamError()
      const user = await UsersModel.findById(id || userId)
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
      if (process.env.NODE_ENV !== 'test') {
        const fireuserUid = (await fauth.getUserByEmail(user.email)).uid
        fauth.updateUser(fireuserUid, updates)
      }
      res.send(updates)
    } catch (e) {
      res.status(e.getStatusCode()).json({ error: e.message })
    }
  }

  async retrieve(req: Request, res: Response): Promise<void> {
    try {
      const { userId, id } = req.params

      if (!userId && !id) throw new MissingParamError()
      const user = await UsersModel.findOne({ _id: id || userId })
      if (!user) throw new DbNotFoundError('User')
      await user.populate('devices').execPopulate()

      res.json({
        user: {
          id: user._id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          admin: user.admin,
          devices: user.devices,
        },
      })
    } catch (e) {
      res.status(e.getStatusCode()).json({ error: e.message })
    }
  }

  async all(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params

      if (!userId) throw new UnauthorizedAccessError()
      const users = await UsersModel.find()
      users.map((u) => ({
        _id: u._id,
        firstname: u.firstname,
        lastname: u.lastname,
        email: u.email,
        admin: u.admin,
        devices: u.devices,
      }))
      res.json({ users })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  }

  async updatePwd(req: Request, res: Response): Promise<void> {
    try {
      const { password } = req.body
      const { userId, id } = req.params

      if (!userId && !id) throw new UnauthorizedAccessError()
      if (!password) throw new MissingParamError()
      const user = await UsersModel.findById(id || userId)
      if (!user) throw new DbNotFoundError('User')
      if (!user.password) throw new WrongPwdError()
      const newPwd =
        password && user?.password !== password
          ? bcrypt.hashSync(password, 12)
          : user?.password
      user.password = newPwd
      user.save()
      if (process.env.NODE_ENV !== 'test') {
        const uid = (await fauth.getUserByEmail(user.email)).uid
        fauth.updateUser(uid, {
          password: newPwd,
        })
      }

      res.json({ success: true })
    } catch (e) {
      res.status(e.getStatusCode()).json({ error: e.message })
    }
  }

  // async updatePwd(req: Request, res: Response): Promise<void> {
  //   try {
  //     updatePwdCount.inc()
  //     const { password, oldPassword } = req.body
  //     const { userId, id } = req.params

  //     if (!userId && !id) throw new UnauthorizedAccessError()
  //     if (!password || !oldPassword) throw new MissingParamError()
  //     const user = await UsersModel.findById(id || userId)
  //     if (!user) throw new DbNotFoundError('User')
  //     if (!user.password) throw new WrongPwdError()
  //     if (!bcrypt.compareSync(oldPassword, user.password))
  //       throw new WrongPwdError()
  //     const newPwd = {
  //       password:
  //         password && user?.password !== password ? password : user?.password,
  //     }
  //     await UsersModel.findByIdAndUpdate(userId, newPwd)

  //     res.json({ success: true })
  //   } catch (e) {
  //     res.status(e.getStatusCode()).json({ error: e.message })
  //   }
  // }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { userId, id } = req.params

      if (!userId && !id) throw new MissingParamError()
      const user = await UsersModel.findByIdAndDelete(id || userId)
      if (!user) throw new DbNotFoundError('User')
      if (process.env.NODE_ENV !== 'test') {
        const fuid = (await fauth.getUserByEmail(user.email)).uid
        fauth.deleteUser(fuid)
      }

      res.json(user)
    } catch (e) {
      res.status(e.getStatusCode()).json({ error: e.message })
    }
  }
}

export default new UserController()
