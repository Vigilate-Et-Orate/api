import request from 'supertest'

import App from '../src/app'
import testDb from './dbtest'

let app: Express.Application
let prayerId: string
let favouriteId: string
let userId: string
let token: string

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
  userId = res.body.user.id

  const res2 = await request(app)
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
  if (res2.status !== 200) return
  prayerId = res2.body._id
})

afterAll(async () => {
  await testDb.stop()
})

describe('Favourite - Add to favourite', () => {
  it('Adding Prayer To Favs - Good request', async () => {
    const res = await request(app)
      .post('/favourites')
      .send({
        prayerId: prayerId,
      })
      .set('Accept', 'application/json')
      .set('Authorization', token)
    expect(res.status).toEqual(200)
    expect(res.body.prayer).toEqual(prayerId)
    expect(res.body.faved).toEqual(true)
    expect(res.body.user).toEqual(userId)
    favouriteId = res.body.id
  })

  it('Adding with missing param', async () => {
    const res = await request(app)
      .post('/favourites')
      .send({})
      .set('Accept', 'application/json')
      .set('Authorization', token)
    expect(res.status).toEqual(400)
  })

  it('Adding without auth', async () => {
    const res = await request(app)
      .post('/favourites')
      .send({
        prayer: prayerId,
      })
      .set('Accept', 'application/json')
    expect(res.status).toEqual(401)
  })

  it('Adding with bad prayer id', async () => {
    const res = await request(app)
      .post('/favourites')
      .send({
        prayer: 'hahahafalseid',
      })
      .set('Accept', 'application/json')
      .set('Authorization', token)
    expect(res.status).toEqual(400)
  })
})

describe('Favourite - Toggle Favourite', () => {
  it('Toggle - With Id', async () => {
    const res = await request(app)
      .post('/favourites')
      .send({
        id: favouriteId,
      })
      .set('Accept', 'application/json')
      .set('Authorization', token)
    expect(res.status).toEqual(200)
    expect(res.body.faved).toEqual(false)
  })

  it('Toggle - With PrayerId', async () => {
    const res = await request(app)
      .post('/favourites')
      .send({
        prayerId: prayerId,
      })
      .set('Accept', 'application/json')
      .set('Authorization', token)
    expect(res.status).toEqual(200)
    expect(res.body.faved).toEqual(true)
  })

  it('Toggle - With both', async () => {
    const res = await request(app)
      .post('/favourites')
      .send({
        prayerId: prayerId,
        id: favouriteId,
      })
      .set('Accept', 'application/json')
      .set('Authorization', token)
    expect(res.status).toEqual(200)
    expect(res.body.faved).toEqual(false)
  })
})

describe('Favourite - Retrieve One Favourite', () => {
  it('Get - With Id', async () => {
    const res = await request(app)
      .get(`/favourites/${prayerId}`)
      .send({
        id: favouriteId,
      })
      .set('Accept', 'application/json')
      .set('Authorization', token)
    expect(res.status).toEqual(200)
    expect(res.body.prayer).toEqual(prayerId)
    expect(res.body.user).toEqual(userId)
    expect(res.body.id).toEqual(favouriteId)
  })

  it('Get - With PrayerId', async () => {
    const res = await request(app)
      .get(`/favourites/${prayerId}`)
      .set('Accept', 'application/json')
      .set('Authorization', token)
    expect(res.status).toEqual(200)
    expect(res.body.prayer).toEqual(prayerId)
    expect(res.body.user).toEqual(userId)
    expect(res.body.id).toEqual(favouriteId)
  })

  it('Get - With bad param', async () => {
    const res = await request(app)
      .get(`/favourites/blabla`)
      .set('Accept', 'application/json')
      .set('Authorization', token)
    expect(res.status).toEqual(500)
  })
})

describe('Favourites - get all fav for user', () => {
  it('Good request', async () => {
    const res = await request(app)
      .get(`/favourites`)
      .set('Accept', 'application/json')
      .set('Authorization', token)
    expect(res.status).toEqual(200)
    expect(res.body).toEqual([
      {
        faved: false,
        id: favouriteId,
        user: userId,
        prayer: prayerId,
      },
    ])
  })

  it('UnAuthed request', async () => {
    const res = await request(app).get('/favourites').set('Authrozation', token)
    expect(res.status).toEqual(401)
  })
})
