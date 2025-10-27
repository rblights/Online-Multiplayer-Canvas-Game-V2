const { CANVAS, PLAYER_COLORS } = require('../../../config/js/gameConfig.js')

class ServerPlayer {
    constructor ({gameID = null, playerID, x, y, radius, color, thrusterColor, angle, turnSpeed, acceleration, maxSpeed, velocityDampening, velocityDampeningBrake, projectileSpeed, fireRateDelay}) {
        this.gameID = gameID
        this.playerID = playerID
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.thrusterColor = thrusterColor
        this.angle = angle / 180 * Math.PI
        this.rotation = 0
        this.turnSpeed = turnSpeed / 180 * Math.PI
        this.velocity = { x: 0, y: 0 }
        this.acceleration = acceleration
        this.maxSpeed = maxSpeed
        this.velocityDampening = velocityDampening
        this.velocityDampeningBrake = velocityDampeningBrake

        this.isAccelerating = false
        this.isTurningLeft = false
        this.isTurningRight = false
        this.isBraking = false
        this.isFiring = false

        this.projectileSpeed = projectileSpeed
        this.lastFireTime = 0
        this.fireRateDelay = 500
        this.wasSpacePressedLastTick = false

        this.lastProcessedInputSequence = 0
    }

    getState() {
        return {
            playerID: this.playerID,
            x: this.x,
            y: this.y,
            angle: this.angle, 
            velocity: { ...this.velocity }, 
            color: this.color,
            thrusterColor: this.thrusterColor, 
            // health: this.health,
            // isAlive: this.isAlive,
            lastProcessedInputSequence: this.lastProcessedInputSequence
            
        }
    }

    update() {
        //console.log(`--- Updating Player ${this.playerID} ---`);
        //console.log(`Before update: x=${this.x}, y=${this.y}, velocity.x=${this.velocity.x}, velocity.y=${this.velocity.y}, isAccelerating=${this.isAccelerating}`);

        this.angle += this.rotation;

        if (this.isAccelerating) {
            let vX = this.acceleration * Math.cos(this.angle)
            let vY = this.acceleration * -Math.sin(this.angle)
            
            this.velocity.x += vX
            this.velocity.y += vY
        }

        if (this.isBraking) {
            this.velocity.x *= this.velocityDampeningBrake
            this.velocity.y *= this.velocityDampeningBrake
        } else {
            this.velocity.x *= this.velocityDampening
            this.velocity.y *= this.velocityDampening
        }

        if (this.isTurningLeft) {
            this.rotation = this.turnSpeed / 60
        } else if (this.isTurningRight) {
            this.rotation = -this.turnSpeed / 60
        } else {
            this.rotation = 0
        }

        this.x += this.velocity.x
        this.y += this.velocity.y

        if (this.x < 0 - this.radius) {
            this.x += CANVAS.width + 2 * this.radius
        } else if (this.x > CANVAS.width + this.radius) {
            this.x -= CANVAS.width + 2 * this.radius
        } 

        if (this.y < 0 - this.radius) {
            this.y += CANVAS.height + 2 * this.radius 
        } else if (this.y > CANVAS.height + this.radius) {
            this.y -= CANVAS.height + 2 * this.radius
        }

        if (Date.now() - this.lastFireTime >= this.fireRateDelay) {
            this.thrusterColor = 'lightGreen'
        } else {
            this.thrusterColor = 'white'
        }
    }

    
}

module.exports = { ServerPlayer }