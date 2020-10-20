import App from './app'

const port = process.env.PORT || 4000
const dbConnectionString = process.env.DB_URL || 'mongodb://127.0.0.1:27017'

const app = new App(dbConnectionString).app

app.listen(port, () => {
  console.info(`Server Listeneing on PORT ${port}`)
})
