const Game = require("./game");

class SubNode {
  constructor(x, y, ctx, initialVal, sourceId) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.addedValues = {};
    this.uniqId = Math.floor(Math.random() * (10000000000000000)) + 1;
    this.addedValues[String(sourceId)] = 0;
    this.lines = [];
    this.xRange = [this.x - 40, this.x + 40];
    this.yRange = [this.y - 40, this.y + 40];
    this.val = initialVal;
    this.associated = [];
    this.lines = [];
    this.count = 0;
    this.lineIdx = 0;

  }

  addLines(line) {
    this.lines.push(line);
  }

  deleteLine(idx) {
    this.lines.splice(idx, 1);
  }

  isFullyPowered() {
    if (Object.keys(this.addedValues).length === 0) {
      return false;
    }
    let fullyPowered = true;
    Object.keys(this.addedValues).forEach((key) => {
      if (this.addedValues[key] === 0) {
        fullyPowered = false;
      }
    });
    return fullyPowered;
  }

  decreaseValuesByOne() {
    Object.keys(this.addedValues).forEach((key) => {
      this.addedValues[key] -= 1;
    });
  }

  setAddedValues(id) {
    if (!(String(id) in this.addedValues)) {
      this.addedValues[String(id)] = 0;
      console.log("SETTTTT", this.count,  this.addedValues);
    }

  }

  updateAddedValues(id) {
    this.count += 1;
    let stringId = String(id);
    if (stringId in this.addedValues) {
      this.addedValues[stringId] += 1;
    } else {
      this.addedValues[stringId] = 0;
    }
    // console.log("ADDDEEEEEDDDDDD", this.count,  this.addedValues);
  }


  drawSubNode() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, 15, 0, 2 * Math.PI, false);
    this.ctx.fillStyle = Game.COLORS[this.val];
    this.ctx.fill();
    this.ctx.lineWidth = 5;
    this.ctx.strokeStyle = '#003300';

    this.ctx.font = "20px Georgia";
    this.ctx.fillStyle = "#000000";
    this.ctx.fillText(this.val, this.x - 5, this.y + 30);
    this.ctx.fillStyle = this.color;
    this.ctx.stroke();
  }
}

module.exports = SubNode;
