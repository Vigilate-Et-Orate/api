import { Request, Response } from 'express'

import FavouriteModel, { IFavouriteDoc } from '../db/models/FavouriteModel'
import PrayerModel from '../db/models/PrayerModel'
import { BadParameterError, MissingParamError } from '../Error/BadRequestError'
import { DbNotFoundError } from '../Error/DataBaseError'
import BaseError from '../Error/BaseError'

class FavouriteController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { prayerId, faved, id } = req.body
      const { userId } = req.params

      // Check For Missing Params
      if ((!prayerId && !id) || !userId) throw new MissingParamError()
      // Check if PrayerId is valid
      if (prayerId) {
        const prayerCheck = await PrayerModel.findById(prayerId)
        if (!prayerCheck) throw new BadParameterError('prayerId')
      }
      // Check if fav already exists (upd8 ou cre8)
      let fav: IFavouriteDoc | null = null
      if (id) fav = await FavouriteModel.findById(id)
      else if (prayerId && !fav)
        fav = await FavouriteModel.findOne({ prayer: prayerId, user: userId })
      if (!fav) {
        // If doesn't exist, cre8
        fav = await FavouriteModel.create({
          user: userId,
          prayer: prayerId,
          faved: false,
        })
      }
      // Upd8 with faved value or toggle
      fav.faved = faved ? faved : !fav.faved
      fav.save()

      res.json({
        id: fav._id,
        prayer: fav.prayer,
        user: fav.user,
        faved: fav.faved,
      })
    } catch (e) {
      if (e instanceof BaseError)
        res.status(e.getStatusCode()).json({ error: e.message })
      else res.status(500).json({ error: e.message })
    }
  }

  async retrieve(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.body
      const { userId, prayerId } = req.params

      if ((!prayerId && !id) || !userId) throw new MissingParamError()
      let fav: IFavouriteDoc | null = null
      if (id) fav = await FavouriteModel.findById(id)
      if (prayerId && !fav)
        fav = await FavouriteModel.findOne({
          user: userId,
          prayer: prayerId,
        })
      if (!fav) throw new DbNotFoundError()
      else
        res.json({
          id: fav._id,
          prayer: fav.prayer,
          user: fav.user,
          faved: fav.faved,
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

      const favs = await FavouriteModel.find({ user: userId })
      const formated = favs.map((f) => {
        return {
          id: f._id,
          user: f.user,
          prayer: f.prayer,
          faved: f.faved,
        }
      })
      res.json(formated)
    } catch (e) {
      res.status(404).json({ message: 'Failed to get favs for this user' })
    }
  }
}

export default new FavouriteController()
