export class Stars {
    constructor(canvas) {
        this.canvas = canvas
        this.x = Math.random() * canvas.canvas.width
        this.y = Math.random() * canvas.canvas.height
        this.radius = Math.random() * 1 + 1
        this.color = `hsl(${Math.random() * 360}, 50%, 50%)`
        this.alpha = 0
        this.fadeSpeed = Math.random() * .003 + .002
        this.peakAlpha = Math.random() * .5 + .5
        this.fadingIn = true
    }
    draw() {
        this.canvas.context.save()
        this.canvas.context.globalAlpha = this.alpha
        this.canvas.context.beginPath()
        this.canvas.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        this.canvas.context.fillStyle = this.color
        this.canvas.context.fill()
        this.canvas.context.restore()
    }

    update() {
        if (this.fadingIn) {
            this.alpha += this.fadeSpeed
            this.radius += this.fadeSpeed

            if (this.alpha >= this.peakAlpha) {
                this.fadingIn = false
            }
        } else {
            this.alpha -= this.fadeSpeed
            this.radius -= this.fadeSpeed
        }


    }
}