export class ClientProjectile {
    constructor({gameID = null, playerID, projectileID, x, y, radius, color, velocity, projectileSpeed, canvas}) {
        this.gameID = gameID
        this.playerID = playerID
        this.projectileID = projectileID
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.projectileSpeed = projectileSpeed
        this.canvas = canvas
        this.alpha = 1

    }

    syncState(newState) {
        if (newState.x !== undefined) this.x = newState.x
        if (newState.y !== undefined) this.y = newState.y
        if (newState.radius !== undefined) this.radius = newState.radius
        if (newState.velocity !== undefined) this.velocity = newState.velocity
        if (newState.projectileSpeed !== undefined) this.projectileSpeed = newState.projectileSpeed
        if (newState.alpha !== undefined) this.alpha = newState.alpha
    }

    draw() {
        this.canvas.context.save()
        this.canvas.context.globalAlpha = this.alpha
        this.canvas.context.beginPath();
        this.canvas.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        this.canvas.context.fillStyle = this.color;
        this.canvas.context.fill()
        this.canvas.context.restore()
    }

    update() {
        this.x += this.velocity.x * this.projectileSpeed
        this.y += this.velocity.y * this.projectileSpeed

        this.alpha -= .002

        // console.log(this.canvas.canvas.width)

        if (this.x < 0 - this.radius) {
            this.x = this.canvas.canvas.width + this.radius
        } else if (this.x > this.canvas.canvas.width + this.radius) {
            this.x = 0 - this.radius
        }

        if (this.y < 0 - this.radius) {
            this.y = this.canvas.canvas.height + this.radius
        } else if (this.y > this.canvas.canvas.height + this.radius) {
            this.y = 0 - this.radius
        }
    }
}