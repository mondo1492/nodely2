const Game = require("./game");
const GameView = require("./game_view");
const Util = require("./util");

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById('StartButton').addEventListener('click', function() {
    const canvasEl = document.getElementById("canvas");
    canvasEl.width = Game.DIM_X;
    canvasEl.height = Game.DIM_Y;

    const ctx = canvasEl.getContext("2d");
    const game = new Game();
    const gameView = new GameView(game, ctx).start();
  });
});
