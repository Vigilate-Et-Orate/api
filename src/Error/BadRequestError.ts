import BaseError from './BaseError'

export class MissingParamError extends BaseError {
  constructor() {
    super('Missing Parameters', 400)
    Object.setPrototypeOf(this, BaseError.prototype)
  }
}

export class WrongPwdError extends BaseError {
  constructor() {
    super('Wrong Password', 400)
    Object.setPrototypeOf(this, BaseError.prototype)
  }
}

export class NoAccountError extends BaseError {
  constructor() {
    super('No account found with this email', 400)
    Object.setPrototypeOf(this, BaseError.prototype)
  }
}
