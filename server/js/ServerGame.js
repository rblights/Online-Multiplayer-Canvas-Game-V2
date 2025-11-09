const { EventEmitter } = require('../../utils/js/EventEmitter.js')
const { ServerPlayer } = require('./Server Entities/ServerPlayer.js')
const { ServerProjectileManager } = require('./Server Entity Managers/ServerProjectileManager.js')
const { ServerCollisionManager } = require('./Server Entity Managers/ServerCollisionManager.js')

const GAME_TICK_RATE = 1000 / 60
const COLLISION_GRIDCELL_SIZE = 20

class ServerGame extends EventEmitter {
    constructor(gameID, player1Config, player2Config, player1Socket, player2Socket) {
        super()
        this.gameID = gameID
        this.sockets = {
            [player1Config.id]: player1Socket,
            [player2Config.id]: player2Socket
        }

        this.serverProjectileManager = new ServerProjectileManager()
        this.serverCollisionManager = new ServerCollisionManager(COLLISION_GRIDCELL_SIZE, this.serverProjectileManager)

        this.players = {
            [player1Config.id]: new ServerPlayer({...player1Config.state, gameID}),
            [player2Config.id]: new ServerPlayer({...player2Config.state, gameID})
        }

        this.loopInterval = null
        console.log(`Game ${this.gameID} created with players ${player1Config.id} and ${player2Config.id}`)
    }

    updateServerGameState() {
        const serverPlayersToUpdate = Object.values(this.players)
        const updatedServerPlayerStates = []

        serverPlayersToUpdate.forEach(serverPlayer => {
            serverPlayer.update()
            updatedServerPlayerStates.push(serverPlayer.getState())
        })

        this.serverProjectileManager.update()

        this.serverCollisionManager.checkCollisions(serverPlayersToUpdate, this.serverProjectileManager.getProjectiles())

        this.emit('playerStateUpdate', this.gameID, updatedServerPlayerStates)
        this.emit('projectileStateUpdate', this.gameID, this.serverProjectileManager.getStates())
    }

    startLoop() {
        if (this.loopInterval) {
            console.log(`Game loop for ${this.gameID} already running`)
            return 
        }

        console.log(`Starting game loop for ${this.gameID}`)
        this.loopInterval = setInterval(() => {
            this.updateServerGameState()
        }, GAME_TICK_RATE)
    }

    stopLoop() {
        if (this.loopInterval) {
            clearInterval(this.loopInterval)
            this.loopInterval = null
            console.log(`Stopped game loop for ${this.gameID}`)
        }
    }

    addServerProjectile(player, projectileID) {
        return this.serverProjectileManager.addServerProjectile(player, projectileID)
    }

    getServerPlayer(playerID) {
        return this.players[playerID]
    }

    getSockets() {
        return this.sockets
    }

    getFullGameState() {
        return {
            gameID: this.gameID,
            players: Object.values(this.players).map(p => p.getState()),
            projectiles:this.serverProjectileManager.getStates()
        }
    }
}

module.exports = { ServerGame }