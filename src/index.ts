import App from './app'

const port = process.env.PORT || 4000

const app = new App().app

const server = app.listen(port, () => {
  console.info(`Server Listeneing on PORT ${port}`)
})

export default server
