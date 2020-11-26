import mongoose, { Document } from 'mongoose'
import { IPrayerDoc } from './PrayerModel'
import { IUserDoc } from './UsersModel'

interface IFavourite {
  user: IUserDoc | string
  prayer: IPrayerDoc | string
  faved: boolean
}

export interface IFavouriteDoc extends Document, IFavourite {}

const favouriteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, refs: 'users', required: true },
  prayer: {
    type: mongoose.Schema.Types.ObjectId,
    refs: 'prayers',
    required: true,
  },
  faved: { type: Boolean, default: true },
})

const FavouriteModel = mongoose.model<IFavouriteDoc>(
  'favourites',
  favouriteSchema
)

export default FavouriteModel
