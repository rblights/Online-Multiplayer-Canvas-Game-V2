import { Stars } from '../Entities/Stars.js'

export class StarManager {
    constructor() {
        this.stars = []
    }

    spawnStars(canvas) {
        for (let i = 0; i < Math.random() * 10; i++) {
            this.stars.push(new Stars(canvas))
        }
    }

    update() {
        this.stars.forEach(s => s.update())
        this.stars = this.stars.filter(s => s.alpha > 0); // Filter out faded stars
    }

    render(context) {
        this.stars.forEach(s => s.draw())
    }
}
