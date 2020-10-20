import BaseError from './BaseError'

export class DbNotFoundError extends BaseError {
  constructor(entity?: string) {
    super(`DB: ${entity || 'Entity'} Not Found`, 500)
    Object.setPrototypeOf(this, BaseError.prototype)
  }
}
