import { Request, Response } from 'express'

import PrayerModel, { IPrayerDoc } from '../db/models/PrayerModel'
import { MissingParamError } from '../Error/BadRequestError'
import { DbNotFoundError } from '../Error/DataBaseError'
import BaseError from '../Error/BaseError'
import NotificationContentModel, {
  INotificationContentDoc,
} from '../db/models/NotificationContentModel'

const getUpdate = (s: string, e: string) => {
  if (!s && e) return e
  if (!e && s) return s
  return s === e ? e : s
}

type TCreateParams = {
  prayerContent: IPrayerDoc
  notifContent: INotificationContentDoc
}

class PrayerController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { prayerContent, notifContent }: TCreateParams = req.body

      if (!notifContent || !prayerContent) throw new MissingParamError()

      const notificationContent = await NotificationContentModel.create({
        title: notifContent.title,
        sound: notifContent.sound,
        body: notifContent.body,
      })

      const prayer = await PrayerModel.create({
        displayName: prayerContent.displayName,
        name: prayerContent.name,
        content: prayerContent.content,
        description: prayerContent.description,
        notificationContent: notificationContent._id,
      })

      res.json({
        id: prayer._id,
        name: prayer.name,
        displayName: prayer.displayName,
        content: prayer.content,
        description: prayer.description,
        notificationContent,
      })
    } catch (e) {
      if (e instanceof BaseError)
        res.status(e.getStatusCode()).json({ error: e.message })
      else res.status(500).json({ error: e.message })
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { prayerContent, notifContent }: TCreateParams = req.body
      const { userId } = req.params

      if ((!prayerContent && !notifContent) || !userId)
        throw new MissingParamError()

      const prayer = await PrayerModel.findById(prayerContent.id)
      if (!prayer) throw new DbNotFoundError()

      prayer.name = getUpdate(prayerContent.name, prayer.name)
      prayer.displayName = getUpdate(
        prayerContent.displayName,
        prayer.displayName
      )
      prayer.content = getUpdate(prayerContent.content, prayer.content)
      prayer.description = getUpdate(
        prayerContent.description,
        prayer.description
      )
      prayer.save()

      let notificationContent: INotificationContentDoc | null = null
      if (notifContent) {
        notificationContent = await NotificationContentModel.findById(
          notifContent.id
        )
        if (!notificationContent) throw new DbNotFoundError()
        notificationContent.title = getUpdate(
          notifContent.title,
          notificationContent.title
        )
        notificationContent.body = getUpdate(
          notifContent.body,
          notificationContent.body
        )
        if (notifContent.sound) {
          notificationContent.sound =
            notifContent.sound === notificationContent.sound
              ? notificationContent.sound
              : notifContent.sound
        }
        notificationContent.save()
      }

      res.json({
        id: prayer._id,
        name: prayer.name,
        displayName: prayer.displayName,
        content: prayer.content,
        description: prayer.description,
        notificationContent: notificationContent,
      })
    } catch (e) {
      if (e instanceof BaseError)
        res.status(e.getStatusCode()).json({ error: e.message })
      else res.status(500).json({ error: e.message })
    }
  }

  async all(_req: Request, res: Response): Promise<void> {
    const prayers = await PrayerModel.find({})
    res.json({
      prayers,
    })
  }

  async retrieve(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params

      if (!id) throw new MissingParamError()
      const prayer = await PrayerModel.findById(id)
      if (!prayer) throw new DbNotFoundError()
      res.json({
        id: prayer._id,
        name: prayer.name,
        displayName: prayer.displayName,
        content: prayer.content,
        description: prayer.description,
      })
    } catch (e) {
      if (e instanceof BaseError)
        res.status(e.getStatusCode()).json({ error: e.message })
      else res.status(500).json({ error: e.message })
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id, userId } = req.params

      if (!id || !userId) throw new MissingParamError()

      const prayer = await PrayerModel.findByIdAndDelete(id)
      res.json(prayer)
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  }
}

export default new PrayerController()
