const express = require('express')
const http = require('http')
const { Server } = require('socket.io')

const { PORT } = require('./config/js/gameConfig')
const GameManager = require('./server/js/GameManager')
const { initSocketEvents } = require('./server/js/socketHandler')
console.log(GameManager)

const app = express()
const server = http.createServer(app)
const io = new Server(server)

const gameManager = new GameManager()


app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
})

initSocketEvents(io, gameManager)

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})