import BaseError from './BaseError'

export class UnauthorizedAccessError extends BaseError {
  constructor() {
    super('Unauthorized Request', 401)
    Object.setPrototypeOf(this, BaseError.prototype)
  }
}

export class UnauthorizedAdminError extends BaseError {
  constructor() {
    super('Unauthorized Access, Not Admin', 401)
    Object.setPrototypeOf(this, BaseError.prototype)
  }
}

export class InvalidTokenError extends BaseError {
  constructor() {
    super('Invalid Token', 401)
    Object.setPrototypeOf(this, BaseError.prototype)
  }
}
