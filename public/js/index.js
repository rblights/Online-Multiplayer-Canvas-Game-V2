import {Canvas} from './Canvas.js'
import { ClientPlayer } from './ClientPlayer.js'
import { ClientProjectile } from './ClientProjectile.js'
import { Stars } from './Stars.js'

var socket = io()

let canvas
let localPlayer
let remotePlayer

let FPS = 60
let frameCount = 0
let projectiles = []
let stars = []

socket.on('gameStart', (gameData) =>{
    console.log("Full gameData received:", gameData);
    console.log("My player ID:", gameData.playerID);
    console.log("All initial player states:", gameData.players);

    canvas = new Canvas(gameData.canvas.width, gameData.canvas.height)

    const ourID = gameData.playerID

    gameData.players.forEach(initPlayerState => {
        if (initPlayerState.id === ourID) {
            localPlayer = new ClientPlayer({
                xPos: initPlayerState.xPos, 
                yPos: initPlayerState.yPos, 
                radius: initPlayerState.radius,
                angle: initPlayerState.angle,
                color: initPlayerState.localColor, 
                thrusterColor: 'white',
                turnSpeed: initPlayerState.turnSpeed,
                acceleration: initPlayerState.acceleration,
                maxSpeed: initPlayerState.maxSpeed,
                velocityDampening: initPlayerState.velocityDampening,
                velocityDampeningBrake: initPlayerState.velocityDampeningBrake,
                projectileSpeed: initPlayerState.projectileSpeed,
                fireRateDelay: initPlayerState.fireRateDelay,
                canvas: canvas})
        } else {
            remotePlayer = new ClientPlayer({
                xPos: initPlayerState.xPos, 
                yPos: initPlayerState.yPos, 
                radius: initPlayerState.radius,
                angle: initPlayerState.angle, 
                color: initPlayerState.remoteColor, 
                thrusterColor: 'white',
                turnSpeed: initPlayerState.turnSpeed,
                acceleration: initPlayerState.acceleration,
                maxSpeed: initPlayerState.maxSpeed,
                velocityDampening: initPlayerState.velocityDampening,
                velocityDampeningBrake: initPlayerState.velocityDampeningBrake,
                projectileSpeed: initPlayerState.projectileSpeed,
                fireRateDelay: initPlayerState.fireRateDelay,
                canvas: canvas})
        }
    })
    console.log("Local Player: ", localPlayer)
    console.log("Remote Player: ", remotePlayer)

    function spawnStars() {
        for (let i = 0; i < Math.random() * 10; i++)
            stars.push(new Stars(canvas))
    }

    function renderClient() {
        stars.forEach(s => s.draw())
        projectiles.forEach(p => p.draw())
        if (localPlayer) localPlayer.draw()
        if (remotePlayer) remotePlayer.draw()
    }

    function updateClient() {
        stars.forEach(s => s.update())
        stars = stars.filter(s => s.alpha > 0)

        projectiles.forEach(p => p.update())
        projectiles = projectiles.filter(p => p.alpha > .75)

        if (localPlayer) localPlayer.update()
    }

    function animate() {
        requestAnimationFrame(animate)
        frameCount++

        canvas.context.fillStyle = 'rgba(0, 0, 0, .2)'
        canvas.context.fillRect(0, 0, gameData.canvas.width, gameData.canvas.height)

        if (frameCount % 60 === 0) {
            spawnStars()
        }

        renderClient()
        updateClient()
    }

    animate()

    window.addEventListener('keydown', keyDown => {

        if (!localPlayer) return 

        switch (keyDown.code) {
            case 'KeyW':
                localPlayer.isAccelerating = true
                break
            case 'KeyA':
                localPlayer.rotation = localPlayer.turnSpeed / FPS
                break
            case 'KeyS':
                localPlayer.isBraking = true
                break
            case 'KeyD':
                localPlayer.rotation = -localPlayer.turnSpeed / FPS
                break
            case 'Space':
                if (Date.now() - localPlayer.lastFireTime >= localPlayer.fireRateDelay) {
                    projectiles.push(new ClientProjectile({
                        x: localPlayer.xPos + (4 / 3) * localPlayer.radius * Math.cos(localPlayer.angle),
                        y: localPlayer.yPos - (4 / 3) * localPlayer.radius * Math.sin(localPlayer.angle),
                        radius: 3,
                        color: localPlayer.color,
                        velocity: {x: Math.cos(localPlayer.angle), y: -Math.sin(localPlayer.angle)},
                        projectileSpeed: localPlayer.projectileSpeed,
                        canvas: localPlayer.canvas
                    }))
                    localPlayer.lastFireTime = Date.now()
                }
                break
        }
    })

    window.addEventListener('keyup', keyUp => {

        if (!localPlayer) return 

        switch (keyUp.code) {
            case 'KeyW':
                localPlayer.isAccelerating = false;
                break
            case 'KeyA':
            case 'KeyD':
                localPlayer.rotation = 0
                break
            case 'KeyS':
                localPlayer.isBraking = false
                break 
        }
    })
})


