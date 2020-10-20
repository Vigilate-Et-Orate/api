import { MongoMemoryServer } from 'mongodb-memory-server'

class MemoryDatabaseServer {
  public mongodb: MongoMemoryServer

  constructor() {
    this.mongodb = new MongoMemoryServer({
      binary: {
        version: '4.0.3',
      },
      autoStart: false,
    })
  }

  start() {
    return this.mongodb.start()
  }

  stop() {
    return this.mongodb.stop()
  }

  getConnectionString() {
    return this.mongodb.getUri()
  }
}

export default new MemoryDatabaseServer()
