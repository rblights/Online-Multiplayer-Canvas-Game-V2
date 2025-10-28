const { ServerProjectile } = require('../Server Entities/ServerProjectile.js')

class ServerProjectileManager {
    constructor() {
        this.serverProjectiles = new Map()
        this.nextProjectileID = 1
        
    }

    addServerProjectile(player, projectileID) {

        if (Date.now() - player.lastFireTime >= player.fireRateDelay) {
            const serverProjectile = new ServerProjectile({
            gameID: player.gameID,
                playerID: player.playerID,
                projectileID: projectileID,
                x: player.x + (4 / 3) * player.radius * Math.cos(player.angle),
                y: player.y - (4 / 3) * player.radius * Math.sin(player.angle),
                radius: 3,
                color: player.color,
                velocity: {x: Math.cos(player.angle), y: -Math.sin(player.angle)},
                projectileSpeed: player.projectileSpeed
            })
            this.serverProjectiles.set(serverProjectile.projectileID, serverProjectile)
            player.lastFireTime = Date.now()
            // console.log('proj in projManager: ', serverProjectile)
            return serverProjectile

        }
        return null
        
        
    }

    deleteServerProjectile(projectileID) {
        if (this.serverProjectiles.has(projectileID)) {
            this.serverProjectiles.delete(projectileID)
        }
    }

    update() {
        const updatedProjectiles = new Map()

        for (const [projectileID, projectile] of this.serverProjectiles.entries()) {
            projectile.update()

            if (projectile.alpha > 0.75) {
                updatedProjectiles.set(projectileID, projectile)
            } 
        }
        this.serverProjectiles = updatedProjectiles
        return this.serverProjectiles
    }

    getProjectiles() {
        return [...this.serverProjectiles.values()]
    }

    getStates() {
        return [...this.serverProjectiles.values()].map(p => p.getState())
    }
}

module.exports = { ServerProjectileManager }