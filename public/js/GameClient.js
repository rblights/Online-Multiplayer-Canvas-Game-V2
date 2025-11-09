import { Canvas } from "./Entities/Canvas.js"
import { ClientPlayer } from "./Entities/ClientPlayer.js"
import { InputManager } from "./InputManager.js"
import { ClientProjectile } from "./Entities/ClientProjectile.js"
import { ProjectileManager } from "./Entity Managers/ProjectileManager.js"
import { BackgroundStarManager } from "./Entity Managers/BackgroundStarManager.js"
import { ForegroundStarManager } from "./Entity Managers/ForegroundStarManager.js"
import { GameLoop } from "./GameLoop.js"
import { NetworkManager } from "./NetworkManager.js"

export class GameClient {
    constructor(socket = null, networkManager = null) {
        this.canvas = null

        this.localPlayer = null
        this.remotePlayer = null

        this.projectileManager = new ProjectileManager()
        this.backgroundStarManager = new BackgroundStarManager()
        this.foregroundStarManager = new ForegroundStarManager()

        this.inputManager = null

        this.gameLoop = null

        this.socket = socket
        this.networkManager = new NetworkManager(this.socket)

        if (this.networkManager) {
            this.networkManager.setupNetworkListeners(this)
        }
        
    }

    startOnlineGame(gameData) {
        console.log("Full gameData recieved (Online): ", gameData)
        this.canvas = new Canvas(gameData.canvas.width, gameData.canvas.height)

        const ourID = gameData.playerID
        gameData.players.forEach(initPlayerState => {
            const playerState = {...initPlayerState, canvas:this.canvas}

            if (initPlayerState.playerID === ourID) {
                this.localPlayer = new ClientPlayer({...playerState, gameID: gameData.gameID, color: 'blue'})
            } else {
                this.remotePlayer = new ClientPlayer({...playerState, gameID: gameData.gameID, color: 'red', type: 'Enemy'})
            }
        });

        console.log('Online game started. Local Player: ', this.localPlayer, 'Remote Player: ', this.remotePlayer)
        this._initManagersAndLoop()
        this.gameLoop.start()
        

        
    }

    startSinglePlayerGame(options = {}) {
        //const {width = 1280, height = 720} = options
        //console.log('Starting single player game...')

        

        ///
        //this._initManagersAndLoop()
        //this.gameLoop.start()
    }

    _initManagersAndLoop() {
        if (this.localPlayer) {
            // console.log('NetworkManager instance before passing to InputManager:', this.networkManager);
            this.inputManager = new InputManager(
                this.localPlayer,
                this.projectileManager,
                this.canvas,
                this.networkManager
            )
            this.inputManager.attachListeners()
            this.inputManager.startInputLoop()
        }

        this.gameLoop = new GameLoop(
            this.canvas,
            this.localPlayer,
            this.remotePlayer,
            this.inputManager,
            this.projectileManager,
            this.backgroundStarManager,
            this.foregroundStarManager
        )
        this.foregroundStarManager.initializeForegroundStars(this.canvas)
    }

    handlePlayerStateUpdate(playerStates) {

        const RECONCILIATION_STEP = 1000 / 60

        playerStates.forEach(serverPlayerState => {
            if (this.localPlayer && serverPlayerState.playerID === this.localPlayer.playerID) {
                this.localPlayer.syncState(serverPlayerState)
                // console.log('inputSequence before filter: ',this.localPlayer.inputSequence)
                // console.log('Server last processed input', serverPlayerState.lastProcessedInputSequence)
                this.localPlayer.inputSequence = this.localPlayer.inputSequence.filter(input => {
                    // console.log(input.sequenceNumber)
                    return input.sequenceNumber > serverPlayerState.lastProcessedInputSequence
                })
                // console.log('inputSequence after filter: ',this.localPlayer.inputSequence)
                this.localPlayer.inputSequence.forEach(input => {
                    // console.log(input)
                    this.inputManager.applyInputToPlayer(this.localPlayer, input, true)
                    // this.localPlayer.update()
                })
                
            } else if (this.remotePlayer && serverPlayerState.playerID === this.remotePlayer.playerID) {
                this.remotePlayer.syncState(serverPlayerState)
            }
        })
    }

    handleProjectileStateUpdate(serverProjectileData) {
        // console.log(serverProjectileData)
        const validatedIDs = new Set()
        
        serverProjectileData.forEach(serverProjectile => {
            validatedIDs.add(serverProjectile.projectileID)
            const existingProjectile = this.projectileManager.projectiles.find(clientProjectile => {
                return clientProjectile.projectileID === serverProjectile.projectileID
            })
            if (existingProjectile && existingProjectile.playerID === this.localPlayer.playerID) {
                existingProjectile.color = this.localPlayer.color
                existingProjectile.syncState(serverProjectile)
                // console.log(existingProjectile)
            } else if (existingProjectile && existingProjectile.playerID === this.remotePlayer.playerID) {
                    existingProjectile.color = this.remotePlayer.color
                    existingProjectile.syncState(serverProjectile)
            } else if (!existingProjectile && serverProjectile.playerID === this.localPlayer.playerID) {
                const localProjectile = new ClientProjectile({...serverProjectile, playerID: this.localPlayer.playerID, color: this.localPlayer.color, canvas: this.canvas})
                this.projectileManager.projectiles.push(localProjectile)
                // console.log(localProjectile)
            } else if (!existingProjectile && serverProjectile.playerID === this.remotePlayer.playerID) {
                const remoteProjectile = new ClientProjectile({...serverProjectile, playerID: this.remotePlayer.playerID, color: this.remotePlayer.color, canvas: this.canvas})
                this.projectileManager.projectiles.push(remoteProjectile)
                // console.log(remoteProjectile)
            }

        
        })
        this.projectileManager.projectiles = this.projectileManager.projectiles.filter(clientProjectile => {
            return validatedIDs.has(clientProjectile.projectileID)
        })
    }
}