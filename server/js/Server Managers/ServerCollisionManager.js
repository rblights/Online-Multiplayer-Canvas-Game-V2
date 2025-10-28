const { CANVAS } = require('../../../config/js/gameConfig.js')
const { ServerPlayer } = require('../Server Entities/ServerPlayer.js')
const { ServerProjectile } = require('../Server Entities/ServerProjectile.js')

class ServerCollisionManager {
    constructor(gridSize, serverProjectileManager) {
        this.gridSize = gridSize
        this.grid = {}
        this.serverProjectileManager = serverProjectileManager
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
        if (player.playerID === projectile.playerID) {
            return
        }

        const playerVertices = player.getVertices()

        if (this.checkCircleTriangleCollision(projectile, playerVertices)) {
            console.log(`Player ${player.playerID} hit by projectile from Player ${projectile.playerID}`)
            this.serverProjectileManager.deleteServerProjectile(projectile.projectileID)
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

    distToSegmentSquared(px, py, x1, y1, x2, y2) {
        const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)
        if (l2 === 0) return (px - x1) * (px - x1) + (py - y1) * (py - y1)
        let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2
        t = Math.max(0, Math.min(1, t))
        const closestX = x1 + t * (x2 - x1)
        const closestY = y1 + t * (y2 - y1)
        return (px - closestX) * (px - closestX) + (py - closestY) * (py - closestY)
    }

    isPointInTriangle(px, py, v1, v2, v3) {
        // Basically, it checks if the point is on the same side of all three edges.
        // If it is, the point is inside.
        function sign (p1, p2, p3) {
            return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
        }
        const d1 = sign({x:px,y:py}, v1, v2);
        const d2 = sign({x:px,y:py}, v2, v3);
        const d3 = sign({x:px,y:py}, v3, v1);

        const has_neg = (d1 < 0) || (d2 < 0) || (d3 < 0);
        const has_pos = (d1 > 0) || (d2 > 0) || (d3 > 0);

        return !(has_neg && has_pos); // True if all same sign or one is zero (on edge)
    }

    checkCircleTriangleCollision(projectile, playerVertices) {
        const PLAYER_LINE_WIDTH = 5
        const COLLISION_PADDING = PLAYER_LINE_WIDTH / 2

        const projX = projectile.x
        const projY = projectile.y
        const projRadius = projectile.radius
        
        const combinedRadius = projRadius + COLLISION_PADDING
        const combinedRadiusSquared = combinedRadius * combinedRadius

        const [v1, v2, v3] = playerVertices

        // 1. Check if the projectile's center is inside the triangle
        if (this.isPointInTriangle(projX, projY, v1, v2, v3)) {
            return true
        }

        // 2. Check collisions against each of the triangle's edges
        const edges = [
            { p1: v1, p2: v2 },
            { p1: v2, p2: v3 },
            { p1: v3, p2: v1 }
        ]

        for (const edge of edges) {
            const dSquared = this.distToSegmentSquared(projX, projY, edge.p1.x, edge.p1.y, edge.p2.x, edge.p2.y)
            if (dSquared <= combinedRadiusSquared) {
                return true
            }
        }

        return false
    }
}

module.exports = { ServerCollisionManager }