export class ClientPlayer {
    constructor ({gameID = null, playerID, xPos, yPos, radius, color, thrusterColor, angle, turnSpeed, acceleration, maxSpeed, velocityDampening, velocityDampeningBrake, type = null, projectileSpeed, fireRateDelay, canvas}) {
        this.gameID = gameID
        this.playerID = playerID
        this.xPos = xPos
        this.yPos = yPos
        this.authoritativeXPos = null
        this.authoritativeYPos = null
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
        this.fireRateDelay = 500

        this.inputSequence = []

        this.canvas = canvas
    }

    syncState(newState) {
        // if (newState.xPos !== undefined) this.authoritativeXPos = newState.xPos
        // if (newState.yPos !== undefined) this.authoritativeYPos = newState.yPos
        if (newState.xPos !== undefined) this.xPos = newState.xPos
        if (newState.yPos !== undefined) this.yPos = newState.yPos
        if (newState.angle !== undefined) this.angle = newState.angle
        if (newState.rotation !== undefined) this.rotation = newState.rotation
        if (newState.velocity !== undefined) this.velocity = newState.velocity
        if (newState.acceleration !== undefined) this.acceleration = newState.acceleration

        // if (newState.lastProcessedInputSequence !== undefined) this.lastProcessedInputSequence = newState.lastProcessedInputSequence
    }

    draw() {
        this.canvas.context.lineWidth = 5

        const drawShip = (centerX, centerY) => {
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

        

        drawShip(this.xPos, this.yPos)

        if (this.xPos < this.radius) {
            drawShip(this.xPos + this.canvas.canvas.width, this.yPos)
        } else if (this.xPos > this.canvas.canvas.width - this.radius) {
            drawShip(this.xPos - this.canvas.canvas.width, this.yPos)
        }

        if (this.yPos < this.radius) {
            drawShip(this.xPos, this.yPos + this.canvas.canvas.height)
        } else if (this.yPos > this.canvas.canvas.height - this.radius) {
            drawShip(this.xPos, this.yPos - this.canvas.canvas.width)
        }

        if (this.xPos < this.radius && this.yPos < this.radius) {
            drawShip(this.xPos + this.canvas.canvas.width, this.yPos + this.canvas.canvas.height)
        } else if (this.xPos > this.canvas.canvas.width - this.radius && this.yPos < this.radius) {
            drawShip(this.xPos - this.canvas.canvas.width, this.yPos + this.canvas.canvas.height)
        } else if (this.xPos < this.radius && this.yPos > this.canvas.canvas.height - this.radius) {
            drawShip(this.xPos + this.canvas.canvas.width, this.yPos - this.canvas.canvas.height) 
        } else if (this.xPos > this.canvas.canvas.width - this.radius && this.yPos > this.canvas.canvas.height - this.radius) {
            drawShip(this.xPos - this.canvas.canvas.width, this.yPos - this.canvas.canvas.height)
        }
        
    }

    update() {

        // this.xPos = this.xPos + (this.authoritativeXPos - this.xPos) * this.lerpFactor
        // this.yPos = this.yPos + (this.authoritativeYPos - this.yPos) * this.lerpFactor

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
            this.xPos += this.canvas.canvas.width + 2 * this.radius
        } else if (this.xPos > this.canvas.canvas.width + this.radius) {
            this.xPos -= this.canvas.canvas.width + 2 * this.radius
        } 

        if (this.yPos < 0 - this.radius) {
            this.yPos += this.canvas.canvas.height + 2 * this.radius 
        } else if (this.yPos > this.canvas.canvas.height + this.radius) {
            this.yPos -= this.canvas.canvas.height + 2 * this.radius
            
        }

        if (Date.now() - this.lastFireTime >= this.fireRateDelay) {
            this.thrusterColor = 'lightGreen'
        } else {
            this.thrusterColor = 'white'
        }
    }

    
}