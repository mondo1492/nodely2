/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

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


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

const Game = __webpack_require__(0);
const GameView = __webpack_require__(2);
const Util = __webpack_require__(8);

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


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

const Game = __webpack_require__(0);
const Index = __webpack_require__(1);
const SourceNode = __webpack_require__(3);
const SubNode = __webpack_require__(4);
const DragLine = __webpack_require__(5);
const PowerBall = __webpack_require__(6);
const SinkNode = __webpack_require__(7);

class GameView {
  constructor(game, ctx) {
    this.ctx = ctx;
    this.game = game;
    this.interval = 0;
    this.interval2 = 0;
    this.newGame = true;
    this.sourceNodes = [];
    this.subNodes = [];
    this.lines = [];
    this.lineQueue = [];
    this.subNodeBalls = [];
    this.gameOver = false;
    this.sinkNodes = [];
    this.paused = false;
    this.dragLine = null;
    this.count = 0;
    this.score = 0;
    this.skipMouseMove = false;
    this.canvas = document.getElementById("canvas");
    this.registerEventListener = this.registerEventListener.bind(this);
    this.registerEventListener();
  }

  start() {
    this.lastTime = 0;
    requestAnimationFrame(this.animate.bind(this));
  }

  registerEventListener() {
    let self = this;
    this.canvas.addEventListener('mousedown', function() {
        let allNodes = self.sourceNodes.concat(self.subNodes);
        for (let i = 0; i < allNodes.length; i++) {
          self.userInput(event.offsetX, event.offsetY, allNodes[i]);
        }
    });

    document.addEventListener('keydown', function(e) {
      if (e.keyCode === 80 && self.paused === false) {
        self.paused = true;
      } else if (e.keyCode === 80 && self.paused === true) {
        self.paused = false;
        requestAnimationFrame(self.animate.bind(self));
      }
    });
  }

  deleteNode(xCord, yCord) {
    let newSubs = [];
    let newSources = [];
    let mutableNodes = this.subNodes.concat(this.sourceNodes);
    for (let i = 0; i < mutableNodes.length; i++) {
      if (!(this.inRange(xCord, yCord, mutableNodes[i]))) {
        for (let j = 0; j < mutableNodes[i].lines.length; j++) {
          if (xCord >= mutableNodes[i].lines[j].destinationNode.xRange[0] &&
              xCord <= mutableNodes[i].lines[j].destinationNode.xRange[1] &&
              yCord >= mutableNodes[i].lines[j].destinationNode.yRange[0] &&
              yCord <= mutableNodes[i].lines[j].destinationNode.yRange[1]) {
            mutableNodes[i].deleteLine(j);
          }
        }
        if (mutableNodes[i] instanceof SourceNode) {
          newSources.push(mutableNodes[i]);
        } else {
          newSubs.push(mutableNodes[i]);
        }
      }
    }
    this.skipMouseMove = false;
    this.sourceNodes = newSources;
    this.subNodes = newSubs;
  }

  onSameChain(src, end) {
    let queue = [src];
    while (queue.length > 0) {
      let currentNode = queue.shift();
      if (currentNode === end) {
        return true;
      }
      currentNode.lines.forEach(function(line){
        queue.push(line.destinationNode);
      });
    }
    return false;
  }

  inRange(xCord, yCord, node) {
    return (xCord >= node.xRange[0] && xCord <= node.xRange[1] &&
      yCord >= node.yRange[0] && yCord <= node.yRange[1]);
  }

  getNodeFromCoords(x, y) {
    let allNodes = this.sourceNodes.concat(this.subNodes).concat(this.sinkNodes);
    for (let i = 0; i < allNodes.length; i++) {
      if (this.inRange(x, y, allNodes[i])) {
        return allNodes[i];
      }
    }
    return null;
  }

  pointsToPreviousNode(node, destNode) {
    for (let i = 0; i < node.associated.length; i++) {
      if (node.associated[i] === destNode) {
        return true;
      }
    }
    return false;
  }

