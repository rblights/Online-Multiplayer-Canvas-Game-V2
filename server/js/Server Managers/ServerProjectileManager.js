const { ServerProjectile } = require('../Server Entities/ServerProjectile.js')

class ServerProjectileManager {
    constructor() {
        this.serverProjectiles = []
        this.nextProjectileID = 1
        
    }

    addServerProjectile(projectileData) {
        const serverProjectile = new ServerProjectile({
            ...projectileData
        })
        this.serverProjectiles.push(serverProjectile)
        console.log('proj in projManager: ', serverProjectile)
        return serverProjectile
    }

    update() {
        const EPSILON = 1e-9
        this.serverProjectiles = this.serverProjectiles.filter(p => p.alpha > .75 - EPSILON)
        return this.serverProjectiles.map(p => p.update())
    }

    getStates() {
        return this.serverProjectiles.map(p => p.getState()) 
    }
}

module.exports = { ServerProjectileManager }