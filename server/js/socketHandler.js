const { CANVAS } = require('../../config/js/gameConfig.js')
const { EventEmitter } = require('../../utils/js/EventEmitter.js')
const { ServerInputManager } = require('./ServerInputManager.js')

function initSocketEvents(io, gameManager) {

    gameManager.on('playerStateUpdate', (gameID, playerStates) => {
            io.to(gameID).emit('playerStateUpdate', playerStates)
            playerStates.map(p => p.id)
            // console.log(playerStates)
    })

    gameManager.on('projectileStateUpdate', (gameID, projectileStates) => {
        io.to(gameID).emit('projectileStateUpdate', projectileStates)
    })
    
    io.on('connection', (socket) => {
        console.log(`A user connected: ${socket.id}`)

        const playerInputEmitter = new EventEmitter()
        new ServerInputManager(playerInputEmitter, gameManager, socket.id)

        socket.on('playerInput', (currentInputs, currentPlayer) => {
            playerInputEmitter.emit('playerInput', { currentInputs, currentPlayer })
        })
        socket.on('disconnect', (reason) => {
            playerInputEmitter.emit('disconnect', {reason, sourceID: socket.id})
        })
        

        gameManager.addPlayerToQueue(socket)

        const matchData = gameManager.checkForMatch()

        if (matchData) {
            const { gameID, queuedPlayer1, queuedPlayer2, serverPlayers } = matchData

            queuedPlayer1.socket.join(gameID)
            queuedPlayer2.socket.join(gameID)

            queuedPlayer1.socket.gameID = gameID
            queuedPlayer2.socket.gameID = gameID

            const playerStates = serverPlayers.map(p => p.getState())

            queuedPlayer1.socket.emit('gameStart', {
                gameID: gameID,
                playerID: queuedPlayer1.id,
                role: 'P1',
                players: serverPlayers, 
                canvas: CANVAS
            })
            queuedPlayer2.socket.emit('gameStart', {
                gameID: gameID,
                playerID: queuedPlayer2.id,
                role: 'P2',
                players: serverPlayers,
                canvas: CANVAS
            })
        }

        socket.on('disconnect', (reason) => {
            console.log(`User ${socket.id} disconnected. Reason: ${reason}`)

            if (gameManager.removePlayerFromQueue(socket.id)) {
                console.log(`Removed ${socket.id} from queue. Players in queue: ${gameManager.playerQueue.length}`)
            }

            const disconnectedGameID = socket.gameID; 

           /* if (disconnectedGameID && gameManager.endGame(disconnectedGameID)) {
                console.log(`Removed ${socket.id} and ended game ${disconnectedGameID}.`)
            } */
        })
    })
}

module.exports = { initSocketEvents }