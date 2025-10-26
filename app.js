const express = require('express')
const http = require('http')
const { Server } = require('socket.io')

const { PORT } = require('./config/js/gameConfig.js')
const GameManager = require('./server/js/Server Managers/GameManager.js')
const { initSocketEvents } = require('./server/js/socketHandler.js')

const app = express()
const server = http.createServer(app)
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000})

const gameManager = new GameManager()


app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
})

initSocketEvents(io, gameManager)

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})