import { Canvas } from "./Entities/Canvas.js"
import { ClientPlayer } from "./Entities/ClientPlayer.js"
import { InputManager } from "./Managers/InputManager.js"
import { ProjectileManager } from "./Managers/ProjectileManager.js"
import { StarManager } from "./Managers/StarManager.js"
import { GameLoop } from "./GameLoop.js"

export class GameClient {
    constructor(socket) {
        this.socket = socket
        this.canvas = null

        this.localPlayer = null
        this.remotePlayer = null

        this.projectileManager = new ProjectileManager()
        this.starManager = new StarManager()

        this.inputManager = null

        this.gameLoop = null

        this._setupNetworkListeners()
    }

    _setupNetworkListeners() {
        this.socket.on('gameStart', (gameData) => this.startGame(gameData))
    }

    startGame(gameData) {
        console.log("Full gameData recieved: ", gameData)
        this.canvas = new Canvas(gameData.canvas.width, gameData.canvas.height)

        const ourID = gameData.playerID
        gameData.players.forEach(initPlayerState => {
            const playerState = {...initPlayerState, canvas:this.canvas}

            if (initPlayerState.playerID === ourID) {
                this.localPlayer = new ClientPlayer({...playerState, color: 'blue'})
            } else {
                this.remotePlayer = new ClientPlayer({...playerState, color: 'red'})
            }
        });

        this.inputManager = new InputManager(
            this.localPlayer,
            this.projectileManager,
            this.canvas
        )
        this.inputManager.attachListeners()

        this.gameLoop = new GameLoop(
            this.canvas,
            this.localPlayer,
            this.remotePlayer,
            this.projectileManager,
            this.starManager,
            gameData.canvas.width,
            gameData.canvas.height
        )
        this.gameLoop.start()

        console.log('Local Player: ', this.localPlayer)
        console.log('Remote Player: ', this.remotePlayer)
    }
}