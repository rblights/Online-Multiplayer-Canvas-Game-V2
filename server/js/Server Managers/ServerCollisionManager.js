const { CANVAS } = require('../../../config/js/gameConfig.js')
const { ServerPlayer } = require('../Server Entities/ServerPlayer.js')
const { ServerProjectile } = require('../Server Entities/ServerProjectile.js')

class ServerCollisionManager {
    constructor(gridSize) {
        this.gridSize = gridSize
        this.grid = {}
    }

    getGridKey(x, y) {
        return `${Math.floor(x / this.gridSize)}_${Math.floor(y / this.gridSize)}`
    }

    partition(players, projectiles) {
    this.grid = {}
    
        players.concat(projectiles).forEach(entity => {
            
            const minX = entity.x - entity.radius
            const minY = entity.y - entity.radius
            const maxX = entity.x + entity.radius
            const maxY = entity.y + entity.radius

            
            const startXIndex = Math.floor(minX / this.gridSize)
            const startYIndex = Math.floor(minY / this.gridSize)
            const endXIndex = Math.floor(maxX / this.gridSize)
            const endYIndex = Math.floor(maxY / this.gridSize)

            
            for (let x = startXIndex; x <= endXIndex; x++) {
                for (let y = startYIndex; y <= endYIndex; y++) {
                    const key = `${x}_${y}`
                    if (!this.grid[key]) {
                        this.grid[key] = []
                    }
                    this.grid[key].push(entity)
                }
            }
        })
        // console.log(this.grid)
        return this.grid
    }

    checkCollisions(players, projectiles) {
        this.partition(players, projectiles)
        

        for (const player of players) {
            const key = this.getGridKey(player.x, player.y)

            const nearbyEntities = this.getNearbyEntitites(key)

            for (const entity of nearbyEntities) {
                if (entity instanceof ServerPlayer && entity.playerID === player.playerID) 
                    continue
                if (entity instanceof ServerProjectile) {
                    this.handleProjectilePlayerCollision(player, entity)
                }
            }
        }
    }

    handleProjectilePlayerCollision(player, projectile) {
        const dx = player.x - projectile.x
        const dy = player.y - projectile.y
        const distanceSquared = dx * dx + dy * dy
        const collisionDistance = player.radius + projectile.radius

        if (distanceSquared <= collisionDistance * collisionDistance) {
            if (player.playerID === projectile.playerID) {
                return
            }

            console.log(`Player ${player.playerID} hit by projectile from Player ${projectile.playerID}`)
        }
    }

    getNearbyEntitites(currentGridKey) {
        const uniqueEntities = new Set()
        const [currentX, currentY] = currentGridKey.split('_').map(Number)

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const neighborKey = `${currentX + dx}_${currentY + dy}`

                if (this.grid[neighborKey]) {
                    this.grid[neighborKey].forEach(entity => uniqueEntities.add(entity))
                }
            }
        }
        return Array.from(uniqueEntities)
    }
}

module.exports = { ServerCollisionManager }