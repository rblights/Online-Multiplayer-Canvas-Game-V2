const PORT = 3000

const CANVAS = { width: 1280, height: 720 }
const BACKGROUND_COLOR = 'rgba(0, 0, 0, .2)';
const FPS = 60

const PLAYERS_PER_GAME = 2

const PLAYER_COLORS = {
    localColor: 'blue',
    remoteColor: 'red',
    shipBackColor: 'white',
    projectileReadyColor: 'lightGreen'
}

const BASE_PLAYER_STATS = {
    radius: 10,
    turnSpeed: 180,
    acceleration: .10,
    maxSpeed: 2,
    velocityDampening: .99,
    velocityDampeningBrake: .95,
    projectileSpeed: 15,
    fireRateDelay: 500,
    health: 100,
    score: 0
}

module.exports = {
    PORT,
    CANVAS,
    BACKGROUND_COLOR,
    FPS,
    PLAYERS_PER_GAME,
    PLAYER_COLORS,
    BASE_PLAYER_STATS
}
