import mongoose, { Document } from 'mongoose'
import { INotificationContentDoc } from './NotificationContentModel'
import { IDeviceDoc } from './DevicesModel'

interface INotification {
  device: IDeviceDoc | string
  notificationContent: INotificationContentDoc | string
}

export interface INotificationDoc extends Document, INotification {}

const notificationSchema = new mongoose.Schema({
  device: {
    type: mongoose.Schema.Types.ObjectId,
    refs: 'devices',
    required: true,
  },
  notificationContent: {
    type: mongoose.Schema.Types.ObjectId,
    refs: 'notificationContents',
    required: true,
  },
})

const NotificationModel = mongoose.model<INotificationDoc>(
  'notifications',
  notificationSchema
)

export default NotificationModel
