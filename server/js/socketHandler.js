const { CANVAS } = require('../../config/js/gameConfig')

function initSocketEvents(io, gameManager) {
    
    io.on('connection', (socket) => {
        console.log(`A user connected: ${socket.id}`)

        gameManager.addPlayerToQueue(socket)

        const matchData = gameManager.checkForMatch()

        if (matchData) {
            const { gameID, player1, player2, playerStates } = matchData

            player1.socket.join(gameID)
            player2.socket.join(gameID)

            player1.socket.emit('gameStart', {
                gameID: gameID,
                playerID: player1.id,
                role: 'P1',
                players: playerStates,
                canvas: CANVAS
            })
            player2.socket.emit('gameStart', {
                gameID: gameID,
                playerID: player2.id,
                role: 'P2',
                players: playerStates,
                canvas: CANVAS
            })
        }

        socket.on('disconnect', (reason) => {
            console.log(`User ${socket.id} disconnected. Reason: ${reason}`)

            if (gameManager.removePlayerFromQueue(socket.id)) {
                console.log(`Removed ${socket.id} from queue. Players in queue: ${gameManager.playerQueue.length}`)
            }

            // player leaves active game
        })

        // other game events
    })
}

module.exports = { initSocketEvents }