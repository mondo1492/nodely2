const Game = require("./game");

class SinkNode {
  constructor(stored, initialVal) {
    this.x = this.generateRandomX();
    this.y = this.generateRandomY();
    this.assureNonOverlapPosition(stored);
    this.uniqId = Math.floor(Math.random() * (10000000000000000)) + 1;
    this.xRange = [this.x - 25, this.x + 25];
    this.yRange = [this.y - 25, this.y + 25];
    this.lines = [];
    this.currentTally = 0;
    this.finalTally = 2;
    this.currentLine = 0;
    this.val = initialVal || (Math.floor(Math.random() * (12)) + 1);
    this.factor = 0.3;
    this.color = SinkNode.ASSOC_COLOR[this.val];
    this.timeAlive = 4500;
    this.associated = [];
    this.lines = [];
    this.count = 0;
    this.outOfTime = false;
    this.degrees = 360;
    this.hue = 0;
  }

  updateTimeAlive() {
    this.timeAlive -= 1;
    this.degrees -= .1;
    this.hue -= 1;
    if (this.degrees <= 1) {
      this.outOfTime = true;
    }
  }

  addLines(line) {
    this.lines.push(line);
  }


  assureNonOverlapPosition(stored) {
    for (let i = 0; i < stored.length; i++) {
      if (this.x >= stored[i].xRange[0] - 50 &&
          this.x <= stored[i].xRange[1] + 50 &&
          this.y >= stored[i].yRange[0] - 50 &&
          this.y <= stored[i].yRange[1] + 50)
          {
            this.x = this.generateRandomX();
            this.y = this.generateRandomY();
            i = 0;
          }
    }
  }

  generateRandomX() {
    return Math.floor(Math.random() * (Game.DIM_X - 60) + 20);
  }

  generateRandomY() {
    return Math.floor(Math.random() * (Game.DIM_Y - 110) + 20);
  }

  blackToRed() {
    switch(true) {
      case (this.degrees < 45):
        return 'red';
      case (this.degrees < 90):
        return 'orange';
      case (this.degrees < 180):
        return 'yellow';
      default:
        return 'black';
    }
  }

  drawSinkNode(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, 25, 0, this.degrees * Math.PI / 180, false);
    ctx.strokeStyle = this.blackToRed();
    ctx.lineWidth = 20;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(this.x, this.y, 20, 0, Math.PI * 180, false);
    ctx.fillStyle = Game.COLORS[this.val];
    ctx.fill();
    ctx.strokeStyle = Game.COLORS[this.val];
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'black';
    ctx.font = "bold 30px Sans-Serif";
    ctx.fillStyle = "black";
    ctx.fillText(this.val, this.x - 8, this.y + 9);
    ctx.stroke();
  }
}

SinkNode.ASSOC_COLOR = {
  1: "#F5F5DC",
  2: "#FFFF00",
  3: "#0000FF",
  4: "#FFA500",
  5: "#28C928"
};

module.exports = SinkNode;
