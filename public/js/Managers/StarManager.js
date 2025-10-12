import { Stars } from '../Entities/Stars.js'

export class StarManager {
    constructor() {
        this.stars = []
        this.recycledStars = []
        this.maxStars = 250
    }

    spawnStar(canvas) {
        let star
        if (this.recycledStars.length > 0) {
            star = this.recycledStars.pop()
            star.reset(canvas)
        } else if (this.stars.length < this.maxStars) {
            star = new Stars(canvas)
        } else {
            return
        }
        this.stars.push(star)
    }

    spawnStars(canvas, count = 1) {
        for(let i = 0; i < count; i++) {
            this.spawnStar(canvas)
        }
    }

    update() {
        let writeIndex = 0

        for (let i = 0; i < this.stars.length; i++) {
            const star = this.stars[i]
            star.update()

            if (star.alpha > 0 && star.radius > 0 && star.x > 0 - star.radius) {
                this.stars[writeIndex] = star
                writeIndex++
            } else {
                this.recycledStars.push(star)
            }
        }
        this.stars.length = writeIndex



        /*const activeStars = []
        for (const star of this.stars) {
            star.update()
            if (star.alpha > 0 && star.x > 0 - star.radius) {
                activeStars.push(star)
            } else {
                this.recycledStars.push(star)
            }
        }
        this.stars = activeStars*/
    }

    render(context) {
        this.stars.forEach(s => s.draw())
    }
}
