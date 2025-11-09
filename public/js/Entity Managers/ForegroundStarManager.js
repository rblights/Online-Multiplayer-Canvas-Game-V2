import { ForegroundStar } from '../Entities/ForegroundStar.js'

export class ForegroundStarManager {
    constructor() {
        this.foregroundStars = []
        this.recycledForegroundStars = []
        this.maxForegroundStars = 240
    }

    initializeForegroundStars(canvas, count = 100) {
        for (let i = 0; i < count; i++) {
            const x = Math.random() * canvas.canvas.width
            this.spawnForegroundStar(canvas, x)
        }
    }

    spawnForegroundStar(canvas, x) {
            let foregroundStar
            if (this.recycledForegroundStars.length > 0) {
                foregroundStar = this.recycledForegroundStars.pop()
                foregroundStar.reset(canvas, x)
            } else if (this.foregroundStars.length < this.maxForegroundStars) {
                foregroundStar = new ForegroundStar(canvas, x)
            } else {
                return
            }
            this.foregroundStars.push(foregroundStar)
    }
    
    spawnForegroundStars(canvas, x,  count = 1) {
        for(let i = 0; i < count; i++) {
            this.spawnForegroundStar(canvas, x)
        }
    }

    update() {
        let writeIndex = 0

        for (let i = 0; i < this.foregroundStars.length; i++) {
            const foregroundStar = this.foregroundStars[i]
            foregroundStar.update()

            if (foregroundStar.x > 0 - foregroundStar.radius) {
                this.foregroundStars[writeIndex] = foregroundStar
                writeIndex++
            } else {
                this.recycledForegroundStars.push(foregroundStar)
            }
        }
        this.foregroundStars.length = writeIndex
    }

    render(context) {
        this.foregroundStars.forEach(p => p.draw())
    }

    
}