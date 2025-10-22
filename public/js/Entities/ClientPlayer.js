export class ClientPlayer {
    constructor ({gameID = null, playerID, xPos, yPos, radius, color, thrusterColor, angle, turnSpeed, acceleration, maxSpeed, velocityDampening, velocityDampeningBrake, projectileSpeed, fireRateDelay, canvas}) {
        this.gameID = gameID
        this.playerID = playerID
        this.xPos = xPos
        this.yPos = yPos
        this.radius = radius
        this.color = color
        this.thrusterColor = thrusterColor
        this.angle = angle
        this.rotation = 0
        this.turnSpeed = turnSpeed 
        this.velocity = { x: 0, y: 0 }
        this.acceleration = acceleration
        this.maxSpeed = maxSpeed
        this.velocityDampening = velocityDampening
        this.velocityDampeningBrake = velocityDampeningBrake

        this.isAccelerating = false
        this.isTurningLeft = false
        this.isTurningRight = false
        this.isBraking = false

        this.projectileSpeed = projectileSpeed
        this.lastFireTime = 0
        this.fireRateDelay = 500

        this.lastProcessedInputSequence = []

        this.canvas = canvas
    }

    syncState(newState) {
        if (newState.xPos !== undefined) this.xPos = newState.xPos
        if (newState.yPos !== undefined) this.yPos = newState.yPos
        if (newState.angle !== undefined) this.angle = newState.angle
        if (newState.rotation !== undefined) this.rotation = newState.rotation
        if (newState.velocity !== undefined) this.velocity = newState.velocity
        if (newState.acceleration !== undefined) this.acceleration = newState.acceleration

        if (newState.lastProcessedInputSequence !== undefined) this.lastProcessedInputSequence = newState.lastProcessedInputSequence
    }

    draw() {
        this.canvas.context.lineWidth = 5

        const POINT1_X = this.xPos + 4 / 3 * this.radius * Math.cos(this.angle)
        const POINT1_Y = this.yPos - 4 / 3 * this.radius * Math.sin(this.angle)

        const POINT2_X = this.xPos - this.radius * (2 / 3 * Math.cos(this.angle) + Math.sin(this.angle))
        const POINT2_Y = this.yPos + this.radius * (2 / 3 * Math.sin(this.angle) - Math.cos(this.angle))

        const POINT3_X = this.xPos - this.radius * (2 / 3 * Math.cos(this.angle) - Math.sin(this.angle))
        const POINT3_Y = this.yPos + this.radius * (2 / 3 * Math.sin(this.angle) + Math.cos(this.angle))

        this.canvas.context.beginPath()
        this.canvas.context.moveTo(POINT1_X, POINT1_Y)
        this.canvas.context.lineTo(POINT2_X, POINT2_Y)
        this.canvas.context.strokeStyle = this.color
        this.canvas.context.stroke()

        this.canvas.context.beginPath()
        this.canvas.context.moveTo(POINT3_X, POINT3_Y)
        this.canvas.context.lineTo(POINT1_X, POINT1_Y)
        this.canvas.context.strokeStyle = this.color
        this.canvas.context.stroke()

        this.canvas.context.beginPath()
        this.canvas.context.moveTo(POINT2_X, POINT2_Y);
        this.canvas.context.lineTo(POINT3_X, POINT3_Y)
        this.canvas.context.strokeStyle = this.thrusterColor
        this.canvas.context.stroke()
    }

    update() {
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

        this.xPos += this.velocity.x
        this.yPos += this.velocity.y

        if (this.xPos < 0 - this.radius) {
            this.xPos = this.canvas.canvas.width + this.radius
        } else if (this.xPos > this.canvas.canvas.width + this.radius) {
            this.xPos = 0 - this.radius
        }

        if (this.yPos < 0 - this.radius) {
            this.yPos = this.canvas.canvas.height + this.radius
        } else if (this.yPos > this.canvas.canvas.height + this.radius) {
            this.yPos = 0 - this.radius
        }

        if (Date.now() - this.lastFireTime >= this.fireRateDelay) {
            this.thrusterColor = 'lightGreen'
        } else {
            this.thrusterColor = 'white'
        }
    }

    
}