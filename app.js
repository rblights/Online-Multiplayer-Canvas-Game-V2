const express = require('express')
const http = require('http')
const { Server } = require('socket.io')

const { PORT } = require('./config/js/gameConfig.js')
const ServerGameManager = require('./server/js/ServerGameManager.js')
const { initSocketEvents } = require('./server/js/socketHandler.js')

const app = express()
const server = http.createServer(app)
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000})

const serverGameManager = new ServerGameManager()


app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
})

initSocketEvents(io, serverGameManager)

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})