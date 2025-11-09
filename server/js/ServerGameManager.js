const { PLAYERS_PER_GAME } = require('../../config/js/gameConfig.js')
const { InitPlayerState } = require('./initPlayerState.js')
const { ServerGame } = require('./ServerGame.js')
const { EventEmitter } = require('../../utils/js/EventEmitter.js')

class ServerGameManager extends EventEmitter {
    constructor() {
        super()
        this.playerQueue = []
        this.activeGames = {}
        this.nextGameID = 1
    }

    addPlayerToQueue(socket) {
        this.playerQueue.push({
            id: socket.id,
            socket: socket
        })
        console.log(`Player ${socket.id} added to queue. Queue size: ${this.playerQueue.length}`)
    }

    removePlayerFromQueue(id) {
        const queueIndex = this.playerQueue.findIndex(p => p.id === id)
        if (queueIndex !== -1) {
            this.playerQueue.splice(queueIndex, 1)
            console.log(`Player ${id} removed from queue. Queue size: ${this.playerQueue.length}`)
            return true
        }
        return false
    }

    checkForMatch() {
        if (this.playerQueue.length >= PLAYERS_PER_GAME) {
            const gameID = `GAME_${this.nextGameID++}`

            const [queuedPlayer1, queuedPlayer2] = [this.playerQueue.shift(), this.playerQueue.shift()]

            const player1State = InitPlayerState(queuedPlayer1.id, 'P1')
            const player2State = InitPlayerState(queuedPlayer2.id, 'P2')

            const player1Config = {id: queuedPlayer1.id, state: player1State}
            const player2Config = {id: queuedPlayer2.id, state: player2State}

            const newServerGame = new ServerGame(gameID, player1Config, player2Config, queuedPlayer1.socket, queuedPlayer2.socket)

            newServerGame.on('playerStateUpdate', (gameID, playerStates) => {
                this.emit('playerStateUpdate', gameID, playerStates)
            })

            newServerGame.on('projectileStateUpdate', (gameID, projectileStates) => {
                this.emit('projectileStateUpdate', gameID, projectileStates)
            })

            this.activeGames[gameID] = newServerGame
            
            newServerGame.startLoop()
            console.log(`Starting new game ${gameID} with ${queuedPlayer1.id} and ${queuedPlayer2.id}`)

            return {
                gameID,
                queuedPlayer1,
                queuedPlayer2,
                serverPlayers: [newServerGame.getServerPlayer(queuedPlayer1.id), newServerGame.getServerPlayer(queuedPlayer2.id)]
            }
        }
        return null
    }

    addGameProjectile(player, projectileID) {
        const game = this.activeGames[player.gameID] 
        if (game && game.serverProjectileManager) {
            // console.log('projData in gameManager: ', projectileData)
            return game.serverProjectileManager.addServerProjectile(player, projectileID)
        }
        return null
    }

    /* endGame(gameID) {
        if (this.gameLoops[gameID]) {
            clearInterval(this.gameLoops[gameID])
            delete this.gameLoops[gameID]
            console.log(`Stopped game loop for ${gameID}`)
        }

        if (this.activeGames[gameID]) {
            delete this.activeGames[gameID]
            console.log(`Game ${gameID} officially ended and removed.`)
        }
    } */
}

module.exports = ServerGameManager

