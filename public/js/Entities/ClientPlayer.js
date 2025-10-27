export class ClientPlayer {
    constructor ({gameID = null, playerID, x, y, radius, color, thrusterColor, angle, turnSpeed, acceleration, maxSpeed, velocityDampening, velocityDampeningBrake, type = null, projectileSpeed, fireRateDelay, canvas}) {
        this.gameID = gameID
        this.playerID = playerID
        this.x = x
        this.y = y
        this.authoritativeX = null
        this.authoritativeY = null
        this.lerpFactor = .2
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

        this.type = null
        this.projectileSpeed = projectileSpeed
        this.lastFireTime = Date.now()
        this.fireRateDelay = 100
        this.serverFireRateDelay = 500

        this.inputSequence = []

        this.canvas = canvas
    }

    syncState(newState) {
        // if (newState.x !== undefined) this.authoritativeX = newState.x
        // if (newState.y !== undefined) this.authoritativeY = newState.y
        if (newState.x !== undefined) this.x = newState.x
        if (newState.y !== undefined) this.y = newState.y
        if (newState.angle !== undefined) this.angle = newState.angle
        if (newState.rotation !== undefined) this.rotation = newState.rotation
        if (newState.velocity !== undefined) this.velocity = newState.velocity
        if (newState.acceleration !== undefined) this.acceleration = newState.acceleration

        // if (newState.lastProcessedInputSequence !== undefined) this.lastProcessedInputSequence = newState.lastProcessedInputSequence
    }

    draw() {
        this.canvas.context.lineWidth = 5

        const drawShip = (centerX, centerY) => {
            const POINT1_X = this.x + 4 / 3 * this.radius * Math.cos(this.angle)
            const POINT1_Y = this.y - 4 / 3 * this.radius * Math.sin(this.angle)

            const POINT2_X = this.x - this.radius * (2 / 3 * Math.cos(this.angle) + Math.sin(this.angle))
            const POINT2_Y = this.y + this.radius * (2 / 3 * Math.sin(this.angle) - Math.cos(this.angle))

            const POINT3_X = this.x - this.radius * (2 / 3 * Math.cos(this.angle) - Math.sin(this.angle))
            const POINT3_Y = this.y + this.radius * (2 / 3 * Math.sin(this.angle) + Math.cos(this.angle))

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

        

        drawShip(this.x, this.y)

        if (this.x < this.radius) {
            drawShip(this.x + this.canvas.canvas.width, this.y)
        } else if (this.x > this.canvas.canvas.width - this.radius) {
            drawShip(this.x - this.canvas.canvas.width, this.y)
        }

        if (this.y < this.radius) {
            drawShip(this.x, this.y + this.canvas.canvas.height)
        } else if (this.y > this.canvas.canvas.height - this.radius) {
            drawShip(this.x, this.y - this.canvas.canvas.width)
        }

        if (this.x < this.radius && this.y < this.radius) {
            drawShip(this.x + this.canvas.canvas.width, this.y + this.canvas.canvas.height)
        } else if (this.x > this.canvas.canvas.width - this.radius && this.y < this.radius) {
            drawShip(this.x - this.canvas.canvas.width, this.y + this.canvas.canvas.height)
        } else if (this.x < this.radius && this.y > this.canvas.canvas.height - this.radius) {
            drawShip(this.x + this.canvas.canvas.width, this.y - this.canvas.canvas.height) 
        } else if (this.x > this.canvas.canvas.width - this.radius && this.y > this.canvas.canvas.height - this.radius) {
            drawShip(this.x - this.canvas.canvas.width, this.y - this.canvas.canvas.height)
        }
        
    }

    update() {

        // this.x = this.x + (this.authoritativeX - this.x) * this.lerpFactor
        // this.y = this.y + (this.authoritativeY - this.y) * this.lerpFactor

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
            this.x += this.canvas.canvas.width + 2 * this.radius
        } else if (this.x > this.canvas.canvas.width + this.radius) {
            this.x -= this.canvas.canvas.width + 2 * this.radius
        } 

        if (this.y < 0 - this.radius) {
            this.y += this.canvas.canvas.height + 2 * this.radius 
        } else if (this.y > this.canvas.canvas.height + this.radius) {
            this.y -= this.canvas.canvas.height + 2 * this.radius
            
        }

        if (Date.now() - this.lastFireTime >= this.serverFireRateDelay) {
            this.thrusterColor = 'lightGreen'
        } else {
            this.thrusterColor = 'white'
        }
    }

    
}