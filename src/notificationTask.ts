import { Expo, ExpoPushMessage } from 'expo-server-sdk'
import { stringToTime, timeToString } from './timeManager'
import firebase from 'firebase-admin'

const search = ['|0|R', '|1', '|2', '|3', '|4', '|5', '|6', '|7', '|8', '|9']
const getSearch = (h: number, m: number) => {
  return search.map((e) => `${h}:${m}${e}`)
}

// Types
type TNotif = {
  item: string
  time: string
  type: 'prayer' | 'intention'
  user: string
  notificationContent: string
}
type TNotifContent = {
  id: string
  title: string
  body: string
  sound: boolean
}
type TDevice = {
  id: string
  token: string
  name: string
}

const getMessages = async (notifs: TNotif[], contents: TNotifContent[]) => {
  const messages: ExpoPushMessage[] = []
  for (let index = 0; index < notifs.length; index++) {
    const n = notifs[index]
    const c = contents.find((i) => i.id == n.notificationContent)
    if (!c) continue
    const devicesSnap = await firebase
      .firestore()
      .collection('users')
      .doc(n.user)
      .collection('devices')
      .get()
    const devices = devicesSnap.docs.map((d) => {
      const data = d.data()
      return {
        id: d.id,
        name: data.name,
        token: data.token,
      } as TDevice
    })
    devices.forEach((dev) => {
      const message: ExpoPushMessage = {
        to: dev.token,
        sound: 'default',
        title: c.title,
        body: c.body,
        channelId: n.type,
      }
      messages.push(message)
    })
  }
  return messages
}

export const notifTask = async (): Promise<void> => {
  const expo = new Expo()
  const date = new Date(Date.now())
  const h = date.getHours() + date.getTimezoneOffset() / 60
  const m = date.getMinutes()
  const firestore = firebase.firestore()
  const s = getSearch(h, m)

  const notifRequest = await firestore
    .collection('notifications')
    .where('time', 'in', s)
    .get()
  const notifs: TNotif[] = notifRequest.docs.map((doc) => {
    const data = doc.data()
    const time = stringToTime(data.time)
    if (time && time.daysLeft > 0) {
      // Reduce days left
      time.daysLeft - 1
      doc.ref.update({
        time: timeToString(time),
      })
    }
    return {
      item: data.item,
      time: data.time,
      user: data.user,
      type: data.type,
      notificationContent: data.notificationContent,
    } as TNotif
  })
  const notificationContentSnap = await firestore
    .collectionGroup('notificationContent')
    .get()
  const notificationContents: TNotifContent[] = notificationContentSnap.docs.map(
    (n) => {
      const data = n.data()
      return {
        id: n.id,
        title: data.title,
        body: data.body,
        sound: data.sound,
      } as TNotifContent
    }
  )
  // Prepare Messages
  const messages: ExpoPushMessage[] = await getMessages(
    notifs,
    notificationContents
  )
  const chunks = expo.chunkPushNotifications(messages)
  chunks.forEach((chunk) => {
    expo.sendPushNotificationsAsync(chunk)
  })
  console.info(
    `[${new Date(Date.now()).toLocaleTimeString()}] - Sent ${
      messages.length
    } notifications`
  )
}
