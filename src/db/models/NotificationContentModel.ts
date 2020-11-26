import mongoose, { Document } from 'mongoose'

interface INotificationContent {
  title: string
  body: string
  sound: boolean
}

export interface INotificationContentDoc
  extends Document,
    INotificationContent {}

const notificationContentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  sound: { type: Boolean, required: true },
})

const NotificationContentModel = mongoose.model<INotificationContentDoc>(
  'notificationContents',
  notificationContentSchema
)

export default NotificationContentModel
