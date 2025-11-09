const { CANVAS } = require('../../../config/js/gameConfig.js')

class ServerProjectile {
    constructor({gameID, playerID, projectileID, x, y, radius, color, velocity, projectileSpeed}) {
        this.gameID = gameID
        this.playerID = playerID
        this.projectileID = projectileID
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.projectileSpeed = projectileSpeed
        this.alpha = 1

    }

    getState() {
        return {
            gameID: this.gameID,
            playerID: this.playerID,
            projectileID: this.projectileID,
            x: this.x,
            y: this.y,
            radius: this.radius,
            color: this.color,
            velocity: this.velocity,
            projectileSpeed: this.projectileSpeed,
            alpha: this.alpha
        }
    }

    update() {
        this.x += this.velocity.x * this.projectileSpeed
        this.y += this.velocity.y * this.projectileSpeed

        this.alpha -= .003

        // console.log(this.CANVAS.width)

        if (this.x < 0 - this.radius) {
            this.x = CANVAS.width + this.radius
        } else if (this.x > CANVAS.width + this.radius) {
            this.x = 0 - this.radius
        }

        if (this.y < 0 - this.radius) {
            this.y = CANVAS.height + this.radius
        } else if (this.y > CANVAS.height + this.radius) {
            this.y = 0 - this.radius
        }
    }
}

module.exports = { ServerProjectile }