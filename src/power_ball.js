class PowerBall {
  constructor(line, node, dest) {
    this.x = line.x;
    this.y = line.y;
    this.x2 = line.x2;
    this.y2 = line.y2;
    // this.percent = 1 / Math.sqrt(Math.pow((this.x2-this.x),2) + Math.pow((this.y2-this.y),2));
    this.xIncrease = (this.x2 - this.x) / (100);
    this.yIncrease = (this.y2 - this.y) / (100);
    // this.percentUpdate = this.percent;
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
    // this.x += (this.x2 - this.x) * this.percent;
    // this.y += (this.y2 - this.y) * this.percent;
    // this.percent +=   (this.percentUpdate / 100);
    this.x += this.xIncrease;
    this.y += this.yIncrease;
  }
}

module.exports = PowerBall;
