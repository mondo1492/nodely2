class DragLine {
  constructor(x, y, x2, y2, startNode) {
    this.x = x;
    this.y = y;
    this.x2 = x2;
    this.y2 = y2;
    this.pos = [];
    this.balls = [];
    this.startNode = startNode;
    this.destinationNode = null;
    this.defaultBall = null;
  }
  draw(ctx) {
    ctx.beginPath();
    ctx.lineWidth = 5;
    ctx.strokStyle = "black";
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x2, this.y2);
    ctx.stroke();
  }

  addBall(ball) {
    this.balls.push(ball);
  }
}

module.exports = DragLine;
