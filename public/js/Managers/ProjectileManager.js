import { ClientProjectile } from "../Entities/ClientProjectile.js"

export class ProjectileManager {
    constructor() {
        this.projectiles = []
    }

    tryFireProjectile(player, canvas) {
    if (Date.now() - player.lastFireTime >= player.fireRateDelay) {
        this.projectiles.push(new ClientProjectile({
            playerID: player.playerID,
            x: player.xPos + (4 / 3) * player.radius * Math.cos(player.angle),
            y: player.yPos - (4 / 3) * player.radius * Math.sin(player.angle),
            radius: 3,
            color: player.color,
            velocity: {x: Math.cos(player.angle), y: -Math.sin(player.angle)},
            projectileSpeed: player.projectileSpeed,
            canvas: canvas
            }))
        player.lastFireTime = Date.now()
        }
        
    }

    update() {
        this.projectiles.forEach(p => p.update())
        this.projectiles = this.projectiles.filter(p => p.alpha >= .75)
    }

    render() {
        this.projectiles.forEach(p => p.draw())
    }
}

