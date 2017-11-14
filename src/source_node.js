const Game = require("./game");

class SourceNode {
  constructor(allNodes, val) {
    this.x = this.generateRandomX();
    this.y = this.generateRandomY();
    this.assureNonOverlapPosition(allNodes);
    this.uniqId = Math.floor(Math.random() * (10000000000000000)) + 1;
    this.xRange = [this.x - 40, this.x + 40];
    this.yRange = [this.y - 40, this.y + 40];
    this.lines = [];
    this.val = val ? val : Math.floor(Math.random() * (5)) + 1;
    this.factor = 0.2;
    this.color = SourceNode.ASSOC_COLOR[this.val];
    this.timeAlive = 2500;
    this.associated = [];
    this.countDown = 0;
    this.lineIdx = 0;
  }

  deleteLine(idx) {
    this.lines.splice(idx, 1);
  }

  updateTimeAlive() {
    this.timeAlive -= 1;
  }

  addLines(line) {
    this.lines.push(line);
  }


  assureNonOverlapPosition(allNodes) {
    for (let i = 0; i < allNodes.length; i++) {
      if (this.x >= allNodes[i].xRange[0] - 50 &&
          this.x <= allNodes[i].xRange[1] + 50 &&
          this.y >= allNodes[i].yRange[0] - 50 &&
          this.y <= allNodes[i].yRange[1] + 50)
          {
            this.x = this.generateRandomX();
            this.y = this.generateRandomY();
            i = 0;
          }
    }
  }

  generateRandomX() {
    return Math.floor(Math.random() * (Game.DIM_X - 60) + 10);
  }

  generateRandomY() {
    return Math.floor(Math.random() * (Game.DIM_Y - 110) + 10);
  }

  drawSourceNode(ctx) {
    ctx.beginPath();
    ctx.moveTo(this.x + 75 * this.factor, this.y + 0 * this.factor);
    ctx.lineTo(this.x + 150 * this.factor,this.y + 100 * this.factor);
    ctx.lineTo(this.x + 75 * this.factor, this.y + 200 * this.factor);
    ctx.lineTo(this.x + 0 * this.factor,this.y + 100 * this.factor);
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#000000";
    ctx.font = "20px Georgia";
    ctx.fillStyle = "#000000";
    ctx.fillText(this.val, this.x + 58 * this.factor, this.y + 275 * this.factor);
    ctx.fillStyle = this.color;
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

  }
}

SourceNode.ASSOC_COLOR = {
  1: "#DCDCC6",
  2: "#FFFF00",
  3: "#0000FF",
  4: "#FFA500",
  5: "#28C928"
};

module.exports = SourceNode;
