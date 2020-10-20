import mongoose from 'mongoose'

export const connect = async (dbConnectionString: string): Promise<void> => {
  if (mongoose.connection.readyState === 0 && dbConnectionString) {
    await mongoose.connect(dbConnectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
  }
}

export const disconnect = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
  }
}
