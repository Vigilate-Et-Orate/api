import express from 'express'
import * as bodyParser from 'body-parser'
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'
import schedule from 'node-schedule'
import Prometheus from 'prom-client'

import { connect } from './db/db'
import packageDetails from '../package.json'
// Routes
import AuthRoutes from './Auth/AuthRoutes'
import UsersRoutes, { meRouter } from './User/UserRoutes'
import DevicesRoutes from './Devices/DevicesRoutes'
import PrayerRoutes from './Prayer/PrayerRoutes'
import FavouriteRoutes from './Favourite/FavouriteRoutes'
import NotifsRoutes from './Notifs/NotifRoutes'
import mongoose from 'mongoose'
import { notifTask } from './utils/notificationTask'

Prometheus.collectDefaultMetrics()

class App {
  public app: express.Application

  constructor(dbConnectionString: string) {
    this.app = express()
    this.config()
    this.loadRoutes()
    this.dbConnect(dbConnectionString)
  }

  private dbConnect(dbConnectionString: string): void {
    connect(dbConnectionString)
    mongoose.connection.once('open', () =>
      console.info(`[+] - Connected to database`)
    )
  }

  private loadRoutes(): void {
    this.app.use('/', AuthRoutes)
    this.app.use('/me', meRouter)
    this.app.use('/users', UsersRoutes)
    this.app.use('/devices', DevicesRoutes)
    this.app.use('/prayers', PrayerRoutes)
    this.app.use('/favourites', FavouriteRoutes)
    this.app.use('/notifications', NotifsRoutes)
  }

  private config(): void {
    this.app.use(bodyParser.json())
    this.app.use(bodyParser.urlencoded({ extended: true }))
    this.app.use(
      morgan(':method :url :status - :response-time ms', {
        skip: (_req, _res) => process.env.NODE_ENV === 'test',
      })
    )
    this.app.use(helmet())
    this.app.use(cors())
    this.app.get('/metrics', (_req, res) => {
      res.set('Content-Type', Prometheus.register.contentType)
      res.end(Prometheus.register.metrics())
    })
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
}

export default App
