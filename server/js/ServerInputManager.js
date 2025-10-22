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
        console.log(this.playerID)
    }

    handlePlayerInput(data) {
        const { currentInputs, gameID, playerID } = data
        const game = this.gameManager.activeGames[gameID]
        if (!game) return

        const player = game.players[playerID]
        if (!player) return

        player.isAccelerating = currentInputs.keyW
        player.isTurningLeft = currentInputs.keyA
        player.isBraking = currentInputs.keyS
        player.isTurningRight = currentInputs.keyD

        if (currentInputs.keySpace && !player.wasSpacePressedLastTick) {
            // shoot
        }
        player.wasSpacePressedLastTick = currentInputs.keySpace

        
        player.lastProccessedInputSequence = currentInputs.sequenceNumber
        // console.log(player.lastProccessedInputSequence)
    }

    handleDisconnect(data) {
        const { reason } = data
        console.log(`User ${this.playerID} disconnected. Reason: ${reason}`)
        this.gameManager.removePlayerFromQueue(this.playerID)
        // this.gameManager.handleGamePlayerLeave(this.playerID)
    }
}

module.exports = { ServerInputManager }