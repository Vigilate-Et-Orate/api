import Expo, { ExpoPushMessage } from 'expo-server-sdk'
import express from 'express'
import firebase from 'firebase-admin'
import morgan from 'morgan'
import schedule from 'node-schedule'

import packageDetails from '../package.json'
import firebaseConfig from '../config/vigilate-et-orate-firebase-admin.json'
import { notifTask } from './notificationTask'

class App {
  public app: express.Application

  constructor() {
    firebase.initializeApp({
      credential: firebase.credential.cert(
        firebaseConfig as firebase.ServiceAccount
      ),
      databaseURL: 'https://vigilate-et-orate.firebaseio.com',
    })
    this.app = express()
    this.config()
    this.listenToNewDevices()
  }

  private config(): void {
    this.app.use(
      morgan(':method :url :status - :response-time ms', {
        skip: (_req, _res) => process.env.NODE_ENV === 'test',
      })
    )
    this.app.get('/', (_req, res) => {
      const infos = {
        name: packageDetails.description,
        version: packageDetails.version,
        repository: packageDetails.repository,
        author: `Made with ♥ by ${packageDetails.author}`,
      }
      res.json(infos)
    })
    // Notification Task
    schedule.scheduleJob('Notification', '*/1 * * * *', notifTask)
  }

  private listenToNewDevices() {
    firebase
      .firestore()
      .collectionGroup('devices')
      .onSnapshot((snap) => {
        const expo = new Expo()
        const messages: ExpoPushMessage[] = []
        snap.docs.forEach((doc) => {
          const data = doc.data()
          const message: ExpoPushMessage = {
            to: data.token,
            title: 'Appareil Enregistré',
            sound: 'default',
            channelId: 'device-added',
          }
          if (data.notified) return
          else {
            doc.ref.update({
              notified: true,
            })
            messages.push(message)
          }
        })
        const chunks = expo.chunkPushNotifications(messages)
        chunks.forEach((chunk) => expo.sendPushNotificationsAsync(chunk))
      })
  }
}

export default App
