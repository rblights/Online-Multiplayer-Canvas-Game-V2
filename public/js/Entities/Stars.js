export class Stars {
    constructor(canvas) {
        this.canvas = canvas
        this.x = Math.random() * (canvas.canvas.width + 13)
        this.y = Math.random() * canvas.canvas.height
        this.radius = Math.random() * 1 + 2
        this.glowRadius = this.radius * 3
        this.color = `hsl(${Math.random() * 360}, 35%, 50%)`
        this.alpha = 0
        this.fadeSpeed = Math.random() * .01
        this.peakAlpha = Math.random() * .5 + .5
        this.fadingIn = true
    }

    reset(canvas) {
        //this.canvas = canvas
        this.x = Math.random() * canvas.canvas.width
        //this.y = Math.random() * canvas.canvas.height
        this.radius = Math.random() * 1 + 2
        this.glowRadius = this.radius * 3
        //this.color = `hsl(${Math.random() * 360}, 35%, 50%)`
        this.alpha = 0
        //this.fadeSpeed = Math.random() * .01 
        //this.peakAlpha = Math.random() * .5 + .5
        this.fadingIn = true

    }

    draw() {
        this.canvas.context.save()

        this.canvas.context.shadowColor = this.color
        this.canvas.context.shadowBlur = this.glowRadius - this.radius
        this.canvas.context.shadowOffsetX = 0
        this.canvas.context.shadowOffsetY = 0

        this.canvas.context.globalAlpha = this.alpha

        this.canvas.context.beginPath()
        this.canvas.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        this.canvas.context.fillStyle = this.color
        this.canvas.context.fill()

        this.canvas.context.restore() 
    }

    update() {
        this.x = this.x - this.radius / 10

        if (this.fadingIn) {
            this.alpha += this.fadeSpeed 
            this.radius += this.fadeSpeed 
            this.glowRadius += this.fadeSpeed 

            if (this.alpha >= this.peakAlpha) {
                this.fadingIn = false
            }
        } else {
            this.alpha -= this.fadeSpeed 
            this.radius -= this.fadeSpeed  
            this.glowRadius -= this.fadeSpeed 
        }


    }
}