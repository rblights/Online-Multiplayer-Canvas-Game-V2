import { BackgroundStar } from '../Entities/BackgroundStar.js'

export class BackgroundStarManager {
    constructor() {
        this.backgroundStars = []
        this.recycledBackgroundStars = []
        this.maxBackgroundStars = 250
    }

    spawnBackgroundStar(canvas) {
        let backgroundStar
        if (this.recycledBackgroundStars.length > 0) {
            backgroundStar = this.recycledBackgroundStars.pop()
            backgroundStar.reset(canvas)
        } else if (this.backgroundStars.length < this.maxBackgroundStars) {
            backgroundStar = new BackgroundStar(canvas)
        } else {
            return
        }
        this.backgroundStars.push(backgroundStar)
    }

    spawnBackgroundStars(canvas, count = 1) {
        for(let i = 0; i < count; i++) {
            this.spawnBackgroundStar(canvas)
        }
    }

    update() {
        let writeIndex = 0

        for (let i = 0; i < this.backgroundStars.length; i++) {
            const backgroundStar = this.backgroundStars[i]
            backgroundStar.update()

            if (backgroundStar.alpha > 0 && backgroundStar.radius > 0 && backgroundStar.x > 0 - backgroundStar.radius) {
                this.backgroundStars[writeIndex] = backgroundStar
                writeIndex++
            } else {
                this.recycledBackgroundStars.push(backgroundStar)
            }
        }
        this.backgroundStars.length = writeIndex



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
        this.backgroundStars.forEach(s => s.draw())
    }
}
