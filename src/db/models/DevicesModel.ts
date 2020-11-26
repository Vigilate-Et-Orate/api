import mongoose, { Document } from 'mongoose'
import { IUserDoc } from './UsersModel'

interface IDevice {
  token: string
  name?: string
  user: IUserDoc | string
}

export interface IDeviceDoc extends Document, IDevice {}

const deviceSchema = new mongoose.Schema({
  token: { type: String, required: true },
  name: { type: String, required: false },
  user: { type: mongoose.Schema.Types.ObjectId, refs: 'users', required: true },
})

const DevicesModel = mongoose.model<IDeviceDoc>(
  'devices',
  deviceSchema,
  'devices'
)

export default DevicesModel
