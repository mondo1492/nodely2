class PowerBall {
  constructor(line, node, dest) {
    this.x = line.x;
    this.y = line.y;
    this.x2 = line.x2;
    this.y2 = line.y2;
    this.xIncrease = (this.x2 - this.x) / (100);
    this.yIncrease = (this.y2 - this.y) / (100);
    this.associatedNode = node;
    this.destinationNode = dest;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, 5, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'yellow';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#003300';
    ctx.stroke();
  }

  reachedDestination() {
    return Math.round(this.x2) === Math.round(this.x) &&
    Math.round(this.y2) === Math.round(this.y);
  }

  updatePosition() {
    this.x += this.xIncrease;
    this.y += this.yIncrease;
  }
}

module.exports = PowerBall;
