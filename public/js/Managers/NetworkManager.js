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

        this.socket.on('projectileFired', (projectileData) => {
            // gameClient.addRemoteProjectile(projectileData);
            // console.log("Received projectile fired:", projectileData); // For debugging
        })
        
    }

    sendPlayerInput(inputData, gameID, playerID) {
        this.socket.emit('playerInput', inputData, gameID, playerID);
        //console.log(inputData, gameID)
    }

    sendProjectileFire(projectileData) {
        this.socket.emit('fireProjectile', projectileData);
    }

    emit(eventName, data) {
        this.socket.emit(eventName, data);
    }

    
}