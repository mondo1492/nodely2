class Game {
  constructor() {
    this.x = 25;
  }
  step(timeDelta) {
  }
  drawPausedScreen(ctx) {
    ctx.globalAlpha = .4;
    ctx.fillRect(0, 0, Game.DIM_X, Game.DIM_Y);
    ctx.font = "100px Arial";
    ctx.fillText("PAUSED", (Game.DIM_X / 2) - 200, (Game.DIM_Y / 2) + 20);
    ctx.globalAlpha = 1;
  }
  drawGameOverScreen(ctx) {
    ctx.globalAlpha = .4;
    ctx.fillRect(0, 0, Game.DIM_X, Game.DIM_Y);
    ctx.font = "100px Arial";
    ctx.fillText("GameOver", (Game.DIM_X / 2) - 200, (Game.DIM_Y / 2) + 20);
    ctx.globalAlpha = 1;
  }
  drawScore(ctx, score) {
    ctx.fillStyle = 'black';
    ctx.font = "30px Arial";
    ctx.fillText(`Score ${score}`, Game.DIM_X - 150, 50);
  }
}
Game.DIM_X = 1000;
Game.DIM_Y = 600;
Game.COLORS = {
  1: '#DCDCC6',
  2: 'yellow',
  3: 'teal',
  4: 'pink',
  5: 'orange',
  6: 'purple',
  7: 'pink',
  8: 'lightgreen',
  9: 'aqua',
  10: 'grey',
  11: 'lightbrown',
  12: 'darkbrown',
  13: 'black'
};

module.exports = Game;
