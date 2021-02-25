import mongoose, { Document } from 'mongoose'
import { INotificationContentDoc } from './NotificationContentModel'
import { IUserDoc } from './UsersModel'

interface INotification {
  user: string | IUserDoc
  type: 'prayer' | 'intentions'
  itemId: string
  notificationContent: INotificationContentDoc | string
  time: string
}

export interface INotificationDoc extends Document, INotification {}

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    refs: 'users',
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  itemId: {
    type: String,
    required: true,
  },
  notificationContent: {
    type: mongoose.Schema.Types.ObjectId,
    refs: 'notificationContents',
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
})

const NotificationModel = mongoose.model<INotificationDoc>(
  'notifications',
  notificationSchema
)

export default NotificationModel
