const app = require('./app')
const http = require('http')
// const express = require('express')
// const app = express()
// const cors = require('cors')


const config = require('./utils/config')
const logger = require('./utils/logger')

// app.use(cors())
// app.use(express.json())

const server = http.createServer(app)

server.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
})