import { Request, Response } from 'express'

import NotifModel from '../db/models/NotificationModel'
import { BadParameterError, MissingParamError } from '../Error/BadRequestError'
import BaseError from '../Error/BaseError'
import { isTime } from '../utils/timeManager'

class NotifController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { time, prayerContentId } = req.body
      const { userId } = req.params

      if (!prayerContentId || !time) throw new MissingParamError()
      if (!isTime(time)) throw new BadParameterError()
      const n = await NotifModel.findOne({
        notificationContent: prayerContentId,
        user: userId,
        time,
      })
      if (n) {
        res.json({
          id: n._id,
          notificationContent: n.notificationContent,
          time: n.time,
        })
        return
      }
      const notif = await NotifModel.create({
        notificationContent: prayerContentId,
        time,
        user: userId,
      })
      res.json({
        _id: notif._id,
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
