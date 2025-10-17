import { ClientProjectile } from "../Entities/ClientProjectile.js"

export class InputManager {
    constructor(localPlayer, projectileManager, canvas, networkManager = null) {
        this.localPlayer = localPlayer
        this.projectileManager = projectileManager
        this.canvas = canvas
        this.networkManager = networkManager
        console.log('NetworkManager inside InputManager:', this.networkManager);
        if (this.networkManager) {
            console.log('Does InputManager.networkManager have sendPlayerInput?', typeof this.networkManager.sendPlayerInput === 'function');
        } else {
            console.log('InputManager.networkManager is null or undefined!');
        }

        this._handleKeyDown = this._handleKeyDown.bind(this)
        this._handleKeyUp = this._handleKeyUp.bind(this)
    }

    attachListeners() {
        window.removeEventListener('keydown', this._handleKeyDown)
        window.removeEventListener('keyup', this._handleKeyUp)

        window.addEventListener('keydown', this._handleKeyDown)
        window.addEventListener('keyup', this._handleKeyUp)
    }

    _handleKeyDown(keyDown) {
        if (!this.localPlayer) return

        switch (keyDown.code) {
            case 'KeyW':
                
                this.localPlayer.isAccelerating = true
                /*console.log('Attempting to call sendPlayerInput. NetworkManager:', this.networkManager);
                if (this.networkManager) {
                    console.log('Is sendPlayerInput a function here?', typeof this.networkManager.sendPlayerInput === 'function');
                    this.networkManager.sendPlayerInput('KeyW', this.localPlayer.gameID);
                } else {
                    console.error('Cannot call sendPlayerInput: networkManager is null!');
                }*/
                this.networkManager.sendPlayerInput('KeyW', this.localPlayer.gameID, this.localPlayer.playerID)
                //console.log(this.networkManager, this.localPlayer.gameID)
                break
            case 'KeyA':
                this.localPlayer.isTurningLeft = true
                this.networkManager.sendPlayerInput('KeyA', this.localPlayer.gameID, this.localPlayer.playerID)
                break
            case 'KeyS':
                this.localPlayer.isBraking = true
                this.networkManager.sendPlayerInput('KeyS', this.localPlayer.gameID, this.localPlayer.playerID)
                break
            case 'KeyD':
                this.localPlayer.isTurningRight = true
                this.networkManager.sendPlayerInput('KeyD', this.localPlayer.gameID, this.localPlayer.playerID)
                break

            case 'Space':
                this.projectileManager.tryFireProjectile(this.localPlayer, this.canvas)
                break
        }
    }

    _handleKeyUp(keyUp) {
        if (!this.localPlayer) return

        switch (keyUp.code) {
            case 'KeyW':
                this.localPlayer.isAccelerating = false
                this.networkManager.sendPlayerInput('KeyWUp', this.localPlayer.gameID, this.localPlayer.playerID)
                break
            case 'KeyA':
                this.localPlayer.isTurningLeft = false
                this.networkManager.sendPlayerInput('KeyAUp', this.localPlayer.gameID, this.localPlayer.playerID)
                break
            case 'KeyS':
                this.localPlayer.isBraking = false
                this.networkManager.sendPlayerInput('KeySUp', this.localPlayer.gameID, this.localPlayer.playerID)
                break
            case 'KeyD':
                this.localPlayer.isTurningRight = false
                this.networkManager.sendPlayerInput('KeyDUp', this.localPlayer.gameID, this.localPlayer.playerID)
                break
        }
    }


}