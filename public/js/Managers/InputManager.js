import { ClientProjectile } from "../Entities/ClientProjectile.js"

export class InputManager {
    constructor(localPlayer, projectileManager, canvas, networkManager = null) {
        this.localPlayer = localPlayer
        this.projectileManager = projectileManager
        this.canvas = canvas
        this.networkManager = networkManager

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
                break
            case 'KeyA':
                this.localPlayer.rotation = this.localPlayer.turnSpeed / 60
                break
            case 'KeyS':
                this.localPlayer.isBraking = true
                break
            case 'KeyD':
                this.localPlayer.rotation = -this.localPlayer.turnSpeed / 60
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
                break
            case 'KeyA':
                this.localPlayer.rotation = 0
                break
            case 'KeyS':
                this.localPlayer.isBraking = false
                break
            case 'KeyD':
                this.localPlayer.rotation = 0
                break
        }
    }


}