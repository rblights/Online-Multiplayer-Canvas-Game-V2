const { CANVAS, BASE_PLAYER_STATS, PLAYER_COLORS} = require('../../config/js/gameConfig.js')

function InitPlayerState(id, role) {
    const isP1 = role === 'P1'
    
    return {
        playerID: id,
        xPos: isP1? 320 : CANVAS.width - 320,
        yPos: CANVAS.height / 2,
        angle: isP1? 90 : 270,
        ...BASE_PLAYER_STATS,
        ...PLAYER_COLORS
    }
    
}

module.exports = { InitPlayerState }