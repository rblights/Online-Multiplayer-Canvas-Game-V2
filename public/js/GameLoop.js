export class GameLoop {
    constructor(canvas, localPlayer, remotePlayer, projectileManager, backgroundStarManager, foregroundStarManager) {
        this.canvas = canvas

        this.localPlayer = localPlayer
        this.remotePlayer = remotePlayer

        this.projectileManager = projectileManager

        this.backgroundStarManager = backgroundStarManager
        this.foregroundStarManager = foregroundStarManager


        this.frameCount = 0
        this.FPS = 60

        this._animate = this._animate.bind(this)
    }

    start() {
        this._animate()
        console.log(this.canvas.canvas.width)
    }

    _update() {
        this.backgroundStarManager.update()
        this.foregroundStarManager.update()
        this.projectileManager.update()
        if (this.localPlayer) this.localPlayer.update()

        
    }

    _render() {
        this.canvas.context.fillStyle = 'rgba(0, 0, 0, .2)'
        this.canvas.context.fillRect(0, 0, this.canvas.canvas.width, this.canvas.canvas.height)

        this.backgroundStarManager.render(this.canvas.context)
        this.foregroundStarManager.render(this.canvas.context)
        this.projectileManager.render(this.canvas.context)


        if (this.localPlayer) this.localPlayer.draw()
        if (this.remotePlayer) this.remotePlayer.draw()
    }

    _animate() {
        requestAnimationFrame(this._animate)
        this.frameCount++

        this.backgroundStarManager.spawnBackgroundStars(this.canvas, 100)
        
        if (Math.random() < 0.1) { 
        this.foregroundStarManager.spawnForegroundStar(this.canvas, this.canvas.canvas.width + 100, 1)
        }

        this._update()
        this._render()
    }

}
