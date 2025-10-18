class ServerInputManager {
    constructor(inputEmitter, gameManager, playerID) {
        this.inputEmitter = inputEmitter
        this.gameManager = gameManager
        this.playerID = playerID // not defined

        this.bindEvents()

    }

    bindEvents() {
        this.inputEmitter.on('playerInput', this.handlePlayerInput.bind(this))
        this.inputEmitter.on('disconnect', this.handleDisconnect.bind(this))
        console.log(this.playerID)
    }

    handlePlayerInput(data) {
        const { keycode, gameID, playerID } = data
        const game = this.gameManager.activeGames[gameID]
        if (!game) return

        const player = game.players[playerID]
        if (!player) return

        switch (keycode) {
                case 'KeyW':
                    player.isAccelerating = true
                    // console.log(keycode)
                    break
                case 'KeyA':
                    player.isTurningLeft = true
                    break
                case 'KeyS':
                    player.isBraking = true
                    break
                case 'KeyD':
                    player.isTurningRight = true
                    break

                case 'Space':
                    
                    break
        }
        
        switch (keycode) {
            case 'KeyWUp':
                player.isAccelerating = false
                break
            case 'KeyAUp':
                player.isTurningLeft = false
                break
            case 'KeySUp':
                player.isBraking = false
                break
            case 'KeyDUp':
                player.isTurningRight = false
                break
        }
    }

    handleDisconnect(data) {
        const { reason } = data
        console.log(`User ${this.playerID} disconnected. Reason: ${reason}`)
        this.gameManager.removePlayerFromQueue(this.playerID)
        // this.gameManager.handleGamePlayerLeave(this.playerID)
    }
}

module.exports = { ServerInputManager }