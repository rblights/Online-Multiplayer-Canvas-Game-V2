const { ServerProjectile } = require('../Server Entities/ServerProjectile.js')

class ServerProjectileManager {
    constructor() {
        this.serverProjectiles = []
        this.nextProjectileID = 1
        
    }

    addServerProjectile(player, projectileID) {

        if (Date.now() - player.lastFireTime >= player.fireRateDelay) {
            const serverProjectile = new ServerProjectile({
            gameID: player.gameID,
                playerID: player.playerID,
                projectileID: projectileID,
                x: player.xPos + (4 / 3) * player.radius * Math.cos(player.angle),
                y: player.yPos - (4 / 3) * player.radius * Math.sin(player.angle),
                radius: 3,
                color: player.color,
                velocity: {x: Math.cos(player.angle), y: -Math.sin(player.angle)},
                projectileSpeed: player.projectileSpeed
            })
            this.serverProjectiles.push(serverProjectile)
            player.lastFireTime = Date.now()
            console.log('proj in projManager: ', serverProjectile)
            return serverProjectile

        }
        return null
        
        
    }

    update() {
        this.serverProjectiles = this.serverProjectiles.map(p => {
            p.update()
            return p
        })
        this.serverProjectiles = this.serverProjectiles.filter(p => p.alpha > 0.75)
        return this.serverProjectiles
    }

    getStates() {
        return this.serverProjectiles.map(p => p.getState()) 
    }
}

module.exports = { ServerProjectileManager }