const { CANVAS } = require('../../config/js/gameConfig.js')
const { EventEmitter } = require('../../utils/js/EventEmitter.js')
const { ServerInputManager } = require('./Server Managers/ServerInputManager.js')

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
            const { gameID, player1, player2, serverPlayers } = matchData

            player1.socket.join(gameID)
            player2.socket.join(gameID)

            player1.socket.gameID = gameID
            player2.socket.gameID = gameID

            player1.socket.emit('gameStart', {
                gameID: gameID,
                playerID: player1.id,
                role: 'P1',
                players: serverPlayers,  //serverPlayers.map(p => p.getState())
                canvas: CANVAS
            })
            player2.socket.emit('gameStart', {
                gameID: gameID,
                playerID: player2.id,
                role: 'P2',
                players: serverPlayers,
                canvas: CANVAS
            })
            gameManager.startOrUpdateGameLoops(gameID)
        }

        socket.on('disconnect', (reason) => {
            console.log(`User ${socket.id} disconnected. Reason: ${reason}`)

            if (gameManager.removePlayerFromQueue(socket.id)) {
                console.log(`Removed ${socket.id} from queue. Players in queue: ${gameManager.playerQueue.length}`)
            }

            const disconnectedGameID = socket.gameID; 

            if (disconnectedGameID && gameManager.endGame(disconnectedGameID)) {
                console.log(`Removed ${socket.id} and ended game ${disconnectedGameID}.`)
            }
        })
    })
}

module.exports = { initSocketEvents }