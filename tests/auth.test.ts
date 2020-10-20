import request from 'supertest'

import App from '../src/app'
import testDb from './dbtest'

let app: Express.Application

jest.setTimeout(15000)

beforeAll(async () => {
  const started = await testDb.start()
  if (!started) throw new Error('Failed to start test db')
  const connectionString = await testDb.getConnectionString()
  app = new App(connectionString).app
})

afterAll(async () => {
  await testDb.stop()
})

let userId: string

describe('Auth - Register', () => {
  it('Register with good params', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        firstname: 'John',
        lastname: 'Peter',
        email: 'test@test.me',
        admin: true,
        password: 'secretpassword',
      })
      .set('Accept', 'application/json')
    expect(res.status).toEqual(200)
    expect(res.body.message).toEqual('Account created')
    expect(res.body.token).toBeDefined()
    expect(res.body.user.firstname).toEqual('John')
    expect(res.body.user.lastname).toEqual('Peter')
    expect(res.body.user.email).toEqual('test@test.me')
    expect(res.body.user.id).toBeDefined()
    userId = res.body.user.id
  })

  it('Register with dupplicate email', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        firstname: 'John',
        lastname: 'Peter',
        email: 'test@test.me',
        admin: true,
        password: 'secretpassword',
      })
      .set('Accept', 'application/json')
    expect(res.status).toEqual(500)
  })

  it('Regsiter with a missing parameter', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        firstname: 'John',
        lastname: 'Peter',
      })
      .set('Accept', 'application/json')
    expect(res.status).toEqual(400)
    expect(res.body.error).toBeDefined()
    expect(res.body.error).toEqual('Missing Parameters')
  })
})

describe('Auth - Login', () => {
  it('Login with good credentials', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        email: 'test@test.me',
        password: 'secretpassword',
      })
      .set('Accept', 'application/json')
    expect(res.status).toEqual(200)
    expect(res.body.token).toBeDefined()
    expect(res.body.user).toBeDefined()
    expect(res.body.user).toEqual({
      id: userId,
      firstname: 'John',
      lastname: 'Peter',
      email: 'test@test.me',
    })
  })

  it('Login with bad email', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        email: 'test@test.us',
        password: 'secretpassword',
      })
      .set('Accept', 'application/json')
    expect(res.status).toEqual(400)
    expect(res.body.error).toBeDefined()
    expect(res.body.error).toEqual('No account found with this email')
  })

  it('Login with bad password', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        email: 'test@test.me',
        password: 'falsesecretpassword',
      })
      .set('Accept', 'application/json')
    expect(res.status).toEqual(400)
    expect(res.body.error).toBeDefined()
    expect(res.body.error).toEqual('Wrong Password')
  })
})
describe('Auth - Social Login Registration', () => {
  it('Registration', async () => {
    const res = await request(app)
      .post('/social')
      .send({
        email: 'test@test.us',
        lastname: 'Test',
        firstname: 'Test',
        googleId: '109345798271170375564',
      })
      .set('Accept', 'application/json')
    expect(res.status).toEqual(200)
    expect(res.body.message).toEqual('Social Registration')
    expect(res.body.user).toBeDefined()
  })

  it('Login', async () => {
    const res = await request(app)
      .post('/social')
      .send({
        email: 'test@test.us',
        lastname: 'Test',
        firstname: 'Test',
        googleId: '109345798271170375564',
      })
      .set('Accept', 'application/json')
    expect(res.status).toEqual(200)
    expect(res.body.message).toEqual('Social Login')
    expect(res.body.user).toBeDefined()
  })

  it('Missing param', async () => {
    const res = await request(app)
      .post('/social')
      .send({
        email: 'test@test.us',
        lastname: 'Test',
        firstname: 'Test',
      })
      .set('Accept', 'application/json')
    expect(res.status).toEqual(400)
  })
})
