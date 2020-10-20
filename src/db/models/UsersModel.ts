import mongoose, { Document } from 'mongoose'

interface IUser {
  firstname: string
  lastname: string
  email: string
  password?: string
  admin: boolean
  googleId?: string
  googleAccessToken?: string
}

export interface IUserDoc extends Document, IUser {}

const userSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: false },
  admin: { type: Boolean, required: true },
  googleId: { type: String, required: false },
  googleAccessToken: { type: String, required: false },
})

const UsersModel = mongoose.model<IUserDoc>('users', userSchema)

export default UsersModel
