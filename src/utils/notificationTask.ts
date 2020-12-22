import { IDeviceDoc } from '../db/models/DevicesModel'
import NotificationContentModel from '../db/models/NotificationContentModel'
import UsersModel from '../db/models/UsersModel'
import { Expo, ExpoPushMessage } from 'expo-server-sdk'
import NotifModel, { INotificationDoc } from '../db/models/NotificationModel'
import { stringToTime } from './timeManager'

const getMessagesForNotif = async (
  notif: INotificationDoc
): Promise<ExpoPushMessage[]> => {
  const msgs: ExpoPushMessage[] = []
  const user = await UsersModel.findById(notif.user)
  const notifContent = await NotificationContentModel.findById(
    notif.notificationContent
  )
  if (!user || !notifContent) throw new Error('Failed to load infos')
  await user.populate('devices').execPopulate()
  const devices = user.devices as IDeviceDoc[]
  devices.forEach((d) => {
    const m: ExpoPushMessage = {
      to: d.token,
      sound: 'default',
      title: notifContent.title,
    }
    msgs.push(m)
  })
  return msgs
}

const getMessages = async (
  notifs: INotificationDoc[]
): Promise<ExpoPushMessage[]> => {
  const messages: ExpoPushMessage[] = []

  for (const n of notifs) {
    const msgs = await getMessagesForNotif(n)
    msgs.forEach((m) => messages.push(m))
  }

  return messages
}

export const notifTask = async (): Promise<void> => {
  const expo = new Expo()
  const date = new Date(Date.now())
  const h = date.getHours()
  const m = date.getMinutes()
  let notifs = await NotifModel.find()
  if (!notifs || notifs.length === 0) return
  notifs = notifs.filter((n) => {
    const t = stringToTime(n.time)
    if (!t) return false
    return t.hour === h && t.minute === m && (t.daysLeft > 0 || t.repeat)
  })
  // Prepare notifications
  const messages: ExpoPushMessage[] = await getMessages(notifs)
  const chunks = expo.chunkPushNotifications(messages)
  // Send the notifications
  chunks.forEach((chunk) => {
    expo.sendPushNotificationsAsync(chunk)
  })
}
