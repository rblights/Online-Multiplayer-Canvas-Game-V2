import { GameClient } from "./GameClient.js"

var socket = io()

const gameClient = new GameClient(socket)
console.log(gameClient)


