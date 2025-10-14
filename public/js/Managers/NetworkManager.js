export class NetworkManager {
    constructor(socket) {
        if (!socket) {
            throw new Error("NetworkManager requires a socket instance")
        }
        this.socket = socket
        console.log('NetworkManager init with socket: ', socket.id)
    }

    setupNetworkListeners(gameClient) {
        this.socket.on('gameStart', (gameData) => {
            console.log("NetworkManager recieved 'gameStart'. GameClient init")

            gameClient.startOnlineGame(gameData)
        })

        this.socket.on('playerUpdate', (playerState) => {
            // gameClient.updateRemotePlayer(playerState);
            // console.log("Received player update:", playerState); // For debugging
        });

        this.socket.on('projectileFired', (projectileData) => {
            // gameClient.addRemoteProjectile(projectileData);
            // console.log("Received projectile fired:", projectileData); // For debugging
        });
        
    }

    sendPlayerInput(inputData) {
        this.socket.emit('playerInput', inputData);
    }

    sendProjectileFire(projectileData) {
        this.socket.emit('fireProjectile', projectileData);
    }

    emit(eventName, data) {
        this.socket.emit(eventName, data);
    }

    
}