  userInput(xCord, yCord, node) {
    let self = this;
    if (this.inRange(xCord, yCord, node)) {
        let addVal = node.val;

        self.canvas.addEventListener('mousemove', function handler(e) {
          let xCordMove = event.offsetX;
          let yCordMove = event.offsetY;
          if (self.skipMouseMove) {
            self.skipMouseMove = false;
            e.currentTarget.removeEventListener(e.type, handler);
          }
          self.dragLine = new DragLine(xCord, yCord, xCordMove, yCordMove, node);
          self.canvas.addEventListener('mouseup', function handler2(e2) {
            e2.currentTarget.removeEventListener(e2.type, handler2);
            e2.currentTarget.removeEventListener(e.type, handler);
          });
        });
        self.canvas.addEventListener('mouseup', function handler(e) {
          e.currentTarget.removeEventListener(e.type, handler);
          const xCordUp = event.offsetX;
          const yCordUp = event.offsetY;
          if (xCord === xCordUp && yCord === yCordUp) {
            self.deleteNode(xCord, yCord);
            self.skipMouseMove = true;
            e.currentTarget.removeEventListener(e.type, handler);
            self.dragLine = null;
            return;
          }
          let destNode = self.getNodeFromCoords(xCordUp, yCordUp);

          let addUp = false;
          let sameChain = false;
          let pointsToPrevious = false;
          const powerBall = new PowerBall(self.dragLine, node);
          self.dragLine.balls.push(powerBall);
          self.dragLine.defaultBall = new PowerBall(self.dragLine, node);
          self.dragLine.startNode = node;

          let toSinkNode = false;
          if (self.pointsToPreviousNode(node, destNode)) {
            pointsToPrevious = true;
            addUp = false;
          } else if (destNode instanceof SubNode) {
            if (self.onSameChain(destNode, node)) {
              sameChain = true;
              self.dragLine = null;
            } else {
              destNode.val += addVal;
              self.dragLine.balls[self.dragLine.balls.length - 1].destinationNode = destNode;
              self.dragLine.defaultBall.destinationNode = destNode;
              self.dragLine.destinationNode = destNode;
              destNode.updateAddedValues(node.uniqId);
              node.associated.push(destNode);
              node.addLines(self.dragLine);

              let currentCheckNode = [destNode];
              let currentSum = destNode.val;
              while (currentCheckNode.length > 0) {
                let currentNode = currentCheckNode.shift();
                currentNode.lines.forEach(function(line) {
                    if (line.destinationNode instanceof SubNode) {
                      line.destinationNode.val += addVal;
                      currentCheckNode.push(line.destinationNode);
                    }
                });
              }
              addUp = true;
            }
          } else if (destNode instanceof SinkNode) {
            if (destNode.val === addVal) {
              self.dragLine.balls[self.dragLine.balls.length - 1].destinationNode = destNode;
              self.dragLine.defaultBall.destinationNode = destNode;
              self.dragLine.destinationNode = destNode;
              node.associated.push(destNode);
              node.addLines(self.dragLine);
              toSinkNode = true;
            }
          } else if (destNode instanceof SourceNode) {
            addUp = false;
          } else if (!addUp && !toSinkNode && !sameChain && !pointsToPrevious) {
            let newNode = new SubNode(xCordUp, yCordUp, self.ctx, addVal, node.uniqId);
            self.subNodes.push(newNode);
            self.dragLine.balls[self.dragLine.balls.length - 1].destinationNode = newNode;
            self.dragLine.defaultBall.destinationNode = newNode;
            self.dragLine.destinationNode = newNode;
            node.associated.push(newNode);
            node.addLines(self.dragLine);
          } else {
            addUp = false;
          }
          self.dragLine = null;
        });
      }
  }

  combineAllNodes() {
    return this.sourceNodes.concat(this.subNodes).concat(this.sinkNodes);
  }

