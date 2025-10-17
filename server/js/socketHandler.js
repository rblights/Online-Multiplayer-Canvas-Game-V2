const { CANVAS } = require('../../config/js/gameConfig')

function initSocketEvents(io, gameManager) {

    gameManager.on('playerStateUpdate', (gameID, playerStates) => {
            io.to(gameID).emit('playerStateUpdate', playerStates)
            playerStates.map(p => p.id)
            console.log(playerStates)
    })
    
    io.on('connection', (socket) => {

        console.log(`A user connected: ${socket.id}`)

        gameManager.addPlayerToQueue(socket)

        const matchData = gameManager.checkForMatch()

        if (matchData) {
            const { gameID, player1, player2, serverPlayers } = matchData

            player1.socket.join(gameID)
            player2.socket.join(gameID)

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

            // player leaves active game
        })

        // other game events

        socket.on('playerInput', (keycode, gameID, playerID) => {

            switch (keycode) {
                case 'KeyW':
                    gameManager.activeGames[gameID].players[playerID].isAccelerating = true
                    // console.log(gameManager.activeGames[gameID].players[playerID])
                    break
                case 'KeyA':
                    gameManager.activeGames[gameID].players[playerID].isTurningLeft = true
                    break
                case 'KeyS':
                    gameManager.activeGames[gameID].players[playerID].isBraking = true
                    break
                case 'KeyD':
                    gameManager.activeGames[gameID].players[playerID].isTurningRight = true
                    break

                case 'Space':
                    
                    break
            }
        


            switch (keycode) {
                case 'KeyWUp':
                    gameManager.activeGames[gameID].players[playerID].isAccelerating = false
                    break
                case 'KeyAUp':
                    gameManager.activeGames[gameID].players[playerID].isTurningLeft = false
                    break
                case 'KeySUp':
                    gameManager.activeGames[gameID].players[playerID].isBraking = false
                    break
                case 'KeyDUp':
                    gameManager.activeGames[gameID].players[playerID].isTurningRight = false
                    break
            }
            
        })

    })
}

module.exports = { initSocketEvents }