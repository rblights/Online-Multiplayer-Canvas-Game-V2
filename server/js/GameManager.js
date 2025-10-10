const { PLAYERS_PER_GAME } = require('../../config/js/gameConfig.js')
const { InitPlayerState } = require('./serverPlayer.js')

class GameManager {
    constructor() {
        this.playerQueue = []
        this.activeGames = {}
        this.nextGameID = 1
    }

    addPlayerToQueue(socket) {
        this.playerQueue.push({
            id: socket.id,
            socket: socket
        })
    }

    removePlayerFromQueue(id) {
        const queueIndex = this.playerQueue.findIndex(p => p.id === id)
        if (queueIndex !== -1) {
            this.playerQueue.splice(queueIndex, 1)
            return true
        }
        return false
    }

    checkForMatch() {
        if (this.playerQueue.length >= PLAYERS_PER_GAME) {
            const gameID = `GAME_${this.nextGameID++}`

            const [player1, player2] = [this.playerQueue.shift(), this.playerQueue.shift()]

            const state1 = InitPlayerState(player1.id, 'P1')
            const state2 = InitPlayerState(player2.id, 'P2')

            this.activeGames[gameID] = {
                players: {
                    [player1.id]: state1,
                    [player2.id]: state2
                },
                sockets: {
                    [player1.id]: player1.socket,
                    [player2.id]: player2.socket
                }
            }

            console.log(`Starting new game ${gameID} with ${player1.id} and ${player2.id}`)

            return {
                gameID,
                player1,
                player2,
                playerStates: [state1, state2]
            }
        }
        return null
    }



}

module.exports = GameManager

