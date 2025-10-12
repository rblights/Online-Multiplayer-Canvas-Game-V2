import { Canvas } from "./Entities/Canvas.js"
import { ClientPlayer } from "./Entities/ClientPlayer.js"
import { InputManager } from "./Managers/InputManager.js"
import { ProjectileManager } from "./Managers/ProjectileManager.js"
import { StarManager } from "./Managers/StarManager.js"
import { GameLoop } from "./GameLoop.js"

export class GameClient {
    constructor(socket = null) {
        this.socket = socket
        this.canvas = null

        this.localPlayer = null
        this.remotePlayer = null

        this.projectileManager = new ProjectileManager()
        this.starManager = new StarManager()

        this.inputManager = null

        this.gameLoop = null

        if (this.socket) {
            this._setupNetworkListeners()
        }
        
    }

    _setupNetworkListeners() {
        this.socket.on('gameStart', (gameData) => this._startOnlineGame(gameData))
    }

    _startOnlineGame(gameData) {
        console.log("Full gameData recieved (Online): ", gameData)
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

        this._initManagersAndLoop()
        this.gameLoop.start()
        

        console.log('Online game started. Local Player: ', this.localPlayer, 'Remote Player: ', this.remotePlayer)
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
            this.inputManager = new InputManager(
                this.localPlayer,
                this.projectileManager,
                this.canvas,
                this.socket
            )
            this.inputManager.attachListeners()
        }

        this.gameLoop = new GameLoop(
            this.canvas,
            this.localPlayer,
            this.remotePlayer,
            this.projectileManager,
            this.starManager,
        )
    }
}