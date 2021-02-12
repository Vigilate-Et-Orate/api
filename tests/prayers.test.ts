import request from 'supertest'

import App from '../src/app'
import testDb from './dbtest'

let app: Express.Application
let token: string
let prayerId: string
let notifId: string

beforeAll(async () => {
  const started = await testDb.start()
  if (!started) throw new Error('Failed to start test db')
  const connectionString = await testDb.getConnectionString()
  app = new App(connectionString).app

  const res = await request(app)
    .post('/register')
    .send({
      email: 'test@test.test',
      lastname: 'test',
      firstname: 'test',
      admin: true,
      password: 'testtest',
    })
    .set('Accept', 'application/json')
  if (res.status !== 200 || !res.body.token) return
  token = res.body.token
})

afterAll(async () => {
  await testDb.stop()
})

describe('Prayer - create', () => {
  it('Create - Good Request', async () => {
    const res = await request(app)
      .post('/prayers')
      .send({
        prayerContent: {
          displayName: 'Angelus',
          name: 'angelus',
          content: "L'ange du Seigneur porta l'annonce a Marie",
          description: "priere de l'ange",
        },
        notifContent: {
          title: 'Angeluuus',
          sound: true,
          body: "Il est l'heure de chaner l'angelus",
        },
      })
      .set('Authorization', token)
      .set('Accept', 'application/json')
    expect(res.status).toEqual(200)
    expect(res.body.name).toEqual('angelus')
    expect(res.body.displayName).toEqual('Angelus')
    expect(res.body.description).toEqual("priere de l'ange")
    expect(res.body.content).toEqual(
      "L'ange du Seigneur porta l'annonce a Marie"
    )
    prayerId = res.body._id
    notifId = res.body.notificationContent._id
  })

  it('Create - Missing param', async () => {
    const res = await request(app)
      .post('/prayers')
      .send({
        prayerContent: {
          displayName: 'Angelus',
          name: 'angelus',
          content: "L'ange du Seigneur porta l'annonce a Marie",
          description: "priere de l'ange",
        },
      })
      .set('Authorization', token)
      .set('Accept', 'application/json')
    expect(res.status).toEqual(400)
  })
})

describe('Updating the prayer', () => {
  it('Upd8 - prayer', async () => {
    const res = await request(app)
      .patch(`/prayers/${prayerId}`)
      .send({
        prayerContent: {
          id: prayerId,
          displayName: "L'Angelus",
        },
      })
      .set('Authorization', token)
      .set('Accept', 'application/json')
    expect(res.status).toEqual(200)
    expect(res.body.displayName).toEqual("L'Angelus")
  })

  it('Upd8 - notif', async () => {
    const res = await request(app)
      .patch(`/prayers/${prayerId}`)
      .send({
        prayerContent: {
          id: prayerId,
        },
        notifContent: {
          id: notifId,
          title: 'Angelus',
        },
      })
      .set('Authorization', token)
      .set('Accept', 'application/json')
    expect(res.status).toEqual(200)
    expect(res.body.notificationContent.title).toEqual('Angelus')
  })
})

describe('Retrieve', () => {
  it('All', async () => {
    const res = await request(app)
      .get('/prayers')
      .set('Accept', 'application/json')
    expect(res.status).toEqual(200)
    expect(typeof res.body.prayers).toEqual('object')
    expect(res.body.prayers.length).toEqual(1)
  })

  it('One', async () => {
    const res = await request(app)
      .get(`/prayers/${prayerId}`)
      .set('Accept', 'application/json')
    expect(res.status).toEqual(200)
    expect(res.body).toEqual({
      _id: prayerId,
      displayName: "L'Angelus",
      name: 'angelus',
      content: "L'ange du Seigneur porta l'annonce a Marie",
      description: "priere de l'ange",
    })
  })

  it('One - Bad Id', async () => {
    const res = await request(app)
      .get(`/prayers/blalba`)
      .set('Accept', 'application/json')
    expect(res.status).toEqual(500)
  })
})

describe('Delete', () => {
  it('Deleting - Bad Id', async () => {
    const res = await request(app)
      .delete(`/prayers/blabla`)
      .set('Accept', 'application/json')
      .set('Authorization', token)
    expect(res.status).toEqual(500)
  })

  it('Deleting', async () => {
    const res = await request(app)
      .delete(`/prayers/${prayerId}`)
      .set('Accept', 'application/json')
      .set('Authorization', token)
    expect(res.status).toEqual(200)
  })
})
