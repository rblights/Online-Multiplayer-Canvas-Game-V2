const { ServerProjectile } = require("../Server Entities/ServerProjectile.js")

class ServerInputManager {
    constructor(inputEmitter, gameManager, playerID) {
        this.inputEmitter = inputEmitter
        this.gameManager = gameManager
        this.playerID = playerID 

        this.bindEvents()

    }

    bindEvents() {
        this.inputEmitter.on('playerInput', this.handlePlayerInput.bind(this))
        this.inputEmitter.on('disconnect', this.handleDisconnect.bind(this))
        // console.log(this.playerID)
    }

    handlePlayerInput(data) {
        // console.log(data)
        const { currentInputs, currentPlayer } = data
        // console.log(currentInputs, currentPlayer)
        const game = this.gameManager.activeGames[currentPlayer.gameID]
        if (!game) return

        const player = game.players[currentPlayer.playerID]
        if (!player) return

        // player.color = currentPlayer.color

        
        player.isAccelerating = currentInputs.keyW
        player.isTurningLeft = currentInputs.keyA
        player.isBraking = currentInputs.keyS
        player.isTurningRight = currentInputs.keyD

        if (currentInputs.keySpace && Date.now() - player.lastFireTime >= player.fireRateDelay) {
            player.wasSpacePressedLastTick = true
            const projectileData = {
                gameID: player.gameID,
                playerID: player.playerID,
                projectileID: currentInputs.predictedProjectileID,
                x: player.xPos + (4 / 3) * player.radius * Math.cos(player.angle),
                y: player.yPos - (4 / 3) * player.radius * Math.sin(player.angle),
                radius: 3,
                color: player.color,
                velocity: {x: Math.cos(player.angle), y: -Math.sin(player.angle)},
                projectileSpeed: player.projectileSpeed
            }
            // console.log(player)
            // console.log(projectileData)
            this.gameManager.addGameProjectile(projectileData)
            player.lastFireTime = Date.now()
            
            
        }

        if (!currentInputs.keySpace) {
            player.wasSpacePressedLastTick = false;
        }
        

        
        player.lastProcessedInputSequence = currentInputs.sequenceNumber
        // console.log(player.lastProcessedInputSequence)
        
    }

    handleDisconnect(data) {
        const { reason } = data
        console.log(`User ${this.playerID} disconnected. Reason: ${reason}`)
        this.gameManager.removePlayerFromQueue(this.playerID)
        // this.gameManager.handleGamePlayerLeave(this.playerID)
    }
}

module.exports = { ServerInputManager }