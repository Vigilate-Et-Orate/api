import * as BadRequest from '../src/Error/BadRequestError'
import * as DataBase from '../src/Error/DataBaseError'
import * as UnauthorizedError from '../src/Error/UnauthorizedError'

describe('Bad Request Error', () => {
  it('Missing Parameters', () => {
    const e = () => {
      throw new BadRequest.MissingParamError()
    }
    expect(e).toThrowError('Missing Parameters')
  })

  it('Wrong Pwd', () => {
    const e = () => {
      throw new BadRequest.WrongPwdError()
    }
    expect(e).toThrowError('Wrong Password')
  })

  it('No Account', () => {
    const e = () => {
      throw new BadRequest.NoAccountError()
    }
    expect(e).toThrowError('No account found with this email')
  })
})

describe('Unauthorized Error', () => {
  it('Unauth Access', () => {
    const e = () => {
      throw new UnauthorizedError.UnauthorizedAccessError()
    }
    expect(e).toThrowError('Unauthorized Request')
  })

  it('Unauth Admin', () => {
    const e = () => {
      throw new UnauthorizedError.UnauthorizedAdminError()
    }
    expect(e).toThrowError('Unauthorized Access, Not Admin')
  })

  it('Invalid Token', () => {
    const e = () => {
      throw new UnauthorizedError.InvalidTokenError()
    }
    expect(e).toThrowError('Invalid Token')
  })
})

describe('Db Error', () => {
  it('Entity not precised', () => {
    const e = () => {
      throw new DataBase.DbNotFoundError()
    }
    expect(e).toThrowError('DB: Entity Not Found')
  })

  it('Entity is User', () => {
    const e = () => {
      throw new DataBase.DbNotFoundError('User')
    }
    expect(e).toThrowError('DB: User Not Found')
    const error = new DataBase.DbNotFoundError()
    expect(error.getStatusCode()).toEqual(500)
  })
})
