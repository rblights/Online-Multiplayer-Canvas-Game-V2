export class NetworkManager {
    constructor(socket) {
        if (!socket) {
            throw new Error("NetworkManager requires a socket instance")
        }
        this.socket = socket
    }

    setupNetworkListeners(gameClient) {
        this.socket.on('gameStart', (gameData) => {
            console.log(this.socket)
            console.log('NetworkManager init with socket: ', this.socket.id)
            console.log("NetworkManager recieved 'gameStart'. GameClient init")

            gameClient.startOnlineGame(gameData)
        })

        this.socket.on('playerStateUpdate', (playerStates) => {

            // console.log("Received player update:", playerStates)

            gameClient.handlePlayerStateUpdate(playerStates)
        })

        this.socket.on('projectileStateUpdate', (projectileData) => {
            // console.log("Received projectile fired:", projectileData)
            gameClient.handleProjectileStateUpdate(projectileData)
        })
        
    }

    sendPlayerInput(inputData, player) {
        this.socket.emit('playerInput', inputData, player)
        // console.log(inputData, player)
    }

    sendProjectileFire(predictedProjectileID, projectileData, player) {
        // console.log(projectileData)
        this.socket.emit('fireProjectile', predictedProjectileID, projectileData, player)
    }

    emit(eventName, data) {
        this.socket.emit(eventName, data)
    }

    
}