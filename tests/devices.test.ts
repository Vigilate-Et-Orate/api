import request from 'supertest'

import App from '../src/app'
import testDb from './dbtest'

let app: Express.Application
const expoToken = 'ExponentPushToken[AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAA]'
let token: string
let userId: string
let deviceId: string

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
})

afterAll(async () => {
  await testDb.stop()
})

describe('Device - Push New', () => {
  it('Push New - Good', async () => {
    const res = await request(app)
      .post('/devices')
      .send({
        token: expoToken,
        name: 'Test Device',
      })
      .set('Authorization', token)
      .set('Accept', 'application/json')
    expect(res.status).toEqual(200)
    expect(res.body.name).toEqual('Test Device')
    expect(res.body.token).toEqual(expoToken)
    deviceId = res.body.id
  })

  it('Push New - Not Auth', async () => {
    const res = await request(app)
      .post('/devices')
      .set('Accept', 'application/json')
    expect(res.status).toEqual(401)
  })
})

describe('Device - Update', () => {
  it('Upd8 - Good', async () => {
    const res = await request(app)
      .patch(`/devices/${deviceId}`)
      .send({
        name: 'Test',
      })
      .set('Authorization', token)
      .set('Accept', 'application/json')
    expect(res.status).toEqual(200)
    expect(res.body.name).toEqual('Test')
    expect(res.body.token).toEqual(expoToken)
  })

  it('Push New - Bad device', async () => {
    const res = await request(app)
      .patch('/devices/foobar')
      .set('Accept', 'application/json')
    expect(res.status).toEqual(401)
  })
})

describe('Device - Fetch', () => {
  it('Fetch All', async () => {
    const res = await request(app)
      .get(`/devices`)
      .set('Authorization', token)
      .set('Accept', 'application/json')
    expect(res.status).toEqual(200)
    expect(res.body).toEqual([
      {
        __v: 0,
        _id: deviceId,
        name: 'Test',
        token: expoToken,
        user: userId,
      },
    ])
  })

  it('Fetch One', async () => {
    const res = await request(app)
      .get(`/devices/${deviceId}`)
      .set('Authorization', token)
      .set('Accept', 'application/json')
    expect(res.status).toEqual(200)
    expect(res.body).toEqual({
      id: deviceId,
      name: 'Test',
      token: expoToken,
    })
  })
})

describe('Device - Delete', () => {
  it('Delete - Bad Id', async () => {
    const res = await request(app)
      .delete(`/devices/foobar`)
      .set('Authorization', token)
      .set('Accept', 'application/json')
    expect(res.status).toEqual(500)
  })

  it('Delete - Good Id', async () => {
    const res = await request(app)
      .delete(`/devices/${deviceId}`)
      .set('Authorization', token)
      .set('Accept', 'application/json')
    expect(res.status).toEqual(200)
  })
})
