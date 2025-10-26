import { ClientProjectile } from "../Entities/ClientProjectile.js"

export class ProjectileManager {
    constructor() {
        this.projectiles = []
    }

    tryFireProjectile(player, canvas, inputSequenceNumber) {
        if (Date.now() - player.lastFireTime >= player.fireRateDelay) {
            const predictedProjectileID = player.playerID + '-' + inputSequenceNumber
            const newProjectile = new ClientProjectile({
                gameID: player.gameID,
                playerID: player.playerID,
                projectileID: predictedProjectileID,
                x: player.xPos + (4 / 3) * player.radius * Math.cos(player.angle),
                y: player.yPos - (4 / 3) * player.radius * Math.sin(player.angle),
                radius: 3,
                color: player.color,
                velocity: {x: Math.cos(player.angle), y: -Math.sin(player.angle)},
                projectileSpeed: player.projectileSpeed,
                canvas: canvas,
                isPredicted: true
                })
            this.projectiles.push(newProjectile)
            player.lastFireTime = Date.now()
            // console.log(newProjectile)
            return { newProjectile, predictedProjectileID }
            }
        return null
            
    }

    detectCollision(projectilesArray, enemiesArray) {
        enemiesArray.forEach(enemy => {
            if ((proj.x - enemy.x) - player.radius - enemy.radius === 0 && 
            (player.y - enemy.y) - player.radius - enemy.radius === 0) {
                enemiesArray.splice(1, enemy)
            }
        })
    }

    update() {
        this.projectiles.forEach(p => p.update())
        this.projectiles = this.projectiles.filter(p => p.alpha > .75)
    }

    render() {
        this.projectiles.forEach(p => p.draw())
    }
}

