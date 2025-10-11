export class GameLoop {
    constructor(canvas, localPlayer, remotePlayer, projectileManager, starManager) {
        this.canvas = canvas,

        this.localPlayer = localPlayer,
        this.remotePlayer = remotePlayer,

        this.projectileManager = projectileManager,
        this.starManager = starManager,

        this.frameCount = 0
        this.FPS = 60

        this._animate = this._animate.bind(this)
    }

    start() {
        this._animate()
    }

    _update() {
        this.starManager.update()
        this.projectileManager.update()
        if (this.localPlayer) this.localPlayer.update()

        
    }

    _render() {
        console.log(this.canvas.context)
        this.canvas.context.fillStyle = 'rgba(0, 0, 0, .2)'
        this.canvas.context.fillRect(0, 0, this.canvas.canvas.width, this.canvas.canvas.height)

        this.starManager.render(this.canvas.context)
        this.projectileManager.render(this.canvas.context)

        if (this.localPlayer) this.localPlayer.draw()
        if (this.remotePlayer) this.remotePlayer.draw()
    }

    _animate() {
        requestAnimationFrame(this._animate)
        this.frameCount++

        if (this.frameCount % this.FPS === 0) {
            this.starManager.spawnStars(this.canvas)
        }

        this._update()
        this._render()
    }

}