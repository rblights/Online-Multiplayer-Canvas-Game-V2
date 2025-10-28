const { PLAYERS_PER_GAME } = require('../../../config/js/gameConfig.js')
const { InitPlayerState } = require('../initPlayerState.js')
const { ServerPlayer } = require('../Server Entities/ServerPlayer.js')
const { EventEmitter } = require('../../../utils/js/EventEmitter.js')
const { ServerProjectileManager } = require('./ServerProjectileManager.js')
const { ServerCollisionManager } = require('../Server Managers/ServerCollisionManager.js')

class GameManager extends EventEmitter {
    constructor() {
        super()
        this.playerQueue = []
        this.activeGames = {}
        this.nextGameID = 1
        this.gameLoops = {}
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

            const serverPlayer1 = new ServerPlayer({
                ...state1,
                gameID: gameID
            })
            console.log('ServerPlayer1: ', serverPlayer1)

            const serverPlayer2 = new ServerPlayer({
                ...state2,
                gameID: gameID
            })
            console.log('ServerPlayer2: ', serverPlayer2)

            const serverProjectileManager = new ServerProjectileManager()

            this.activeGames[gameID] = {
                players: {
                    [player1.id]: serverPlayer1,
                    [player2.id]: serverPlayer2
                },
                sockets: {
                    [player1.id]: player1.socket,
                    [player2.id]: player2.socket
                },
                serverProjectileManager: serverProjectileManager,
                serverCollisionManager: new ServerCollisionManager(20, serverProjectileManager)
            }
            
            this.startOrUpdateGameLoops(gameID)
            console.log(`Starting new game ${gameID} with ${player1.id} and ${player2.id}`)

            return {
                gameID,
                player1,
                player2,
                serverPlayers: [serverPlayer1, serverPlayer2]
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

    startOrUpdateGameLoops(gameID) {
        if (this.gameLoops[gameID]) return
        if (!this.activeGames[gameID]) return

        console.log(`Starting game loop for ${gameID}`)
        this.gameLoops[gameID] = setInterval(() =>{
            if (!this.activeGames[gameID]) {
                clearInterval(this.gameLoops[gameID])
                delete this.gameLoops[gameID]
                return
            }

            const playersToUpdate = Object.values(this.activeGames[gameID].players)
            const updatedPlayerStates = []

            playersToUpdate.forEach(serverPlayer => {
                serverPlayer.update()
                updatedPlayerStates.push(serverPlayer.getState())
                // console.log(serverPlayer.getState().lastProcessedInputSequence)
            })
            // console.log(updatedPlayerStates)

            const serverProjectileManager = this.activeGames[gameID].serverProjectileManager
            const serverCollisionManager = this.activeGames[gameID].serverCollisionManager

            const updatedProjectileStates = serverProjectileManager.update()
            // console.log(updatedProjectileStates)

            serverCollisionManager.checkCollisions(playersToUpdate, serverProjectileManager.getProjectiles())
            // console.log(serverProjectileManager.getStates())

            setTimeout(() => {
            this.emit('playerStateUpdate', gameID, updatedPlayerStates)
            this.emit('projectileStateUpdate', gameID, serverProjectileManager.getStates())
            
            }, 10);

        }, 1000 / 60 )


    }

    endGame(gameID) {
        if (this.gameLoops[gameID]) {
            clearInterval(this.gameLoops[gameID])
            delete this.gameLoops[gameID]
            console.log(`Stopped game loop for ${gameID}`)
        }

        if (this.activeGames[gameID]) {
            delete this.activeGames[gameID]
            console.log(`Game ${gameID} officially ended and removed.`)
        }
    }



}

module.exports = GameManager

