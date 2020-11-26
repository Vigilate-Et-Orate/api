import mongoose, { Document } from 'mongoose'

interface IPrayer {
  displayName: string
  name: string
  content: string
  description: string
  notificationContent: string
}

export interface IPrayerDoc extends Document, IPrayer {}

const prayerSchema = new mongoose.Schema({
  displayName: { type: String, required: true },
  name: { type: String, required: true },
  content: { type: String, required: true },
  description: { type: String, required: true },
  notificationContent: {
    type: mongoose.Schema.Types.ObjectId,
    refs: 'notificationContents',
    required: true,
  },
})

const PrayerModel = mongoose.model<IPrayerDoc>('prayers', prayerSchema)

export default PrayerModel
