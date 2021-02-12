import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import * as fireadmin from 'firebase-admin'

import UsersModel, { IUserDoc } from '../db/models/UsersModel'
import {
  MissingParamError,
  NoAccountError,
  WrongPwdError,
} from '../Error/BadRequestError'
import BaseError from '../Error/BaseError'

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

class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, firstname, lastname, admin, password } = req.body

      if (!email || !firstname || !lastname || !password)
        throw new MissingParamError()

      if (process.env.NODE_ENV !== 'test' && fauth)
        await fauth.createUser({
          email,
          displayName: firstname + ' ' + lastname,
          password,
        })
      const user = await UsersModel.create({
        email,
        firstname,
        lastname,
        admin: admin || false,
        password: bcrypt.hashSync(password, 12),
        devices: [],
      })

      const token = jwt.sign(
        JSON.stringify({ id: user?._id }),
        process.env.SECRET || 'secret'
      )
      res.json({
        message: 'Account created',
        token,
        user: {
          id: user._id,
          email: user.email,
          lastname: user.lastname,
          firstname: user.firstname,
          admin: user.admin,
        },
      })
    } catch (e) {
      if (e instanceof BaseError)
        res.status(e.getStatusCode()).json({ error: e.message })
      else res.status(500).json({ error: 'An Error Occurred' + e.message })
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body

      if (!email || !password) throw new MissingParamError()

      const user = await UsersModel.findOne({ email })
      if (!user) throw new NoAccountError()
      if (!user.password) throw new WrongPwdError()
      if (bcrypt.compareSync(password, user.password)) {
        const token = jwt.sign(
          JSON.stringify(user),
          process.env.SECRET || 'secret'
        )
        res.json({
          token,
          user: {
            id: user._id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            admin: user.admin,
          },
        })
      } else {
        throw new WrongPwdError()
      }
    } catch (e) {
      res.status(e.getStatusCode()).json({ error: e.message })
    }
  }

  async social(req: Request, res: Response): Promise<void> {
    try {
      const { email, firstname, lastname, googleId, accessToken } = req.body
      let msg: string | null = null

      if (!email || !firstname || !lastname || !googleId)
        throw new MissingParamError()

      let user: IUserDoc | null
      user = await UsersModel.findOne({ googleId, email })
      if (!user) {
        msg = 'Social Registration'
        user = await UsersModel.create({
          email,
          lastname,
          firstname,
          admin: false,
          devices: [],
          googleId,
          googleAccessToken: accessToken,
        })
      }

      const token = jwt.sign(
        JSON.stringify({ id: user._id }),
        process.env.SECRET || 'secret'
      )
      res.json({
        message: msg || 'Social Login',
        token,
        user: {
          id: user._id,
          email: user.email,
          lastname: user.lastname,
          firstname: user.firstname,
          googleId: user.googleId,
        },
      })
    } catch (e) {
      res.status(e.getStatusCode()).json({ error: e.message })
    }
  }
}

export default new AuthController()