  drawBallsFromLine(line, node) {
    let self = this;
    let ballIdx = 0;
    const newBallStore = [];

    while (ballIdx < line.balls.length) {
      let ball = line.balls[0];
      ball.draw(self.ctx);
      ball.updatePosition();
      if (ball.reachedDestination() && ball.destinationNode instanceof SinkNode) {
        ball.destinationNode.currentTally += 1;
        ball.destinationNode.degrees = 360;
      } else if (ball.reachedDestination()) {
        ball.destinationNode.updateAddedValues(ball.associatedNode.uniqId);
      } else {
        if (!ball.destinationNode instanceof SinkNode) {
          ball.destinationNode.setAddedValues(ball.associatedNode.uniqId);
        }
        newBallStore.push(ball);
      }
      ballIdx += 1;
    }
    line.balls = newBallStore;
  }

  animate(time) {
    if (this.interval2 === 100) {
      this.score += 1;
      this.interval2 = 0;
    }
    if (this.paused === false && this.gameOver === false) {
      let self = this;
      let newStore = [];
      const timeDelta = time - this.lastTime;
      this.ctx.clearRect(0, 0, Game.DIM_X, Game.DIM_Y);
      if (this.dragLine !== null) {
        this.dragLine.draw(self.ctx);
      }
      this.sourceNodes.forEach(function(sourcenode) {
        sourcenode.updateTimeAlive();
        if (sourcenode.timeAlive > 0) {
          newStore.push(sourcenode);
        } else if (sourcenode.associated.length > 0){
          sourcenode.associated.forEach(function(subnode){
            let updateQueue = [subnode];
            let currentSubNode;
            while (updateQueue.length > 0) {
              currentSubNode = updateQueue.shift();
              if (currentSubNode instanceof SubNode) {
                currentSubNode.val -= sourcenode.val;
              }
              currentSubNode.associated.forEach(function(subnode2){
                updateQueue.push(subnode2);
              });
            }
          });
        }
        self.sourceNodes = newStore;
        sourcenode.lines.forEach(function(line) {
          line.draw(self.ctx);
        });

        if (sourcenode.countDown === 0) {
          sourcenode.countDown = 200;
          if (sourcenode.lines[sourcenode.lineIdx]) {
            let tester = new DragLine();
            tester.balls.push(new PowerBall(sourcenode.lines[sourcenode.lineIdx],
              sourcenode.lines[sourcenode.lineIdx].startNode,
              sourcenode.lines[sourcenode.lineIdx].destinationNode));
            self.lineQueue.push(tester);
          }
          sourcenode.lineIdx += 1;
          if (sourcenode.lineIdx >= sourcenode.lines.length) {
            sourcenode.lineIdx = 0;
          }
        } else {
          sourcenode.countDown -= 1;
        }
        sourcenode.drawSourceNode(self.ctx);
      });

      if (this.newGame) {
        this.sourceNodes.push(new SourceNode(this.combineAllNodes(), 4));
        this.sourceNodes.push(new SourceNode(this.combineAllNodes(), 3));
        this.sourceNodes.push(new SourceNode(this.combineAllNodes(), 1));
        this.sinkNodes.push(new SinkNode(this.combineAllNodes(), 4));
        this.sinkNodes.push(new SinkNode(this.combineAllNodes(), 5));
        this.sinkNodes.push(new SinkNode(this.combineAllNodes(), 2));
        this.newGame = false;
      }

      if (this.interval === 1000) {
        this.sourceNodes.push(new SourceNode(this.combineAllNodes()));
        this.sinkNodes.push(new SinkNode(this.combineAllNodes()));
        this.lastTime = time;
        this.interval = 0;
      } else {
        this.interval += 1;
        this.interval2 += 1;
      }
      const subNodeStore = [];
      this.subNodes.forEach(function(subnode) {
        if (subnode.val > 0) {
          if (subnode.associated.length === 0) {
            subnode.resetCounts();
          }
          subnode.lines.forEach(function(line) {
             if (subnode.isFullyPowered()) {
                if (subnode.lines[subnode.lineIdx]) {
                  let tester2 = new DragLine();
                  tester2.balls.push(new PowerBall(
                    subnode.lines[subnode.lineIdx],
                    subnode.lines[subnode.lineIdx].startNode,
                    subnode.lines[subnode.lineIdx].destinationNode));
                  self.lineQueue.push(tester2);
                }
                subnode.lineIdx += 1;
                if (subnode.lineIdx >= subnode.lines.length) {
                  subnode.lineIdx = 0;
                }
                subnode.decreaseValuesByOne();
            }

            line.draw(self.ctx);
          });
          subNodeStore.push(subnode);
          subnode.drawSubNode(self.ctx);
        }

      });
      self.subNodes = subNodeStore;
      const sinkNodeStore = [];
      this.sinkNodes.forEach(function(sinknode) {
        sinknode.updateTimeAlive();
        if (sinknode.outOfTime === true) {
          self.gameOver = true;
        }
        if (sinknode.currentTally < sinknode.finalTally) {
          sinknode.lines.forEach(function(line) {
            self.drawBallsFromLine(line);
            // line.draw(self.ctx);
          });
          sinkNodeStore.push(sinknode);
          sinknode.drawSinkNode(self.ctx);
        } else {
          self.score += 10;
          self.subNodes.forEach(function(subnode) {
            let newLines = [];
            subnode.lines.forEach(function(line) {
              if (line.destinationNode !== sinknode) {
                newLines.push(line);
              }
            });
            subnode.lines = newLines;
          });

          self.sourceNodes.forEach(function(sourcenode) {
            let newLines = [];
            sourcenode.lines.forEach(function(line) {
              if (line.destinationNode !== sinknode) {
                newLines.push(line);
              }
            });
            sourcenode.lines = newLines;
          });
        }
      });
      self.sinkNodes = sinkNodeStore;
      self.lineQueue.forEach(function(line) {
        self.drawBallsFromLine(line);
      });
      this.lastTime = time;
      this.game.drawScore(this.ctx, this.score);
      requestAnimationFrame(this.animate.bind(this));
    } else if (this.paused === true) {
      this.game.drawPausedScreen(this.ctx);
      this.ctx.globalAlpha = 1;
    } else {
      this.game.drawGameOverScreen(this.ctx);
    }
  }
}

