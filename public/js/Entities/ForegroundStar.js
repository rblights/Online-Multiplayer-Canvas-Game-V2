export class ForegroundStar {
    constructor(canvas, x = null) {
        this.canvas = canvas
        this.reset(canvas, x)
    }

    reset(canvas, x = null) {
        this.radius = Math.random() * 4 + 1
        this.glowRadius = this.radius * 3
        
        this.x = x !== null ? x : canvas.canvas.width + 130
        this.y = Math.random() * canvas.canvas.height
        
        this.speed = this.radius / 10 
        
        this.rotationOffset = 0
        this.rotationSpeed = Math.random() * 0.001 + 0.001 

        this.oceanColor = `hsl(${Math.random() * 360}, 35%, 50%)`
        this.landColor = `hsl(${Math.random() * 360}, 30%, 45%)`
        this.cloudColor = 'rgba(255, 255, 255, 0.5)'

        
        this.alpha = 1 
    }
    
    update() {
        this.x -= this.speed
        this.rotationOffset += this.rotationSpeed
    }

    draw() {
        this.canvas.context.save()

        this.canvas.context.shadowColor = this.oceanColor
        this.canvas.context.shadowBlur = this.glowRadius - this.radius
        this.canvas.context.shadowOffsetX = 0
        this.canvas.context.shadowOffsetY = 0

        this.canvas.context.globalAlpha = this.alpha
        

        this.canvas.context.beginPath()
        this.canvas.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        

        this.canvas.context.fillStyle = this.oceanColor
        this.canvas.context.fill()

        this.canvas.context.restore()
    }

}