import { Request, Response } from 'express'
import { DbNotFoundError } from '../Error/DataBaseError'

import NotifModel from '../db/models/NotificationModel'
import { BadParameterError, MissingParamError } from '../Error/BadRequestError'
import BaseError from '../Error/BaseError'
import { isTime } from '../utils/timeManager'

class NotifController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { time, prayerContentId, type, itemId } = req.body
      const { userId } = req.params

      if (!time || !itemId || !type) throw new MissingParamError()
      if (!prayerContentId && type === 'prayer') throw new MissingParamError()
      if (!isTime(time)) throw new BadParameterError()
      const n = await NotifModel.findOne({
        notificationContent:
          type === 'prayer' ? prayerContentId : '603d0f2bdac4380006256de0',
        user: userId,
        type,
        time,
      })
      if (n) {
        res.json({
          id: n._id,
          type: n.type,
          itemId: n.itemId,
          notificationContent: n.notificationContent,
          time: n.time,
        })
        return
      }
      const notif = await NotifModel.create({
        notificationContent:
          type === 'prayer' ? prayerContentId : '603d0f2bdac4380006256de0',
        type,
        itemId,
        time,
        user: userId,
      })
      res.json({
        _id: notif._id,
        type: notif.type,
        itemId: notif.itemId,
        notificationContent: notif.notificationContent,
        time: notif.time,
      })
    } catch (e) {
      if (e instanceof BaseError)
        res.status(e.getStatusCode()).json({ error: e.message })
      else res.status(500).json({ error: e.message })
    }
  }

  async all(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params

      const notifs = await NotifModel.find({ user: userId })

      res.json(notifs)
    } catch (e) {
      if (e instanceof BaseError)
        res.status(e.getStatusCode()).json({ error: e.message })
      else res.status(500).json({ error: e.message })
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { time } = req.body
      const { id } = req.params

      if (!id || !time) throw new MissingParamError()
      const notif = await NotifModel.findById(id)
      if (!notif) throw new DbNotFoundError()

      notif.time = time
      notif.save()

      res.json(notif)
    } catch (e) {
      if (e instanceof BaseError)
        res.status(e.getStatusCode()).json({ error: e.message })
      else res.status(500).json({ error: e.message })
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params

      if (!id) throw new MissingParamError()
      const notif = await NotifModel.findByIdAndDelete(id)

      res.json(notif)
    } catch (e) {
      if (e instanceof BaseError)
        res.status(e.getStatusCode()).json({ error: e.message })
      else res.status(500).json({ error: e.message })
    }
  }
}

export default new NotifController()