module.exports = GameView;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

const Game = __webpack_require__(0);

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


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

const Game = __webpack_require__(0);

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

  resetCounts() {
    Object.keys(this.addedValues).forEach((key) => {
      this.addedValues[key] = 0;
    });
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

  checkStatus() {
    let allGreaterThanOne = true;
    Object.keys(this.addedValues).forEach((key) => {
      if (this.addedValues[key] < 1) {
        allGreaterThanOne = false;
      }
    });
    if (allGreaterThanOne) {
      this.decreaseValuesByOne();
    }
  }

  decreaseValuesByOne() {
    Object.keys(this.addedValues).forEach((key) => {
      this.addedValues[key] -= 1;
    });
  }

  setAddedValues(id) {
    if (!(String(id) in this.addedValues)) {
      this.addedValues[String(id)] = 0;
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


/***/ }),
/* 5 */
/***/ (function(module, exports) {

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


/***/ }),
/* 6 */
/***/ (function(module, exports) {

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


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

const Game = __webpack_require__(0);

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
  }

  updateTimeAlive() {
    this.timeAlive -= 1;
    this.degrees -= .1;
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

  drawSinkNode(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, 25, 0, this.degrees * Math.PI / 180, false);
    ctx.fillStyle = Game.COLORS[this.val];
    ctx.fill();
    ctx.lineWidth = 15;
    ctx.strokeStyle = '#003300';
    ctx.font = "30px Georgia";
    ctx.fillStyle = "#000000";
    ctx.fillStyle = 'white';
    ctx.fillText(this.val, this.x - 8, this.y + 5);
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


/***/ }),
/* 8 */
/***/ (function(module, exports) {

class Util {
  x() {
    return 1000;
  }
  y() {
    return 400;
  }
}


/***/ })
/******/ ]);