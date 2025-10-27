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

        if (currentInputs.keySpace && currentInputs.predictedProjectileID) {
            this.gameManager.addGameProjectile(player, currentInputs.predictedProjectileID)
            // console.log(currentInputs)
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