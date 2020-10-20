import request from 'supertest'

import App from '../src/app'
import testDb from './dbtest'

let app: Express.Application
let token: string
let userId: string

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

describe('User - Get current user', () => {
  it('Get user with good token', async () => {
    const res = await request(app)
      .get('/me')
      .set('Authorization', token)
      .set('Accept', 'application/json')
    expect(res.status).toEqual(200)
    expect(res.body.user).toBeDefined()
    expect(res.body.user).toEqual({
      id: userId,
      email: 'test@test.test',
      lastname: 'test',
      firstname: 'test',
    })
  })

  it('Get user with bad token', async () => {
    const res = await request(app)
      .get('/me')
      .set('Authorization', 'false.token.haha')
      .set('Accept', 'application/json')
    expect(res.status).toEqual(401)
  })
})

describe('User - Update current user', () => {
  it('Update user with good token', async () => {
    const res = await request(app)
      .patch('/me')
      .send({
        email: 'test@updated.me',
        firstname: 'testtest',
        lastname: 'testtest',
      })
      .set('Authorization', token)
      .set('Accept', 'application/json')
    expect(res.status).toEqual(200)
    expect(res.body).toEqual({
      email: 'test@updated.me',
      lastname: 'testtest',
      firstname: 'testtest',
    })
  })

  it('Update user only email', async () => {
    const res = await request(app)
      .patch('/me')
      .send({
        email: 'test@updated.test',
      })
      .set('Authorization', token)
      .set('Accept', 'application/json')
    expect(res.status).toEqual(200)
    expect(res.body).toEqual({
      email: 'test@updated.test',
      lastname: 'testtest',
      firstname: 'testtest',
    })
  })

  it('Updated user with bad token', async () => {
    const res = await request(app)
      .patch('/me')
      .send({
        email: 'test@updated.me',
      })
      .set('Authorization', 'false.token.haha')
      .set('Accept', 'application/json')
    expect(res.status).toEqual(401)
  })
})

describe('User - Update password', () => {
  it('Update user pwd with good token', async () => {
    const res = await request(app)
      .put('/me')
      .send({
        oldPassword: 'testtest',
        password: 'secret',
      })
      .set('Authorization', token)
      .set('Accept', 'application/json')
    expect(res.status).toEqual(200)
    expect(res.body).toEqual({
      success: true,
    })
  })

  it('Update user pwd with bad token', async () => {
    const res = await request(app)
      .put('/me')
      .send({
        oldPassword: 'testtest',
        password: 'secret',
      })
      .set('Authorization', 'false.token.haha')
      .set('Accept', 'application/json')
    expect(res.status).toEqual(401)
  })

  it('Update user pwd with bad old pwd', async () => {
    const res = await request(app)
      .put('/me')
      .send({
        oldPassword: 'test',
        password: 'secret',
      })
      .set('Authorization', token)
      .set('Accept', 'application/json')
    expect(res.status).toEqual(400)
  })
})

describe('User - Delete User', () => {
  it('Delete user with good token', async () => {
    const res = await request(app)
      .delete(`/me/${userId}`)
      .set('Authorization', token)
      .set('Accept', 'application/json')
    expect(res.status).toEqual(200)
  })

  it('Delete user with bad token', async () => {
    const res = await request(app)
      .delete(`/me/${userId}`)
      .set('Authorization', 'false.token.haha')
      .set('Accept', 'application/json')
    expect(res.status).toEqual(401)
  })
})
