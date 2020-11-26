import { Request, Response } from 'express'
import { Expo, ExpoPushMessage } from 'expo-server-sdk'

import DevicesModel from '../db/models/DevicesModel'
import { MissingParamError, BadParameterError } from '../Error/BadRequestError'
import { DbNotFoundError } from '../Error/DataBaseError'
import BaseError from '../Error/BaseError'
import UsersModel from '../db/models/UsersModel'

class DevicesController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const expo = new Expo()
      const { token, name } = req.body
      const { userId } = req.params

      if (!token || !userId) throw new MissingParamError()
      if (!Expo.isExpoPushToken(token)) throw new BadParameterError()

      const device = await DevicesModel.create({
        name,
        token,
        user: userId,
      })
      const user = await UsersModel.findById(userId)
      if (!user) throw new DbNotFoundError()
      user.devices.push(device._id)
      user.save()

      const message: ExpoPushMessage = {
        to: token,
        sound: 'default',
        title: 'Appareil Enregistré !',
        subtitle: 'Votre Appareil recevra désormais les notifications',
      }
      const chunks = expo.chunkPushNotifications([message])
      if (process.env.NODE_ENV !== 'test')
        chunks.forEach((chunk) => expo.sendPushNotificationsAsync(chunk))

      res.json({
        id: device._id,
        name: device.name,
        token: device.token,
      })
    } catch (e) {
      if (e instanceof BaseError)
        res.status(e.getStatusCode()).json({ error: e.message })
      else res.status(500).json({ error: e.message })
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { name, token } = req.body
      const { userId, id } = req.params

      if (!id && !userId) throw new MissingParamError()

      const device = await DevicesModel.findById(id)
      if (!device) throw new DbNotFoundError()

      device.name = name && name != device.name ? name : device.name
      device.token = token && device.token != token ? token : device.token
      device.save()

      res.json({
        id: device._id,
        name: device.name,
        token: device.token,
      })
    } catch (e) {
      res.status(e.getStatusCode()).json({ error: e.message })
    }
  }

  async all(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params

      if (!userId) throw new MissingParamError()
      const user = await UsersModel.findById(userId)
      if (!user) throw new DbNotFoundError()
      await user.populate('devices').execPopulate()

      res.json(user.devices)
    } catch (e) {
      if (e instanceof BaseError)
        res.status(e.getStatusCode()).json({ error: e.message })
      else res.status(500).json({ error: e.message })
    }
  }

  async retrieve(req: Request, res: Response): Promise<void> {
    try {
      const { id, userId } = req.params

      if (!id && !userId) throw new MissingParamError()
      const device = await DevicesModel.findOne({ _id: id })
      if (!device) res.status(404).json({ message: 'Device Not Found' })
      else
        res.json({
          id: device._id,
          name: device.name,
          token: device.token,
        })
    } catch (e) {
      res.status(e.getStatusCode()).json({ error: e.message })
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id, userId } = req.params

      if (!id && !userId) throw new MissingParamError()

      const device = await DevicesModel.findByIdAndDelete(id)
      res.json(device)
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  }
}

export default new DevicesController()
