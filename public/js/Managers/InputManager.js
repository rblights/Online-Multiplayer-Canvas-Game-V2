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

        this.playerInputs = []

        this.keys = {
            
            w: {
                pressed: false
            },
            a: {
                pressed: false
            },
            s: {
                pressed: false
            },
            d: {
                pressed: false
            },
            space: {
                pressed: false
            }
    
        }
    }

    attachListeners() {
        window.removeEventListener('keydown', this._handleKeyDown)
        window.removeEventListener('keyup', this._handleKeyUp)

        window.addEventListener('keydown', this._handleKeyDown)
        window.addEventListener('keyup', this._handleKeyUp)
    }

    startInputLoop() {
        let sequenceNumber = this.localPlayer.lastProcessedInputSequence > 0 ?
                            this.localPlayer.lastProcessedInputSequence[this.localPlayer.lastProcessedInputSequence - 1].sequenceNumber + 1 : 0

        setInterval(() => {
            const currentInputs = {
                sequenceNumber: sequenceNumber++,
                keyW: this.keys.w.pressed,
                keyA: this.keys.a.pressed,
                keyS: this.keys.s.pressed,
                keyD: this.keys.d.pressed,
                keySpace: this.keys.space.pressed
            }
            this.localPlayer.lastProcessedInputSequence.push(currentInputs)
            this.networkManager.sendPlayerInput(
                currentInputs,
                this.localPlayer.gameID,
                this.localPlayer.playerID
            )
        }, 1000 / 60);

    }

    applyInputToPLayer(player, inputState, isPrediction = false) {
        player.isAccelerating = inputState.keyW
        player.isTurningLeft = inputState.keyA
        player.isBraking = inputState.keySpace
        player.isTurningRight = inputState.keyD

        if (isPrediction && inputState.keySpace) {
            this.projectileManager.tryFireProjectile(player, this.canvas)
        }
    }

    

    _handleKeyDown(keyDown) {
        if (!this.localPlayer) return

        switch (keyDown.code) {
            case 'KeyW':           
                this.keys.w.pressed = true
                break
            case 'KeyA':
                this.keys.a.pressed = true
                break
            case 'KeyS':
                this.keys.s.pressed = true
                break
            case 'KeyD':
                this.keys.d.pressed = true
                break
            case 'Space':
                this.keys.space.pressed = true
                break
        }
        this.applyInputToPLayer(this.localPlayer, this.keys, true)
    }

    _handleKeyUp(keyUp) {
        if (!this.localPlayer) return

        switch (keyUp.code) {
            case 'KeyW':
                this.keys.w.pressed = false
                // this.localPlayer.isAccelerating = false
                // this.networkManager.sendPlayerInput('KeyWUp', this.localPlayer.gameID, this.localPlayer.playerID)
                break
            case 'KeyA':
                this.keys.a.pressed = false
                // this.localPlayer.isTurningLeft = false
                // this.networkManager.sendPlayerInput('KeyAUp', this.localPlayer.gameID, this.localPlayer.playerID)
                break
            case 'KeyS':
                this.keys.s.pressed = false
                // this.localPlayer.isBraking = false
                // this.networkManager.sendPlayerInput('KeySUp', this.localPlayer.gameID, this.localPlayer.playerID)
                break
            case 'KeyD':
                this.keys.d.pressed = false
                // this.localPlayer.isTurningRight = false
                // this.networkManager.sendPlayerInput('KeyDUp', this.localPlayer.gameID, this.localPlayer.playerID)
                break
            case 'Space':
                this.keys.space.pressed = false
                break
        }
        this.applyInputToPLayer(this.localPlayer, this.keys, true)
    }




}